import { expect, test, type Locator, type Page } from '@playwright/test'

test.use({ viewport: { width: 1440, height: 1100 } })

async function openBlueprintTakeoff(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('crm-authed', '1')
    localStorage.setItem('crm-consent', 'accepted')
  })
  await page.goto('/lab')
  await page.getByRole('link', { name: /Blueprint takeoff/i }).click()
  await expect(page).toHaveURL(/\/lab\/blueprint-takeoff$/)
}

async function canvasClientPoint(canvas: Locator, x: number, y: number) {
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Canvas has no bounding box')

  const size = await canvas.evaluate((node) => {
    const canvasElement = node as HTMLCanvasElement
    return { width: canvasElement.width, height: canvasElement.height }
  })

  return {
    x: box.x + (x / size.width) * box.width,
    y: box.y + (y / size.height) * box.height,
  }
}

test('runs a blueprint takeoff from upload through release and undo', async ({ page }) => {
  await openBlueprintTakeoff(page)

  await page.getByTestId('blueprint-upload').setInputFiles({
    name: 'benchmark-tower-addendum.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 benchmark fixture'),
  })
  await expect(page.getByTestId('active-plan-name')).toContainText('benchmark-tower-addendum.pdf')

  const canvas = page.getByTestId('takeoff-canvas')
  await expect(canvas).toBeVisible()

  await page.getByRole('button', { name: 'Calibrate' }).click()
  const calibrationStart = await canvasClientPoint(canvas, 180, 140)
  const calibrationEnd = await canvasClientPoint(canvas, 300, 140)
  await page.mouse.click(calibrationStart.x, calibrationStart.y)
  await page.mouse.click(calibrationEnd.x, calibrationEnd.y)
  await page.getByLabel('Known length').fill('30')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(page.getByTestId('takeoff-scale')).toContainText('1 ft = 4.00 px')

  await page.getByRole('button', { name: 'Linear' }).click()
  const lineStart = await canvasClientPoint(canvas, 240, 250)
  const lineEnd = await canvasClientPoint(canvas, 410, 250)
  await page.mouse.move(lineStart.x, lineStart.y)
  await page.mouse.down()
  await page.mouse.move(lineEnd.x, lineEnd.y)
  await page.mouse.up()

  await page.getByLabel('Measurement name').fill('Benchmark wall run')
  await page.getByLabel('Cost code').fill('09-2216')
  await page.getByRole('button', { name: /^Save$/ }).click()

  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByTestId('package-state')).toHaveText('Submitted')

  await page.getByRole('button', { name: /Tenant east polished slab/ }).click()
  await page.getByRole('button', { name: 'Release' }).click()
  await expect(page.getByTestId('package-state')).toHaveText('Released')

  await page.getByLabel('Search measurements').fill('Benchmark wall')
  const createdRow = page.getByTestId(/^measurement-row-/).filter({ hasText: 'Benchmark wall run' })
  await expect(createdRow).toContainText('Approved')

  await page.getByLabel('Search measurements').fill('Tenant east')
  await expect(page.getByText('Tenant east polished slab')).toBeVisible()
  await expect(page.getByTestId('measurement-row-seed-slab-east')).toContainText('Needs review')

  await page.getByLabel('Search measurements').fill('Benchmark wall')
  await page.getByRole('button', { name: /Benchmark wall run/ }).click()
  await page.getByRole('button', { name: 'Delete measurement' }).click()
  await expect(page.getByRole('button', { name: 'Undo delete' })).toBeVisible()
  await page.getByRole('button', { name: 'Undo delete' }).click()
  await expect(page.getByRole('button', { name: /Benchmark wall run/ })).toBeVisible()

  const canvasStats = await canvas.evaluate((node) => {
    const canvasElement = node as HTMLCanvasElement
    const ctx = canvasElement.getContext('2d')
    if (!ctx) return { dark: 0, total: 0 }
    const { data } = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height)
    let dark = 0
    for (let index = 0; index < data.length; index += 4) {
      if (data[index] < 245 || data[index + 1] < 245 || data[index + 2] < 245) dark += 1
    }
    return { dark, total: data.length / 4 }
  })
  expect(canvasStats.dark).toBeGreaterThan(1000)
})

test('rejects a zero-length calibration span', async ({ page }) => {
  await openBlueprintTakeoff(page)

  const canvas = page.getByTestId('takeoff-canvas')
  await expect(canvas).toBeVisible()

  await page.getByRole('button', { name: 'Calibrate' }).click()
  const calibrationPoint = await canvasClientPoint(canvas, 220, 160)
  await page.mouse.click(calibrationPoint.x, calibrationPoint.y)
  await page.mouse.click(calibrationPoint.x, calibrationPoint.y)
  await page.getByLabel('Known length').fill('30')
  await page.getByRole('button', { name: 'Apply' }).click()

  await expect(page.getByRole('status')).toContainText('Calibration span is too short')
  await expect(page.getByTestId('takeoff-scale')).toContainText('1 ft = 4.00 px')
})

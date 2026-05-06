import { expect, test } from '@playwright/test'

async function openBlueprintTakeoff(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('crm-authed', '1')
    localStorage.setItem('crm-consent', 'accepted')
  })
  await page.goto('/lab')
  await page.getByRole('link', { name: /Blueprint takeoff/i }).click()
  await expect(page).toHaveURL(/\/lab\/blueprint-takeoff$/)
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
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return

  await page.getByRole('button', { name: 'Calibrate' }).click()
  await page.mouse.click(box.x + 180, box.y + 140)
  await page.mouse.click(box.x + 300, box.y + 140)
  await page.getByLabel('Known length').fill('30')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(page.getByTestId('takeoff-scale')).not.toContainText('1 ft = 4.00 px')

  await page.getByRole('button', { name: 'Linear' }).click()
  await page.mouse.move(box.x + 240, box.y + 250)
  await page.mouse.down()
  await page.mouse.move(box.x + 410, box.y + 250)
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
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return

  await page.getByRole('button', { name: 'Calibrate' }).click()
  await page.mouse.click(box.x + 220, box.y + 160)
  await page.mouse.click(box.x + 220, box.y + 160)
  await page.getByLabel('Known length').fill('30')
  await page.getByRole('button', { name: 'Apply' }).click()

  await expect(page.getByRole('status')).toContainText('Calibration span is too short')
  await expect(page.getByTestId('takeoff-scale')).toContainText('1 ft = 4.00 px')
})

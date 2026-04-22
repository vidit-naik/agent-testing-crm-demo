import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'

type Seat = { id: string; x: number; y: number; price: number; taken: boolean }

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F']
const COLS = 10
const SEAT_SIZE = 28
const PADDING = 24

function buildSeats(): Seat[] {
  const seats: Seat[] = []
  for (let r = 0; r < ROWS.length; r++) {
    for (let c = 0; c < COLS; c++) {
      const price = r < 2 ? 120 : r < 4 ? 80 : 45
      seats.push({
        id: `${ROWS[r]}${c + 1}`,
        x: PADDING + c * (SEAT_SIZE + 6),
        y: PADDING + r * (SEAT_SIZE + 6),
        price,
        taken: Math.random() < 0.15,
      })
    }
  }
  return seats
}

@customElement('crm-seatmap')
export class CrmSeatmap extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    }
    canvas {
      display: block;
      max-width: 100%;
      border-radius: 8px;
      background: #f8fafc;
    }
    .legend {
      display: flex;
      gap: 18px;
      padding: 10px 0 0;
      font-size: 12px;
      color: #475569;
    }
    .sw {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 3px;
      margin-right: 6px;
      vertical-align: middle;
    }
  `

  @state() private seats: Seat[] = []
  @state() private selected = new Set<string>()

  private ctx: CanvasRenderingContext2D | null = null

  connectedCallback(): void {
    super.connectedCallback()
    this.seats = buildSeats()
  }

  firstUpdated(): void {
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement
    this.ctx = canvas.getContext('2d')
    this.draw()
    canvas.addEventListener('click', (e) => this.handleClick(e))
  }

  private handleClick(e: MouseEvent) {
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const seat = this.seats.find(
      (s) => !s.taken && x >= s.x && x <= s.x + SEAT_SIZE && y >= s.y && y <= s.y + SEAT_SIZE
    )
    if (!seat) return
    if (this.selected.has(seat.id)) this.selected.delete(seat.id)
    else this.selected.add(seat.id)
    this.selected = new Set(this.selected)
    this.emit()
    this.draw()
  }

  private total() {
    let t = 0
    for (const s of this.seats) if (this.selected.has(s.id)) t += s.price
    return t
  }

  private emit() {
    this.dispatchEvent(
      new CustomEvent('seat-change', {
        detail: { seats: [...this.selected], total: this.total() },
        bubbles: true,
        composed: true,
      })
    )
  }

  private draw() {
    if (!this.ctx) return
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement
    const w = canvas.width
    const h = canvas.height
    this.ctx.clearRect(0, 0, w, h)

    this.ctx.fillStyle = '#1e293b'
    this.ctx.font = '12px system-ui'
    this.ctx.fillText('STAGE', w / 2 - 20, 12)
    this.ctx.strokeStyle = '#94a3b8'
    this.ctx.beginPath()
    this.ctx.moveTo(PADDING, 16)
    this.ctx.lineTo(w - PADDING, 16)
    this.ctx.stroke()

    for (const s of this.seats) {
      const isSelected = this.selected.has(s.id)
      let fill = '#bfdbfe'
      if (s.price >= 120) fill = '#a5b4fc'
      else if (s.price >= 80) fill = '#bae6fd'
      if (s.taken) fill = '#e2e8f0'
      if (isSelected) fill = '#16a34a'
      this.ctx.fillStyle = fill
      this.ctx.fillRect(s.x, s.y, SEAT_SIZE, SEAT_SIZE)
      this.ctx.strokeStyle = '#94a3b8'
      this.ctx.strokeRect(s.x, s.y, SEAT_SIZE, SEAT_SIZE)
      this.ctx.fillStyle = s.taken ? '#94a3b8' : isSelected ? '#fff' : '#0f172a'
      this.ctx.font = '10px system-ui'
      this.ctx.fillText(s.id, s.x + 4, s.y + 17)
    }
  }

  render() {
    const canvasW = PADDING * 2 + COLS * (SEAT_SIZE + 6) - 6
    const canvasH = PADDING * 2 + ROWS.length * (SEAT_SIZE + 6) - 6 + 20
    return html`
      <canvas width=${canvasW} height=${canvasH}></canvas>
      <div class="legend">
        <span><span class="sw" style="background:#a5b4fc"></span>$120</span>
        <span><span class="sw" style="background:#bae6fd"></span>$80</span>
        <span><span class="sw" style="background:#bfdbfe"></span>$45</span>
        <span><span class="sw" style="background:#e2e8f0"></span>Taken</span>
        <span><span class="sw" style="background:#16a34a"></span>Selected</span>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'crm-seatmap': CrmSeatmap
  }
}

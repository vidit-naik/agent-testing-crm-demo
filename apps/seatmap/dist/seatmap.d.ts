export {}

declare global {
  interface HTMLElementTagNameMap {
    'crm-seatmap': HTMLElement & {
      addEventListener(type: 'seat-change', listener: (e: CustomEvent<{ seats: string[]; total: number }>) => void): void
    }
  }
}

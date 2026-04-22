'use client'

import { useEffect, useRef } from 'react'

const SHADOW_STYLE = `
  :host { all: initial; }
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    z-index: 2147483640;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  }
  .panel {
    margin: 24px;
    max-width: 520px;
    width: 100%;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    padding: 20px 22px;
  }
  h3 { margin: 0 0 6px; font-size: 15px; color: #0f172a; }
  p { margin: 0 0 14px; font-size: 13px; color: #475569; line-height: 1.5; }
  .row { display: flex; gap: 8px; justify-content: flex-end; }
  button {
    font-size: 13px; padding: 8px 14px; border-radius: 6px;
    border: 1px solid #cbd5e1; background: #fff; cursor: pointer;
    font-weight: 500;
  }
  button.primary { background: #1d4ed8; color: #fff; border-color: #1d4ed8; }
  button:hover { filter: brightness(0.96); }
`

export function ShadowConsent({
  title,
  body,
  accept,
  reject,
}: {
  title: string
  body: string
  accept: string
  reject: string
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    if (typeof window !== 'undefined' && localStorage.getItem('crm-consent') === 'accepted') return

    let shadow: ShadowRoot
    try {
      shadow = host.attachShadow({ mode: 'closed' })
    } catch {
      return
    }

    const style = document.createElement('style')
    style.textContent = SHADOW_STYLE

    const backdrop = document.createElement('div')
    backdrop.className = 'backdrop'

    const panel = document.createElement('div')
    panel.className = 'panel'
    panel.setAttribute('role', 'dialog')

    const h = document.createElement('h3')
    h.textContent = title
    const p = document.createElement('p')
    p.textContent = body
    const row = document.createElement('div')
    row.className = 'row'

    const rejectBtn = document.createElement('button')
    rejectBtn.textContent = reject
    const acceptBtn = document.createElement('button')
    acceptBtn.textContent = accept
    acceptBtn.className = 'primary'

    const dismiss = () => {
      try {
        localStorage.setItem('crm-consent', 'accepted')
      } catch {}
      host.remove()
    }

    rejectBtn.addEventListener('click', dismiss)
    acceptBtn.addEventListener('click', dismiss)

    row.appendChild(rejectBtn)
    row.appendChild(acceptBtn)
    panel.appendChild(h)
    panel.appendChild(p)
    panel.appendChild(row)
    backdrop.appendChild(panel)

    shadow.appendChild(style)
    shadow.appendChild(backdrop)
  }, [title, body, accept, reject])

  return <div ref={hostRef} data-consent-host="" />
}

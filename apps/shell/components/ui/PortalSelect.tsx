'use client'

import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'

export function PortalSelect({
  value,
  onChange,
  options,
  placeholder,
  id,
  disabled,
}: {
  value: string
  onChange: (v: string, label: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  id?: string
  disabled?: boolean
}) {
  const selected = options.find((o) => o.value === value)
  return (
    <SelectPrimitive.Root
      value={value}
      disabled={disabled}
      onValueChange={(v) => {
        const opt = options.find((o) => o.value === v)
        onChange(v, opt?.label || '')
      }}
    >
      <SelectPrimitive.Trigger
        id={id}
        className="w-full inline-flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
      >
        <SelectPrimitive.Value placeholder={placeholder || 'Select'}>
          {selected ? selected.label : placeholder}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-[2000] min-w-[--radix-select-trigger-width] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          <SelectPrimitive.Viewport className="p-1 max-h-64">
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 pr-8 text-sm outline-none focus:bg-accent data-[highlighted]:bg-accent"
              >
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2 inline-flex items-center">
                  <Check className="h-4 w-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

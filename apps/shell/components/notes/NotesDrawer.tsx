'use client'

import { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'
import { X, Bold, Italic, List, Quote, Save } from 'lucide-react'

const SUGGESTIONS = [
  { id: 'alice', label: 'Alice Chen' },
  { id: 'bob', label: 'Bob Smith' },
  { id: 'carol', label: 'Carol Ng' },
  { id: 'dan', label: 'Dan Rivera' },
  { id: 'emma', label: 'Emma Park' },
]

function SuggestionList({ items, command }: { items: typeof SUGGESTIONS; command: (item: any) => void }) {
  return (
    <div className="z-[3000] min-w-[180px] rounded-md border bg-popover shadow-md p-1">
      {items.length === 0 ? (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">No match</div>
      ) : (
        items.map((item) => (
          <button
            key={item.id}
            className="w-full text-left rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            onClick={() => command(item)}
          >
            {item.label}
          </button>
        ))
      )}
    </div>
  )
}

export function NotesDrawer({
  open,
  onOpenChange,
  title = 'Notes',
  initialContent = '',
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  initialContent?: string
  onSave?: (html: string) => void
}) {
  const [saving, setSaving] = useState(false)
  const rendererRef = useRef<any>(null)

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({}),
        Mention.configure({
          HTMLAttributes: { class: 'mention' },
          suggestion: {
            items: ({ query }) =>
              SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(query.toLowerCase())).slice(0, 5),
            render: () => {
              let component: ReactRenderer | null = null
              let el: HTMLDivElement | null = null
              return {
                onStart: (props) => {
                  component = new ReactRenderer(SuggestionList, { props, editor: props.editor })
                  el = document.createElement('div')
                  el.style.position = 'fixed'
                  el.style.zIndex = '3000'
                  el.appendChild(component.element as HTMLElement)
                  document.body.appendChild(el)
                  const rect = props.clientRect?.()
                  if (rect && el) {
                    el.style.left = `${rect.left}px`
                    el.style.top = `${rect.bottom + 4}px`
                  }
                },
                onUpdate: (props) => {
                  component?.updateProps(props)
                  const rect = props.clientRect?.()
                  if (rect && el) {
                    el.style.left = `${rect.left}px`
                    el.style.top = `${rect.bottom + 4}px`
                  }
                },
                onKeyDown: () => false,
                onExit: () => {
                  el?.remove()
                  component?.destroy()
                  el = null
                  component = null
                },
              }
            },
          },
        }),
      ],
      content: initialContent || '<p></p>',
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: 'prose prose-sm max-w-none focus:outline-none min-h-[320px] px-4 py-3',
        },
      },
    },
    [open]
  )

  useEffect(() => {
    if (!open && rendererRef.current) {
      rendererRef.current.destroy()
      rendererRef.current = null
    }
  }, [open])

  const handleSave = async () => {
    if (!editor) return
    setSaving(true)
    const html = editor.getHTML()
    try {
      await onSave?.(html)
    } finally {
      setSaving(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[300] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className="fixed right-0 top-0 z-[301] h-screen w-[520px] max-w-full border-l bg-background shadow-2xl flex flex-col">
          <div className="flex items-center justify-between border-b px-4 h-14">
            <Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-md p-1 hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex items-center gap-1 border-b px-3 py-2">
            <button
              className="rounded p-1.5 hover:bg-accent"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              aria-label="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              className="rounded p-1.5 hover:bg-accent"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              aria-label="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              className="rounded p-1.5 hover:bg-accent"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              aria-label="Bullet list"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              className="rounded p-1.5 hover:bg-accent"
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              aria-label="Blockquote"
            >
              <Quote className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground ml-auto">Type @ to mention</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <EditorContent editor={editor} />
          </div>

          <div className="border-t px-4 py-3 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

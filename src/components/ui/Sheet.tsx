'use client'
import { Drawer } from 'vaul'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  children: React.ReactNode
  snapPoints?: (number | string)[]
  initialSnap?: number
}

export function Sheet({ open, onOpenChange, title, children, snapPoints, initialSnap }: SheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      activeSnapPoint={snapPoints && initialSnap !== undefined ? snapPoints[initialSnap] : undefined}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--card-border)', borderBottom: 'none', maxHeight: '90dvh' }}
          aria-label={title}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--surface-3)' }} aria-hidden="true" />
          </div>
          {title && (
            <Drawer.Title className="px-5 py-3 text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              {title}
            </Drawer.Title>
          )}
          <div className="overflow-y-auto px-5 pb-8 flex-1">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

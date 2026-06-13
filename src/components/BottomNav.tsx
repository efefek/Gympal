'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Activity, Users, User, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/body', label: 'Body', icon: Activity },
  { href: '/social', label: 'Social', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
] as const

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export default function BottomNav() {
  const pathname = usePathname()
  const companionActive = isActive(pathname, '/companion')

  return (
    <nav
      aria-label="Primary"
      className="glass md:hidden fixed inset-x-0 bottom-0 z-50 border-t safe-bottom"
      style={{ borderColor: 'var(--card-border)' }}
    >
      <div className="relative mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {tabs.slice(0, 2).map((tab) => (
          <TabLink key={tab.href} {...tab} active={isActive(pathname, tab.href)} />
        ))}

        <Link
          href="/companion"
          aria-label="Open AI Companion"
          aria-current={companionActive ? 'page' : undefined}
          className="btn-ink tap-scale -mt-8 flex size-16 shrink-0 flex-col items-center justify-center rounded-full"
          style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.25)', border: '4px solid var(--background)' }}
        >
          <Sparkles className="size-6" style={{ fill: 'var(--ink-text)' }} aria-hidden="true" />
        </Link>

        {tabs.slice(2).map((tab) => (
          <TabLink key={tab.href} {...tab} active={isActive(pathname, tab.href)} />
        ))}
      </div>
    </nav>
  )
}

type TabLinkProps = {
  href: string
  label: string
  icon: typeof Home
  active: boolean
}

function TabLink({ href, label, icon: Icon, active }: TabLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className="relative flex min-h-12 w-16 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium"
      style={{ color: active ? 'var(--foreground)' : 'var(--muted)' }}
    >
      {active && (
        <motion.span
          layoutId="bottomnav-indicator"
          className="absolute inset-0 rounded-xl"
          style={{ background: 'var(--surface-2)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <Icon className="relative size-5" aria-hidden="true" />
      <span className="relative">{label}</span>
    </Link>
  )
}

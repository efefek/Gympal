'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Activity, Users, User, Sparkles } from 'lucide-react'

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
      className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-black/85 backdrop-blur-xl safe-bottom"
    >
      <div className="relative mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {/* Sol iki sekme */}
        {tabs.slice(0, 2).map((tab) => (
          <TabLink key={tab.href} {...tab} active={isActive(pathname, tab.href)} />
        ))}

        {/* Merkez FAB — AI Companion */}
        <Link
          href="/companion"
          aria-label="Open AI Companion"
          aria-current={companionActive ? 'page' : undefined}
          className="tap-scale -mt-8 flex size-16 shrink-0 flex-col items-center justify-center rounded-full bg-primary text-black shadow-[0_0_24px_rgba(57,255,20,0.45)] ring-4 ring-black"
        >
          <Sparkles className="size-6 fill-black" aria-hidden="true" />
        </Link>

        {/* Sağ iki sekme */}
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
      className={`tap-scale flex min-h-12 w-16 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium transition-colors ${
        active ? 'text-primary' : 'text-zinc-500'
      }`}
    >
      <Icon className="size-5" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  )
}

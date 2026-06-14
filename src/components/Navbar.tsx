'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, TreePine, Route, User, BarChart3, Settings } from 'lucide-react'
import Logo from './Logo'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { href: '/gyms', label: 'Gyms', icon: MapPin },
  { href: '/parks', label: 'Parks', icon: TreePine },
  { href: '/routes', label: 'Routes', icon: Route },
]

export default function Navbar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="hidden md:block sticky top-0 z-50 bg-black/80 dark:bg-black/80 light:bg-white/80 backdrop-blur-md border-b border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" aria-label="GymPal home">
          <Logo withWordmark />
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/program"
            aria-current={isActive('/program') ? 'page' : undefined}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/program')
                ? 'bg-primary text-black'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <BarChart3 className="size-4" aria-hidden="true" />
            Program
          </Link>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary-dim text-primary'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
          <Link
            href="/profile"
            aria-current={isActive('/profile') ? 'page' : undefined}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/profile')
                ? 'bg-primary-dim text-primary'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <User className="size-4" aria-hidden="true" />
            Profile
          </Link>
          <Link
            href="/settings"
            aria-current={isActive('/settings') ? 'page' : undefined}
            aria-label="Settings"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/settings')
                ? 'bg-primary-dim text-primary'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Settings className="size-4" aria-hidden="true" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}

'use client'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { Magnetic } from '@/components/ui/magnetic'
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { FOOTER_SOCIAL_LINKS } from './data'

const THEMES_OPTIONS = [
  {
    label: 'Light',
    id: 'light',
    icon: <SunIcon className="h-4 w-4" />,
  },
  {
    label: 'Dark',
    id: 'dark',
    icon: <MoonIcon className="h-4 w-4" />,
  },
  {
    label: 'System',
    id: 'system',
    icon: <MonitorIcon className="h-4 w-4" />,
  },
]

function ThemeSwitch() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <AnimatedBackground
      className="pointer-events-none rounded-lg bg-surface"
      defaultValue={theme}
      transition={{
        type: 'spring',
        bounce: 0,
        duration: 0.2,
      }}
      enableHover={false}
      onValueChange={(id) => {
        setTheme(id as string)
      }}
    >
      {THEMES_OPTIONS.map((theme) => {
        return (
          <button
            key={theme.id}
            className="inline-flex h-7 w-7 items-center justify-center text-muted transition-colors duration-100 focus-visible:outline-2 data-[checked=true]:text-accent"
            type="button"
            aria-label={`Switch to ${theme.label} theme`}
            data-id={theme.id}
          >
            {theme.icon}
          </button>
        )
      })}
    </AnimatedBackground>
  )
}

function FooterLink({ children, href }: { children: ReactNode; href: string }) {
  const isEmail = href.startsWith('mailto:')

  return (
    <Magnetic springOptions={{ bounce: 0 }} intensity={0.3}>
      <a
        href={href}
        target={isEmail ? undefined : '_blank'}
        rel={isEmail ? undefined : 'noopener noreferrer'}
        className="group relative inline-flex shrink-0 items-center gap-[1px] rounded-full border border-border bg-surface px-2.5 py-1 text-sm text-foreground transition-colors duration-200 hover:border-accent/40 hover:text-accent"
      >
        {children}
      </a>
    </Magnetic>
  )
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border px-0 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {FOOTER_SOCIAL_LINKS.map((link) => (
            <FooterLink key={link.label} href={link.href}>
              {link.label}
            </FooterLink>
          ))}
        </div>
        <div className="text-xs text-muted">
          <ThemeSwitch />
        </div>
      </div>
    </footer>
  )
}

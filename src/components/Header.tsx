"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Flame, LayoutDashboard, Search, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { token, user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    router.replace("/login")
  }

  const initials = user
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : ""

  const navLinks = [
    { href: "/calories", label: "Look up", icon: Search },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href={token ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-bold text-primary"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Flame className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-foreground">CalorieIQ</span>
        </Link>

        <div className="flex items-center gap-1">
          {token && user && (
            <>
              <nav className="hidden items-center gap-1 sm:flex">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "gap-1.5 text-muted-foreground",
                        pathname === href && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </Button>
                  </Link>
                ))}
              </nav>

              <div className="mx-2 hidden h-5 w-px bg-border sm:block" />

              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </Button>
              </div>

              <div className="flex items-center gap-1 sm:hidden">
                {navLinks.map(({ href, icon: Icon }) => (
                  <Link key={href} href={href}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        pathname === href && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

/**
 * Navbar de navegación principal
 * Permite cambiar entre diferentes funcionalidades
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Tab = "tracker" | "recipes" | "analyzer"

interface NavbarProps {
  activeTab?: Tab
  onTabChange?: (tab: Tab) => void
}

export default function Navbar({ activeTab = "tracker", onTabChange }: NavbarProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs: Array<{ id: Tab; label: string; icon: string }> = [
    { id: "tracker", label: "Nutrición", icon: "📊" },
    { id: "recipes", label: "Recetas", icon: "🍽️" },
    { id: "analyzer", label: "Analizador", icon: "🔍" },
  ]

  return (
    <nav className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-accent">🥗</span>
            <span className="text-xl font-bold hidden sm:inline text-foreground">
              NutritionAI
            </span>
          </Link>

          {/* Tabs */}
          <div className="flex items-center gap-1 flex-wrap justify-center flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {isLoading ? "..." : "🚪 Salir"}
          </Button>
        </div>
      </div>
    </nav>
  )
}

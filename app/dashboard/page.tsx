"use client"
import { useState } from "react"
import NutritionTracker from "@/components/nutrition-tracker"
import RecipeDiscovery from "@/components/recipe-discovery"
import Navbar from "@/components/navbar"
import { Card } from "@/components/ui/card"

type Tab = "tracker" | "recipes" | "analyzer"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("tracker")

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">¡Bienvenido!</h1>
          <p className="text-muted-foreground">
            {activeTab === "tracker" && "Rastrea tu nutrición diaria y mantén tus objetivos de salud"}
            {activeTab === "recipes" && "Descubre recetas deliciosas y personalizadas"}
            {activeTab === "analyzer" && "Analiza contenido multimodal (imágenes, videos, PDFs)"}
          </p>
        </div>

        {/* Nutrition Tracker Section */}
        {activeTab === "tracker" && (
          <section className="animate-in fade-in">
            <NutritionTracker />
          </section>
        )}

        {/* Recipe Discovery Section */}
        {activeTab === "recipes" && (
          <section className="animate-in fade-in">
            <RecipeDiscovery />
          </section>
        )}

        {/* Analyzer Section */}
        {activeTab === "analyzer" && (
          <section className="animate-in fade-in">
            <Card className="p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    🔍 Analizador Multimodal
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Analiza imágenes, videos y PDFs con inteligencia artificial para obtener insights nutricionales.
                  </p>
                </div>
                
                {/* Analyzer Component */}
                <NutritionTracker showOnlyAnalyzer={true} />
              </div>
            </Card>
          </section>
        )}
      </main>
    </div>
  )
}

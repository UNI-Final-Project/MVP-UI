/**
 * Componente para renderizar respuestas markdown del API
 * Con estilos simples y acordes al diseño actual
 */

"use client"

import React, { useRef } from "react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"

interface MarkdownResponseProps {
  content: string
  title?: string
}

export default function MarkdownResponse({
  content,
  title = "Análisis",
}: MarkdownResponseProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (!containerRef.current) return

    const printWindow = window.open("", "", "width=800,height=600")
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1, h2, h3 { color: #333; }
            p { line-height: 1.6; }
            ul, ol { margin: 10px 0; }
            code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
            blockquote { border-left: 4px solid #ddd; padding-left: 10px; margin: 10px 0; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          ${containerRef.current.innerHTML}
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="space-y-3">
      {/* Botón de impresión */}
      <div className="flex gap-2">
        <Button
          onClick={handlePrint}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          🖨️ Imprimir
        </Button>
        <Button
          onClick={() => {
            navigator.clipboard.writeText(content)
          }}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          📋 Copiar
        </Button>
      </div>

      {/* Contenedor del markdown - Simple */}
      <div
        ref={containerRef}
        className="bg-card p-4 rounded-lg border border-border text-sm text-foreground"
      >
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-xl font-bold mt-4 mb-2" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-lg font-bold mt-3 mb-2" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-base font-semibold mt-2 mb-1" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="mb-2 text-sm" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-inside mb-2 space-y-1" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="text-sm" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-semibold" {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="italic" {...props} />
            ),
            code: ({ node, ...props }) => (
              <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono" {...props} />
            ),
            pre: ({ node, ...props }) => (
              <pre className="bg-muted p-3 rounded mb-2 overflow-x-auto text-xs" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-muted-foreground pl-3 italic my-2" {...props} />
            ),
            table: ({ node, ...props }) => (
              <table className="w-full border-collapse border border-border my-2 text-xs" {...props} />
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-muted" {...props} />
            ),
            tr: ({ node, ...props }) => (
              <tr className="border border-border" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th className="p-2 text-left font-semibold" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="p-2" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a className="text-blue-600 underline hover:text-blue-800" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

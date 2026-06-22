import { useNavigate } from "react-router-dom"
import { Globe, AlertTriangle, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroMetricas } from "@/components/HeroMetricas"
import { PainelMapa } from "@/components/PainelMapa"
import { GraficoCanais } from "@/components/GraficoCanais"
import { GraficoBairros } from "@/components/GraficoBairros"
import { PainelFiltros } from "@/components/PainelFiltros"
import { GridLeads } from "@/components/GridLeads"
import { useAppStore } from "@/store/useAppStore"
import { useAuthStore } from "@/store/useAuthStore"
import { Badge } from "@/components/ui/badge"

export function Dashboard() {
  const navigate = useNavigate()
  const { buscaAtual, limparResultados, empresas, fonteDados } = useAppStore()
  const { usuarioId, perfil } = useAuthStore()

  function handleAssinar() {
    if (!usuarioId) {
      navigate("/entrar")
    } else if (!perfil) {
      navigate("/perfil")
    } else {
      navigate("/planos")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header do dashboard */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/60">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={limparResultados}
                className="h-8 px-2 text-muted-foreground hover:text-foreground flex-shrink-0"
              >
                ← <span className="hidden sm:inline ml-1">Nova busca</span>
              </Button>

              <div className="h-4 w-px bg-border" />

              {buscaAtual && (
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="w-4 h-4 rounded-full bg-dourado-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-dourado-400" />
                  </span>
                  <span className="text-sm font-semibold text-foreground truncate">
                    {buscaAtual.segmento}
                  </span>
                  <span className="text-muted-foreground text-sm">em</span>
                  <span className="text-sm text-muted-foreground">
                    {buscaAtual.cidade}{buscaAtual.estado ? `, ${buscaAtual.estado}` : ""}
                  </span>
                  <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                    {buscaAtual.raioKm}km
                  </Badge>
                  <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                    {empresas.length} resultados
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {buscaAtual && (
                fonteDados === "google" ? (
                  <Badge variant="success" className="text-xs flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Dados reais (Google)
                  </Badge>
                ) : fonteDados === "openstreetmap" ? (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Dados reais (OpenStreetMap)
                  </Badge>
                ) : (
                  <Badge variant="warning" className="text-xs flex items-center gap-1" title="Não encontramos estabelecimentos reais cadastrados nessa região/segmento. Mostrando exemplo simulado.">
                    <AlertTriangle className="w-3 h-3" />
                    Exemplo simulado
                  </Badge>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-screen-xl mx-auto px-4 py-7 space-y-6">

        {/* Tira de métricas com destaque dourado */}
        <HeroMetricas />

        {/* Mapa (esquerda) + Filtros/Gráficos (direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
          <PainelMapa />

          <div className="flex flex-col gap-4">
            <PainelFiltros />
            <GraficoCanais />
            <GraficoBairros />
          </div>
        </div>

        {/* Grid de cards de leads — substitui a tabela tradicional */}
        <GridLeads onAssinar={handleAssinar} />
      </main>
    </div>
  )
}

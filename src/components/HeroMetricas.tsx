import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/useAppStore"
import { calcularEstatisticas } from "@/lib/utils"

/**
 * Mini gráfico de barras decorativo, dá textura visual ao card principal
 * sem representar dados reais — é puramente estético.
 */
function MiniBarras() {
  const alturas = [40, 65, 50, 90, 70, 100, 60]
  return (
    <div className="flex items-end gap-[3px] h-7 mt-3">
      {alturas.map((altura, i) => (
        <div
          key={i}
          className="w-[5px] rounded-t-sm bg-gradient-to-b from-dourado-500 to-dourado-700 opacity-80"
          style={{ height: `${altura}%` }}
        />
      ))}
    </div>
  )
}

export function HeroMetricas() {
  const { empresasFiltradas, empresas, carregando } = useAppStore()
  const stats = calcularEstatisticas(empresasFiltradas)
  const totalOriginal = empresas.length

  if (carregando) {
    return (
      <div className="flex gap-px bg-border rounded-2xl overflow-hidden border border-border">
        {[1.3, 1, 1, 1].map((flex, i) => (
          <div
            key={i}
            className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/10"
            style={{ flex }}
          >
            <Skeleton className="h-9 w-16 mb-3" />
            <Skeleton className="h-3 w-24 mb-1.5" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-px bg-border rounded-2xl overflow-hidden border border-border">
      {/* Card principal — alvos identificados, com glow dourado */}
      <div className="relative flex-[1.3] min-w-[200px] p-6 overflow-hidden bg-gradient-to-br from-[#232017] to-[#1a1815]">
        <div className="absolute -top-10 -right-8 w-44 h-44 rounded-full bg-dourado-500/10 blur-2xl pointer-events-none" />
        <p className="relative text-[38px] font-extrabold leading-none tracking-tight text-dourado-400">
          {stats.total}
        </p>
        <p className="relative text-[11px] text-muted-foreground uppercase tracking-wide mt-2.5">
          Alvos identificados
        </p>
        <p className="relative text-xs text-muted-foreground/70 mt-1">
          {totalOriginal !== stats.total
            ? `${totalOriginal} no total, ${stats.total} com filtros`
            : "neste raio de busca"}
        </p>
        <MiniBarras />
      </div>

      {/* Contato direto disponível */}
      <div className="flex-1 min-w-[160px] p-6 bg-gradient-to-br from-secondary/30 to-secondary/5">
        <p className="text-[38px] font-extrabold leading-none tracking-tight text-foreground">
          {stats.comTelefone}
        </p>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide mt-2.5">
          Contato direto disponível
        </p>
        <p className="text-xs text-green-400/80 mt-2.5">
          {stats.total > 0
            ? `↑ ${Math.round((stats.comTelefone / stats.total) * 100)}% têm telefone`
            : "—"}
        </p>
      </div>

      {/* E-mail confirmado */}
      <div className="flex-1 min-w-[160px] p-6 bg-gradient-to-br from-secondary/30 to-secondary/5">
        <p className="text-[38px] font-extrabold leading-none tracking-tight text-foreground">
          {stats.comEmail}
        </p>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide mt-2.5">
          E-mail confirmado
        </p>
        <p className="text-xs text-muted-foreground mt-2.5">
          {stats.total > 0
            ? `${Math.round((stats.comEmail / stats.total) * 100)}% do total`
            : "—"}
        </p>
      </div>

      {/* Qualidade média do lead */}
      <div className="flex-1 min-w-[160px] p-6 bg-gradient-to-br from-secondary/30 to-secondary/5">
        <p className="text-[38px] font-extrabold leading-none tracking-tight text-dourado-400">
          {stats.total > 0 ? stats.scoreMedia.toFixed(1) : "—"}
        </p>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide mt-2.5">
          Qualidade média do lead
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {stats.scoreMedia >= 4
            ? "excelente aderência"
            : stats.scoreMedia >= 2.5
            ? "boa aderência ao perfil"
            : "aderência baixa"}
        </p>
      </div>
    </div>
  )
}

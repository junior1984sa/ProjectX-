// Painel decorativo que envolve o MapaProspeccao existente com o novo
// cabeçalho de painel (estilo "Onde estão os alvos") usado no resto do dashboard.
import { MapaProspeccao } from "@/components/MapaProspeccao"

export function PainelMapa() {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/60 overflow-hidden h-full">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between flex-wrap gap-2">
        <p className="text-[13px] font-semibold text-foreground/90 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-dourado-400 shadow-[0_0_8px_rgba(212,176,106,0.6)]" />
          Onde estão os alvos
        </p>
        <div className="flex gap-3 text-[10.5px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Alta aderência
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-dourado-400" />
            Média
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Baixa
          </span>
        </div>
      </div>
      <div className="px-5 pb-5">
        <MapaProspeccao />
      </div>
    </div>
  )
}

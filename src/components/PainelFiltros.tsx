import { Phone, Mail, Globe, Share2 } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { useTranslation } from "react-i18next"

interface FiltroChip {
  id: string
  /** Chave de tradução — o rótulo é resolvido na hora de renderizar */
  chaveLabel: string
  icone: React.ReactNode
  chave: "temTelefone" | "temEmail" | "temWebsite" | "temRedesSociais"
}

const CHIPS: FiltroChip[] = [
  { id: "tel", chaveLabel: "painel.comTelefone", icone: <Phone className="w-3 h-3" />, chave: "temTelefone" },
  { id: "mail", chaveLabel: "painel.comEmail", icone: <Mail className="w-3 h-3" />, chave: "temEmail" },
  { id: "site", chaveLabel: "painel.comSite", icone: <Globe className="w-3 h-3" />, chave: "temWebsite" },
  { id: "redes", chaveLabel: "painel.redesSociais", icone: <Share2 className="w-3 h-3" />, chave: "temRedesSociais" },
]

/** Anel circular indicando o score mínimo selecionado, no estilo "dial" do mockup aprovado */
function AnelScore({ score }: { score: number }) {
  const raio = 26
  const circunferencia = 2 * Math.PI * raio
  const progresso = (score / 5) * circunferencia

  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="flex-shrink-0">
      <circle cx="32" cy="32" r={raio} fill="none" stroke="hsl(var(--border))" strokeWidth="7" />
      <circle
        cx="32"
        cy="32"
        r={raio}
        fill="none"
        stroke="#d4b06a"
        strokeWidth="7"
        strokeDasharray={`${progresso} ${circunferencia}`}
        strokeLinecap="round"
        transform="rotate(-90 32 32)"
      />
      <text
        x="32"
        y="37"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fill="hsl(var(--foreground))"
      >
        {score > 0 ? `${score}+` : "—"}
      </text>
    </svg>
  )
}

export function PainelFiltros() {
  const { filtros, aplicarFiltros } = useAppStore()
  const { t } = useTranslation()

  function alternarChip(chave: FiltroChip["chave"]) {
    aplicarFiltros({ [chave]: !filtros[chave] })
  }

  function ajustarScore(novoValor: number) {
    aplicarFiltros({ scoreMinimo: filtros.scoreMinimo === novoValor ? 0 : novoValor })
  }

  const estrelasLabel = filtros.scoreMinimo > 0
    ? "★".repeat(Math.round(filtros.scoreMinimo)) + "☆".repeat(5 - Math.round(filtros.scoreMinimo))
    : t("painel.qualquerScore")

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/60 overflow-hidden">
      <div className="px-5 pt-4 pb-3">
        <p className="text-[13px] font-semibold text-foreground/90 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-dourado-400 shadow-[0_0_8px_rgba(212,176,106,0.6)]" />
          {t("painel.refinarAlvo")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 px-5 pb-5">
        {CHIPS.map((chip) => {
          const ativo = filtros[chip.chave]
          return (
            <button
              key={chip.id}
              onClick={() => alternarChip(chip.chave)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                ativo
                  ? "border-dourado-700 bg-dourado-900/30 text-dourado-300"
                  : "border-border bg-white/[0.02] text-muted-foreground hover:text-foreground"
              }`}
            >
              {ativo && "✓"}
              {chip.icone}
              {t(chip.chaveLabel)}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-4 px-5 pb-5">
        <button onClick={() => ajustarScore(filtros.scoreMinimo >= 5 ? 0 : Math.min(5, Math.floor(filtros.scoreMinimo) + 1))}>
          <AnelScore score={filtros.scoreMinimo} />
        </button>
        <div className="text-xs text-muted-foreground leading-relaxed">
          {t("painel.scoreMinimo")}
          <br />
          <span className="text-foreground/90 font-medium tracking-wide">{estrelasLabel}</span>
        </div>
      </div>

      <div className="flex gap-1.5 px-5 pb-5">
        {[0, 1, 2, 3, 4, 5].map((nivel) => (
          <button
            key={nivel}
            onClick={() => ajustarScore(nivel)}
            className={`flex-1 h-7 rounded-md text-[11px] font-medium transition-colors ${
              filtros.scoreMinimo === nivel
                ? "bg-dourado-600 text-background"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {nivel === 0 ? t("painel.tudo") : nivel}
          </button>
        ))}
      </div>
    </div>
  )
}

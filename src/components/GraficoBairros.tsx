import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/useAppStore"
import { calcularEstatisticas } from "@/lib/utils"
import { useTranslation } from "react-i18next"

export function GraficoBairros() {
  const { empresasFiltradas, carregando } = useAppStore()
  const { t } = useTranslation()
  const stats = calcularEstatisticas(empresasFiltradas)

  const dadosBairros = Object.entries(stats.porBairro)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([bairro, total]) => ({ bairro, total }))

  const maiorValor = dadosBairros[0]?.total ?? 1

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/60 overflow-hidden">
      <div className="px-5 pt-4 pb-3">
        <p className="text-[13px] font-semibold text-foreground/90 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-dourado-400 shadow-[0_0_8px_rgba(212,176,106,0.6)]" />
          {t("painel.bairrosComMaisAlvos")}
        </p>
      </div>

      <div className="px-5 pb-5 flex flex-col gap-2.5">
        {carregando ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full rounded" style={{ width: `${95 - i * 12}%` }} />
          ))
        ) : dadosBairros.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">{t("painel.semDados")}</p>
        ) : (
          dadosBairros.map((item, index) => (
            <div key={item.bairro} className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-md bg-dourado-900/20 border border-dourado-700/30 text-dourado-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-xs text-foreground/85 w-20 flex-shrink-0 truncate">
                {item.bairro}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-dourado-700 to-dourado-400"
                  style={{ width: `${(item.total / maiorValor) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground w-4 text-right flex-shrink-0">
                {item.total}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

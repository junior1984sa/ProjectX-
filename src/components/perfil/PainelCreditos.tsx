import { useEffect } from "react"
import { Zap, Clock, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useCreditosStore } from "@/store/useCreditosStore"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function PainelCreditos() {
  const { creditos, historico, carregarCreditos, carregarHistorico } = useCreditosStore()

  useEffect(() => {
    carregarCreditos()
    carregarHistorico()
  }, [])

  if (!creditos) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Seus créditos aparecem aqui depois que sua assinatura for ativada.
          </p>
        </CardContent>
      </Card>
    )
  }

  const franquia = creditos.creditos_totais_ciclo
  const disponiveis = creditos.creditos_disponiveis

  /** Quanto o assinante trouxe de ciclos anteriores (créditos não expiram) */
  const acumulado = Math.max(0, disponiveis - franquia)

  /**
   * Proporção do saldo em relação à franquia do ciclo, limitada a 100%.
   * O limite é necessário porque, com acúmulo, o saldo pode ultrapassar
   * a franquia — sem ele a barra estouraria a largura do container.
   */
  const percentualRestante =
    franquia > 0 ? Math.min(100, Math.round((disponiveis / franquia) * 100)) : 0

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-dourado-400" />
          Créditos de busca
        </CardTitle>
        <CardDescription>
          Cada busca consome créditos conforme a quantidade de empresas retornadas.
          O que sobrar não expira: soma à recarga do próximo ciclo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold text-dourado-400">
              {disponiveis}
            </span>
            <span className="text-sm text-muted-foreground">
              {acumulado > 0
                ? `${franquia} do plano + ${acumulado} acumulados`
                : `de ${franquia} créditos`}
            </span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-dourado-700 to-dourado-400 transition-all"
              style={{ width: `${percentualRestante}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Próxima recarga em{" "}
            {format(new Date(creditos.ciclo_fim), "dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>

        {historico.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <TrendingDown className="w-3 h-3" />
              Uso recente
            </p>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {historico.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-secondary/40"
                >
                  <div>
                    <p className="text-foreground/90">
                      {item.segmento} · {item.cidade}
                    </p>
                    <p className="text-muted-foreground/70 mt-0.5">
                      {item.quantidade_empresas} empresas ·{" "}
                      {format(new Date(item.criado_em), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <span className="text-dourado-400 font-semibold flex-shrink-0 ml-2">
                    -{item.creditos_gastos}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

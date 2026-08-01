import { useEffect, useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Loader2,
  Target,
  Search,
  Gift,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { carregarPainel, formatarBRL, ROTULOS_CATEGORIA, type PainelAdministrativo } from "@/lib/admin"

interface CartaoMetricaProps {
  titulo: string
  valor: string
  subtitulo?: string
  icone: React.ReactNode
  destaque?: "positivo" | "negativo" | "neutro"
}

function CartaoMetrica({ titulo, valor, subtitulo, icone, destaque = "neutro" }: CartaoMetricaProps) {
  const cores = {
    positivo: "text-green-400",
    negativo: "text-red-400",
    neutro: "text-dourado-400",
  }

  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{titulo}</p>
            <p className={`text-xl font-bold mt-1 ${cores[destaque]}`}>{valor}</p>
            {subtitulo && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{subtitulo}</p>
            )}
          </div>
          <div className={`flex-shrink-0 ${cores[destaque]} opacity-60`}>{icone}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function VisaoGeralAdmin() {
  const [painel, setPainel] = useState<PainelAdministrativo | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    carregarPainel().then((dados) => {
      if (!dados) {
        setErro("Não foi possível carregar as métricas. Verifique se você tem permissão de administrador.")
      }
      setPainel(dados)
      setCarregando(false)
    })
  }, [])

  if (carregando) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (erro || !painel) {
    return (
      <div className="rounded-lg bg-destructive/15 border border-destructive/40 p-4">
        <p className="text-sm text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {erro ?? "Erro ao carregar o painel."}
        </p>
      </div>
    )
  }

  const { associados, financeiro, planos, custos_por_categoria, uso } = painel
  const lucroPositivo = financeiro.lucro_mensal >= 0

  return (
    <div className="space-y-6">
      {/* ── Resultado do mês ── */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Resultado mensal
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <CartaoMetrica
            titulo="Receita recorrente"
            valor={formatarBRL(financeiro.receita_mensal)}
            subtitulo="MRR — entra todo mês"
            icone={<TrendingUp className="w-5 h-5" />}
            destaque="positivo"
          />
          <CartaoMetrica
            titulo="Custo mensal"
            valor={formatarBRL(financeiro.custo_mensal)}
            subtitulo="Infra + APIs + ads"
            icone={<TrendingDown className="w-5 h-5" />}
            destaque="negativo"
          />
          <CartaoMetrica
            titulo="Lucro mensal"
            valor={formatarBRL(financeiro.lucro_mensal)}
            subtitulo={`Margem de ${financeiro.margem_pct}%`}
            icone={<Wallet className="w-5 h-5" />}
            destaque={lucroPositivo ? "positivo" : "negativo"}
          />
          <CartaoMetrica
            titulo="Projeção anual"
            valor={formatarBRL(financeiro.receita_anual_projetada)}
            subtitulo="Se a base ficar estável"
            icone={<Target className="w-5 h-5" />}
          />
        </div>

        {/* Alerta de prejuízo — o número mais importante para decidir */}
        {!lucroPositivo && financeiro.custo_mensal > 0 && (
          <div className="mt-3 rounded-lg bg-destructive/15 border border-destructive/40 p-3">
            <p className="text-xs text-red-300">
              <strong>Operando no prejuízo.</strong> Faltam{" "}
              {formatarBRL(Math.abs(financeiro.lucro_mensal))} por mês para o ponto de
              equilíbrio
              {financeiro.ponto_equilibrio_assinantes
                ? ` — aproximadamente ${financeiro.ponto_equilibrio_assinantes} assinantes ativos`
                : ""}
              .
            </p>
          </div>
        )}

        {financeiro.custos_unicos_total > 0 && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Além disso, {formatarBRL(financeiro.custos_unicos_total)} em custos únicos
            (não entram no cálculo mensal).
          </p>
        )}
      </div>

      {/* ── Associados ── */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Associados
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <CartaoMetrica
            titulo="Pagantes ativos"
            valor={String(associados.ativos)}
            subtitulo={`${associados.total} cadastrados no total`}
            icone={<Users className="w-5 h-5" />}
            destaque="positivo"
          />
          <CartaoMetrica
            titulo="Em teste"
            valor={String(associados.em_trial)}
            subtitulo="Podem virar pagantes"
            icone={<Gift className="w-5 h-5" />}
          />
          <CartaoMetrica
            titulo="Pagamento falhou"
            valor={String(associados.em_atraso)}
            subtitulo="Precisam de recuperação"
            icone={<AlertTriangle className="w-5 h-5" />}
            destaque={associados.em_atraso > 0 ? "negativo" : "neutro"}
          />
          <CartaoMetrica
            titulo="Novos (30 dias)"
            valor={String(associados.novos_30_dias)}
            subtitulo={`${associados.cancelados} cancelaram`}
            icone={<TrendingUp className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* ── Onde o dinheiro entra e sai ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Receita por plano
            </h3>
            {planos.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma assinatura ativa ainda.</p>
            ) : (
              <div className="space-y-2">
                {planos.map((p) => (
                  <div key={p.plano} className="flex items-center justify-between text-sm">
                    <span className="text-foreground capitalize">
                      {p.plano}{" "}
                      <span className="text-muted-foreground text-xs">({p.quantidade})</span>
                    </span>
                    <span className="text-dourado-300 font-medium">
                      {formatarBRL(p.receita_total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Custos por categoria
            </h3>
            {custos_por_categoria.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhum custo ativo cadastrado. Ative os custos na aba "Custos".
              </p>
            ) : (
              <div className="space-y-2">
                {custos_por_categoria.map((c) => {
                  const percentual =
                    financeiro.custo_mensal > 0
                      ? (c.total_mensal / financeiro.custo_mensal) * 100
                      : 0
                  return (
                    <div key={c.categoria}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground">
                          {ROTULOS_CATEGORIA[c.categoria as keyof typeof ROTULOS_CATEGORIA] ??
                            c.categoria}
                        </span>
                        <span className="text-red-300/90 font-medium">
                          {formatarBRL(c.total_mensal)}
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-red-400/60 rounded-full"
                          style={{ width: `${Math.min(100, percentual)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Uso da plataforma ── */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Uso da plataforma (30 dias)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CartaoMetrica
            titulo="Buscas realizadas"
            valor={String(uso.buscas_30_dias)}
            icone={<Search className="w-5 h-5" />}
          />
          <CartaoMetrica
            titulo="Créditos consumidos"
            valor={String(uso.creditos_consumidos_30_dias)}
            subtitulo="Indica custo de API"
            icone={<Wallet className="w-5 h-5" />}
          />
          <CartaoMetrica
            titulo="No diretório"
            valor={String(uso.perfis_publicados_diretorio)}
            subtitulo="Perfis publicados"
            icone={<Users className="w-5 h-5" />}
          />
        </div>
      </div>
    </div>
  )
}

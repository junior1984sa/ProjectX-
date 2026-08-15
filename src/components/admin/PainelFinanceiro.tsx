import { useEffect, useMemo, useState } from "react"
import {
  Loader2,
  TrendingUp,
  Target,
  Wallet,
  Percent,
  RotateCcw,
  AlertTriangle,
  Info,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { carregarPainel, formatarBRL, ROTULOS_CATEGORIA, type PainelAdministrativo } from "@/lib/admin"
import {
  carregarPremissas,
  salvarPremissas,
  calcularCenario,
  montarGradeReceitas,
  distribuirAssinantes,
  PREMISSAS_PADRAO,
  MIX_PADRAO_PCT,
  DEGRAUS_CENARIO,
  aliquotaSimples,
  compararAnexos,
  type Premissas,
} from "@/lib/projecao"
import {
  PLANOS,
  ORDEM_PLANOS,
  PAISES_DISPONIVEIS,
  obterPais,
  formatarMoeda,
  type TipoPlano,
} from "@/types/prestador"

/**
 * PAINEL FINANCEIRO — custos reais e receitas possíveis.
 *
 * A aba "Visão geral" mostra o que já aconteceu. Esta mostra o que
 * PODE acontecer: quanto entra por assinante, quantos assinantes pagam
 * a operação e o que sobra em cada degrau de crescimento.
 *
 * A separação importa porque as duas perguntas se respondem em momentos
 * diferentes. Antes da primeira venda, só a projeção informa alguma
 * coisa — e é justamente antes da primeira venda que se decide quanto
 * gastar para consegui-la.
 */

function Metrica({
  titulo,
  valor,
  subtitulo,
  icone,
  tom = "neutro",
}: {
  titulo: string
  valor: string
  subtitulo?: string
  icone: React.ReactNode
  tom?: "positivo" | "negativo" | "neutro"
}) {
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
            <p className={`text-xl font-bold mt-1 ${cores[tom]}`}>{valor}</p>
            {subtitulo && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitulo}</p>}
          </div>
          <div className={`flex-shrink-0 ${cores[tom]} opacity-60`}>{icone}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PainelFinanceiro() {
  const [painel, setPainel] = useState<PainelAdministrativo | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [premissas, setPremissas] = useState<Premissas>(carregarPremissas)

  const [assinantes, setAssinantes] = useState(50)
  const [paisSimulado, setPaisSimulado] = useState("BR")

  useEffect(() => {
    carregarPainel().then((dados) => {
      setPainel(dados)
      setCarregando(false)
    })
  }, [])

  function atualizarPremissas(mudanca: Partial<Premissas>) {
    const novas = { ...premissas, ...mudanca }
    setPremissas(novas)
    salvarPremissas(novas)
  }

  // O custo fixo vem do que já está cadastrado na aba "Custos". Se nada
  // foi cadastrado ainda, projetar contra zero daria lucro fictício —
  // por isso o aviso aparece logo abaixo.
  const custoFixo = painel?.financeiro.custo_mensal ?? 0

  const mix = useMemo(() => distribuirAssinantes(assinantes, MIX_PADRAO_PCT), [assinantes])

  const cenario = useMemo(
    () => calcularCenario(mix, paisSimulado, custoFixo, premissas),
    [mix, paisSimulado, custoFixo, premissas],
  )

  const grade = useMemo(() => montarGradeReceitas(premissas), [premissas])

  if (carregando) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const semCustosCadastrados = custoFixo <= 0

  return (
    <div className="space-y-8">
      {semCustosCadastrados && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-700/40 bg-amber-950/20 p-3.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-amber-200/90 leading-relaxed">
            Nenhum custo fixo cadastrado ainda. Enquanto a aba{" "}
            <strong>Custos</strong> estiver vazia, a projeção assume custo zero e
            todo o lucro mostrado aqui é fictício. Cadastre Vercel, Supabase,
            domínio e APIs primeiro.
          </p>
        </div>
      )}

      {/* ═══ Simulador ═══ */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Simulador de receita</h3>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Quanto o negócio rende com um determinado número de assinantes.
          </p>
        </div>

        <Card className="border-border/60">
          <CardContent className="p-5 space-y-5">
            <div className="grid gap-5 sm:grid-cols-[1fr_200px]">
              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <Label className="text-[13px]">Assinantes</Label>
                  <span className="text-2xl font-bold text-dourado-400 tabular-nums">
                    {assinantes}
                  </span>
                </div>
                <Slider
                  value={[assinantes]}
                  onValueChange={([valor]) => setAssinantes(valor)}
                  min={1}
                  max={1000}
                  step={1}
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {DEGRAUS_CENARIO.map((degrau) => (
                    <button
                      key={degrau}
                      onClick={() => setAssinantes(degrau)}
                      className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                        assinantes === degrau
                          ? "border-azul-500 bg-azul-500/15 text-azul-300"
                          : "border-border/60 text-muted-foreground hover:border-azul-600/60"
                      }`}
                    >
                      {degrau}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-[13px]">País</Label>
                <Select value={paisSimulado} onValueChange={setPaisSimulado}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAISES_DISPONIVEIS.map((pais) => (
                      <SelectItem key={pais.codigo} value={pais.codigo}>
                        {pais.nome} · {pais.moeda}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Simula todos os assinantes nesse país. Converte para real pelo
                  câmbio das premissas.
                </p>
              </div>
            </div>

            {/* Mix aplicado — mostra a composição por trás do número */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-border/40 pt-4">
              {ORDEM_PLANOS.map((plano) => (
                <Badge key={plano} variant="outline" className="text-[11px] font-normal">
                  {PLANOS[plano].nome}: <span className="font-semibold ml-1">{mix[plano]}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metrica
            titulo="Receita bruta / mês"
            valor={formatarBRL(cenario.receitaBrutaMensal)}
            subtitulo={`${formatarBRL(cenario.receitaAnualProjetada)} por ano`}
            icone={<TrendingUp className="w-5 h-5" />}
          />
          <Metrica
            titulo="Margem de contribuição"
            valor={formatarBRL(cenario.margemContribuicaoTotal)}
            subtitulo={`${formatarBRL(cenario.margemMediaPorAssinante)} por assinante`}
            icone={<Percent className="w-5 h-5" />}
          />
          <Metrica
            titulo="Lucro / mês"
            valor={formatarBRL(cenario.lucroMensal)}
            subtitulo={`margem líquida ${cenario.margemLiquidaPct.toFixed(1)}%`}
            icone={<Wallet className="w-5 h-5" />}
            tom={cenario.lucroMensal >= 0 ? "positivo" : "negativo"}
          />
          <Metrica
            titulo="Ponto de equilíbrio"
            valor={
              cenario.pontoEquilibrio === null
                ? "—"
                : `${cenario.pontoEquilibrio} assinantes`
            }
            subtitulo="para pagar o custo fixo"
            icone={<Target className="w-5 h-5" />}
            tom={
              cenario.pontoEquilibrio !== null && cenario.totalAssinantes >= cenario.pontoEquilibrio
                ? "positivo"
                : "neutro"
            }
          />
        </div>

        {/* Para onde vai o dinheiro que entra */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">
              Composição da receita
            </p>
            <div className="space-y-2 text-[13px]">
              {[
                { rotulo: "Receita bruta", valor: cenario.receitaBrutaMensal, sinal: "+" },
                { rotulo: "Taxas do gateway", valor: -cenario.totalTaxasGateway, sinal: "−" },
                { rotulo: "Impostos", valor: -cenario.totalImpostos, sinal: "−" },
                { rotulo: "Custo de API (créditos)", valor: -cenario.totalCustoVariavel, sinal: "−" },
                { rotulo: "Custo fixo mensal", valor: -cenario.custoFixoMensal, sinal: "−" },
                // No Anexo V a linha some: não existe pró-labore obrigatório,
                // e mostrá-la zerada sugeriria uma despesa que não há.
                ...(cenario.proLabore
                  ? [
                      {
                        rotulo: "Pró-labore (fator r)",
                        valor: -cenario.proLabore.saidaDeCaixa,
                        sinal: "−",
                      },
                    ]
                  : []),
              ].map((linha) => (
                <div
                  key={linha.rotulo}
                  className="flex items-center justify-between py-1 border-b border-border/30 last:border-0"
                >
                  <span className="text-muted-foreground">{linha.rotulo}</span>
                  <span
                    className={`tabular-nums font-medium ${
                      linha.valor < 0 ? "text-red-400/80" : "text-foreground"
                    }`}
                  >
                    {linha.sinal} {formatarBRL(Math.abs(linha.valor))}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/60">
                <span className="font-semibold text-foreground">Resultado</span>
                <span
                  className={`tabular-nums font-bold text-base ${
                    cenario.lucroMensal >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {formatarBRL(cenario.lucroMensal)}
                </span>
              </div>
            </div>

            {cenario.proLabore && (
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                O pró-labore aparece como despesa porque, sem ele, o fator
                &quot;r&quot; não fecha 28% e a empresa cai no Anexo V — perdendo
                os 9,5 pontos de imposto que motivaram o Anexo III. Mas ele não é
                dinheiro perdido: é o dono se pagando. O que sai de fato é o INSS
                de {formatarBRL(cenario.proLabore.inss)}.
                {cenario.proLabore.limitadoPeloPiso &&
                  " Neste volume o valor está no piso do salário mínimo, não no percentual — é a faixa em que o Anexo III ainda não compensa."}
                {cenario.proLabore.atingeIRRF &&
                  " Acima de R$ 5.000 mensais entra IRRF na fonte, que reduz o líquido do sócio sem alterar o custo da empresa."}
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ═══ Cenários prontos ═══ */}
      <section className="space-y-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Degraus de crescimento</h3>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Mesmo mix e mesmo país do simulador, em cada patamar de assinantes.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-[13px]">
            <thead className="bg-card/60">
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2.5 font-medium">Assinantes</th>
                <th className="px-3 py-2.5 font-medium text-right">Receita bruta</th>
                <th className="px-3 py-2.5 font-medium text-right">Margem contrib.</th>
                <th className="px-3 py-2.5 font-medium text-right">Lucro / mês</th>
                <th className="px-3 py-2.5 font-medium text-right">Receita / ano</th>
              </tr>
            </thead>
            <tbody>
              {DEGRAUS_CENARIO.map((degrau) => {
                const linha = calcularCenario(
                  distribuirAssinantes(degrau, MIX_PADRAO_PCT),
                  paisSimulado,
                  custoFixo,
                  premissas,
                )
                return (
                  <tr key={degrau} className="border-t border-border/40">
                    <td className="px-3 py-2.5 font-semibold text-foreground tabular-nums">
                      {degrau}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                      {formatarBRL(linha.receitaBrutaMensal)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                      {formatarBRL(linha.margemContribuicaoTotal)}
                    </td>
                    <td
                      className={`px-3 py-2.5 text-right tabular-nums font-semibold ${
                        linha.lucroMensal >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {formatarBRL(linha.lucroMensal)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                      {formatarBRL(linha.receitaAnualProjetada)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══ Custo fixo real, por categoria ═══ */}
      {painel && painel.custos_por_categoria.length > 0 && (
        <section className="space-y-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">Custo fixo hoje</h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              O que já está cadastrado na aba Custos, mensalizado.
            </p>
          </div>

          <Card className="border-border/60">
            <CardContent className="p-5 space-y-2 text-[13px]">
              {painel.custos_por_categoria.map((custo) => {
                const proporcao =
                  custoFixo > 0 ? (custo.total_mensal / custoFixo) * 100 : 0
                return (
                  <div key={custo.categoria} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {ROTULOS_CATEGORIA[custo.categoria as keyof typeof ROTULOS_CATEGORIA] ??
                          custo.categoria}
                      </span>
                      <span className="tabular-nums font-medium text-foreground">
                        {formatarBRL(custo.total_mensal)}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-border/40 overflow-hidden">
                      <div
                        className="h-full bg-azul-500/80 rounded-full"
                        style={{ width: `${Math.min(100, proporcao)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-between pt-3 mt-1 border-t border-border/60">
                <span className="font-semibold text-foreground">Total mensal</span>
                <span className="tabular-nums font-bold text-dourado-400">
                  {formatarBRL(custoFixo)}
                </span>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* ═══ Receita por plano e país ═══ */}
      <section className="space-y-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Quanto rende cada plano, em cada país
          </h3>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Um assinante, por mês, já descontados gateway, imposto e API.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-[13px]">
            <thead className="bg-card/60">
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2.5 font-medium">País</th>
                <th className="px-3 py-2.5 font-medium">Plano</th>
                <th className="px-3 py-2.5 font-medium text-right">Preço do ciclo</th>
                <th className="px-3 py-2.5 font-medium text-right">Bruto / mês</th>
                <th className="px-3 py-2.5 font-medium text-right">Sobra / mês</th>
                <th className="px-3 py-2.5 font-medium text-right">Margem</th>
              </tr>
            </thead>
            <tbody>
              {grade.map((linha) => (
                <tr
                  key={`${linha.pais}-${linha.plano}`}
                  className="border-t border-border/40 hover:bg-card/40"
                >
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {obterPais(linha.pais).nome}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {PLANOS[linha.plano as TipoPlano].nome}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground whitespace-nowrap">
                    {formatarMoeda(linha.precoCicloLocal, linha.pais)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {formatarBRL(linha.brutoMensalBRL)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold text-foreground">
                    {formatarBRL(linha.margemContribuicaoBRL)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right tabular-nums ${
                      linha.margemPct >= 70 ? "text-green-400" : "text-muted-foreground"
                    }`}
                  >
                    {linha.margemPct.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══ Premissas ═══ */}
      <section className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">Premissas do cálculo</h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Ajuste conforme os números reais da sua operação.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPremissas(PREMISSAS_PADRAO)
              salvarPremissas(PREMISSAS_PADRAO)
            }}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Restaurar
          </Button>
        </div>

        <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-card/30 p-3.5">
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Os valores iniciais são estimativas de partida, não cotações ao vivo.
            As taxas de gateway variam por prazo de repasse e volume, e o câmbio
            muda todo dia. Confirme cada um antes de usar esta projeção para
            decidir investimento.
          </p>
        </div>

        <Card className="border-border/60">
          <CardContent className="p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-[12px]">Custo por crédito (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={premissas.custoPorCredito}
                onChange={(e) =>
                  atualizarPremissas({ custoPorCredito: Number(e.target.value) || 0 })
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Uma consulta de lugares na faixa paga do Google.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px]">Uso médio dos créditos (%)</Label>
              <Input
                type="number"
                step="1"
                value={Math.round(premissas.usoMedioCreditos * 100)}
                onChange={(e) =>
                  atualizarPremissas({
                    usoMedioCreditos: Math.min(1, Math.max(0, Number(e.target.value) / 100)),
                  })
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Quanto do saldo o assinante médio realmente gasta.
              </p>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[12px]">Anexo do Simples Nacional</Label>
              <div className="flex gap-2">
                {(["III", "V"] as const).map((anexo) => (
                  <Button
                    key={anexo}
                    type="button"
                    variant={premissas.anexoSimples === anexo ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => atualizarPremissas({ anexoSimples: anexo })}
                  >
                    Anexo {anexo}
                  </Button>
                ))}
              </div>
              <div className="rounded-md border border-border/60 bg-muted/30 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                <p className="mb-1.5">
                  A alíquota não é digitada — ela vem do anexo e de a receita ser
                  ou não exportação de serviço:
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono">
                  <span>Brasil</span>
                  <span className="text-right text-foreground">
                    {aliquotaSimples(premissas.anexoSimples, "BR").toFixed(3)}%
                  </span>
                  <span>Exportação</span>
                  <span className="text-right text-foreground">
                    {aliquotaSimples(premissas.anexoSimples, "US").toFixed(3)}%
                  </span>
                </div>
                <p className="mt-1.5">
                  Anexo III exige fator &quot;r&quot; de 28% (folha ÷ receita). Sem
                  pró-labore, o enquadramento é o V. Exportação de serviço não paga
                  PIS, Cofins nem ISS dentro do DAS (LC 123, art. 18, §14).
                </p>
                {(() => {
                  // O painel desconta o pró-labore inteiro do resultado, o
                  // que é correto para a empresa e enganoso para a decisão:
                  // esse dinheiro vai para o dono. Aqui compara-se só o que
                  // some de fato — imposto mais INSS.
                  const c = compararAnexos(cenario.receitaBrutaMensal)
                  if (cenario.receitaBrutaMensal <= 0) return null
                  return (
                    <p className="mt-1.5 pt-1.5 border-t border-border/40">
                      Neste volume, o que evapora em imposto + INSS:{" "}
                      <strong className="text-foreground">
                        Anexo III {formatarBRL(c.custoAnexoIII)}
                      </strong>{" "}
                      contra{" "}
                      <strong className="text-foreground">
                        Anexo V {formatarBRL(c.custoAnexoV)}
                      </strong>
                      .{" "}
                      {c.vantagemDoIII > 0
                        ? `O Anexo III economiza ${formatarBRL(c.vantagemDoIII)} por mês.`
                        : `O Anexo V ainda é melhor — o III vira a partir de ${formatarBRL(c.receitaDeVirada)} de receita mensal.`}
                    </p>
                  )
                })()}
              </div>
            </div>

            {(["mercadopago", "stripe", "paypal"] as const).map((gateway) => (
              <div key={gateway} className="space-y-1.5">
                <Label className="text-[12px] capitalize">Taxa {gateway} (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={premissas.taxaGatewayPct[gateway]}
                  onChange={(e) =>
                    atualizarPremissas({
                      taxaGatewayPct: {
                        ...premissas.taxaGatewayPct,
                        [gateway]: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">
              Câmbio para real
            </p>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Object.keys(premissas.cambio)
                .filter((moeda) => moeda !== "BRL")
                .map((moeda) => (
                  <div key={moeda} className="space-y-1.5">
                    <Label className="text-[12px]">1 {moeda} =</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={premissas.cambio[moeda]}
                      onChange={(e) =>
                        atualizarPremissas({
                          cambio: { ...premissas.cambio, [moeda]: Number(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ArrowRight,
  Globe,
  Search,
  Target,
  MessageCircle,
  Megaphone,
  Crosshair,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CarrosselPrestadores } from "@/components/CarrosselPrestadores"
import { PreviaResultados } from "@/components/PreviaResultados"
import { EscolhaIdiomaPais } from "@/components/EscolhaIdiomaPais"
import { usePreferenciasStore } from "@/store/usePreferenciasStore"
import { usePromocaoStore } from "@/store/usePromocaoStore"
import { obterPais, PAISES_DISPONIVEIS, TOTAL_SEGMENTOS_MAPEADOS } from "@/types/prestador"
import { useEffect, useState } from "react"

/**
 * PÁGINA DE APRESENTAÇÃO — a primeira coisa que um visitante vê.
 *
 * Antes, quem chegava pelo link caía direto na busca, sem nenhuma
 * explicação do que o produto faz nem motivo para criar conta. Como
 * toda a estratégia de captação aponta para cá, levar tráfego a uma
 * página que não convence é queimar o esforço de prospecção.
 *
 * A ordem dos blocos segue a objeção que o visitante levanta:
 *   1. o que é isso           → tese em uma frase
 *   2. será que funciona      → demonstração SEM cadastro
 *   3. como funciona          → três passos
 *   4. em que isso é diferente → anúncio espera, ProspectX vai
 *   5. quanto custa            → a conta ANTES do preço
 *
 * O botão principal leva para a busca, não para o cadastro. A maior
 * arma do produto é deixar a pessoa ver empresas reais antes de
 * qualquer compromisso — pedir cadastro primeiro joga isso fora.
 */
export function TelaAbertura() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { pais, escolheu, reabrirEscolha } = usePreferenciasStore()
  const { ativa, vagasUsadas, vagasTotais, carregarStatus } = usePromocaoStore()

  /**
   * Guarda POR QUE a escolha foi aberta. Quem clicou em "buscar" quer
   * seguir para a busca depois de escolher; quem clicou no país no
   * rodapé só quer trocar e continuar lendo a página.
   */
  const [escolhaAberta, setEscolhaAberta] = useState<null | "busca" | "trocar">(null)

  useEffect(() => {
    carregarStatus()
  }, [])

  useEffect(() => {
    if (!escolhaAberta || !escolheu) return

    const destino = escolhaAberta
    setEscolhaAberta(null)
    if (destino === "busca") navigate("/buscar")
  }, [escolhaAberta, escolheu])

  /**
   * A escolha de país NÃO bloqueia a entrada, de propósito.
   *
   * Antes ela vinha primeiro, e um visitante que clicou num anúncio
   * caía direto num formulário perguntando país e idioma — sem saber
   * o que o produto faz. Ninguém preenche formulário de quem ainda não
   * sabe se quer. País é parâmetro de busca; a pergunta certa é feita
   * no momento de buscar, não na porta.
   */
  const paisAtual = obterPais(pais)
  const vagasRestantes = Math.max(0, vagasTotais - vagasUsadas)
  const promocaoVisivel = ativa && vagasRestantes > 0

  /**
   * Só pergunta o país na hora de buscar — e só se ainda não souber.
   * Sem país a busca assume Brasil e alguém em Sydney não encontra nada.
   */
  function irParaBusca() {
    if (!escolheu) {
      setEscolhaAberta("busca")
      return
    }
    navigate("/buscar")
  }

  const passos = [
    { icone: Search, titulo: t("apresentacao.passo1Titulo"), texto: t("apresentacao.passo1Texto") },
    { icone: Target, titulo: t("apresentacao.passo2Titulo"), texto: t("apresentacao.passo2Texto") },
    { icone: MessageCircle, titulo: t("apresentacao.passo3Titulo"), texto: t("apresentacao.passo3Texto") },
  ]

  if (escolhaAberta) {
    return <EscolhaIdiomaPais />
  }

  return (
    <div className="min-h-screen">
      {/* ═══ Tese ═══ */}
      <section className="relative overflow-hidden px-5 pt-14 pb-10 sm:pt-20 sm:pb-14">
        {/* Dois halos sobrepostos dão profundidade ao fundo escuro; um só
            achata a composição e o topo fica com cara de página vazia. */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-32 w-[820px] h-[820px] rounded-full bg-dourado-500/[0.07] blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 -translate-x-1/2 top-40 w-[520px] h-[420px] rounded-full bg-prata-500/[0.04] blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto text-center flex flex-col items-center gap-5 animate-fadeIn">
          <img
            src="/logo-projectx.png"
            alt="ProspectX"
            className="w-44 sm:w-56 drop-shadow-[0_0_50px_rgba(212,176,106,0.2)]"
          />

          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-dourado-300 border border-dourado-800/40 bg-dourado-900/20 rounded-full px-3 py-1">
            <span className="w-1 h-1 rounded-full bg-dourado-400 animate-pulse" />
            {t("apresentacao.eyebrow")}
          </span>

          <h1 className="text-[2rem] leading-[1.05] sm:text-[3.4rem] font-bold tracking-tight text-balance bg-gradient-to-b from-white via-prata-100 to-prata-400 bg-clip-text text-transparent">
            {t("apresentacao.titulo")}
          </h1>

          <p className="text-base sm:text-[1.0625rem] text-muted-foreground leading-relaxed max-w-xl text-pretty">
            {t("apresentacao.subtitulo")}
          </p>

          <div className="flex flex-col items-center gap-2.5 mt-1 w-full sm:w-auto">
            <Button
              onClick={irParaBusca}
              size="xl"
              className="w-full sm:w-auto sm:px-11 bg-gradient-to-r from-dourado-500 to-dourado-700 hover:from-dourado-400 hover:to-dourado-600 text-prata-900 font-semibold shadow-xl shadow-dourado-900/40 transition-all hover:shadow-dourado-800/50 hover:-translate-y-0.5"
            >
              {t("apresentacao.ctaPrincipal")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground/70">
              {t("apresentacao.ctaObservacao")}
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Prévia do produto ═══
          Vem logo depois da tese, antes de qualquer explicação: mostrar
          o formato da entrega convence mais rápido que descrevê-la. */}
      <section className="px-5 pb-12">
        <div className="max-w-lg mx-auto">
          <PreviaResultados />
        </div>
      </section>

      {/* ═══ Números reais ═══
          Todos calculados a partir da configuração do sistema, não
          digitados à mão: se mudarmos a cobertura, o texto acompanha. */}
      <section className="px-5 pb-14">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-3">
          {[
            { valor: String(PAISES_DISPONIVEIS.length), rotulo: t("apresentacao.statPaises") },
            { valor: `${TOTAL_SEGMENTOS_MAPEADOS}+`, rotulo: t("apresentacao.statSegmentos") },
            { valor: "7", rotulo: t("apresentacao.statTeste") },
          ].map((stat) => (
            <div
              key={stat.rotulo}
              className="rounded-xl border border-border/50 bg-card/30 px-3 py-4 text-center"
            >
              <p className="text-2xl sm:text-3xl font-bold text-dourado-400 tabular-nums">
                {stat.valor}
              </p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wide mt-1 leading-tight">
                {stat.rotulo}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Prova: prestadores reais no diretório ═══ */}
      <section className="pb-14">
        <CarrosselPrestadores />
      </section>

      {/* ═══ Como funciona ═══ */}
      <section className="px-5 py-14 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-9">
            {t("apresentacao.comoFunciona")}
          </h2>

          <div className="grid gap-6 sm:grid-cols-3">
            {passos.map((passo, i) => {
              const Icone = passo.icone
              return (
                <div key={i} className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-dourado-900/30 border border-dourado-800/40 flex items-center justify-center flex-shrink-0">
                      <Icone className="w-4 h-4 text-dourado-400" />
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-snug">
                    {passo.titulo}
                  </h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    {passo.texto}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ O que muda em relação a anunciar ═══ */}
      <section className="px-5 py-14 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-9">
            {t("apresentacao.diferencialTitulo")}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Megaphone className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {t("apresentacao.difEsperar")}
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground/80 leading-relaxed">
                {t("apresentacao.difEsperarTexto")}
              </p>
            </div>

            <div className="rounded-xl border-2 border-dourado-600/50 bg-dourado-900/10 p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-dourado-300">
                <Crosshair className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {t("apresentacao.difIr")}
                </span>
              </div>
              <p className="text-[13px] text-dourado-200/80 leading-relaxed">
                {t("apresentacao.difIrTexto")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ A conta, antes do preço ═══ */}
      <section className="px-5 py-14 border-t border-border/50">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("apresentacao.contaTitulo")}
          </h2>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            {t("apresentacao.contaTexto")}
          </p>
          <p className="text-[13px] text-muted-foreground/70">
            {t("apresentacao.contaRodape")}
          </p>
        </div>
      </section>

      {/* ═══ Planos ═══ */}
      <section className="px-5 py-14 border-t border-border/50">
        <div className="max-w-xl mx-auto text-center space-y-5">
          <div className="space-y-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {t("apresentacao.planosTitulo")}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("apresentacao.planosTexto")}
            </p>

            {/* O número vem do contador real no banco. Escassez só
                funciona se for verdadeira — e some quando esgota. */}
            {promocaoVisivel && (
              <p className="text-sm font-semibold text-dourado-300">
                {t("planos.promocaoUltimas", { restantes: vagasRestantes })}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <Button
              onClick={() => navigate("/planos")}
              size="lg"
              className="bg-gradient-to-r from-dourado-600 to-dourado-700 hover:from-dourado-700 hover:to-dourado-800 text-white font-semibold"
            >
              {t("apresentacao.verPlanos")}
            </Button>
            <Button
              onClick={() => navigate("/entrar")}
              size="lg"
              variant="outline"
              className="border-dourado-700/50 text-dourado-300 hover:bg-dourado-900/20"
            >
              {t("apresentacao.criarConta")}
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ Rodapé: idioma e país ═══ */}
      <footer className="px-5 py-8 border-t border-border/50">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground/60 text-center">
            {t("abertura.chamada")}
          </p>
          <button
            onClick={() => {
              reabrirEscolha()
              setEscolhaAberta("trocar")
            }}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-dourado-300 transition-colors"
            title={t("preferencias.alterar")}
          >
            <Globe className="w-3 h-3" />
            {t(`paises.${paisAtual.codigo}`)}
            <span className="opacity-50">·</span>
            {paisAtual.moeda}
          </button>
        </div>
      </footer>
    </div>
  )
}

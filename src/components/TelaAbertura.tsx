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
import { EscolhaIdiomaPais } from "@/components/EscolhaIdiomaPais"
import { usePreferenciasStore } from "@/store/usePreferenciasStore"
import { usePromocaoStore } from "@/store/usePromocaoStore"
import { obterPais } from "@/types/prestador"
import { useEffect } from "react"

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

  useEffect(() => {
    carregarStatus()
  }, [])

  if (!escolheu) {
    return <EscolhaIdiomaPais />
  }

  const paisAtual = obterPais(pais)
  const vagasRestantes = Math.max(0, vagasTotais - vagasUsadas)
  const promocaoVisivel = ativa && vagasRestantes > 0

  const passos = [
    { icone: Search, titulo: t("apresentacao.passo1Titulo"), texto: t("apresentacao.passo1Texto") },
    { icone: Target, titulo: t("apresentacao.passo2Titulo"), texto: t("apresentacao.passo2Texto") },
    { icone: MessageCircle, titulo: t("apresentacao.passo3Titulo"), texto: t("apresentacao.passo3Texto") },
  ]

  return (
    <div className="min-h-screen">
      {/* ═══ Tese ═══ */}
      <section className="relative overflow-hidden px-5 pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="absolute left-1/2 -translate-x-1/2 -top-20 w-[680px] h-[680px] rounded-full bg-dourado-500/[0.06] blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <img
            src="/logo-projectx.png"
            alt="ProspectX"
            className="w-40 sm:w-48 drop-shadow-[0_0_40px_rgba(212,176,106,0.15)]"
          />

          <span className="text-[11px] uppercase tracking-[0.16em] text-dourado-400">
            {t("apresentacao.eyebrow")}
          </span>

          <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight leading-[1.08] text-balance">
            {t("apresentacao.titulo")}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
            {t("apresentacao.subtitulo")}
          </p>

          <div className="flex flex-col items-center gap-2.5 mt-1 w-full sm:w-auto">
            <Button
              onClick={() => navigate("/buscar")}
              size="xl"
              className="w-full sm:w-auto sm:px-10 bg-gradient-to-r from-dourado-600 to-dourado-700 hover:from-dourado-700 hover:to-dourado-800 text-white font-semibold shadow-lg shadow-dourado-900/30"
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
            onClick={reabrirEscolha}
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

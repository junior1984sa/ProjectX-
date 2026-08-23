import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ArrowRight,
  Search,
  Target,
  MessageCircle,
  Megaphone,
  Crosshair,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CarrosselPrestadores } from "@/components/CarrosselPrestadores"
import { PreviaResultados } from "@/components/PreviaResultados"
import { usePromocaoStore } from "@/store/usePromocaoStore"
import { PAISES_DISPONIVEIS, TOTAL_SEGMENTOS_MAPEADOS } from "@/types/prestador"

/**
 * COMO FUNCIONA — o argumento de venda, fora da porta de entrada.
 *
 * Estes blocos moravam na página inicial. Saíram de lá porque a home
 * não recebe tráfego frio de anúncio: quem chega já conhece o produto, e
 * seis seções de convencimento só afastavam a pessoa da ação.
 *
 * Aqui eles continuam úteis, para dois públicos: quem foi indicado e
 * quer entender antes de testar, e nós mesmos, quando precisarmos de um
 * link que explique o produto numa conversa de prospecção.
 *
 * A ordem segue a objeção que o visitante levanta:
 *   1. o que é isso            → tese
 *   2. será que funciona       → formato do resultado
 *   3. como funciona           → três passos
 *   4. em que isso é diferente → anúncio espera, WhoHiresYou vai
 *   5. quanto custa            → a conta ANTES do preço
 */
export function PaginaComoFunciona() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { ativa, vagasUsadas, vagasTotais, carregarStatus } = usePromocaoStore()

  useEffect(() => {
    carregarStatus()
  }, [])

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
      <section className="relative overflow-hidden px-5 pt-12 pb-10 sm:pt-16 sm:pb-14">
        <div className="absolute left-1/2 -translate-x-1/2 -top-32 w-[720px] h-[720px] max-w-[100vw] rounded-full bg-dourado-500/[0.06] blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto text-center flex flex-col items-center gap-5">
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-dourado-300 border border-dourado-800/40 bg-dourado-900/20 rounded-full px-3 py-1">
            {t("apresentacao.eyebrow")}
          </span>

          <h1 className="text-[2rem] leading-[1.05] sm:text-[3rem] font-bold tracking-tight text-balance bg-gradient-to-b from-white via-prata-100 to-prata-400 bg-clip-text text-transparent">
            {t("apresentacao.titulo")}
          </h1>

          <p className="text-base sm:text-[1.0625rem] text-muted-foreground leading-relaxed max-w-xl text-pretty">
            {t("apresentacao.subtitulo")}
          </p>

          <Button
            onClick={() => navigate("/")}
            size="xl"
            className="w-full sm:w-auto sm:px-11 bg-dourado-500 hover:bg-dourado-400 active:bg-dourado-600 text-prata-900 font-semibold shadow-xl shadow-dourado-900/40 transition-all hover:-translate-y-0.5"
          >
            {t("apresentacao.ctaPrincipal")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground/70 -mt-2">
            {t("apresentacao.ctaObservacao")}
          </p>
        </div>
      </section>

      {/* ═══ Formato do resultado ═══ */}
      <section className="px-5 pb-12">
        <div className="max-w-lg mx-auto">
          <PreviaResultados />
        </div>
      </section>

      {/* ═══ Escopo do produto ═══ */}
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

      {/* ═══ Prestadores reais no diretório ═══ */}
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
                <span className="text-sm font-semibold">{t("apresentacao.difEsperar")}</span>
              </div>
              <p className="text-[13px] text-muted-foreground/80 leading-relaxed">
                {t("apresentacao.difEsperarTexto")}
              </p>
            </div>

            <div className="rounded-xl border-2 border-dourado-600/50 bg-dourado-900/10 p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-dourado-300">
                <Crosshair className="w-4 h-4" />
                <span className="text-sm font-semibold">{t("apresentacao.difIr")}</span>
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
              className="bg-dourado-500 hover:bg-dourado-400 active:bg-dourado-600 text-prata-900 font-semibold"
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
    </div>
  )
}

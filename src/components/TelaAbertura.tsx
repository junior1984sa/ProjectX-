import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Search, MapPin, Globe, Loader2, Clock } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { usePreferenciasStore } from "@/store/usePreferenciasStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useExecutarBusca } from "@/hooks/useExecutarBusca"
import { EscolhaIdiomaPais } from "@/components/EscolhaIdiomaPais"
import { HomeSecoes } from "@/components/HomeSecoes"
import {
  obterPais,
  obterSegmentosClientes,
  PAISES_DISPONIVEIS,
  TOTAL_SEGMENTOS_MAPEADOS,
  type ModoBusca,
} from "@/types/prestador"

/**
 * PÁGINA INICIAL — o instrumento, não o folheto.
 *
 * A versão anterior era uma landing de vendas com seis seções: manchete,
 * prévia, números, passos, comparativo e planos. Isso faz sentido para
 * quem compra tráfego frio, que precisa ser convencido do zero. Não é o
 * nosso caso: sem anúncios, quem chega aqui já ouviu falar do produto, e
 * argumentar com quem já está convencido só atrasa a ação.
 *
 * Então a home É a prospecção. O argumento de venda mudou de endereço:
 * mora em /como-funciona, alcançável pelo rodapé por quem quiser.
 *
 * A VALIDAÇÃO DO FORMULÁRIO É CONTADA POR UMA RÉGUA, não por um botão
 * que acende. A barra tem duas metades na base: a da esquerda pertence
 * ao campo de ramo, a da direita ao de cidade, e cada uma se preenche
 * quando o seu campo é preenchido. Com as duas cheias, a busca está
 * pronta — e a pessoa vê isso sem precisar ler nada.
 *
 * Isso nasceu como um X, quando a marca era um X. A marca mudou para
 * WhoHiresYou e o X saiu: um X grande no meio da tela lê como
 * "cancelar" quando não é mais identidade visual. A régua sobreviveu
 * porque o mecanismo nunca dependeu do desenho.
 */

export function TelaAbertura() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { pais, escolheu, reabrirEscolha } = usePreferenciasStore()
  const { usuarioId } = useAuthStore()
  const { historicoBuscas } = useAppStore()
  const { executarBusca, buscandoMapeamento, carregando } = useExecutarBusca()

  const [segmento, setSegmento] = useState("")
  const [cidade, setCidade] = useState("")
  const [modoBusca, setModoBusca] = useState<ModoBusca>("clientes")
  const [trocandoPais, setTrocandoPais] = useState(false)

  const configPais = obterPais(pais)
  const temRamo = segmento.trim().length > 0
  const temCidade = cidade.trim().length > 0
  const pronto = temRamo && temCidade
  const ocupado = carregando || buscandoMapeamento

  /**
   * A linha-tradução é o único conceito do produto que não é
   * auto-evidente: que buscamos quem CONTRATA o serviço, não quem o
   * presta. Mostrá-la enquanto a pessoa digita dispensa uma seção
   * "como funciona" — ela vê o mecanismo em vez de ler sobre ele.
   */
  const clientesPrevistos =
    modoBusca === "clientes" && temRamo ? obterSegmentosClientes(segmento).slice(0, 3) : []

  async function handleBuscar() {
    // Raio e tamanho ficam no padrão aqui de propósito: a home pede duas
    // informações, não seis. Quem quiser ajustar faz isso em /buscar.
    await executarBusca({ segmento, cidade, raioKm: 10, faixaSelecionada: 0, modoBusca })
    navigate("/buscar")
  }

  function handleTecla(e: React.KeyboardEvent) {
    if (e.key === "Enter" && pronto && !ocupado) handleBuscar()
  }

  if (trocandoPais || !escolheu) {
    return <EscolhaIdiomaPais aoConcluir={() => setTrocandoPais(false)} />
  }

  return (
    <div className="min-h-[100svh] flex flex-col">
      {/* ═══ A · Barra utilitária ═══ */}
      <header className="h-14 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
        <button
          onClick={() => {
            reabrirEscolha()
            setTrocandoPais(true)
          }}
          className="flex items-center gap-1.5 text-[13px] text-prata-400 hover:text-prata-200 transition-colors rounded"
        >
          <Globe className="w-3.5 h-3.5" />
          {configPais.idioma.split("-")[0].toUpperCase()}
        </button>

        <div className="flex items-center gap-3">
          {usuarioId ? (
            <Link
              to="/perfil"
              className="text-[13px] text-prata-400 hover:text-prata-200 transition-colors rounded"
            >
              {t("home.meuPerfil")}
            </Link>
          ) : (
            <>
              <Link
                to="/entrar"
                className="text-[13px] text-prata-400 hover:text-prata-200 transition-colors rounded"
              >
                {t("home.entrar")}
              </Link>
              <Link
                to="/entrar"
                className="h-8 px-3 inline-flex items-center rounded-lg border border-prata-600 text-[13px] text-prata-200 hover:border-prata-500 hover:text-prata-100 transition-colors"
              >
                {t("home.criarConta")}
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ═══ B · O instrumento ═══ */}
      {/* A altura mínima é explícita, e não `flex-1`, porque agora existe
          conteúdo depois: com `flex-1` o instrumento encolheria para caber
          junto das seções, e ele deixaria de ocupar a primeira dobra —
          que é a única coisa que a home precisa fazer bem. Descontar a
          barra utilitária (3.5rem) mantém o conjunto centrado na tela. */}
      <main className="relative flex flex-col items-center px-4 pt-[10svh] pb-16 sm:pt-0 sm:pb-0 sm:justify-center sm:min-h-[calc(100svh-3.5rem)] fundo-conteudo">
        {/* Halo único, centrado no vértice. O próprio X fornece a
            segunda massa focal, então dois halos só borrariam o centro. */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/3 w-[720px] h-[720px] max-w-[100vw] rounded-full bg-azul-500/[0.07] blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-[880px] flex flex-col items-center">
          {/* Marca.
              O h1 continua existindo por baixo da imagem: buscador e
              leitor de tela leem texto, não pixels, e uma home cuja
              única identificação é um PNG não é encontrada por ninguém. */}
          <h1 className="leading-none">
            {/* As medidas mudaram junto com a marca: o logotipo antigo
                era quase quadrado (599x579) e o novo e horizontal
                (420x100). Manter as medidas antigas esticaria a imagem. */}
            <img
              src="/logo-whohiresyou.svg"
              alt="WhoHiresYou"
              width={420}
              height={100}
              className="w-64 sm:w-[380px] h-auto"
            />
          </h1>

          <p className="mt-3 sm:mt-4 text-[1.125rem] sm:text-[1.375rem] text-prata-300 text-center leading-snug">
            {t("home.slogan")}
          </p>

          {/* Comutador de modo */}
          <div className="mt-8 sm:mt-12 inline-flex rounded-lg border border-prata-700 p-0.5" role="group">
            {(["clientes", "direta"] as const).map((modo) => (
              <button
                key={modo}
                onClick={() => setModoBusca(modo)}
                aria-pressed={modoBusca === modo}
                className={`h-9 px-3.5 rounded-[6px] text-[13px] transition-colors ${
                  modoBusca === modo
                    ? "bg-prata-800 text-prata-100"
                    : "text-prata-400 hover:text-prata-200"
                }`}
              >
                {modo === "clientes" ? t("busca.modoClientes") : t("busca.modoDireta")}
              </button>
            ))}
          </div>

          {/* ── A barra de busca ── */}
          <div className="relative w-full mt-4">
            {/* A barra: poço mais escuro que o card, borda prata-500
                (4,65:1 — a borda padrão do sistema dá 1,51:1 e reprova) */}
            <div
              aria-busy={ocupado}
              className="relative flex flex-col sm:flex-row gap-2 sm:gap-0 sm:h-16 sm:rounded-xl sm:border sm:border-prata-500 sm:bg-prata-900 sm:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] sm:overflow-hidden"
            >
              {/* Zona 1 — ramo */}
              <label className="flex-[1.4] flex items-center gap-3 px-5 py-3 sm:py-0 h-14 sm:h-auto rounded-xl sm:rounded-none border border-prata-500 sm:border-0 bg-prata-900 cursor-text focus-within:bg-prata-800 transition-colors">
                <Search className={`w-[18px] h-[18px] flex-shrink-0 ${temRamo ? "text-prata-300" : "text-prata-500"}`} />
                <span className="sr-only">
                  {modoBusca === "clientes" ? t("busca.seuRamo") : t("busca.ramoABuscar")}
                </span>
                <input
                  value={segmento}
                  onChange={(e) => setSegmento(e.target.value)}
                  onKeyDown={handleTecla}
                  placeholder={t("home.placeholderRamo")}
                  className="w-full bg-transparent text-[1.125rem] text-prata-100 font-medium placeholder:text-prata-400 placeholder:font-normal outline-none"
                />
              </label>

              <div className="hidden sm:block w-px h-8 self-center bg-prata-700 flex-shrink-0" />

              {/* Zona 2 — cidade, com o país à direita dentro do campo */}
              <label className="flex-1 flex items-center gap-3 px-5 py-3 sm:py-0 h-14 sm:h-auto rounded-xl sm:rounded-none border border-prata-500 sm:border-0 bg-prata-900 cursor-text focus-within:bg-prata-800 transition-colors">
                <MapPin className={`w-[18px] h-[18px] flex-shrink-0 ${temCidade ? "text-prata-300" : "text-prata-500"}`} />
                <span className="sr-only">{t("busca.cidade")}</span>
                <input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  onKeyDown={handleTecla}
                  placeholder={t("busca.placeholderCidade", { exemplo: configPais.exemploCidade })}
                  className="w-full bg-transparent text-[1.125rem] text-prata-100 font-medium placeholder:text-prata-400 placeholder:font-normal outline-none"
                />
                {/* Código ISO em texto, nunca emoji de bandeira: no
                    Windows a bandeira vira as duas letras mesmo, e o
                    leitor de tela não anuncia nada. */}
                <span
                  className="flex-shrink-0 text-[11px] font-medium text-prata-400 border border-prata-700 rounded px-1.5 py-0.5"
                  aria-label={t(`paises.${configPais.codigo}`)}
                >
                  {configPais.codigo}
                </span>
              </label>

              <button
                onClick={handleBuscar}
                disabled={!pronto || ocupado}
                className="h-13 sm:h-auto py-3.5 sm:py-0 sm:w-[216px] flex-shrink-0 flex items-center justify-center gap-2 rounded-xl sm:rounded-none text-[1.125rem] font-semibold transition-colors duration-fast disabled:cursor-not-allowed bg-azul-600 text-white hover:bg-azul-500 active:bg-azul-700 disabled:bg-prata-700 disabled:text-prata-500"
              >
                {ocupado ? (
                  <>
                    <Loader2 className="w-[18px] h-[18px] animate-spin" />
                    {t("home.buscando")}
                  </>
                ) : (
                  t("home.buscar")
                )}
              </button>

              {/* RÉGUA DE PRONTIDÃO.
                  Cada metade pertence a um campo e se preenche quando
                  ele é preenchido — o estado da busca vira sinal visual,
                  sem precisar de texto de ajuda nem de botão desabilitado.

                  Foi removida uma vez por engano: o painel de preview
                  não estava compondo quadros, então as transições CSS
                  ficavam congeladas no valor inicial e a medição dizia
                  que a régua nunca preenchia. Ela sempre funcionou. */}
              <div
                aria-hidden="true"
                className="hidden sm:flex absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden"
              >
                <span
                  className="h-full flex-1 bg-dourado-500 transition-transform duration-medium ease-out motion-reduce:transition-none"
                  style={{ transformOrigin: "right", transform: `scaleX(${temRamo ? 1 : 0})` }}
                />
                <span
                  className="h-full flex-1 bg-dourado-500 transition-transform duration-medium ease-out motion-reduce:transition-none"
                  style={{ transformOrigin: "left", transform: `scaleX(${temCidade ? 1 : 0})` }}
                />
              </div>
            </div>

          </div>

          {/* Linha-tradução — altura reservada mesmo vazia, senão os
              chips empurram o botão para baixo no meio do clique */}
          <div className="h-8 mt-3 w-full flex items-center justify-center gap-1.5 overflow-x-auto">
            {clientesPrevistos.length > 0 && (
              <>
                <span className="text-[13px] text-prata-500 flex-shrink-0">
                  {t("home.vamosProcurar")}
                </span>
                {clientesPrevistos.map((cliente) => (
                  <span
                    key={cliente}
                    className="flex-shrink-0 text-[13px] text-dourado-300 bg-dourado-900/25 border border-dourado-700/50 rounded-full px-2.5 py-0.5"
                  >
                    {cliente}
                  </span>
                ))}
              </>
            )}
          </div>

          <p className="mt-5 text-[13px] text-muted-foreground">{t("home.microlinha")}</p>

          {/* ═══ C · Buscas recentes (só quando existem) ═══ */}
          {historicoBuscas.length > 0 && (
            <div className="mt-16 w-full max-w-md">
              <p className="text-[12px] uppercase tracking-[0.08em] font-semibold text-prata-500 mb-2">
                {t("busca.buscasRecentes")}
              </p>
              <div className="divide-y divide-border/40">
                {historicoBuscas.slice(0, 3).map((busca, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSegmento(busca.segmento)
                      setCidade(busca.estado ? `${busca.cidade}, ${busca.estado}` : busca.cidade)
                    }}
                    className="w-full h-11 flex items-center gap-2.5 text-left text-[13px] text-prata-400 hover:text-prata-200 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 flex-shrink-0 text-prata-600" />
                    <span className="truncate">
                      {busca.segmento} · {busca.cidade}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ═══ C2 · Seções institucionais ═══
          Ficam ABAIXO da dobra, sempre. Quem chega sabendo o que quer
          busca e sai sem ver nada disto; quem vem do Instagram rola e
          entende o produto. A primeira dobra continua sendo o
          instrumento, não o folheto — que foi a decisão original desta
          tela e continua valendo. */}
      <HomeSecoes />

      {/* ═══ D · Rodapé mínimo ═══ */}
      <footer className="flex-shrink-0 py-6 px-4 flex flex-col items-center gap-1.5">
        <nav className="flex items-center gap-x-4 gap-y-1 flex-wrap justify-center text-[13px]">
          {[
            { para: "/como-funciona", texto: t("home.comoFunciona") },
            { para: "/planos", texto: t("home.planos") },
            { para: "/ajuda", texto: t("home.ajuda") },
          ].map((link) => (
            <Link
              key={link.para}
              to={link.para}
              className="text-prata-400 hover:text-prata-200 transition-colors rounded"
            >
              {link.texto}
            </Link>
          ))}
        </nav>
        {/* Escopo verificável do produto — não é prova social. Os três
            números saem da configuração real, então não desatualizam. */}
        <p className="text-[12px] text-prata-500">
          {t("home.escopo", {
            paises: PAISES_DISPONIVEIS.length,
            idiomas: 3,
            ramos: TOTAL_SEGMENTOS_MAPEADOS,
          })}
        </p>
      </footer>
    </div>
  )
}

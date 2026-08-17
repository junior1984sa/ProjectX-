import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Search, Send, GitBranch, Check, Plus, Minus } from "lucide-react"
import { usePreferenciasStore } from "@/store/usePreferenciasStore"
import {
  PLANOS,
  ORDEM_PLANOS,
  PAISES_DISPONIVEIS,
  obterPais,
  formatarMoeda,
  precoTotalNoPais,
  precoMensalEquivalente,
  economiaSobrePlanoAnterior,
  TOTAL_SEGMENTOS_MAPEADOS,
  type TipoPlano,
} from "@/types/prestador"

/**
 * SEÇÕES INSTITUCIONAIS DA HOME
 *
 * Ficam ABAIXO do instrumento, nunca acima. Quem chega sabendo o que
 * quer busca e vai embora sem ver nada disto; quem chega pelo Instagram
 * rola e entende. As duas audiências são atendidas sem que uma atrapalhe
 * a outra — e a primeira dobra continua sendo produto, não folheto.
 *
 * HONESTIDADE, QUE AQUI É REGRA DURA
 * O produto tem zero assinantes. Toda métrica de tração que aparecesse
 * aqui seria inventada, e conteúdo que finge tração custa mais caro que
 * não ter conteúdo. Por isso os únicos números desta página saem da
 * CONFIGURAÇÃO REAL do sistema (quantidade de segmentos mapeados, de
 * países ativos, preços de tabela) — números que não desatualizam
 * porque são lidos do próprio código, e que qualquer pessoa pode
 * conferir usando o produto.
 *
 * Não existe aqui: número de clientes, taxa de acerto, quantidade de
 * empresas na base, depoimento, logotipo de cliente ou selo de
 * verificação. Nada disso é verdade hoje.
 */

// ═══════════════════════════════════════════════════════════
// Peças de composição
// ═══════════════════════════════════════════════════════════

/** Rótulo pequeno em ouro que anuncia a seção. Marca, não ação. */
function Sobrescrito({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-dourado-500">
      {children}
    </p>
  )
}

function Secao({
  id,
  children,
  className = "",
}: {
  id?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`border-t border-prata-700/50 py-20 px-5 ${className}`}>
      <div className="max-w-5xl mx-auto">{children}</div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════
// A · Os três movimentos do produto
// ═══════════════════════════════════════════════════════════

function Pilares() {
  const { t } = useTranslation()

  // Cada pilar corresponde a uma funcionalidade que EXISTE hoje. Não há
  // nenhum "em breve" disfarçado de recurso.
  const pilares = [
    { icone: Search, chave: "descobrir", para: "/buscar" },
    { icone: Send, chave: "abordar", para: "/como-funciona" },
    { icone: GitBranch, chave: "acompanhar", para: "/contatos" },
  ] as const

  return (
    <Secao>
      <div className="max-w-xl">
        <Sobrescrito>{t("secoes.pilares.sobrescrito")}</Sobrescrito>
        <h2 className="font-display text-[26px] sm:text-[32px] leading-[1.15] text-prata-100 mt-3">
          {t("secoes.pilares.titulo")}
        </h2>
        <p className="text-[15px] leading-relaxed text-prata-400 mt-4">
          {t("secoes.pilares.subtitulo")}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3 mt-12">
        {pilares.map(({ icone: Icone, chave, para }) => (
          <Link
            key={chave}
            to={para}
            className="group rounded-xl border border-prata-700 bg-prata-900 p-6 transition-colors hover:border-azul-600"
          >
            <Icone className="w-5 h-5 text-azul-400" />
            <h3 className="font-display text-[17px] text-prata-100 mt-4">
              {t(`secoes.pilares.${chave}.titulo`)}
            </h3>
            <p className="text-[13.5px] leading-relaxed text-prata-400 mt-2">
              {t(`secoes.pilares.${chave}.texto`)}
            </p>
          </Link>
        ))}
      </div>
    </Secao>
  )
}

// ═══════════════════════════════════════════════════════════
// B · Como funciona, em quatro passos
// ═══════════════════════════════════════════════════════════

function Passos() {
  const { t } = useTranslation()
  const passos = ["1", "2", "3", "4"] as const

  return (
    <Secao>
      <div className="max-w-xl">
        <Sobrescrito>{t("secoes.passos.sobrescrito")}</Sobrescrito>
        <h2 className="font-display text-[26px] sm:text-[32px] leading-[1.15] text-prata-100 mt-3">
          {t("secoes.passos.titulo")}
        </h2>
      </div>

      <ol className="grid gap-x-8 gap-y-9 sm:grid-cols-2 mt-12">
        {passos.map((n) => (
          <li key={n} className="flex gap-4">
            {/* O número é ornamento tipográfico, não botão — por isso
                fica em prata, não em azul. Azul aqui sugeriria clique.
                É prata-500 e não prata-600: medido no navegador, o 600
                dá 2,5:1 sobre o obsidian e reprova o mínimo de 3:1 que
                a WCAG exige para texto grande. O 500 entrega 3,67:1. */}
            <span className="font-display text-[28px] leading-none text-prata-500 tabular-nums flex-shrink-0 w-9">
              {`0${n}`}
            </span>
            <div>
              <h3 className="font-display text-[17px] text-prata-100">
                {t(`secoes.passos.p${n}.titulo`)}
              </h3>
              <p className="text-[13.5px] leading-relaxed text-prata-400 mt-1.5">
                {t(`secoes.passos.p${n}.texto`)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Secao>
  )
}

// ═══════════════════════════════════════════════════════════
// C · Preços — com alternador de ciclo e de país
// ═══════════════════════════════════════════════════════════

function Precos() {
  const { t } = useTranslation()
  const { pais: paisPreferido } = usePreferenciasStore()

  const [ciclo, setCiclo] = useState<TipoPlano>("mensal")
  const [pais, setPais] = useState(paisPreferido ?? "BR")

  const config = obterPais(pais)
  const plano = PLANOS[ciclo]
  const total = precoTotalNoPais(ciclo, pais)
  const mensal = precoMensalEquivalente(ciclo, pais)
  const economia = economiaSobrePlanoAnterior(ciclo, pais)

  return (
    <Secao id="precos">
      <div className="max-w-xl">
        <Sobrescrito>{t("secoes.precos.sobrescrito")}</Sobrescrito>
        <h2 className="font-display text-[26px] sm:text-[32px] leading-[1.15] text-prata-100 mt-3">
          {t("secoes.precos.titulo")}
        </h2>
        <p className="text-[15px] leading-relaxed text-prata-400 mt-4">
          {t("secoes.precos.subtitulo")}
        </p>
      </div>

      {/* Alternadores. Ciclo e país mudam o mesmo cartão em vez de
          empilhar quatro colunas: o cliente compara uma coisa de cada
          vez, que é como a decisão realmente acontece. */}
      <div className="flex flex-wrap items-center gap-3 mt-10">
        <div
          role="tablist"
          aria-label={t("secoes.precos.ciclo")}
          className="inline-flex rounded-lg border border-prata-700 bg-prata-900 p-1"
        >
          {ORDEM_PLANOS.map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={ciclo === p}
              onClick={() => setCiclo(p)}
              className={`px-3 py-1.5 rounded-md text-[12.5px] transition-colors ${
                ciclo === p
                  ? "bg-azul-600 text-white"
                  : "text-prata-400 hover:text-prata-200"
              }`}
            >
              {t(`planos.ciclo.${p}`)}
            </button>
          ))}
        </div>

        <select
          value={pais}
          onChange={(e) => setPais(e.target.value)}
          aria-label={t("secoes.precos.pais")}
          className="h-9 rounded-lg border border-prata-700 bg-prata-900 px-3 text-[12.5px] text-prata-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azul-500"
        >
          {PAISES_DISPONIVEIS.map((p) => (
            <option key={p.codigo} value={p.codigo}>
              {p.nome} · {p.moeda}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1.1fr_1fr] mt-6">
        <div className="rounded-xl border border-prata-700 bg-prata-900 p-7">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[40px] leading-none text-prata-100">
              {formatarMoeda(mensal, pais)}
            </span>
            <span className="text-[13px] text-prata-400">
              {t("secoes.precos.porMes")}
            </span>
          </div>

          {plano.meses > 1 && (
            <p className="text-[12.5px] text-prata-400 mt-2">
              {t("secoes.precos.cobradoDeUmaVez", {
                total: formatarMoeda(total, pais),
                meses: plano.meses,
              })}
            </p>
          )}

          {economia > 0 && (
            <p className="inline-flex items-center gap-1.5 mt-3 rounded-md border border-dourado-700/60 bg-dourado-900/20 px-2.5 py-1 text-[12px] text-dourado-300">
              {t("secoes.precos.economia", { pct: economia })}
            </p>
          )}

          <ul className="space-y-2.5 mt-6">
            {[
              t("secoes.precos.item.creditos", { creditos: plano.creditosMensais }),
              t("secoes.precos.item.segmentos", { total: TOTAL_SEGMENTOS_MAPEADOS }),
              t("secoes.precos.item.funil"),
              t("secoes.precos.item.abordagem"),
              t("secoes.precos.item.idiomas"),
            ].map((item) => (
              <li key={item} className="flex gap-2.5 text-[13.5px] text-prata-300">
                <Check className="w-4 h-4 text-verde-400 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>

          <Link
            to="/planos"
            className="mt-7 inline-flex h-10 w-full items-center justify-center rounded-lg bg-azul-600 px-5 text-[14px] font-medium text-white transition-colors hover:bg-azul-500"
          >
            {t("secoes.precos.cta")}
          </Link>
        </div>

        {/* Coluna de transparência. Existe porque a reclamação número um
            contra os concorrentes deste mercado é cobrança que o cliente
            não consegue prever. Dizer a conta antes de cobrar é barato e
            é exatamente o que nenhum deles faz. */}
        <div className="rounded-xl border border-prata-700/60 bg-prata-900/40 p-7">
          <h3 className="font-display text-[16px] text-prata-100">
            {t("secoes.precos.transparencia.titulo")}
          </h3>
          <dl className="mt-5 space-y-4">
            {["credito", "acumulo", "cancelamento", "moeda"].map((k) => (
              <div key={k}>
                <dt className="text-[13px] font-medium text-prata-200">
                  {t(`secoes.precos.transparencia.${k}.p`)}
                </dt>
                <dd className="text-[13px] leading-relaxed text-prata-400 mt-1">
                  {t(`secoes.precos.transparencia.${k}.r`, {
                    moeda: config.moeda,
                  })}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Secao>
  )
}

// ═══════════════════════════════════════════════════════════
// D · Perguntas
// ═══════════════════════════════════════════════════════════

function Perguntas() {
  const { t } = useTranslation()
  const [aberta, setAberta] = useState<string | null>("origem")

  // A primeira pergunta é a mais desconfortável de propósito: de onde
  // vem o dado. Quem compra ferramenta de prospecção já foi enganado
  // por base ruim antes, e responder isso primeiro vale mais que
  // qualquer argumento de recurso.
  const perguntas = ["origem", "cobertura", "creditos", "email", "cancelar"] as const

  return (
    <Secao id="faq">
      <div className="max-w-xl">
        <Sobrescrito>{t("secoes.faq.sobrescrito")}</Sobrescrito>
        <h2 className="font-display text-[26px] sm:text-[32px] leading-[1.15] text-prata-100 mt-3">
          {t("secoes.faq.titulo")}
        </h2>
      </div>

      <div className="mt-10 divide-y divide-prata-700/60 border-y border-prata-700/60">
        {perguntas.map((k) => {
          const estaAberta = aberta === k
          return (
            <div key={k}>
              <button
                onClick={() => setAberta(estaAberta ? null : k)}
                aria-expanded={estaAberta}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-[15px] text-prata-100">
                  {t(`secoes.faq.${k}.p`)}
                </span>
                {estaAberta ? (
                  <Minus className="w-4 h-4 text-prata-400 flex-shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-prata-400 flex-shrink-0" />
                )}
              </button>
              {estaAberta && (
                <p className="pb-5 pr-8 text-[14px] leading-relaxed text-prata-400">
                  {t(`secoes.faq.${k}.r`)}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </Secao>
  )
}

// ═══════════════════════════════════════════════════════════

export function HomeSecoes() {
  return (
    <>
      <Pilares />
      <Passos />
      <Precos />
      <Perguntas />
    </>
  )
}

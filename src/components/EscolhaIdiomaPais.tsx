import { useTranslation } from "react-i18next"
import { Globe, Check } from "lucide-react"
import { usePreferenciasStore } from "@/store/usePreferenciasStore"
import { IDIOMAS_DISPONIVEIS } from "@/i18n"
import { PAISES_DISPONIVEIS, obterPais } from "@/types/prestador"

/**
 * ESCOLHA DE IDIOMA E PAÍS — primeira coisa que o visitante vê.
 *
 * POR QUE LOGO NA ENTRADA:
 * o país não é preferência cosmética, é o que faz a busca funcionar.
 * Sem ele o sistema assume Brasil, e quem procura em "Miami, FL" não
 * recebe resultado nenhum. Perguntar na abertura evita que a primeira
 * experiência da pessoa seja uma busca vazia.
 *
 * Aparece uma vez só: a resposta fica no localStorage e, depois do
 * cadastro, o `pais_foco` do perfil assume. Quem quiser trocar usa o
 * botão discreto que fica na própria tela de abertura.
 */
interface EscolhaIdiomaPaisProps {
  /**
   * Chamado depois de confirmar. Existe porque quem abriu a escolha só
   * para TROCAR de país precisa voltar para onde estava — sem isso a
   * tela ficaria presa, já que `escolheu` volta a ser verdadeiro mas o
   * componente que a abriu não fica sabendo.
   */
  aoConcluir?: () => void
}

export function EscolhaIdiomaPais({ aoConcluir }: EscolhaIdiomaPaisProps = {}) {
  const { t } = useTranslation()
  const { pais, idioma, definirPais, definirIdioma, confirmarEscolha } =
    usePreferenciasStore()

  const paisSelecionado = obterPais(pais)

  /**
   * Compara só a língua base ("pt", "en"): o i18next pode reportar
   * en-US, en-AU ou en-GB, e todos devem marcar o botão "English".
   */
  const idiomaBase = idioma.split("-")[0]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Glow decorativo, mesmo da tela de abertura */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-dourado-500/5 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-5">
          <img
            src="/logo-whohiresyou.svg"
            alt="WhoHiresYou"
            className="w-40 drop-shadow-[0_0_40px_rgba(212,176,106,0.15)]"
          />

          <div className="text-center space-y-2">
            <h1 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
              <Globe className="w-4 h-4 text-dourado-400" />
              {t("preferencias.titulo")}
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("preferencias.subtitulo")}
            </p>
          </div>
        </div>

        {/* ═══ Idioma ═══ */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {t("preferencias.idioma")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {IDIOMAS_DISPONIVEIS.map((item) => (
              <button
                key={item.codigo}
                type="button"
                onClick={() => definirIdioma(item.codigo)}
                className={`py-2.5 rounded-md text-sm font-medium border transition-all ${
                  idiomaBase === item.codigo.split("-")[0]
                    ? "bg-azul-500/15 border-azul-500 text-azul-300"
                    : "bg-secondary border-transparent text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                {item.nomeNativo}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ País ═══ */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {t("preferencias.pais")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PAISES_DISPONIVEIS.map((item) => (
              <button
                key={item.codigo}
                type="button"
                onClick={() => definirPais(item.codigo)}
                className={`relative flex flex-col items-center justify-center py-2.5 px-1 rounded-md text-xs font-medium border transition-all ${
                  pais === item.codigo
                    ? "bg-azul-500/15 border-azul-500 text-azul-300"
                    : "bg-secondary border-transparent text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-1">
                  {pais === item.codigo && <Check className="w-3 h-3 flex-shrink-0" />}
                  {t(`paises.${item.codigo}`)}
                </span>
                {item.gateway === null && (
                  <span className="text-[9px] opacity-60 mt-0.5 leading-tight text-center">
                    {t("preferencias.pagamentoEmBreve")}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Aviso honesto: a busca funciona, a cobrança ainda não */}
        {paisSelecionado.gateway === null && (
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed bg-secondary/40 rounded-md px-3 py-2.5">
            {t("preferencias.avisoPagamento")}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            confirmarEscolha()
            aoConcluir?.()
          }}
          className="w-full py-3 rounded-md bg-azul-600 text-white text-sm font-semibold hover:bg-azul-500 transition-colors"
        >
          {t("preferencias.confirmar")}
        </button>
      </div>
    </div>
  )
}

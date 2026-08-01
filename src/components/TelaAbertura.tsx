import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ChevronRight, Globe } from "lucide-react"
import { CarrosselPrestadores } from "@/components/CarrosselPrestadores"
import { EscolhaIdiomaPais } from "@/components/EscolhaIdiomaPais"
import { usePreferenciasStore } from "@/store/usePreferenciasStore"
import { obterPais } from "@/types/prestador"

/**
 * Tela de abertura: o logo grande funciona como um portal de entrada.
 * É a primeira impressão do app — clicar nele leva para a busca de
 * prospecção, que já funciona livremente, sem exigir login. Abaixo,
 * um carrossel mostra prestadores em destaque — clicar nele leva
 * direto para o cadastro/login, já que ver detalhes exige conta.
 *
 * Na PRIMEIRA visita, antes de tudo isso, pergunta idioma e país. O
 * país não é enfeite: é ele que faz a busca procurar no lugar certo.
 */
export function TelaAbertura() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { pais, escolheu, reabrirEscolha } = usePreferenciasStore()

  if (!escolheu) {
    return <EscolhaIdiomaPais />
  }

  const paisAtual = obterPais(pais)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-12 gap-10">
      {/* Glow decorativo atrás do logo */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-dourado-500/5 blur-3xl pointer-events-none" />

      <button
        onClick={() => navigate("/buscar")}
        className="group relative flex flex-col items-center gap-6 transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
      >
        <img
          src="/logo-projectx.png"
          alt="ProjectX"
          className="w-56 sm:w-72 md:w-80 drop-shadow-[0_0_40px_rgba(212,176,106,0.15)]"
        />

        <span className="flex items-center gap-1.5 text-sm text-muted-foreground group-hover:text-dourado-300 transition-colors">
          {t("abertura.toqueParaEntrar")}
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </span>
      </button>

      <CarrosselPrestadores />

      <div className="flex flex-col items-center gap-3 px-6">
        <p className="text-xs text-muted-foreground/60 max-w-sm text-center">
          {t("abertura.chamada")}
        </p>

        {/* Trocar idioma/país — discreto, mas sempre acessível */}
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
    </div>
  )
}

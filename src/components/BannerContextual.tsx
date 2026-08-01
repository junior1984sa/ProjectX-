import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { obterFornecedoresPara } from "@/types/prestador"
import {
  ANUNCIANTES_DEMONSTRACAO,
  iniciaisDe,
  type AnuncianteBanner,
} from "@/lib/anunciantesDemo"

/** Tempo que cada anúncio fica visível antes de trocar */
const INTERVALO_MS = 7000

/**
 * BANNER CONTEXTUAL — fixo no rodapé, em todas as páginas.
 *
 * REGRA DE SEGMENTAÇÃO (o ponto central deste componente):
 * quem está navegando só vê anúncios de quem VENDE PARA o ramo dele.
 * Um dentista vê fornecedor de equipamento odontológico; nunca vê
 * anúncio de oficina mecânica, e nunca vê outra clínica odontológica
 * (que seria concorrente direta).
 *
 * Isso é feito por obterFornecedoresPara(), que percorre o mapa de
 * segmentos ao contrário: se o segmento "X" tem o ramo do visitante
 * na sua lista de clientes, então X vende para ele.
 *
 * NÃO INTERFERE NA NAVEGAÇÃO: é uma faixa fina, sem pop-up, sem
 * sobreposição de conteúdo e sem exigir clique para fechar. O app
 * reserva espaço no rodapé para ela (padding no App.tsx), então nada
 * fica escondido atrás.
 */
export function BannerContextual() {
  const navigate = useNavigate()
  const { perfil } = useAuthStore()
  const [anuncios, setAnuncios] = useState<AnuncianteBanner[]>([])
  const [indice, setIndice] = useState(0)
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Seleciona quais anúncios fazem sentido para quem está vendo
  useEffect(() => {
    const segmentoVisitante = perfil?.segmento ?? ""

    if (segmentoVisitante) {
      const fornecedores = obterFornecedoresPara(segmentoVisitante)

      const relevantes = ANUNCIANTES_DEMONSTRACAO.filter((a) =>
        fornecedores.some(
          (f) => a.segmento.includes(f) || f.includes(a.segmento)
        )
      )

      // Se encontrou anunciantes do ramo certo, mostra só eles.
      // Se não encontrou nenhum, cai na rotação geral — é melhor
      // mostrar algo genérico do que deixar a faixa vazia.
      setAnuncios(relevantes.length > 0 ? relevantes : ANUNCIANTES_DEMONSTRACAO)
    } else {
      // Visitante sem perfil: rotação geral
      setAnuncios(ANUNCIANTES_DEMONSTRACAO)
    }

    setIndice(0)
  }, [perfil?.segmento])

  // Rotação automática
  useEffect(() => {
    if (anuncios.length <= 1) return

    intervaloRef.current = setInterval(() => {
      setIndice((prev) => (prev + 1) % anuncios.length)
    }, INTERVALO_MS)

    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current)
    }
  }, [anuncios.length])

  if (anuncios.length === 0) return null

  const atual = anuncios[indice]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-sm">
      <button
        onClick={() => navigate(perfil ? "/diretorio" : "/entrar")}
        className="w-full h-14 px-3 sm:px-4 flex items-center gap-3 text-left hover:bg-secondary/30 transition-colors"
      >
        {/* Bloco de identidade visual do anunciante */}
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white/90"
          style={{
            background: `linear-gradient(135deg, ${atual.corInicio}, ${atual.corFim})`,
          }}
        >
          {iniciaisDe(atual.nomeEmpresa)}
        </div>

        {/* Conteúdo do anúncio */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-foreground truncate">
              {atual.nomeEmpresa}
            </p>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground flex-shrink-0">
              {atual.demonstracao ? "Exemplo" : "Patrocinado"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {atual.chamada}
            <span className="hidden sm:inline">
              {" · "}
              <MapPin className="w-2.5 h-2.5 inline-block -mt-0.5" /> {atual.cidade}/
              {atual.estado}
            </span>
          </p>
        </div>

        {/* Indicadores de rotação */}
        {anuncios.length > 1 && (
          <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
            {anuncios.slice(0, 6).map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === indice % Math.min(anuncios.length, 6)
                    ? "w-3 bg-dourado-400"
                    : "w-1 bg-secondary"
                }`}
              />
            ))}
          </div>
        )}
      </button>
    </div>
  )
}

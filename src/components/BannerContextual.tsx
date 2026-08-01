import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin, ArrowUpRight } from "lucide-react"
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
 * Quantos anúncios são montados na faixa. O 2º e o 3º só ficam
 * visíveis em telas largas, via CSS — em celular apenas o 1º aparece.
 */
const CARTOES = 3

/**
 * BANNER CONTEXTUAL — faixa fixa no rodapé, em todas as páginas.
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
 * POR QUE NO RODAPÉ, E NÃO NA LATERAL:
 * a lateral tem espaço sobrando em telas grandes, mas fica na altura
 * dos olhos, ao lado do formulário de busca — competindo com a ação
 * principal do site. No rodapé o anúncio cresce sem disputar atenção
 * com quem está digitando.
 *
 * COMO GANHA DESTAQUE SEM POLUIR:
 *   • altura de 80px (96px no computador), contra os 56px anteriores
 *   • logo maior, nome em destaque, chamada e cidade sempre legíveis
 *   • em telas largas exibe até 3 anunciantes lado a lado, aproveitando
 *     a largura em vez da altura
 *
 * NÃO INTERFERE NA NAVEGAÇÃO: sem pop-up, sem sobreposição e sem
 * exigir clique para fechar. O App.tsx reserva a altura exata
 * (pb-20 md:pb-24), então nada fica escondido atrás da faixa.
 */
export function BannerContextual() {
  const navigate = useNavigate()
  const { perfil } = useAuthStore()
  const [anuncios, setAnuncios] = useState<AnuncianteBanner[]>([])
  const [indice, setIndice] = useState(0)
  const [segmentado, setSegmentado] = useState(false)
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
      setSegmentado(relevantes.length > 0)
    } else {
      // Visitante sem perfil: rotação geral
      setAnuncios(ANUNCIANTES_DEMONSTRACAO)
      setSegmentado(false)
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

  /** Anunciantes montados na faixa, a partir do índice atual */
  const visiveis = Array.from(
    { length: Math.min(CARTOES, anuncios.length) },
    (_, i) => anuncios[(indice + i) % anuncios.length]
  )

  const abrir = () => navigate(perfil ? "/diretorio" : "/entrar")

  /** A partir do 2º cartão, some nas telas estreitas */
  const visibilidadePorPosicao = ["flex", "hidden md:flex", "hidden xl:flex"]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-sm">
      {/* Rótulo fino acima da faixa: explica o que é aquilo sem roubar
          espaço. Só promete segmentação quando ela de fato ocorreu. */}
      <div className="h-5 px-3 sm:px-4 flex items-center justify-between">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
          {segmentado ? "Fornecedores para o seu ramo" : "Patrocinado"}
        </p>

        {anuncios.length > 1 && (
          <div className="flex items-center gap-1">
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
      </div>

      {/* Conta da altura total, que precisa bater exatamente com o
          pb-20 md:pb-24 do App.tsx:
            1px da borda + 20px do rótulo + 59px = 80px  (celular)
            1px da borda + 20px do rótulo + 75px = 96px  (computador) */}
      <div className="h-[59px] md:h-[75px] px-2 sm:px-3 flex items-stretch gap-2">
        {visiveis.map((anuncio, posicao) => (
          <button
            key={anuncio.id}
            onClick={abrir}
            className={`${visibilidadePorPosicao[posicao]} group flex-1 min-w-0 items-center gap-3 px-2 sm:px-3 rounded-lg text-left hover:bg-secondary/30 transition-colors`}
          >
            {/* Bloco de identidade visual do anunciante */}
            <div
              className="w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold text-white/90"
              style={{
                background: `linear-gradient(135deg, ${anuncio.corInicio}, ${anuncio.corFim})`,
              }}
            >
              {iniciaisDe(anuncio.nomeEmpresa)}
            </div>

            {/* Conteúdo do anúncio */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-foreground truncate">
                  {anuncio.nomeEmpresa}
                </p>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground flex-shrink-0">
                  {anuncio.demonstracao ? "Exemplo" : "Patrocinado"}
                </span>
              </div>

              <p className="text-xs text-muted-foreground truncate">
                {anuncio.chamada}
              </p>

              <p className="text-[11px] text-muted-foreground/80 flex items-center gap-0.5 mt-0.5">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {anuncio.cidade}/{anuncio.estado}
                </span>
              </p>
            </div>

            {/* Chamada para ação — aparece ao passar o mouse */}
            <span className="hidden lg:inline-flex items-center gap-0.5 text-[11px] text-dourado-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              Ver no diretório
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { MapPin } from "lucide-react"
import { buscarItensCarrossel, type ItemCarrossel } from "@/lib/diretorio"

// Itens de demonstração — usados SOMENTE quando ainda não há nenhum
// prestador real publicado com imagem de capa. Marcados com selo
// "Exemplo" para nunca serem confundidos com prestadores de verdade.
// Substituídos automaticamente assim que o primeiro perfil real for
// publicado no diretório (a busca real tem prioridade).
const ITENS_DEMONSTRACAO: ItemCarrossel[] = [
  {
    profileId: "demo-1",
    nomeEmpresa: "Jateamento Industrial Exemplo",
    segmento: "Jateamento abrasivo",
    cidade: "Florianópolis",
    estado: "SC",
    logoUrl: "/demo/demo_1.jpg",
  },
  {
    profileId: "demo-2",
    nomeEmpresa: "Marmoraria Exemplo Ltda",
    segmento: "Marmoraria",
    cidade: "São Paulo",
    estado: "SP",
    logoUrl: "/demo/demo_2.jpg",
  },
  {
    profileId: "demo-3",
    nomeEmpresa: "Construtora Exemplo S.A.",
    segmento: "Construção civil",
    cidade: "Curitiba",
    estado: "PR",
    logoUrl: "/demo/demo_3.jpg",
  },
  {
    profileId: "demo-4",
    nomeEmpresa: "Pintura Industrial Exemplo",
    segmento: "Pintura industrial",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    logoUrl: "/demo/demo_4.jpg",
  },
]

/**
 * Carrossel de imagens de capa de prestadores publicados, exibido na
 * tela de abertura — funciona sem login, como "vitrine" do produto.
 * Clicar em qualquer item leva direto para o cadastro/login, já que
 * ver detalhes do prestador exige conta.
 *
 * Quando não há nenhum prestador real publicado ainda, mostra itens
 * de demonstração claramente identificados, para você validar o
 * visual antes de ter dados reais.
 */
export function CarrosselPrestadores() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [itens, setItens] = useState<ItemCarrossel[]>([])
  const [usandoDemo, setUsandoDemo] = useState(false)
  const [indiceAtivo, setIndiceAtivo] = useState(0)
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    buscarItensCarrossel(12).then((reais) => {
      if (reais.length > 0) {
        setItens(reais)
        setUsandoDemo(false)
      } else {
        setItens(ITENS_DEMONSTRACAO)
        setUsandoDemo(true)
      }
    })
  }, [])

  useEffect(() => {
    if (itens.length <= 1) return

    intervaloRef.current = setInterval(() => {
      setIndiceAtivo((prev) => (prev + 1) % itens.length)
    }, 4000)

    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current)
    }
  }, [itens.length])

  function handleClicarItem() {
    navigate("/entrar")
  }

  if (itens.length === 0) return null

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-center gap-2 mb-3">
        <p className="text-center text-xs text-muted-foreground uppercase tracking-wide">
          {t("abertura.prestadoresEmDestaque")}
        </p>
        {usandoDemo && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            Exemplo
          </span>
        )}
      </div>
      <div className="relative h-44 sm:h-56 rounded-2xl overflow-hidden border border-border/60">
        {itens.map((item, i) => (
          <button
            key={item.profileId}
            onClick={handleClicarItem}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === indiceAtivo ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={item.logoUrl}
              alt={item.nomeEmpresa}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
              <p className="text-white font-semibold text-sm">{item.nomeEmpresa}</p>
              <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {item.cidade}, {item.estado} · {item.segmento}
              </p>
            </div>
          </button>
        ))}
      </div>

      {itens.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {itens.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndiceAtivo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === indiceAtivo ? "w-5 bg-dourado-400" : "w-1.5 bg-secondary"
              }`}
              aria-label={`Ver destaque ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

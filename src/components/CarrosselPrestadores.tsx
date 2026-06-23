import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin } from "lucide-react"
import { buscarItensCarrossel, type ItemCarrossel } from "@/lib/diretorio"

/**
 * Carrossel de imagens de capa de prestadores publicados, exibido na
 * tela de abertura — funciona sem login, como "vitrine" do produto.
 * Clicar em qualquer item leva direto para o cadastro/login, já que
 * ver detalhes do prestador exige conta.
 */
export function CarrosselPrestadores() {
  const navigate = useNavigate()
  const [itens, setItens] = useState<ItemCarrossel[]>([])
  const [indiceAtivo, setIndiceAtivo] = useState(0)
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    buscarItensCarrossel(12).then(setItens)
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
      <p className="text-center text-xs text-muted-foreground uppercase tracking-wide mb-3">
        Prestadores em destaque
      </p>
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

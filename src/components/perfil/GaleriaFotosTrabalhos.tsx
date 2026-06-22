import { useState, useRef, useEffect } from "react"
import { X, Loader2, ImagePlus } from "lucide-react"
import {
  enviarFotoTrabalho,
  listarFotosTrabalhos,
  removerFotoTrabalho,
} from "@/lib/diretorio"
import type { FotoTrabalho } from "@/types/prestador"
import toast from "react-hot-toast"

interface GaleriaFotosTrabalhosProps {
  profileId: string
}

const MAX_FOTOS = 6

export function GaleriaFotosTrabalhos({ profileId }: GaleriaFotosTrabalhosProps) {
  const [fotos, setFotos] = useState<FotoTrabalho[]>([])
  const [enviando, setEnviando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    carregarFotos()
  }, [profileId])

  async function carregarFotos() {
    const lista = await listarFotosTrabalhos(profileId)
    setFotos(lista)
  }

  async function handleSelecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return

    if (fotos.length >= MAX_FOTOS) {
      toast.error(`Você já atingiu o máximo de ${MAX_FOTOS} fotos.`)
      return
    }

    setEnviando(true)
    const { dados, erro } = await enviarFotoTrabalho(profileId, arquivo, "", fotos.length)
    setEnviando(false)

    if (erro) {
      toast.error(erro)
      return
    }

    if (dados) {
      setFotos((prev) => [...prev, dados])
      toast.success("Foto adicionada!")
    }

    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleRemover(foto: FotoTrabalho) {
    const { erro } = await removerFotoTrabalho(foto)
    if (erro) {
      toast.error("Erro ao remover foto.")
      return
    }
    setFotos((prev) => prev.filter((f) => f.id !== foto.id))
    toast.success("Foto removida.")
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {fotos.map((foto) => (
          <div key={foto.id} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
            <img src={foto.url_foto} alt="Trabalho realizado" className="w-full h-full object-cover" />
            <button
              onClick={() => handleRemover(foto)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {fotos.length < MAX_FOTOS && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={enviando}
            className="aspect-square rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:border-dourado-700/50 transition-colors"
          >
            {enviando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="w-5 h-5" />
                <span className="text-[10px]">Adicionar</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleSelecionarArquivo}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        {fotos.length}/{MAX_FOTOS} fotos · JPG, PNG ou WEBP, até 8MB cada
      </p>
    </div>
  )
}

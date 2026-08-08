import { useState, useRef, useEffect } from "react"
import { Upload, FileText, Image as ImageIcon, X, Loader2, FilePlus2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  enviarArquivoPortfolio,
  listarArquivosPortfolio,
  removerArquivoPortfolio,
  formatarTamanhoArquivo,
} from "@/lib/storage"
import type { ArquivoPortfolio, TipoArquivo } from "@/types/prestador"
import { useTranslation } from "react-i18next"
import toast from "react-hot-toast"

const LABELS_TIPO: Record<TipoArquivo, string> = {
  portfolio: "arquivos.portfolio",
  proposta: "arquivos.proposta",
  panfleto: "arquivos.panfleto",
  outro: "arquivos.outro",
}

interface UploadPortfolioProps {
  profileId: string
}

export function UploadPortfolio({ profileId }: UploadPortfolioProps) {
  const [arquivos, setArquivos] = useState<ArquivoPortfolio[]>([])
  const [enviando, setEnviando] = useState(false)
  const { t } = useTranslation()
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoArquivo>("portfolio")
  const [carregandoLista, setCarregandoLista] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    carregarArquivos()
  }, [profileId])

  async function carregarArquivos() {
    setCarregandoLista(true)
    const lista = await listarArquivosPortfolio(profileId)
    setArquivos(lista)
    setCarregandoLista(false)
  }

  async function handleSelecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return

    setEnviando(true)
    const { dados, erro } = await enviarArquivoPortfolio(profileId, arquivo, tipoSelecionado)
    setEnviando(false)

    if (erro) {
      toast.error(erro)
      return
    }

    if (dados) {
      setArquivos((prev) => [dados, ...prev])
      toast.success(t("arquivos.enviadoOk"))
    }

    // Limpa o input para permitir reenvio do mesmo arquivo se necessário
    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleRemover(arquivo: ArquivoPortfolio) {
    const { erro } = await removerArquivoPortfolio(arquivo)
    if (erro) {
      toast.error(t("arquivos.erroRemover"))
      return
    }
    setArquivos((prev) => prev.filter((a) => a.id !== arquivo.id))
    toast.success(t("arquivos.removidoOk"))
  }

  function iconePorTipo(nomeArquivo: string) {
    const ext = nomeArquivo.split(".").pop()?.toLowerCase()
    if (ext === "pdf") return <FileText className="w-4 h-4 text-red-400" />
    return <ImageIcon className="w-4 h-4 text-dourado-400" />
  }

  return (
    <div className="space-y-4">
      {/* Seletor de tipo + botão de upload */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={tipoSelecionado} onValueChange={(v) => setTipoSelecionado(v as TipoArquivo)}>
          <SelectTrigger className="w-full sm:w-48 h-10 bg-background/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LABELS_TIPO).map(([valor, chaveLabel]) => (
              <SelectItem key={valor} value={valor}>
                {t(chaveLabel)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleSelecionarArquivo}
          className="hidden"
          id="upload-portfolio"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          className="flex-1"
        >
          {enviando ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {enviando ? t("arquivos.enviando") : t("arquivos.enviarArquivo")}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {t("arquivos.formatosAceitos")}
      </p>

      {/* Lista de arquivos enviados */}
      <div className="space-y-2">
        {carregandoLista ? (
          <p className="text-xs text-muted-foreground">{t("arquivos.carregandoArquivos")}</p>
        ) : arquivos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border rounded-lg">
            <FilePlus2 className="w-8 h-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">{t("arquivos.nenhumArquivo")}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {t("arquivos.envieSeuPortfolio")}
            </p>
          </div>
        ) : (
          arquivos.map((arquivo) => (
            <div
              key={arquivo.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border/60"
            >
              {iconePorTipo(arquivo.nome_arquivo)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{arquivo.nome_arquivo}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-xs">
                    {LABELS_TIPO[arquivo.tipo]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatarTamanhoArquivo(arquivo.tamanho_bytes)}
                  </span>
                </div>
              </div>
              <a
                href={arquivo.url_storage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-dourado-400 hover:underline flex-shrink-0"
              >
                Ver
              </a>
              <button
                onClick={() => handleRemover(arquivo)}
                className="text-muted-foreground hover:text-red-400 flex-shrink-0"
                title={t("arquivos.removerArquivo")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

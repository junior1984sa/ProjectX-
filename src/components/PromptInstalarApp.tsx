import { useState, useEffect } from "react"
import { Download, X, Smartphone } from "lucide-react"

interface EventoInstalacaoPWA extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const CHAVE_DISPENSADO = "prospectx_pwa_dispensado"

/**
 * Banner discreto que aparece quando o navegador sinaliza que o app
 * pode ser instalado (PWA). Some automaticamente se o usuário já
 * instalou, já dispensou antes (guardado por 7 dias), ou se o
 * navegador não suportar instalação.
 */
export function PromptInstalarApp() {
  const [eventoInstalacao, setEventoInstalacao] = useState<EventoInstalacaoPWA | null>(null)
  const [mostrar, setMostrar] = useState(false)

  useEffect(() => {
    const dispensadoEm = localStorage.getItem(CHAVE_DISPENSADO)
    if (dispensadoEm) {
      const diasPassados = (Date.now() - Number(dispensadoEm)) / (1000 * 60 * 60 * 24)
      if (diasPassados < 7) return
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setEventoInstalacao(e as EventoInstalacaoPWA)
      setMostrar(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  }, [])

  async function handleInstalar() {
    if (!eventoInstalacao) return
    await eventoInstalacao.prompt()
    setMostrar(false)
  }

  function handleDispensar() {
    localStorage.setItem(CHAVE_DISPENSADO, Date.now().toString())
    setMostrar(false)
  }

  if (!mostrar) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 rounded-xl border border-dourado-700/40 bg-card shadow-2xl shadow-black/40 p-4 animate-fadeIn">
      <button
        onClick={handleDispensar}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-dourado-900/30 flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-dourado-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Instale o ProspectX</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Acesse mais rápido, direto da tela inicial do seu celular.
          </p>
          <button
            onClick={handleInstalar}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold bg-dourado-600 hover:bg-dourado-700 text-background px-3 py-1.5 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Instalar agora
          </button>
        </div>
      </div>
    </div>
  )
}

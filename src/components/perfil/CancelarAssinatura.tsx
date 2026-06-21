import { useState } from "react"
import { AlertTriangle, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cancelarAssinatura } from "@/lib/pagamento"
import { useAuthStore } from "@/store/useAuthStore"
import toast from "react-hot-toast"

/**
 * Botão e fluxo de cancelamento da assinatura. Propositalmente simples:
 * um clique para abrir, um clique para confirmar, sem pedir motivo,
 * sem etapas de retenção agressivas. Cancelamento fácil gera confiança.
 */
export function CancelarAssinatura() {
  const { carregarPerfil } = useAuthStore()
  const [modalAberto, setModalAberto] = useState(false)
  const [cancelando, setCancelando] = useState(false)

  async function handleConfirmarCancelamento() {
    setCancelando(true)
    const resultado = await cancelarAssinatura()
    setCancelando(false)

    if (!resultado.sucesso) {
      toast.error(resultado.erro ?? "Não foi possível cancelar agora. Tente novamente.")
      return
    }

    toast.success("Assinatura cancelada. Você não será cobrado novamente.")
    setModalAberto(false)
    await carregarPerfil()
  }

  return (
    <>
      <button
        onClick={() => setModalAberto(true)}
        className="text-xs text-muted-foreground hover:text-red-400 transition-colors underline-offset-2 hover:underline"
      >
        Cancelar assinatura
      </button>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              Cancelar assinatura
            </DialogTitle>
            <DialogDescription>
              Seu perfil deixa de aparecer no diretório e nenhuma nova cobrança será feita.
              Você pode assinar novamente quando quiser, sem penalidade.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setModalAberto(false)}
              className="flex-1"
              disabled={cancelando}
            >
              <X className="w-4 h-4 mr-1.5" />
              Manter assinatura
            </Button>
            <Button
              onClick={handleConfirmarCancelamento}
              disabled={cancelando}
              variant="destructive"
              className="flex-1"
            >
              {cancelando ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : null}
              Sim, cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

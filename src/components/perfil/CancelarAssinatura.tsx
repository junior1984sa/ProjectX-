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
import { useTranslation } from "react-i18next"
import toast from "react-hot-toast"

/**
 * Botão e fluxo de cancelamento da assinatura. Propositalmente simples:
 * um clique para abrir, um clique para confirmar, sem pedir motivo,
 * sem etapas de retenção agressivas. Cancelamento fácil gera confiança.
 */
export function CancelarAssinatura() {
  const { carregarPerfil } = useAuthStore()
  const { t } = useTranslation()
  const [modalAberto, setModalAberto] = useState(false)
  const [cancelando, setCancelando] = useState(false)

  async function handleConfirmarCancelamento() {
    setCancelando(true)
    const resultado = await cancelarAssinatura()
    setCancelando(false)

    if (!resultado.sucesso) {
      toast.error(resultado.erro ?? t("assinatura.canceladaErro"))
      return
    }

    toast.success(t("assinatura.canceladaOk"))
    setModalAberto(false)
    await carregarPerfil()
  }

  return (
    <>
      <button
        onClick={() => setModalAberto(true)}
        className="text-xs text-muted-foreground hover:text-red-400 transition-colors underline-offset-2 hover:underline"
      >
        {t("assinatura.cancelar")}
      </button>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              {t("assinatura.cancelar")}
            </DialogTitle>
            <DialogDescription>{t("assinatura.cancelarDescricao")}</DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setModalAberto(false)}
              className="flex-1"
              disabled={cancelando}
            >
              <X className="w-4 h-4 mr-1.5" />
              {t("assinatura.manter")}
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
              {t("assinatura.confirmarCancelar")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

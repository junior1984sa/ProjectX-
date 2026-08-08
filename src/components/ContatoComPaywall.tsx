import { Lock, Phone, Mail } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { temAcessoLiberado } from "@/types/prestador"
import { useTranslation } from "react-i18next"

interface ContatoComPaywallProps {
  tipo: "telefone" | "email"
  valor: string | null
  onClickAssinar: () => void
}

/**
 * Exibe o contato normalmente se o usuário logado tem assinatura ativa.
 * Caso contrário, borra a informação e mostra um CTA para assinar.
 */
export function ContatoComPaywall({ tipo, valor, onClickAssinar }: ContatoComPaywallProps) {
  const { perfil } = useAuthStore()
  const { t } = useTranslation()
  const temAcesso = temAcessoLiberado(perfil)

  if (!valor) {
    return <span className="text-xs text-muted-foreground/50">—</span>
  }

  if (temAcesso) {
    return (
      <div className="flex items-center gap-1.5">
        {tipo === "telefone" ? (
          <Phone className="w-3 h-3 text-green-400 flex-shrink-0" />
        ) : (
          <Mail className="w-3 h-3 text-purple-400 flex-shrink-0" />
        )}
        <span className="text-xs font-mono text-foreground truncate">{valor}</span>
      </div>
    )
  }

  // Mostra o valor borrado, com tooltip e CTA
  return (
    <button
      onClick={onClickAssinar}
      className="group flex items-center gap-1.5 hover:opacity-80 transition-opacity"
      title={t("paywall.assineParaVer")}
    >
      <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
      <span className="text-xs font-mono text-muted-foreground/50 blur-[3px] select-none group-hover:blur-[2px] transition-all">
        {valor}
      </span>
    </button>
  )
}

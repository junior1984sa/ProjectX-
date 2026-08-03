import { useEffect, useMemo, useState } from "react"
import { X, Mail, Send, Loader2, ShieldCheck, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/useAuthStore"
import {
  carregarJaContatadas,
  chaveDaEmpresa,
  dispararEmails,
} from "@/lib/prospeccao"
import type { Empresa } from "@/types/empresa"
import toast from "react-hot-toast"

/** Teto do plano gratuito do Resend, espelhado da Edge Function */
const MAXIMO_POR_DISPARO = 50

interface DisparoEmailProps {
  empresas: Empresa[]
  onFechar: () => void
}

/**
 * DISPARO DE E-MAIL EM LOTE
 *
 * O canal que pode, de fato, ser automatizado: e-mail frio B2B é lícito
 * pelo Art. 7º, IX da LGPD (legítimo interesse). WhatsApp em massa não —
 * por isso lá existe a fila um a um, e aqui o envio de verdade.
 *
 * A tela mostra explicitamente o que vai no rodapé e quantas empresas
 * foram puladas. Isso não é enfeite: quem dispara precisa entender que
 * está identificado e que o descadastro funciona, senão trata a
 * ferramenta como disparador anônimo — que é o uso que gera multa.
 */
export function DisparoEmail({ empresas, onFechar }: DisparoEmailProps) {
  const { perfil } = useAuthStore()

  const [jaContatadas, setJaContatadas] = useState<Set<string> | null>(null)
  const [assunto, setAssunto] = useState("")
  const [corpo, setCorpo] = useState("")
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    carregarJaContatadas().then(setJaContatadas)
  }, [])

  useEffect(() => {
    if (!perfil) return
    // Rascunho inicial: abre com prova, não com pedido. É a mesma
    // lógica da abordagem por WhatsApp que funciona melhor a frio.
    setAssunto("Encontrei a {{empresa}} procurando parceiros na região")
    setCorpo(
      `Olá! Sou ${perfil.nome_contato}, da ${perfil.nome_empresa}.\n\n` +
        `Trabalhamos com ${perfil.segmento} e encontrei a {{empresa}} ao mapear empresas da região que podem precisar desse serviço.\n\n` +
        `Se fizer sentido, posso enviar nossa proposta e alguns trabalhos que já entregamos. Basta responder este e-mail.\n\n` +
        `Obrigado pela atenção.`
    )
  }, [perfil])

  /** Só entram empresas com e-mail e que ainda não foram abordadas */
  const elegiveis = useMemo(() => {
    if (!jaContatadas) return []
    return empresas
      .filter((e) => e.email && !jaContatadas.has(chaveDaEmpresa(e)))
      .slice(0, MAXIMO_POR_DISPARO)
  }, [empresas, jaContatadas])

  const semEmail = empresas.filter((e) => !e.email).length
  const jaAbordadas = jaContatadas
    ? empresas.filter((e) => e.email && jaContatadas.has(chaveDaEmpresa(e))).length
    : 0

  async function handleEnviar() {
    if (!perfil) return

    if (!assunto.trim() || !corpo.trim()) {
      toast.error("Preencha o assunto e a mensagem.")
      return
    }
    if (elegiveis.length === 0) {
      toast.error("Nenhuma empresa nova com e-mail nesta busca.")
      return
    }

    setEnviando(true)
    const r = await dispararEmails({
      empresas: elegiveis,
      assunto,
      corpo,
      remetente: {
        empresa: perfil.nome_empresa,
        contato: perfil.nome_contato,
        cidade: `${perfil.cidade}${perfil.estado ? `/${perfil.estado}` : ""}`,
        email: perfil.email_contato,
      },
    })
    setEnviando(false)

    if (!r.sucesso) {
      toast.error(r.erro ?? "Não foi possível enviar.")
      return
    }

    const partes = [`${r.enviados} enviados`]
    if (r.bloqueados > 0) partes.push(`${r.bloqueados} descadastrados`)
    if (r.falhas > 0) partes.push(`${r.falhas} falhas`)

    toast.success(partes.join(" · "))
    onFechar()
  }

  if (jaContatadas === null) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      <div className="border-b border-border/60 px-4 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-dourado-400" />
            Disparo por e-mail
          </p>
          <p className="text-[11px] text-muted-foreground">
            {elegiveis.length} {elegiveis.length === 1 ? "empresa" : "empresas"} nesta lista
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onFechar}
          className="h-8 w-8 text-muted-foreground flex-shrink-0"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto p-5 space-y-5">
          {/* Quem ficou de fora, e por quê */}
          {(semEmail > 0 || jaAbordadas > 0) && (
            <div className="text-[11px] text-muted-foreground/80 space-y-1">
              {semEmail > 0 && (
                <p>
                  {semEmail} {semEmail === 1 ? "empresa ficou" : "empresas ficaram"} de fora
                  por não ter e-mail cadastrado.
                </p>
              )}
              {jaAbordadas > 0 && (
                <p>
                  {jaAbordadas} {jaAbordadas === 1 ? "já foi abordada" : "já foram abordadas"}{" "}
                  antes e não {jaAbordadas === 1 ? "entra" : "entram"} de novo.
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Assunto
            </Label>
            <Input
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              className="bg-background/60"
              placeholder="Assunto do e-mail"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Mensagem
              </Label>
              <span className="text-[10px] text-dourado-400/80">
                {"{{empresa}}"} vira o nome de cada uma
              </span>
            </div>
            <textarea
              value={corpo}
              onChange={(e) => setCorpo(e.target.value)}
              rows={9}
              className="w-full rounded-md border border-border bg-background/60 px-3 py-2.5 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-dourado-600/40"
            />
          </div>

          {/* O que o servidor acrescenta — mostrado para quem dispara
              entender que está identificado e que o opt-out funciona */}
          <div className="rounded-lg border border-border/60 bg-card p-3.5 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-green-400" />
              Adicionado automaticamente ao final
            </p>
            <div className="text-[11px] text-muted-foreground/80 leading-relaxed border-t border-border/60 pt-2">
              <p className="font-medium text-muted-foreground">
                {perfil?.nome_empresa} · {perfil?.cidade}
                {perfil?.estado ? `/${perfil.estado}` : ""}
              </p>
              <p>
                Contato: {perfil?.nome_contato} — {perfil?.email_contato}
              </p>
              <p className="mt-1">
                Você recebeu este e-mail porque sua empresa atua em um segmento
                relacionado ao nosso serviço.{" "}
                <span className="text-dourado-400 underline">Não quero mais receber</span>.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground/80 flex items-start gap-1.5 leading-relaxed">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
            Use apenas para oferta relevante à atividade da empresa. Quem clicar em
            descadastrar não recebe mais nada, de nenhum assinante — e isso é
            definitivo.
          </p>

          <Button
            onClick={handleEnviar}
            disabled={enviando || elegiveis.length === 0}
            size="lg"
            className="w-full bg-gradient-to-r from-dourado-600 to-dourado-700 hover:from-dourado-700 hover:to-dourado-800 text-white font-semibold"
          >
            {enviando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar para {elegiveis.length}{" "}
                {elegiveis.length === 1 ? "empresa" : "empresas"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

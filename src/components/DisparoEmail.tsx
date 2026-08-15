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
import {
  podeReceberEmail,
  motivoDaRecusa,
  paisesQueExigemEnderecoPostal,
} from "@/lib/regimeEmail"
import type { Empresa } from "@/types/empresa"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()

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
    //
    // O texto sai no idioma da interface porque é ele que CHEGA na
    // empresa abordada. Um prestador em Sydney disparando em português
    // não seria lido — e o disparo, além de inútil, queima o domínio.
    //
    // `{{empresa}}` fica escapado de propósito: quem substitui pelo
    // nome de cada destinatário é o servidor, na hora do envio.
    const marcador = "{{empresa}}"
    setAssunto(t("disparo.rascunhoAssunto", { empresa: marcador }))
    setCorpo(
      t("disparo.rascunhoCorpo", {
        contato: perfil.nome_contato,
        empresaRemetente: perfil.nome_empresa,
        segmento: perfil.segmento,
        empresa: marcador,
      })
    )
  }, [perfil])

  /**
   * Só entram empresas com e-mail, ainda não abordadas E em país onde
   * o disparo sem consentimento prévio é lícito.
   *
   * O filtro por país acontece AQUI, na montagem da lista, e não só no
   * servidor. Não é redundância inútil: sem isso o assinante escreveria
   * a mensagem inteira acreditando que ela vai para 40 empresas, e só
   * depois de clicar em enviar descobriria que 25 eram britânicas. O
   * servidor continua sendo quem recusa de fato — este filtro só evita
   * o trabalho perdido.
   */
  const elegiveis = useMemo(() => {
    if (!jaContatadas) return []
    return empresas
      .filter(
        (e) =>
          e.email &&
          !jaContatadas.has(chaveDaEmpresa(e)) &&
          podeReceberEmail(e.pais),
      )
      .slice(0, MAXIMO_POR_DISPARO)
  }, [empresas, jaContatadas])

  const semEmail = empresas.filter((e) => !e.email).length
  const jaAbordadas = jaContatadas
    ? empresas.filter((e) => e.email && jaContatadas.has(chaveDaEmpresa(e))).length
    : 0

  /** Agrupa as recusadas por país, para explicar em vez de só omitir. */
  const recusadasPorPais = useMemo(() => {
    const mapa = new Map<string, { quantidade: number; motivo: string }>()
    for (const e of empresas) {
      if (!e.email || podeReceberEmail(e.pais)) continue
      const chave = e.pais || "?"
      const atual = mapa.get(chave)
      if (atual) atual.quantidade += 1
      else mapa.set(chave, { quantidade: 1, motivo: motivoDaRecusa(e.pais) })
    }
    return [...mapa.entries()].sort((a, b) => b[1].quantidade - a[1].quantidade)
  }, [empresas])

  /**
   * O CAN-SPAM exige endereço postal físico do remetente. Se houver
   * destinatário nos Estados Unidos e o perfil não tiver endereço, o
   * servidor recusa o lote — então travamos o botão antes, com o
   * motivo à vista.
   */
  const paisesExigindoEndereco = useMemo(
    () => paisesQueExigemEnderecoPostal(elegiveis.map((e) => e.pais)),
    [elegiveis],
  )
  const faltaEnderecoPostal =
    paisesExigindoEndereco.length > 0 && !perfil?.endereco_postal?.trim()

  async function handleEnviar() {
    if (!perfil) return

    if (!assunto.trim() || !corpo.trim()) {
      toast.error(t("disparo.erroCampos"))
      return
    }
    if (elegiveis.length === 0) {
      toast.error(t("disparo.erroNenhuma"))
      return
    }
    if (faltaEnderecoPostal) {
      toast.error(
        "Cadastre o endereço postal da sua empresa no perfil — é " +
          `exigência legal para enviar a ${paisesExigindoEndereco.join(", ")}.`,
      )
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
        enderecoPostal: perfil.endereco_postal,
      },
    })
    setEnviando(false)

    if (!r.sucesso) {
      toast.error(r.erro ?? t("disparo.erroEnvio"))
      return
    }

    const partes = [`${r.enviados} enviados`]
    if (r.bloqueados > 0) partes.push(`${r.bloqueados} descadastrados`)
    if (r.recusadosPorPais > 0) partes.push(`${r.recusadosPorPais} fora das regras do país`)
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
            {t("disparo.titulo")}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {t("disparo.naLista", { count: elegiveis.length })}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onFechar}
          className="h-8 w-8 text-muted-foreground flex-shrink-0"
          title={t("disparo.fechar")}
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
                <p>{t("disparo.semEmail", { count: semEmail })}</p>
              )}
              {jaAbordadas > 0 && (
                <p>{t("disparo.jaAbordadas", { count: jaAbordadas })}</p>
              )}
            </div>
          )}

          {/* Recusa por país — explicada, não escondida.
              Omitir em silêncio faria o assinante achar que a busca
              trouxe menos empresas do que trouxe de fato. */}
          {recusadasPorPais.length > 0 && (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5">
              <p className="text-[11px] font-medium text-foreground">
                Contatos fora do disparo por regra do país
              </p>
              {recusadasPorPais.map(([pais, info]) => (
                <p key={pais} className="text-[11px] text-muted-foreground leading-relaxed">
                  <strong className="text-foreground/80">{pais}</strong> ·{" "}
                  {info.quantidade}{" "}
                  {info.quantidade === 1 ? "empresa" : "empresas"} — {info.motivo}
                </p>
              ))}
              <p className="text-[11px] text-muted-foreground/70 pt-0.5">
                Nesses países o contato precisa ter autorizado antes. Você pode
                abordar por telefone, formulário do site ou LinkedIn.
              </p>
            </div>
          )}

          {/* Endereço postal ausente trava o envio aos EUA */}
          {faltaEnderecoPostal && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-700/40 bg-amber-950/20 p-3">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Para enviar a <strong>{paisesExigindoEndereco.join(", ")}</strong> é
                obrigatório informar o endereço postal físico da sua empresa no
                rodapé da mensagem. Cadastre o endereço no seu perfil para
                liberar o disparo.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("disparo.assunto")}
            </Label>
            <Input
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              className="bg-background/60"
              placeholder={t("disparo.placeholderAssunto")}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("disparo.mensagem")}
              </Label>
              <span className="text-[10px] text-dourado-400/80">
                {"{{empresa}}"} {t("disparo.viraNome")}
              </span>
            </div>
            <textarea
              value={corpo}
              onChange={(e) => setCorpo(e.target.value)}
              rows={9}
              className="w-full rounded-md border border-border bg-background/60 px-3 py-2.5 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-azul-500/40"
            />
          </div>

          {/* O que o servidor acrescenta — mostrado para quem dispara
              entender que está identificado e que o opt-out funciona */}
          <div className="rounded-lg border border-border/60 bg-card p-3.5 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-green-400" />
              {t("disparo.adicionadoAutomaticamente")}
            </p>
            <div className="text-[11px] text-muted-foreground/80 leading-relaxed border-t border-border/60 pt-2">
              <p className="font-medium text-muted-foreground">
                {perfil?.nome_empresa} · {perfil?.cidade}
                {perfil?.estado ? `/${perfil.estado}` : ""}
              </p>
              <p>
                {t("disparo.rodapeContato")}: {perfil?.nome_contato} — {perfil?.email_contato}
              </p>
              <p className="mt-1">
                {t("disparo.rodapeMotivo")}{" "}
                <span className="text-dourado-400 underline">{t("disparo.rodapeDescadastrar")}</span>.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground/80 flex items-start gap-1.5 leading-relaxed">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
            {t("disparo.aviso")}
          </p>

          <Button
            onClick={handleEnviar}
            disabled={enviando || elegiveis.length === 0}
            size="lg"
            className="w-full"
          >
            {enviando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("disparo.enviando")}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {t("disparo.enviarPara", { count: elegiveis.length })}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

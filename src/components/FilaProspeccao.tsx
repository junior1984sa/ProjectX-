import { useEffect, useMemo, useState } from "react"
import {
  X,
  MessageCircle,
  SkipForward,
  Check,
  MapPin,
  Phone,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"
import { usePreferenciasStore } from "@/store/usePreferenciasStore"
import { obterPais } from "@/types/prestador"
import { gerarLinkWhatsAppComNumero, montarMensagemAbordagem } from "@/lib/utils"
import {
  carregarJaContatadas,
  registrarContato,
  chaveDaEmpresa,
} from "@/lib/prospeccao"
import type { Empresa } from "@/types/empresa"
import { useTranslation } from "react-i18next"
import toast from "react-hot-toast"

interface FilaProspeccaoProps {
  empresas: Empresa[]
  urlPortfolio?: string | null
  onFechar: () => void
}

/**
 * FILA DE PROSPECÇÃO — abordagem em sequência, um clique por empresa.
 *
 * POR QUE NÃO É DISPARO EM MASSA:
 * enviar 50 mensagens de WhatsApp por ferramenta automatizada é
 * detectável no protocolo da Meta e resulta em banimento do número —
 * não em aviso. A API oficial permite volume, mas só para quem deu
 * opt-in antes, o que empresa prospectada a frio nunca deu.
 *
 * Então a fila resolve o problema real, que é o TEMPO: em vez de
 * procurar cada telefone, copiar, abrir o WhatsApp e escrever, você vê
 * a próxima empresa e clica. São poucos segundos por empresa, a
 * mensagem sai personalizada, e o número não corre risco.
 *
 * Cada abordagem fica registrada, então a mesma empresa não aparece
 * numa fila futura — nem gasta crédito de novo.
 */
export function FilaProspeccao({
  empresas,
  urlPortfolio,
  onFechar,
}: FilaProspeccaoProps) {
  const { perfil } = useAuthStore()
  const { t } = useTranslation()
  const paisPreferido = usePreferenciasStore((s) => s.pais)
  const pais = perfil?.pais_foco ?? paisPreferido
  const configPais = obterPais(pais)

  const [jaContatadas, setJaContatadas] = useState<Set<string> | null>(null)
  const [indice, setIndice] = useState(0)
  const [abordadasAgora, setAbordadasAgora] = useState(0)
  const [registrando, setRegistrando] = useState(false)

  useEffect(() => {
    carregarJaContatadas().then(setJaContatadas)
  }, [])

  /**
   * A fila só inclui quem tem telefone e ainda não foi abordado.
   * Empresa sem telefone não tem como ser contatada por aqui, e
   * mostrá-la na fila só faria o usuário pular à toa.
   */
  const fila = useMemo(() => {
    if (!jaContatadas) return []
    return empresas.filter(
      (e) => e.telefone && !jaContatadas.has(chaveDaEmpresa(e))
    )
  }, [empresas, jaContatadas])

  const atual = fila[indice]
  const semTelefone = empresas.filter((e) => !e.telefone).length

  async function abrirWhatsApp() {
    if (!atual || !perfil || !atual.telefone) return

    setRegistrando(true)
    const { sucesso, erro } = await registrarContato(atual, "whatsapp", pais)
    setRegistrando(false)

    if (!sucesso) {
      // O banco recusa se a empresa estiver na lista de descadastro.
      // Nesse caso pular é o comportamento certo, não insistir.
      toast.error(erro ?? t("fila.erroRegistrar"))
      avancar()
      return
    }

    const link = gerarLinkWhatsAppComNumero(
      atual.telefone,
      atual.nome,
      perfil.nome_contato,
      urlPortfolio,
      configPais.codigoTelefone
    )

    window.open(link, "_blank", "noopener")
    setAbordadasAgora((n) => n + 1)
    avancar()
  }

  function avancar() {
    setIndice((i) => i + 1)
  }

  // ═══ Carregando ═══
  if (jaContatadas === null) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando a fila...</p>
      </div>
    )
  }

  // ═══ Fila terminada (ou vazia desde o início) ═══
  if (!atual) {
    const nadaARenderizar = fila.length === 0
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-dourado-900/30 flex items-center justify-center mx-auto">
            <Check className="w-7 h-7 text-dourado-400" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-foreground">
              {nadaARenderizar ? t("fila.nenhumaNova") : t("fila.concluida")}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {nadaARenderizar
                ? t("fila.todasJaAbordadas")
                : t("fila.abordouAgora", { count: abordadasAgora })}
            </p>
          </div>

          <Button onClick={onFechar} className="w-full">
            {t("fila.voltarResultados")}
          </Button>
        </div>
      </div>
    )
  }

  const restantes = fila.length - indice

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Cabeçalho com progresso */}
      <div className="border-b border-border/60 px-4 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {t("fila.deTotal", { atual: indice + 1, total: fila.length })}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {t("fila.restante", { count: restantes })} · {t("fila.abordadas", { count: abordadasAgora })}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onFechar}
          className="h-8 w-8 text-muted-foreground flex-shrink-0"
          title={t("fila.fechar")}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Barra de progresso */}
      <div className="h-1 bg-secondary">
        <div
          className="h-full bg-azul-500 transition-all"
          style={{ width: `${(indice / fila.length) * 100}%` }}
        />
      </div>

      {/* Empresa atual */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-bold text-foreground leading-tight">
              {atual.nome}
            </h2>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {atual.bairro ? `${atual.bairro}, ` : ""}
              {atual.cidade}
              {atual.estado ? `/${atual.estado}` : ""}
            </p>
            <p className="text-sm text-dourado-300 flex items-center justify-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              {atual.telefone}
            </p>
          </div>

          {/* Prévia da mensagem: o que a empresa vai receber */}
          <div className="rounded-lg border border-border/60 bg-card p-3.5 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t("fila.mensagemQueSeraAberta")}
            </p>
            <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">
              {/* Mesma função que monta a mensagem enviada de verdade:
                  duas cópias do texto divergiriam na primeira alteração,
                  e a prévia passaria a mentir sobre o que será enviado. */}
              {montarMensagemAbordagem(
                atual.nome,
                perfil?.nome_contato ?? "...",
                urlPortfolio ? "[link]" : null
              ).join("\n")}
            </p>
          </div>

          {!urlPortfolio && (
            <p className="text-[11px] text-muted-foreground/80 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
              {t("fila.semPortfolio")}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Button
              onClick={abrirWhatsApp}
              disabled={registrando}
              size="lg"
              className="w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t("fila.abrirWhatsApp")}
            </Button>

            <Button
              onClick={avancar}
              variant="ghost"
              className="w-full text-muted-foreground"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              {t("fila.pular")}
            </Button>
          </div>

          {semTelefone > 0 && indice === 0 && (
            <p className="text-[11px] text-center text-muted-foreground/70">
              {t("fila.semTelefone", { count: semTelefone })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

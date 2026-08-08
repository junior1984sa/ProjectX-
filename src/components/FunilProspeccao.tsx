import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Loader2,
  Search,
  MessageCircle,
  Handshake,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Phone,
  Mail,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  carregarHistoricoContatos,
  carregarResumoFunil,
  atualizarStatusContato,
  ORDEM_FUNIL,
  type ContatoRegistrado,
  type ResumoFunil,
  type StatusContato,
} from "@/lib/prospeccao"
import { usePreferenciasStore } from "@/store/usePreferenciasStore"
import { useAuthStore } from "@/store/useAuthStore"
import { formatarMoeda } from "@/types/prestador"
import { localeDeData } from "@/lib/datas"
import { format, differenceInDays } from "date-fns"
import toast from "react-hot-toast"

/**
 * FUNIL DE ACOMPANHAMENTO
 *
 * O produto entregava a lista e esquecia dela. Quem abordava 50
 * empresas e recebia 3 respostas não tinha onde registrar nada — e,
 * na hora de renovar, não sabia responder "isso me deu cliente?".
 *
 * Esta tela existe para responder essa pergunta em dinheiro, que é a
 * única forma dela convencer. Por isso o valor fechado é pedido junto
 * com o estágio: um funil que só conta "3 fechados" não diz se o mês
 * pagou a assinatura.
 */

const ICONES: Record<StatusContato, typeof MessageCircle> = {
  pendente: Clock,
  contatado: MessageCircle,
  respondeu: TrendingUp,
  negociando: Handshake,
  fechou: CheckCircle2,
  sem_resposta: Clock,
  descartado: XCircle,
}

/** Cor por estágio. Só "fechou" ganha verde — o resto é caminho. */
const CORES: Record<StatusContato, string> = {
  pendente: "text-prata-400 border-prata-700",
  contatado: "text-prata-300 border-prata-600",
  respondeu: "text-dourado-300 border-dourado-700",
  negociando: "text-dourado-200 border-dourado-600",
  fechou: "text-verde-300 border-verde-600",
  sem_resposta: "text-prata-500 border-prata-700",
  descartado: "text-prata-500 border-prata-700",
}

/** Depois de quantos dias parado um lead vira aviso na tela */
const DIAS_PARA_ALERTAR = 7

export function FunilProspeccao() {
  const { t } = useTranslation()
  const { perfil } = useAuthStore()
  const paisPreferido = usePreferenciasStore((s) => s.pais)
  const pais = perfil?.pais_foco ?? paisPreferido
  const locale = localeDeData()

  const [contatos, setContatos] = useState<ContatoRegistrado[]>([])
  const [resumo, setResumo] = useState<ResumoFunil | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState<StatusContato | "todos">("todos")
  const [busca, setBusca] = useState("")
  const [editandoValor, setEditandoValor] = useState<string | null>(null)
  const [valorDigitado, setValorDigitado] = useState("")

  useEffect(() => {
    recarregar()
  }, [])

  async function recarregar() {
    setCarregando(true)
    const [lista, res] = await Promise.all([
      carregarHistoricoContatos(),
      carregarResumoFunil(),
    ])
    setContatos(lista)
    setResumo(res)
    setCarregando(false)
  }

  async function mudarEstagio(contato: ContatoRegistrado, novo: StatusContato) {
    // Atualiza a tela antes da resposta do banco: trocar o estágio de
    // 30 leads seguidos com meio segundo de espera em cada um faria a
    // tela parecer travada.
    setContatos((prev) =>
      prev.map((c) => (c.chave_empresa === contato.chave_empresa ? { ...c, status: novo } : c))
    )

    const ok = await atualizarStatusContato(contato.chave_empresa, novo)
    if (!ok) {
      toast.error(t("funil.erroSalvar"))
      recarregar()
      return
    }

    // "Fechou" sem valor não responde a pergunta que a tela existe para
    // responder, então o campo abre sozinho.
    if (novo === "fechou" && contato.valor_fechado == null) {
      setEditandoValor(contato.chave_empresa)
      setValorDigitado("")
    }

    setResumo(await carregarResumoFunil())
  }

  async function salvarValor(contato: ContatoRegistrado) {
    const numero = Number(valorDigitado.replace(/\./g, "").replace(",", "."))
    if (isNaN(numero) || numero < 0) {
      toast.error(t("funil.valorInvalido"))
      return
    }

    const ok = await atualizarStatusContato(contato.chave_empresa, "fechou", numero)
    if (!ok) {
      toast.error(t("funil.erroSalvar"))
      return
    }

    setContatos((prev) =>
      prev.map((c) =>
        c.chave_empresa === contato.chave_empresa ? { ...c, valor_fechado: numero } : c
      )
    )
    setEditandoValor(null)
    setResumo(await carregarResumoFunil())
  }

  const visiveis = contatos
    .filter((c) => filtro === "todos" || c.status === filtro)
    .filter((c) => c.empresa_nome.toLowerCase().includes(busca.toLowerCase()))

  if (carregando) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const nenhumContato = contatos.length === 0

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("funil.titulo")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("funil.subtitulo")}</p>
      </div>

      {nenhumContato ? (
        <Card className="border-border/60">
          <CardContent className="p-10 text-center space-y-2">
            <MessageCircle className="w-8 h-8 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground">{t("funil.vazio")}</p>
            <p className="text-xs text-muted-foreground/70">{t("funil.vazioDica")}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ═══ O número que importa ═══ */}
          {resumo && (
            <Card className="border-dourado-700/40 bg-dourado-900/10">
              <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-dourado-300/80">
                    {t("funil.retornoGerado")}
                  </p>
                  <p className="text-3xl font-bold text-dourado-300 mt-0.5 tabular-nums">
                    {formatarMoeda(resumo.valor_total, pais)}
                  </p>
                </div>
                <p className="text-[13px] text-dourado-200/80 max-w-[16rem] leading-relaxed">
                  {t("funil.fechadosDeAbordadas", {
                    fechados: resumo.fechou,
                    total: resumo.total,
                  })}
                </p>
              </CardContent>
            </Card>
          )}

          {/* ═══ Estágios ═══ */}
          {resumo && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ORDEM_FUNIL.map((estagio) => {
                const Icone = ICONES[estagio]
                const quantidade = resumo[estagio as keyof ResumoFunil] as number
                const ativo = filtro === estagio
                return (
                  <button
                    key={estagio}
                    onClick={() => setFiltro(ativo ? "todos" : estagio)}
                    className={`rounded-xl border px-2 py-3 text-center transition-colors ${
                      ativo ? "bg-card border-dourado-600" : "border-border/60 hover:border-prata-600"
                    }`}
                  >
                    <Icone className={`w-4 h-4 mx-auto ${CORES[estagio].split(" ")[0]}`} />
                    <p className="text-lg font-bold text-foreground mt-1 tabular-nums">
                      {quantidade}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {t(`funil.estagio.${estagio}`)}
                    </p>
                  </button>
                )
              })}
            </div>
          )}

          {/* ═══ Busca ═══ */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("funil.buscarEmpresa")}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 bg-background/60"
            />
          </div>

          {/* ═══ Lista ═══ */}
          <div className="space-y-2">
            {visiveis.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                {t("funil.nenhumNesteFiltro")}
              </p>
            ) : (
              visiveis.map((contato) => {
                const diasParado = contato.status_mudou_em
                  ? differenceInDays(new Date(), new Date(contato.status_mudou_em))
                  : 0
                // Só alerta quem ainda está em jogo: um lead descartado
                // parado há meses não é problema, é decisão tomada.
                const emJogo = ["contatado", "respondeu", "negociando"].includes(contato.status)
                const esquecido = emJogo && diasParado >= DIAS_PARA_ALERTAR

                return (
                  <Card key={contato.chave_empresa} className="border-border/60">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {contato.empresa_nome}
                          </p>
                          <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                            {contato.cidade && (
                              <span className="text-[11px] text-muted-foreground">
                                {contato.cidade}
                              </span>
                            )}
                            {contato.empresa_telefone && (
                              <span className="flex items-center gap-1 text-[11px] text-verde-300">
                                <Phone className="w-3 h-3" />
                                {contato.empresa_telefone}
                              </span>
                            )}
                            {contato.empresa_email && (
                              <Mail className="w-3 h-3 text-prata-400" />
                            )}
                          </div>
                        </div>

                        <Select
                          value={contato.status}
                          onValueChange={(v) => mudarEstagio(contato, v as StatusContato)}
                        >
                          <SelectTrigger className="w-[9.5rem] h-8 text-xs flex-shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDEM_FUNIL.map((estagio) => (
                              <SelectItem key={estagio} value={estagio} className="text-xs">
                                {t(`funil.estagio.${estagio}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between gap-3 flex-wrap text-[11px]">
                        <div className="flex items-center gap-2.5">
                          {contato.contatado_em && (
                            <span className="text-muted-foreground/70">
                              {t("funil.abordadoEm", {
                                data: format(
                                  new Date(contato.contatado_em),
                                  t("creditos.formatoData"),
                                  { locale }
                                ),
                              })}
                            </span>
                          )}
                          {esquecido && (
                            <span className="text-dourado-400">
                              {t("funil.paradoHa", { dias: diasParado })}
                            </span>
                          )}
                        </div>

                        {contato.status === "fechou" &&
                          (editandoValor === contato.chave_empresa ? (
                            <div className="flex items-center gap-1.5">
                              <Input
                                autoFocus
                                value={valorDigitado}
                                onChange={(e) => setValorDigitado(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") salvarValor(contato)
                                  if (e.key === "Escape") setEditandoValor(null)
                                }}
                                onBlur={() => salvarValor(contato)}
                                placeholder={t("funil.quantoFaturou")}
                                className="h-7 w-32 text-xs bg-background/60"
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditandoValor(contato.chave_empresa)
                                setValorDigitado(
                                  contato.valor_fechado != null ? String(contato.valor_fechado) : ""
                                )
                              }}
                              className="text-verde-300 font-semibold hover:underline"
                            >
                              {contato.valor_fechado != null
                                ? formatarMoeda(contato.valor_fechado, pais)
                                : t("funil.informarValor")}
                            </button>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { X, Copy, MessageCircle, Sparkles, RefreshCw, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  gerarAbordagem,
  gerarPeloModelo,
  TONS,
  type AbordagemGerada,
  type CanalAbordagem,
  type TomAbordagem,
} from "@/lib/abordagem"
import { copiarParaClipboard, gerarLinkWhatsAppComNumero } from "@/lib/utils"
import { obterPais, obterSegmentosClientes } from "@/types/prestador"
import { useAuthStore } from "@/store/useAuthStore"
import { usePreferenciasStore } from "@/store/usePreferenciasStore"
import type { Empresa } from "@/types/empresa"
import toast from "react-hot-toast"

/**
 * MODAL DO ASSISTENTE DE ABORDAGEM.
 *
 * A mensagem aparece PRONTA ao abrir, não atrás de um botão "gerar".
 * Quem está no meio de uma lista de 40 empresas não quer dar dois
 * cliques por empresa — quer ler, ajustar uma palavra e enviar.
 *
 * O texto é editável de propósito. O assistente acerta a estrutura;
 * quem conhece o próprio serviço é o assinante, e a versão dele quase
 * sempre fecha mais que a nossa.
 */

interface ModalAbordagemProps {
  empresa: Empresa
  urlPortfolio?: string | null
  onFechar: () => void
}

export function ModalAbordagem({ empresa, urlPortfolio, onFechar }: ModalAbordagemProps) {
  const { t } = useTranslation()
  const { perfil } = useAuthStore()
  const paisPreferido = usePreferenciasStore((s) => s.pais)
  const configPais = obterPais(perfil?.pais_foco ?? paisPreferido)

  const [tom, setTom] = useState<TomAbordagem>("direto")
  const [canal, setCanal] = useState<CanalAbordagem>(empresa.telefone ? "whatsapp" : "email")
  const [resultado, setResultado] = useState<AbordagemGerada | null>(null)
  const [texto, setTexto] = useState("")
  const [gerando, setGerando] = useState(false)

  /**
   * O ramo-alvo é o que trouxe a empresa para a lista. Recuperá-lo aqui
   * é o que permite a mensagem dizer POR QUE essa empresa — a única
   * linha que o destinatário não recebe de mais ninguém.
   */
  const segmentoAlvo = perfil?.segmento
    ? obterSegmentosClientes(perfil.segmento)[0]
    : undefined

  // Fecha no Esc: modal que só fecha no X irrita quem usa teclado.
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar()
    }
    window.addEventListener("keydown", aoTeclar)
    return () => window.removeEventListener("keydown", aoTeclar)
  }, [onFechar])

  // Primeira versão sai na hora, pelo modelo local — sem espera de rede.
  useEffect(() => {
    if (!perfil) return
    const local = gerarPeloModelo({ empresa, perfil, segmentoAlvo, tom, canal, urlPortfolio })
    setResultado(local)
    setTexto(local.mensagem)
  }, [perfil, tom, canal])

  async function refinar() {
    if (!perfil) return
    setGerando(true)
    const gerado = await gerarAbordagem({ empresa, perfil, segmentoAlvo, tom, canal, urlPortfolio })
    setGerando(false)
    setResultado(gerado)
    setTexto(gerado.mensagem)
  }

  async function copiar() {
    const conteudo = canal === "email" && resultado ? `${resultado.assunto}\n\n${texto}` : texto
    const ok = await copiarParaClipboard(conteudo)
    toast[ok ? "success" : "error"](ok ? t("abordagem.copiado") : t("leads.erro.naoCopiou"))
  }

  function abrirWhatsApp() {
    if (!empresa.telefone) return
    // A mensagem EDITADA é a que vai — não a original. Deixar o usuário
    // ajustar o texto e enviar outro seria o pior tipo de bug: silencioso.
    const link = gerarLinkWhatsAppComNumero(
      empresa.telefone,
      empresa.nome,
      perfil?.nome_contato ?? "",
      null,
      configPais.codigoTelefone,
      texto
    )
    window.open(link, "_blank", "noopener")
  }

  if (!perfil) {
    return (
      <div className="fixed inset-0 z-modal bg-obsidian/80 flex items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-xl border border-prata-700 bg-prata-900 p-6 text-center space-y-4">
          <p className="text-sm text-prata-300">{t("abordagem.semPerfil")}</p>
          <Button onClick={onFechar} variant="secondary" className="w-full">
            {t("abordagem.fechar")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-modal bg-obsidian/85 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
      aria-label={t("abordagem.titulo")}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[92svh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-prata-700 bg-prata-900 shadow-lg"
      >
        {/* Cabeçalho */}
        <div className="sticky top-0 bg-prata-900 border-b border-prata-700 px-5 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-prata-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-dourado-400" />
              {t("abordagem.titulo")}
            </p>
            <p className="text-[12px] text-prata-400 mt-0.5 truncate">{empresa.nome}</p>
          </div>
          <button
            onClick={onFechar}
            className="text-prata-400 hover:text-prata-100 transition-colors flex-shrink-0"
            aria-label={t("abordagem.fechar")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Tom */}
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wide text-prata-400">
              {t("abordagem.tomLabel")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {TONS.map((opcao) => (
                <button
                  key={opcao}
                  onClick={() => setTom(opcao)}
                  aria-pressed={tom === opcao}
                  className={`h-9 rounded-md text-[13px] border transition-colors ${
                    tom === opcao
                      ? "bg-azul-500/15 border-azul-500 text-azul-300"
                      : "border-prata-700 text-prata-400 hover:text-prata-200"
                  }`}
                >
                  {t(`abordagem.tom.${opcao}.nome`)}
                </button>
              ))}
            </div>
          </div>

          {/* Canal — só oferece o que a empresa realmente tem */}
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wide text-prata-400">
              {t("abordagem.canal")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: "whatsapp" as const, rotulo: t("abordagem.canalWhatsapp"), disponivel: !!empresa.telefone, icone: MessageCircle },
                { id: "email" as const, rotulo: t("abordagem.canalEmail"), disponivel: !!empresa.email, icone: Mail },
              ]).map((opcao) => {
                const Icone = opcao.icone
                return (
                  <button
                    key={opcao.id}
                    onClick={() => opcao.disponivel && setCanal(opcao.id)}
                    disabled={!opcao.disponivel}
                    aria-pressed={canal === opcao.id}
                    className={`h-9 rounded-md text-[13px] border transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
                      canal === opcao.id
                        ? "bg-azul-500/15 border-azul-500 text-azul-300"
                        : "border-prata-700 text-prata-400 hover:text-prata-200"
                    }`}
                  >
                    <Icone className="w-3.5 h-3.5" />
                    {opcao.rotulo}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Assunto, só para e-mail */}
          {canal === "email" && resultado && (
            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-wide text-prata-400">
                {t("disparo.assunto")}
              </p>
              <p className="text-[13px] text-prata-200 bg-prata-800 border border-prata-700 rounded-md px-3 py-2">
                {resultado.assunto}
              </p>
            </div>
          )}

          {/* Mensagem editável */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] uppercase tracking-wide text-prata-400">
                {t("abordagem.mensagem")}
              </p>
              {resultado && (
                <Badge
                  variant="outline"
                  className={`text-[10px] font-normal ${
                    resultado.origem === "ia"
                      ? "border-dourado-700 text-dourado-300"
                      : "border-prata-700 text-prata-400"
                  }`}
                >
                  {resultado.origem === "ia" ? t("abordagem.porIA") : t("abordagem.porModelo")}
                </Badge>
              )}
            </div>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={canal === "email" ? 9 : 6}
              className="w-full rounded-md border border-prata-500 bg-prata-800 px-3 py-2.5 text-[13px] text-prata-100 leading-relaxed resize-y outline-none focus:border-azul-500"
            />
            <p className="text-[11px] text-prata-500">{t("abordagem.dicaEditar")}</p>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-2">
            {canal === "whatsapp" && empresa.telefone && (
              <Button onClick={abrirWhatsApp} size="lg" className="w-full">
                <MessageCircle className="w-4 h-4" />
                {t("abordagem.abrirWhatsapp")}
              </Button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={copiar} variant="secondary">
                <Copy className="w-3.5 h-3.5" />
                {t("abordagem.copiar")}
              </Button>
              <Button onClick={refinar} variant="outline" carregando={gerando}>
                {!gerando && <RefreshCw className="w-3.5 h-3.5" />}
                {gerando ? t("abordagem.gerando") : t("abordagem.gerar")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

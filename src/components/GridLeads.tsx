import { useState, useEffect } from "react"
import { Heart, Copy, Download, Search, MessageCircle, Mail, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/useAppStore"
import { useAuthStore } from "@/store/useAuthStore"
import { copiarParaClipboard, exportarCSV, gerarLinkWhatsAppComNumero, gerarLinkWhatsAppSemNumero } from "@/lib/utils"
import { listarArquivosPortfolio } from "@/lib/storage"
import { ContatoComPaywall } from "@/components/ContatoComPaywall"
import { NomeComPaywall } from "@/components/NomeComPaywall"
import { FilaProspeccao } from "@/components/FilaProspeccao"
import { DisparoEmail } from "@/components/DisparoEmail"
import { ModalAbordagem } from "@/components/ModalAbordagem"
import type { Empresa } from "@/types/empresa"
import { temAcessoLiberado } from "@/types/prestador"
import { useTranslation } from "react-i18next"
import toast from "react-hot-toast"

const ITENS_POR_PAGINA = 8

function Estrelas({ score }: { score: number }) {
  return (
    <span className="text-sm tracking-wider text-dourado-400">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < Math.round(score) ? "" : "opacity-25"}>★</span>
      ))}
    </span>
  )
}

function SkeletonLeadCard() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex justify-between mb-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-3 w-32 mb-2" />
      <Skeleton className="h-3 w-28" />
    </div>
  )
}

export function GridLeads({ onAssinar }: { onAssinar?: () => void }) {
  const {
    empresasFiltradas,
    carregando,
    filtros,
    aplicarFiltros,
    alternarFavorito,
  } = useAppStore()
  const { perfil } = useAuthStore()
  const { t } = useTranslation()
  const temAcesso = temAcessoLiberado(perfil)

  const [pagina, setPagina] = useState(1)
  const [urlPortfolio, setUrlPortfolio] = useState<string | null>(null)
  const [filaAberta, setFilaAberta] = useState(false)
  const [disparoAberto, setDisparoAberto] = useState(false)
  /** Empresa cuja abordagem esta sendo escrita, ou null */
  const [abordando, setAbordando] = useState<Empresa | null>(null)

  useEffect(() => {
    if (!perfil?.id) return
    listarArquivosPortfolio(perfil.id).then((arquivos) => {
      // Usa o arquivo mais recente como material padrão de divulgação
      setUrlPortfolio(arquivos[0]?.url_storage ?? null)
    })
  }, [perfil?.id])

  function handleAssinar() {
    onAssinar?.()
  }

  function handleEnviarPanfleto(empresa: Empresa) {
    if (!temAcesso) {
      toast.error(t("leads.erro.assineEnviar"))
      handleAssinar()
      return
    }
    if (!perfil) return

    if (!urlPortfolio) {
      toast(t("leads.semPortfolio"), { icon: "📎" })
      return
    }

    const link = empresa.telefone
      ? gerarLinkWhatsAppComNumero(empresa.telefone, empresa.nome, perfil.nome_contato, urlPortfolio)
      : gerarLinkWhatsAppSemNumero(empresa.nome, perfil.nome_contato, urlPortfolio)

    window.open(link, "_blank")
  }

  async function handleCopiar(empresa: Empresa) {
    if (!temAcesso) {
      toast.error(t("leads.erro.assineCopiar"))
      handleAssinar()
      return
    }
    const texto = [empresa.nome, empresa.telefone || "", empresa.email || ""]
      .filter(Boolean)
      .join(" | ")
    const ok = await copiarParaClipboard(texto)
    toast[ok ? "success" : "error"](ok ? t("leads.ok.copiado") : t("leads.erro.naoCopiou"))
  }

  function handleExportar() {
    if (!temAcesso) {
      toast.error(t("leads.erro.assineExportar"))
      handleAssinar()
      return
    }
    const { conteudo, nomeArquivo } = exportarCSV(empresasFiltradas)
    const blob = new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = nomeArquivo
    link.click()
    URL.revokeObjectURL(url)
    toast.success(t("leads.ok.exportadas", { quantidade: empresasFiltradas.length }))
  }

  const ordenadas = [...empresasFiltradas].sort((a, b) => b.score - a.score)
  const totalPaginas = Math.max(1, Math.ceil(ordenadas.length / ITENS_POR_PAGINA))
  const inicio = (pagina - 1) * ITENS_POR_PAGINA
  const pagAtual = ordenadas.slice(inicio, inicio + ITENS_POR_PAGINA)

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h2 className="text-[15px] font-bold text-foreground">{t("leads.titulo")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {carregando ? t("leads.carregando") : t("leads.contagem", { quantidade: ordenadas.length })}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder={t("leads.buscarPlaceholder")}
              value={filtros.textoBusca}
              onChange={(e) => { aplicarFiltros({ textoBusca: e.target.value }); setPagina(1) }}
              className="pl-8 h-9 text-xs w-52 bg-white/[0.02]"
            />
          </div>
          {/* Só faz sentido oferecer a fila para quem tem acesso: sem
              assinatura os telefones estão protegidos, e a fila existe
              justamente para usá-los. */}
          {temAcesso && (
            <Button
              size="sm"
              onClick={() => setFilaAberta(true)}
              disabled={ordenadas.filter((e) => e.telefone).length === 0 || carregando}
              className="h-9 text-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              {t("leads.prospectarSequencia")}
            </Button>
          )}
          {/* WhatsApp é um a um por obrigação (disparo em massa banisce
              o número); e-mail é em lote porque pode, legalmente. */}
          {temAcesso && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDisparoAberto(true)}
              disabled={ordenadas.filter((e) => e.email).length === 0 || carregando}
              className="h-9 text-xs border-dourado-700 bg-dourado-900/10 text-dourado-300 hover:bg-dourado-900/20"
            >
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              {t("leads.emailLote")}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportar}
            disabled={ordenadas.length === 0 || carregando}
            className="h-9 text-xs border-dourado-700 bg-dourado-900/10 text-dourado-300 hover:bg-dourado-900/20"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {t("leads.exportar")}
          </Button>
        </div>
      </div>

      {filaAberta && (
        <FilaProspeccao
          empresas={ordenadas}
          urlPortfolio={urlPortfolio}
          onFechar={() => setFilaAberta(false)}
        />
      )}

      {disparoAberto && (
        <DisparoEmail
          empresas={ordenadas}
          onFechar={() => setDisparoAberto(false)}
        />
      )}

      {abordando && (
        <ModalAbordagem
          empresa={abordando}
          urlPortfolio={urlPortfolio}
          onFechar={() => setAbordando(null)}
        />
      )}

      {!temAcesso && !carregando && ordenadas.length > 0 && (
        <div className="rounded-xl border border-dourado-700/40 bg-dourado-900/12 px-5 py-3.5 mb-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-dourado-200/90">
            🔒{" "}
            {t("leads.paywallAviso", {
              telefones: empresasFiltradas.filter((e) => e.telefone).length,
              emails: empresasFiltradas.filter((e) => e.email).length,
            })}
          </p>
          <Button
            size="sm"
            onClick={handleAssinar}
            variant="premium"
            className="h-8 text-xs flex-shrink-0"
          >
            {t("leads.desbloquear")}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {carregando ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonLeadCard key={i} />)
        ) : pagAtual.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <p className="text-sm text-muted-foreground">{t("leads.nenhuma")}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">{t("leads.ajusteFiltros")}</p>
          </div>
        ) : (
          pagAtual.map((empresa) => {
            const destaque = empresa.score >= 4
            return (
              <div
                key={empresa.id}
                className={`rounded-2xl border bg-card p-[18px] transition-colors ${
                  destaque ? "border-dourado-700/40" : "border-border"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground/95 leading-snug">
                      <NomeComPaywall nome={empresa.nome} />
                    </p>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5">
                      📍 {empresa.bairro}, {empresa.cidade}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0 ml-2">
                    <Estrelas score={empresa.score} />
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        empresa.score >= 4
                          ? "bg-green-900/30 text-green-400"
                          : "bg-dourado-900/30 text-dourado-300"
                      }`}
                    >
                      {empresa.score}/5
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mb-3.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center flex-shrink-0">📞</span>
                    {empresa.telefone ? (
                      <ContatoComPaywall tipo="telefone" valor={empresa.telefone} onClickAssinar={handleAssinar} />
                    ) : (
                      <span className="text-muted-foreground/50 text-[11px]">{t("leads.semTelefone")}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center flex-shrink-0">✉️</span>
                    {empresa.email ? (
                      <ContatoComPaywall tipo="email" valor={empresa.email} onClickAssinar={handleAssinar} />
                    ) : (
                      <span className="text-muted-foreground/50 text-[11px]">{t("leads.semEmail")}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-border/60">
                  <button
                    onClick={() => handleEnviarPanfleto(empresa)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-green-700/40 bg-green-900/10 text-xs text-green-400 hover:bg-green-900/20 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {t("leads.enviarPanfleto")}
                  </button>
                  {/* Assistente de abordagem: mesma trava dos demais —
                      sem assinatura os contatos estao protegidos, e a
                      mensagem existe justamente para usa-los. */}
                  <button
                    onClick={() => {
                      if (!temAcesso) {
                        toast.error(t("leads.erro.assineEnviar"))
                        handleAssinar()
                        return
                      }
                      setAbordando(empresa)
                    }}
                    className="w-9 flex items-center justify-center rounded-lg border border-dourado-700/50 bg-dourado-900/15 text-dourado-300 hover:bg-dourado-900/30 transition-colors"
                    title={t("abordagem.titulo")}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopiar(empresa)}
                    className="w-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-white/[0.02] transition-colors"
                    title={t("leads.copiarDados")}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      alternarFavorito(empresa.id)
                      toast.success(empresa.favorita ? t("leads.ok.favoritoRemovido") : t("leads.ok.favoritoSalvo"))
                    }}
                    className={`w-9 flex items-center justify-center rounded-lg border transition-colors ${
                      empresa.favorita
                        ? "border-red-700/40 bg-red-900/10 text-red-400"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                    title={t("leads.favoritar")}
                  >
                    <Heart className={`w-3.5 h-3.5 ${empresa.favorita ? "fill-red-400" : ""}`} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {!carregando && totalPaginas > 1 && (
        <div className="flex justify-center gap-1.5 mt-7">
          {Array.from({ length: totalPaginas }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPagina(i + 1)}
              className={`h-1.5 rounded-full transition-all ${
                pagina === i + 1 ? "w-5 bg-dourado-400" : "w-1.5 bg-secondary"
              }`}
              aria-label={t("leads.pagina", { numero: i + 1 })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

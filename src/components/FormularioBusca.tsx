import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, MapPin, Clock, Trash2, ChevronRight, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/store/useAppStore"
import { useAuthStore } from "@/store/useAuthStore"
import { usePreferenciasStore } from "@/store/usePreferenciasStore"
import { useCreditosStore } from "@/store/useCreditosStore"
import { FAIXAS_CREDITO, temAcessoLiberado, obterSegmentosClientes as obterSegmentosClientesPreview, obterSegmentosClientesComFallback, obterPais, type ModoBusca } from "@/types/prestador"
import { useTranslation } from "react-i18next"
import { type ParametrosBusca } from "@/types/empresa"
import toast from "react-hot-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// As sugestões de segmento vêm da tradução (mudam com o idioma) e as
// de cidade vêm do país escolhido — sugerir "São Paulo, SP" para quem
// prospecta em Chicago seria pior do que não sugerir nada.

export function FormularioBusca() {
  const navigate = useNavigate()
  const { buscarEmpresas, historicoBuscas, removerBuscaSalva, carregando } = useAppStore()
  const { usuarioId, perfil } = useAuthStore()

  /**
   * País da busca. O perfil manda quando existe (é o dado oficial, que
   * define moeda e cobrança); antes do cadastro vale a escolha feita na
   * tela de abertura. Sem isso, um visitante dos EUA buscaria no Brasil.
   */
  const paisPreferido = usePreferenciasStore((s) => s.pais)
  const paisDaBusca = perfil?.pais_foco ?? paisPreferido
  const configPais = obterPais(paisDaBusca)
  const { t } = useTranslation()
  const { creditos, carregarCreditos, consumirCreditos } = useCreditosStore()

  const [segmento, setSegmento] = useState("")
  const [cidade, setCidade] = useState("")
  const [raioKm, setRaioKm] = useState(10)
  const [faixaSelecionada, setFaixaSelecionada] = useState(0) // índice em FAIXAS_CREDITO
  const [modoBusca, setModoBusca] = useState<ModoBusca>("clientes")
  const [buscandoMapeamento, setBuscandoMapeamento] = useState(false)
  const [mostrarSugestoesSegmento, setMostrarSugestoesSegmento] = useState(false)
  const [mostrarSugestoesCidade, setMostrarSugestoesCidade] = useState(false)

  const temAcesso = temAcessoLiberado(perfil)

  useEffect(() => {
    if (usuarioId && temAcesso) {
      carregarCreditos()
    }
  }, [usuarioId, temAcesso])

  async function handleBuscar() {
    if (!segmento.trim()) {
      toast.error(t("busca.erro.informeRamo"))
      return
    }
    if (!cidade.trim()) {
      toast.error(t("busca.erro.informeCidade"))
      return
    }

    // Extrai cidade e estado do campo (ex: "São Paulo, SP")
    // Aceita "Cidade", "Cidade, UF" e "Bairro, Cidade, UF".
    //
    // Com três partes assume que a primeira é bairro: em cidade grande
    // é o que faz a busca render, porque leads a 40 km do prestador não
    // são visitados. Com duas, mantém o formato antigo — quem já usava
    // "São Paulo, SP" não vê diferença.
    const partes = cidade.split(",").map((p) => p.trim()).filter(Boolean)
    const temBairro = partes.length >= 3
    const bairro = temBairro ? partes[0] : ""
    const nomeCidade = temBairro ? partes[1] : partes[0] ?? ""
    const estado = temBairro ? partes[2] : partes[1] ?? ""

    // No modo "clientes potenciais", traduz o segmento do prestador
    // para os segmentos que tipicamente CONTRATAM esse serviço — usa
    // a tabela fixa primeiro e, se não achar, recorre à inferência por IA.
    let segmentosBusca: string[] | undefined
    if (modoBusca === "clientes") {
      setBuscandoMapeamento(true)
      const { segmentos, fonte } = await obterSegmentosClientesComFallback(segmento.trim())
      setBuscandoMapeamento(false)

      if (segmentos.length === 0) {
        toast.error(t("busca.erro.semClientesPotenciais"))
        return
      }
      if (fonte === "ia") {
        toast.success(t("busca.ok.iaIdentificou"))
      }
      segmentosBusca = segmentos
    }

    // Visitante sem login: libera uma busca de demonstração, sem gastar
    // créditos, para que a pessoa sinta a ferramenta antes de criar conta.
    // O tamanho fica fixo em 10 empresas e fica marcado como "demo" na sessão.
    if (!usuarioId) {
      if (sessionStorage.getItem("prospectx_demo_usado")) {
        toast.error(t("busca.erro.demoUsada"))
        navigate("/entrar")
        return
      }

      const params: ParametrosBusca = {
        segmento: segmento.trim(),
        cidade: nomeCidade,
        estado,
        raioKm,
        quantidadeDesejada: 10,
        segmentosBusca,
        pais: paisDaBusca,
        bairro,
        timestamp: new Date(),
      }

      sessionStorage.setItem("prospectx_demo_usado", "true")
      toast.success(t("busca.ok.demonstracao"))
      await buscarEmpresas(params)
      return
    }

    if (!temAcesso) {
      toast.error(t("busca.erro.assineParaLiberar"))
      navigate(perfil ? "/planos" : "/perfil")
      return
    }

    const faixa = FAIXAS_CREDITO[faixaSelecionada]

    // Verifica e debita créditos de forma atômica no banco antes de gerar a busca
    const resultado = await consumirCreditos({
      quantidadeEmpresas: faixa.max,
      segmento: segmento.trim(),
      cidade: nomeCidade,
      estado,
      raioKm,
    })

    if (!resultado.sucesso) {
      // Duas recusas bem diferentes: sem saldo pede recarga; teto do
      // dia significa que o saldo existe e só precisa voltar amanhã.
      // Dar a mensagem errada aqui faria o cliente achar que acabou.
      toast.error(
        resultado.motivo === "limite_diario"
          ? t("busca.erro.limiteDiario", { restantes: resultado.creditos_restantes })
          : t("busca.erro.creditosInsuficientes", {
              custo: resultado.custo,
              saldo: resultado.creditos_restantes,
            })
      )
      return
    }

    const params: ParametrosBusca = {
      segmento: segmento.trim(),
      cidade: nomeCidade,
      estado,
      raioKm,
      quantidadeDesejada: faixa.max,
      segmentosBusca,
      pais: paisDaBusca,
      bairro,
      timestamp: new Date(),
    }

    toast.success(
      t("busca.ok.creditosUsados", {
        custo: resultado.custo,
        saldo: resultado.creditos_restantes,
      })
    )
    await buscarEmpresas(params)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleBuscar()
  }

  function preencherBuscaSalva(busca: typeof historicoBuscas[0]) {
    setSegmento(busca.segmento)
    setCidade(busca.estado ? `${busca.cidade}, ${busca.estado}` : busca.cidade)
    setRaioKm(busca.raioKm)
  }

  // Sugestões: segmentos seguem o idioma, cidades seguem o país
  const segmentosSugeridos = t("busca.segmentosSugeridos", {
    returnObjects: true,
  }) as string[]
  const cidadesSugeridas = configPais.cidadesSugeridas

  const sugestoesSegmentoFiltradas = segmentosSugeridos.filter(
    (s) => s.toLowerCase().includes(segmento.toLowerCase()) && segmento.length > 0
  )
  const sugestoesCidadeFiltradas = cidadesSugeridas.filter(
    (c) => c.toLowerCase().includes(cidade.toLowerCase()) && cidade.length > 0
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      <div className="mb-10 text-center animate-fadeIn">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img
            src="/logo-x-apenas.png"
            alt="ProjectX"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Prospect<span className="text-dourado-400">X</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          {/* A região sai do país escolhido: prometer "do Brasil" para
              quem prospecta em Sydney seria promessa errada */}
          {t("busca.chamada", { regiao: t(`paisesEm.${configPais.codigo}`) })}
        </p>
      </div>

      {/* Card principal de busca */}
      <Card className="w-full max-w-2xl border-border/60 shadow-2xl shadow-black/30 animate-fadeIn">
        <CardContent className="p-6 md:p-8 space-y-6">

          {/* Seletor de modo de busca */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {t("busca.oQueEncontrar")}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setModoBusca("clientes")}
                className={`flex flex-col items-start gap-0.5 p-3 rounded-lg border text-left transition-all ${
                  modoBusca === "clientes"
                    ? "bg-dourado-900/30 border-dourado-600 text-dourado-300"
                    : "bg-secondary border-transparent text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                <span className="text-sm font-semibold">{t("busca.modoClientes")}</span>
                <span className="text-xs opacity-80">{t("busca.modoClientesDescricao")}</span>
              </button>
              <button
                type="button"
                onClick={() => setModoBusca("direta")}
                className={`flex flex-col items-start gap-0.5 p-3 rounded-lg border text-left transition-all ${
                  modoBusca === "direta"
                    ? "bg-dourado-900/30 border-dourado-600 text-dourado-300"
                    : "bg-secondary border-transparent text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                <span className="text-sm font-semibold">{t("busca.modoDireta")}</span>
                <span className="text-xs opacity-80">{t("busca.modoDiretaDescricao")}</span>
              </button>
            </div>
          </div>

          {/* Campo: Segmento */}
          <div className="space-y-2 relative">
            <Label htmlFor="segmento" className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {modoBusca === "clientes" ? t("busca.seuRamo") : t("busca.ramoABuscar")}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="segmento"
                placeholder={
                  modoBusca === "clientes"
                    ? t("busca.placeholderRamoClientes")
                    : t("busca.placeholderRamoDireta")
                }
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
                onFocus={() => setMostrarSugestoesSegmento(true)}
                onBlur={() => setTimeout(() => setMostrarSugestoesSegmento(false), 150)}
                onKeyDown={handleKeyDown}
                className="pl-9 h-12 text-base bg-background/60"
              />
            </div>
            {/* Dropdown de sugestões */}
            {mostrarSugestoesSegmento && sugestoesSegmentoFiltradas.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                {sugestoesSegmentoFiltradas.map((sug) => (
                  <button
                    key={sug}
                    className="w-full text-left px-4 py-2.5 hover:bg-accent hover:text-accent-foreground text-sm transition-colors"
                    onMouseDown={() => setSegmento(sug)}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
            {/* Chips de sugestões rápidas */}
            {!segmento && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {segmentosSugeridos.slice(0, 5).map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setSegmento(sug)}
                    className="px-2.5 py-1 rounded-full bg-secondary text-xs text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Preview dos segmentos-clientes mapeados, em tempo real */}
            {modoBusca === "clientes" && segmento.trim() && (
              <div className="mt-2">
                {(() => {
                  const previewClientes = obterSegmentosClientesPreview(segmento)
                  if (previewClientes.length === 0) {
                    return (
                      <p className="text-xs text-muted-foreground">
                        {t("busca.foraDaLista")}
                      </p>
                    )
                  }
                  return (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">{t("busca.vamosBuscar")}</span>
                      {previewClientes.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded-full bg-dourado-900/20 border border-dourado-700/30 text-xs text-dourado-300">
                          {c}
                        </span>
                      ))}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Campo: Cidade */}
          <div className="space-y-2 relative">
            <Label htmlFor="cidade" className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {t("busca.cidade")}
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="cidade"
                placeholder={t("busca.placeholderCidade", {
                  exemplo: configPais.exemploCidade,
                })}
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                onFocus={() => setMostrarSugestoesCidade(true)}
                onBlur={() => setTimeout(() => setMostrarSugestoesCidade(false), 150)}
                onKeyDown={handleKeyDown}
                className="pl-9 h-12 text-base bg-background/60"
              />
            </div>
            {/* Dropdown cidades */}
            {mostrarSugestoesCidade && sugestoesCidadeFiltradas.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                {sugestoesCidadeFiltradas.map((c) => (
                  <button
                    key={c}
                    className="w-full text-left px-4 py-2.5 hover:bg-accent hover:text-accent-foreground text-sm transition-colors flex items-center gap-2"
                    onMouseDown={() => setCidade(c)}
                  >
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    {c}
                  </button>
                ))}
              </div>
            )}

            {/* A busca por bairro é o que salva cidade grande, mas
                ninguém adivinha que o campo aceita — por isso a dica
                fica visível, e não escondida num ícone de ajuda. */}
            <p className="text-[11px] text-muted-foreground/80 leading-snug">
              {t("busca.dicaBairro")}
            </p>
          </div>

          {/* Campo: Raio */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {t("busca.raioDeBusca")}
            </Label>
            <div className="flex items-center gap-3">
              {[5, 10, 20, 30, 50].map((km) => (
                <button
                  key={km}
                  onClick={() => setRaioKm(km)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    raioKm === km
                      ? "bg-dourado-600 text-white"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  {km}km
                </button>
              ))}
            </div>
          </div>

          {/* Campo: tamanho da busca, ligado ao consumo de créditos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {t("busca.tamanhoDaBusca")}
              </Label>
              {usuarioId && temAcesso && creditos && (
                <span className="flex items-center gap-1 text-xs text-dourado-400 font-medium">
                  <Zap className="w-3 h-3" />
                  {t("busca.creditosDisponiveis", {
                    quantidade: creditos.creditos_disponiveis,
                  })}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FAIXAS_CREDITO.map((faixa, i) => (
                <button
                  key={faixa.max}
                  onClick={() => setFaixaSelecionada(i)}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-md text-xs font-medium transition-all border ${
                    faixaSelecionada === i
                      ? "bg-dourado-900/30 border-dourado-600 text-dourado-300"
                      : "bg-secondary border-transparent text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  {/* O rótulo vem da tradução, não do `label` fixo da
                      constante, que está escrito em português */}
                  <span>{t("busca.ateEmpresas", { quantidade: faixa.max })}</span>
                  <span className="text-[10px] opacity-70 mt-0.5">
                    {t("busca.custoEmCreditos", { quantidade: faixa.custo })}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("busca.dicaCreditos")}
            </p>
          </div>

          {/* Botão buscar */}
          <Button
            onClick={handleBuscar}
            disabled={carregando || buscandoMapeamento}
            size="xl"
            className="w-full bg-gradient-to-r from-dourado-600 to-dourado-700 hover:from-dourado-700 hover:to-dourado-800 text-white font-semibold shadow-lg shadow-dourado-900/30"
          >
            {buscandoMapeamento ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("busca.identificandoClientes")}
              </div>
            ) : carregando ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("busca.buscandoEmpresas")}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {t("busca.buscarEmpresas", {
                  quantidade: FAIXAS_CREDITO[faixaSelecionada].custo,
                })}
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de buscas */}
      {historicoBuscas.length > 0 && (
        <div className="w-full max-w-2xl mt-8 animate-fadeIn">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {t("busca.buscasRecentes")}
            </h2>
          </div>
          <div className="space-y-2">
            {historicoBuscas.map((busca) => (
              <div
                key={busca.id}
                className="group flex items-center gap-3 p-3 rounded-lg bg-card border border-border/60 hover:border-border transition-all cursor-pointer"
                onClick={() => preencherBuscaSalva(busca)}
              >
                <div className="w-8 h-8 rounded-md bg-dourado-900/40 flex items-center justify-center flex-shrink-0">
                  <Search className="w-4 h-4 text-dourado-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {busca.segmento} — {busca.cidade}{busca.estado ? `, ${busca.estado}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {busca.totalResultados} empresas •{" "}
                    {format(new Date(busca.timestamp), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                    {busca.raioKm}km
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removerBuscaSalva(busca.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

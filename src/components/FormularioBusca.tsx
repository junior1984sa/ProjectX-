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
import { useCreditosStore } from "@/store/useCreditosStore"
import { FAIXAS_CREDITO, temAcessoLiberado } from "@/types/prestador"
import { type ParametrosBusca } from "@/types/empresa"
import toast from "react-hot-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Sugestões rápidas de segmentos
const SEGMENTOS_SUGERIDOS = [
  "Marmoraria", "Clínica odontológica", "Restaurante", "Academia",
  "Mecânica", "Farmácia", "Pet shop", "Construtora", "Advocacia", "Contabilidade"
]

// Cidades populares
const CIDADES_SUGERIDAS = [
  "São Paulo, SP", "Rio de Janeiro, RJ", "Florianópolis, SC",
  "Curitiba, PR", "Belo Horizonte, MG", "Porto Alegre, RS"
]

export function FormularioBusca() {
  const navigate = useNavigate()
  const { buscarEmpresas, historicoBuscas, removerBuscaSalva, carregando } = useAppStore()
  const { usuarioId, perfil } = useAuthStore()
  const { creditos, carregarCreditos, consumirCreditos } = useCreditosStore()

  const [segmento, setSegmento] = useState("")
  const [cidade, setCidade] = useState("")
  const [raioKm, setRaioKm] = useState(10)
  const [faixaSelecionada, setFaixaSelecionada] = useState(0) // índice em FAIXAS_CREDITO
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
      toast.error("Informe o ramo ou segmento da empresa.")
      return
    }
    if (!cidade.trim()) {
      toast.error("Informe a cidade para a busca.")
      return
    }

    // Extrai cidade e estado do campo (ex: "São Paulo, SP")
    const partes = cidade.split(",")
    const nomeCidade = partes[0].trim()
    const estado = partes[1]?.trim() || ""

    // Visitante sem login: libera uma busca de demonstração, sem gastar
    // créditos, para que a pessoa sinta a ferramenta antes de criar conta.
    // O tamanho fica fixo em 10 empresas e fica marcado como "demo" na sessão.
    if (!usuarioId) {
      if (sessionStorage.getItem("prospectx_demo_usado")) {
        toast.error("Você já usou sua busca de demonstração. Crie sua conta para continuar buscando.")
        navigate("/entrar")
        return
      }

      const params: ParametrosBusca = {
        segmento: segmento.trim(),
        cidade: nomeCidade,
        estado,
        raioKm,
        quantidadeDesejada: 10,
        timestamp: new Date(),
      }

      sessionStorage.setItem("prospectx_demo_usado", "true")
      toast.success("Essa é uma demonstração — crie sua conta para ver os contatos e buscar sem limites.")
      await buscarEmpresas(params)
      return
    }

    if (!temAcesso) {
      toast.error("Assine um plano para liberar suas buscas mensais.")
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
      toast.error(
        `Créditos insuficientes (precisa de ${resultado.custo}, você tem ${resultado.creditos_restantes}). Aguarde a renovação mensal.`
      )
      return
    }

    const params: ParametrosBusca = {
      segmento: segmento.trim(),
      cidade: nomeCidade,
      estado,
      raioKm,
      quantidadeDesejada: faixa.max,
      timestamp: new Date(),
    }

    toast.success(`${resultado.custo} créditos usados · ${resultado.creditos_restantes} restantes`)
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

  // Filtra sugestões
  const sugestoesSegmentoFiltradas = SEGMENTOS_SUGERIDOS.filter(s =>
    s.toLowerCase().includes(segmento.toLowerCase()) && segmento.length > 0
  )
  const sugestoesCidadeFiltradas = CIDADES_SUGERIDAS.filter(c =>
    c.toLowerCase().includes(cidade.toLowerCase()) && cidade.length > 0
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
          Esqueça anúncio esperando alguém ver. O ProspectX vai direto até quem,
          agora, precisa do serviço que você presta — em qualquer cidade do Brasil.
        </p>
      </div>

      {/* Card principal de busca */}
      <Card className="w-full max-w-2xl border-border/60 shadow-2xl shadow-black/30 animate-fadeIn">
        <CardContent className="p-6 md:p-8 space-y-6">

          {/* Campo: Segmento */}
          <div className="space-y-2 relative">
            <Label htmlFor="segmento" className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Ramo / Segmento
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="segmento"
                placeholder="Ex: marmoraria, clínica odontológica, restaurante..."
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
                {SEGMENTOS_SUGERIDOS.slice(0, 5).map((sug) => (
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
          </div>

          {/* Campo: Cidade */}
          <div className="space-y-2 relative">
            <Label htmlFor="cidade" className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Cidade
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="cidade"
                placeholder="Ex: São Paulo, SP"
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
          </div>

          {/* Campo: Raio */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Raio de Busca
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
                Tamanho da busca
              </Label>
              {usuarioId && temAcesso && creditos && (
                <span className="flex items-center gap-1 text-xs text-dourado-400 font-medium">
                  <Zap className="w-3 h-3" />
                  {creditos.creditos_disponiveis} créditos disponíveis
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
                  <span>{faixa.label}</span>
                  <span className="text-[10px] opacity-70 mt-0.5">{faixa.custo} créditos</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Buscas maiores rendem mais empresas por crédito gasto. Seu saldo renova todo mês.
            </p>
          </div>

          {/* Botão buscar */}
          <Button
            onClick={handleBuscar}
            disabled={carregando}
            size="xl"
            className="w-full bg-gradient-to-r from-dourado-600 to-dourado-700 hover:from-dourado-700 hover:to-dourado-800 text-white font-semibold shadow-lg shadow-dourado-900/30"
          >
            {carregando ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Buscando empresas...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Buscar Empresas · {FAIXAS_CREDITO[faixaSelecionada].custo} créditos
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
              Buscas Recentes
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

import { useEffect, useState } from "react"
import { Plus, Loader2, Trash2, DollarSign, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  listarCustos,
  salvarCusto,
  alternarCustoAtivo,
  removerCusto,
  carregarCotacaoDolar,
  salvarCotacaoDolar,
  formatarBRL,
  ROTULOS_CATEGORIA,
  ROTULOS_RECORRENCIA,
  type CustoOperacional,
  type CategoriaCusto,
  type Recorrencia,
} from "@/lib/admin"
import toast from "react-hot-toast"

const FORM_VAZIO = {
  categoria: "infraestrutura" as CategoriaCusto,
  descricao: "",
  valor: "",
  moeda: "BRL" as "BRL" | "USD" | "EUR",
  recorrencia: "mensal" as Recorrencia,
  observacao: "",
}

export function GestaoCustos() {
  const [custos, setCustos] = useState<CustoOperacional[]>([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [cotacao, setCotacao] = useState(5.5)
  const [editandoCotacao, setEditandoCotacao] = useState(false)
  const [novaCotacao, setNovaCotacao] = useState("")

  useEffect(() => {
    recarregar()
    carregarCotacaoDolar().then(setCotacao)
  }, [])

  async function recarregar() {
    setCarregando(true)
    setCustos(await listarCustos())
    setCarregando(false)
  }

  async function handleSalvar() {
    if (!form.descricao.trim()) {
      toast.error("Descreva o custo.")
      return
    }
    const valorNumerico = Number(form.valor.replace(",", "."))
    if (isNaN(valorNumerico) || valorNumerico < 0) {
      toast.error("Informe um valor válido.")
      return
    }

    setSalvando(true)
    const { erro } = await salvarCusto({
      categoria: form.categoria,
      descricao: form.descricao.trim(),
      valor: valorNumerico,
      moeda: form.moeda,
      recorrencia: form.recorrencia,
      data_referencia: new Date().toISOString().slice(0, 10),
      ativo: true,
      observacao: form.observacao.trim() || null,
    })
    setSalvando(false)

    if (erro) {
      toast.error(`Erro ao salvar: ${erro}`)
      return
    }

    toast.success("Custo registrado.")
    setForm(FORM_VAZIO)
    setMostrarForm(false)
    recarregar()
  }

  async function handleAlternar(custo: CustoOperacional) {
    const { erro } = await alternarCustoAtivo(custo.id, !custo.ativo)
    if (erro) {
      toast.error("Não foi possível alterar.")
      return
    }
    setCustos((prev) =>
      prev.map((c) => (c.id === custo.id ? { ...c, ativo: !c.ativo } : c))
    )
  }

  async function handleRemover(id: string) {
    const { erro } = await removerCusto(id)
    if (erro) {
      toast.error("Não foi possível remover.")
      return
    }
    setCustos((prev) => prev.filter((c) => c.id !== id))
    toast.success("Custo removido.")
  }

  async function handleSalvarCotacao() {
    const valor = Number(novaCotacao.replace(",", "."))
    if (isNaN(valor) || valor <= 0) {
      toast.error("Cotação inválida.")
      return
    }
    const { erro } = await salvarCotacaoDolar(valor)
    if (erro) {
      toast.error("Não foi possível salvar a cotação.")
      return
    }
    setCotacao(valor)
    setEditandoCotacao(false)
    toast.success("Cotação atualizada. As métricas foram recalculadas.")
  }

  /** Converte para BRL/mês, mesma regra usada no banco */
  function custoMensalEmReais(c: CustoOperacional): number {
    const emReais =
      c.moeda === "USD" ? c.valor * cotacao : c.moeda === "EUR" ? c.valor * cotacao * 1.08 : c.valor
    if (c.recorrencia === "mensal") return emReais
    if (c.recorrencia === "anual") return emReais / 12
    return 0
  }

  const totalMensal = custos
    .filter((c) => c.ativo)
    .reduce((soma, c) => soma + custoMensalEmReais(c), 0)

  if (carregando) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho com total e cotação */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Custo mensal total
          </p>
          <p className="text-2xl font-bold text-red-400">{formatarBRL(totalMensal)}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Cotação do dólar */}
          {editandoCotacao ? (
            <div className="flex items-center gap-1">
              <Input
                value={novaCotacao}
                onChange={(e) => setNovaCotacao(e.target.value)}
                placeholder="5.50"
                className="w-20 h-8 text-xs bg-background/60"
              />
              <Button size="icon" className="h-8 w-8" onClick={handleSalvarCotacao}>
                <Check className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setEditandoCotacao(false)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => {
                setNovaCotacao(String(cotacao))
                setEditandoCotacao(true)
              }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              title="Clique para atualizar a cotação"
            >
              <DollarSign className="w-3.5 h-3.5" />
              US$ 1 = R$ {cotacao.toFixed(2)}
            </button>
          )}

          <Button
            size="sm"
            onClick={() => setMostrarForm(!mostrarForm)}
            className=""
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Novo custo
          </Button>
        </div>
      </div>

      {/* Formulário de novo custo */}
      {mostrarForm && (
        <Card className="border-dourado-700/40">
          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Categoria</Label>
                <select
                  value={form.categoria}
                  onChange={(e) =>
                    setForm({ ...form, categoria: e.target.value as CategoriaCusto })
                  }
                  className="w-full h-9 rounded-md border border-input bg-background/60 px-3 text-sm"
                >
                  {Object.entries(ROTULOS_CATEGORIA).map(([valor, rotulo]) => (
                    <option key={valor} value={valor}>
                      {rotulo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Descrição</Label>
                <Input
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: Google Ads — campanha de lançamento"
                  className="bg-background/60 h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Valor</Label>
                <Input
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  placeholder="0,00"
                  className="bg-background/60 h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Moeda</Label>
                <select
                  value={form.moeda}
                  onChange={(e) =>
                    setForm({ ...form, moeda: e.target.value as "BRL" | "USD" | "EUR" })
                  }
                  className="w-full h-9 rounded-md border border-input bg-background/60 px-3 text-sm"
                >
                  <option value="BRL">R$ (BRL)</option>
                  <option value="USD">US$ (USD)</option>
                  <option value="EUR">€ (EUR)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Recorrência</Label>
                <select
                  value={form.recorrencia}
                  onChange={(e) =>
                    setForm({ ...form, recorrencia: e.target.value as Recorrencia })
                  }
                  className="w-full h-9 rounded-md border border-input bg-background/60 px-3 text-sm"
                >
                  {Object.entries(ROTULOS_RECORRENCIA).map(([valor, rotulo]) => (
                    <option key={valor} value={valor}>
                      {rotulo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button onClick={handleSalvar} disabled={salvando} size="sm" className="flex-1">
                {salvando ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
                Salvar custo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMostrarForm(false)
                  setForm(FORM_VAZIO)
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de custos */}
      <div className="space-y-2">
        {custos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum custo cadastrado ainda.
          </p>
        ) : (
          custos.map((c) => (
            <Card
              key={c.id}
              className={`border-border/60 ${!c.ativo ? "opacity-50" : ""}`}
            >
              <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{c.descricao}</p>
                    <Badge variant="secondary" className="text-[10px]">
                      {ROTULOS_CATEGORIA[c.categoria]}
                    </Badge>
                    {!c.ativo && (
                      <Badge variant="muted" className="text-[10px]">
                        Inativo
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.moeda === "USD" ? "US$" : c.moeda === "EUR" ? "€" : "R$"}{" "}
                    {c.valor.toFixed(2)} · {ROTULOS_RECORRENCIA[c.recorrencia]}
                    {c.recorrencia !== "unico" && (
                      <> · equivale a {formatarBRL(custoMensalEmReais(c))}/mês</>
                    )}
                  </p>
                  {c.observacao && (
                    <p className="text-[11px] text-muted-foreground/70 mt-1">{c.observacao}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Button
                    size="sm"
                    variant={c.ativo ? "outline" : "default"}
                    onClick={() => handleAlternar(c)}
                    className="h-8 text-xs"
                  >
                    {c.ativo ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemover(c.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Custos marcados como <strong>inativos</strong> não entram no cálculo — útil para
        deixar pré-cadastrado o que você ainda vai contratar (Vercel Pro, Google Places,
        lojas de apps) e ativar quando começar a pagar de fato.
      </p>
    </div>
  )
}

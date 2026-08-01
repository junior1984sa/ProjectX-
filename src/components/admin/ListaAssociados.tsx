import { useEffect, useState } from "react"
import { Loader2, Search, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { listarAssociados, formatarBRL, type Associado } from "@/lib/admin"

const FILTROS = [
  { id: "todos", rotulo: "Todos" },
  { id: "ativa", rotulo: "Pagantes" },
  { id: "trial", rotulo: "Em teste" },
  { id: "atraso", rotulo: "Pagamento falhou" },
  { id: "cancelada", rotulo: "Cancelados" },
  { id: "pendente", rotulo: "Sem assinatura" },
] as const

function badgeDoStatus(status: string) {
  const mapa: Record<string, { variante: string; rotulo: string }> = {
    ativa: { variante: "success", rotulo: "Pagante" },
    trial: { variante: "secondary", rotulo: "Em teste" },
    atraso: { variante: "destructive", rotulo: "Pagamento falhou" },
    cancelada: { variante: "muted", rotulo: "Cancelado" },
    pendente: { variante: "warning", rotulo: "Sem assinatura" },
  }
  return mapa[status] ?? { variante: "muted", rotulo: status }
}

export function ListaAssociados() {
  const [associados, setAssociados] = useState<Associado[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState<string>("todos")
  const [busca, setBusca] = useState("")

  useEffect(() => {
    listarAssociados().then((dados) => {
      setAssociados(dados)
      setCarregando(false)
    })
  }, [])

  const filtrados = associados.filter((a) => {
    const passaFiltro = filtro === "todos" || a.status_assinatura === filtro
    const termo = busca.trim().toLowerCase()
    const passaBusca =
      !termo ||
      a.nome_empresa?.toLowerCase().includes(termo) ||
      a.email_contato?.toLowerCase().includes(termo) ||
      a.cidade?.toLowerCase().includes(termo) ||
      a.segmento?.toLowerCase().includes(termo)
    return passaFiltro && passaBusca
  })

  if (carregando) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empresa, e-mail, cidade ou segmento"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 bg-background/60"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTROS.map((f) => {
          const quantidade =
            f.id === "todos"
              ? associados.length
              : associados.filter((a) => a.status_assinatura === f.id).length
          return (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                filtro === f.id
                  ? "bg-dourado-900/30 border border-dourado-600 text-dourado-300"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.rotulo} ({quantidade})
            </button>
          )
        })}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum associado nesse filtro.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map((a) => {
            const badge = badgeDoStatus(a.status_assinatura)
            return (
              <Card key={a.id} className="border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">
                          {a.nome_empresa || "(sem nome)"}
                        </p>
                        <Badge variant={badge.variante as never} className="text-[10px]">
                          {badge.rotulo}
                        </Badge>
                        {a.plano && (
                          <Badge variant="secondary" className="text-[10px] capitalize">
                            {a.plano}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {a.email_contato}
                        {a.cidade && ` · ${a.cidade}${a.estado ? `/${a.estado}` : ""}`}
                        {a.segmento && ` · ${a.segmento}`}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        Cadastrado em{" "}
                        {new Date(a.criado_em).toLocaleDateString("pt-BR")}
                        {a.creditos_disponiveis !== null &&
                          ` · ${a.creditos_disponiveis} créditos disponíveis`}
                      </p>
                    </div>

                    {a.valor && a.valor > 0 && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-dourado-300">
                          {formatarBRL(a.valor)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">por ciclo</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/useAppStore"
import { calcularEstatisticas } from "@/lib/utils"

// Paleta dourado/prata, alinhada ao mockup aprovado
const CORES_CANAIS = ["#d4b06a", "#b8bcc2", "#6b5a2e", "#52585f"]

interface TooltipPersonalizadoProps {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}

function TooltipPersonalizado({ active, payload }: TooltipPersonalizadoProps) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-foreground">{item.name}</p>
      <p className="text-muted-foreground">{item.value} empresa{item.value !== 1 ? "s" : ""}</p>
    </div>
  )
}

export function GraficoCanais() {
  const { empresasFiltradas, carregando } = useAppStore()
  const stats = calcularEstatisticas(empresasFiltradas)

  const dados = [
    { nome: "Telefone", valor: stats.porCanal.telefone },
    { nome: "E-mail", valor: stats.porCanal.email },
    { nome: "Website", valor: stats.porCanal.website },
    { nome: "Redes sociais", valor: stats.porCanal.redesSociais },
  ].filter((d) => d.valor > 0)

  const total = dados.reduce((acc, d) => acc + d.valor, 0)

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/60 overflow-hidden">
      <div className="px-5 pt-4 pb-3">
        <p className="text-[13px] font-semibold text-foreground/90 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-dourado-400 shadow-[0_0_8px_rgba(212,176,106,0.6)]" />
          Canais disponíveis
        </p>
      </div>

      <div className="px-5 pb-5">
        {carregando ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-[100px] w-[100px] rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ) : dados.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Sem dados disponíveis</p>
        ) : (
          <div className="flex items-center gap-5">
            <div className="w-[100px] h-[100px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dados}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={38}
                    paddingAngle={2}
                    dataKey="valor"
                    nameKey="nome"
                    stroke="none"
                  >
                    {dados.map((_, index) => (
                      <Cell key={index} fill={CORES_CANAIS[index % CORES_CANAIS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipPersonalizado />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              {dados.map((d, i) => (
                <div key={d.nome} className="flex items-center justify-between text-[11.5px]">
                  <span className="flex items-center gap-1.5 text-foreground/80">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: CORES_CANAIS[i % CORES_CANAIS.length] }}
                    />
                    {d.nome}
                  </span>
                  <span className="text-muted-foreground font-medium">
                    {total > 0 ? Math.round((d.valor / total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

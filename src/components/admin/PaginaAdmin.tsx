import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldAlert, Loader2, LayoutDashboard } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { VisaoGeralAdmin } from "@/components/admin/VisaoGeralAdmin"
import { ListaAssociados } from "@/components/admin/ListaAssociados"
import { GestaoCustos } from "@/components/admin/GestaoCustos"
import { verificarSeEhAdmin } from "@/lib/admin"

/**
 * Área administrativa — visível apenas para perfis marcados como
 * is_admin no banco. A checagem aqui controla o que aparece na tela;
 * a proteção real está nas políticas de RLS e nas funções SQL, que
 * recusam qualquer chamada de quem não é admin.
 */
export function PaginaAdmin() {
  const navigate = useNavigate()
  const [ehAdmin, setEhAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    verificarSeEhAdmin().then(setEhAdmin)
  }, [])

  if (ehAdmin === null) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!ehAdmin) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <ShieldAlert className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <h1 className="text-lg font-semibold text-foreground">Área restrita</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Esta página é exclusiva para administradores do ProspectX.
        </p>
        <button
          onClick={() => navigate("/buscar")}
          className="text-xs text-dourado-400 hover:underline mt-4"
        >
          Voltar para a busca
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-dourado-400" />
          Administração
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Controle de associados, custos e resultado do negócio.
        </p>
      </div>

      <Tabs defaultValue="visao-geral">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="associados">Associados</TabsTrigger>
          <TabsTrigger value="custos">Custos</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="mt-0">
          <VisaoGeralAdmin />
        </TabsContent>

        <TabsContent value="associados" className="mt-0">
          <ListaAssociados />
        </TabsContent>

        <TabsContent value="custos" className="mt-0">
          <GestaoCustos />
        </TabsContent>
      </Tabs>
    </div>
  )
}

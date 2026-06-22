import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FormularioPerfil } from "@/components/perfil/FormularioPerfil"
import { FormularioDiretorio } from "@/components/perfil/FormularioDiretorio"

interface AbasPerfilProps {
  onConcluido?: () => void
}

/**
 * Tela "Meu perfil" com duas abas:
 * - Prospecção: dados usados quando o prestador SAI buscando clientes
 * - Diretório: perfil público exibido quando OUTRAS empresas buscam
 *   esse prestador diretamente (só visível para assinantes publicados)
 */
export function AbasPerfil({ onConcluido }: AbasPerfilProps) {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <Tabs defaultValue="prospeccao">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="prospeccao">Buscar clientes</TabsTrigger>
          <TabsTrigger value="diretorio">Diretório (ser encontrado)</TabsTrigger>
        </TabsList>

        <TabsContent value="prospeccao" className="mt-0">
          <FormularioPerfil onConcluido={onConcluido} />
        </TabsContent>

        <TabsContent value="diretorio" className="mt-0">
          <FormularioDiretorio />
        </TabsContent>
      </Tabs>
    </div>
  )
}

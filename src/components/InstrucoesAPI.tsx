import { useState } from "react"
import { Info, X, Code2, Globe, Database, Key, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const ETAPAS = [
  {
    numero: 1,
    titulo: "Google Places API",
    descricao: "Substitua a função gerarEmpresasMock() em src/lib/dadosMock.ts pela API real do Google Places Nearby Search. Você precisa de uma chave de API no Google Cloud Console.",
    chave: "VITE_GOOGLE_PLACES_KEY",
    url: "https://console.cloud.google.com",
    cor: "text-dourado-400",
    icone: <Globe className="w-4 h-4" />,
  },
  {
    numero: 2,
    titulo: "Enrichment (Hunter.io ou Apollo.io)",
    descricao: "Para enriquecer os leads com e-mails profissionais, integre o Hunter.io ou Apollo.io. Passe o domínio ou nome da empresa para obter contatos verificados.",
    chave: "VITE_HUNTER_KEY",
    url: "https://hunter.io",
    cor: "text-purple-400",
    icone: <Database className="w-4 h-4" />,
  },
  {
    numero: 3,
    titulo: "CNPJ.ws ou Receita Federal",
    descricao: "Para validar CNPJs e buscar dados oficiais da empresa (sócios, situação cadastral, endereço completo), use a API do CNPJ.ws gratuitamente.",
    chave: "Sem chave (pública)",
    url: "https://cnpj.ws",
    cor: "text-green-400",
    icone: <Key className="w-4 h-4" />,
  },
]

interface InstrucoesAPIProps {
  aberto: boolean
  onFechar: () => void
}

export function InstrucoesAPI({ aberto, onFechar }: InstrucoesAPIProps) {
  const [etapaAtiva, setEtapaAtiva] = useState(0)

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-dourado-900/50 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-dourado-400" />
            </div>
            Integrar APIs reais
          </DialogTitle>
          <DialogDescription>
            O ProspectX usa dados simulados por padrão. Siga os passos abaixo para conectar APIs reais e obter leads verdadeiros.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Aviso de modo demo */}
          <div className="rounded-lg bg-yellow-900/20 border border-yellow-700/40 p-4">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-300 mb-1">Modo demonstração ativo</p>
                <p className="text-yellow-300/70 text-xs leading-relaxed">
                  Todos os dados exibidos são fictícios e gerados localmente. Nenhuma requisição externa é feita. Os nomes, telefones e e-mails são exemplos para demonstrar a interface.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs de etapas */}
          <div className="flex gap-1.5">
            {ETAPAS.map((etapa, i) => (
              <button
                key={i}
                onClick={() => setEtapaAtiva(i)}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                  etapaAtiva === i
                    ? "bg-dourado-600 text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {etapa.numero}. {etapa.titulo.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Conteúdo da etapa */}
          <div className="rounded-lg border border-border/60 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${ETAPAS[etapaAtiva].cor}`}>
                {ETAPAS[etapaAtiva].icone}
              </div>
              <div>
                <h3 className="font-medium text-foreground text-sm">
                  {ETAPAS[etapaAtiva].titulo}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {ETAPAS[etapaAtiva].descricao}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Variável de ambiente</p>
              <div className="bg-muted rounded-md px-3 py-2 font-mono text-xs text-foreground">
                {ETAPAS[etapaAtiva].chave}=sua_chave_aqui
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => window.open(ETAPAS[etapaAtiva].url, "_blank")}
              >
                <Globe className="w-3 h-3 mr-1.5" />
                Acessar {ETAPAS[etapaAtiva].titulo.split(" ")[0]}
              </Button>
              <Badge variant="secondary" className="text-xs">
                Passo {etapaAtiva + 1} de {ETAPAS.length}
              </Badge>
            </div>
          </div>

          {/* Trecho de código de substituição */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Código de integração (src/lib/dadosMock.ts)
            </p>
            <div className="bg-muted rounded-lg p-4 font-mono text-xs text-foreground overflow-x-auto">
              <pre>{`// Substitua gerarEmpresasMock() por:
export async function buscarEmpresasAPI(
  params: ParametrosBusca
): Promise<Empresa[]> {
  const key = import.meta.env.VITE_GOOGLE_PLACES_KEY
  const url = \`https://maps.googleapis.com/maps/api/place/nearbysearch/json
    ?location=\${lat},\${lng}
    &radius=\${params.raioKm * 1000}
    &keyword=\${params.segmento}
    &key=\${key}\`
    
  const response = await fetch(url)
  const data = await response.json()
  
  return data.results.map(mapearParaEmpresa)
}`}</pre>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Checklist de integração
            </p>
            {[
              "Criar arquivo .env na raiz do projeto",
              "Adicionar chave VITE_GOOGLE_PLACES_KEY",
              "Substituir gerarEmpresasMock() em dadosMock.ts",
              "Mapear campos da API para a interface Empresa",
              "Testar com cidade e segmento reais",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <Button onClick={onFechar} variant="outline" size="sm">
            <X className="w-3.5 h-3.5 mr-1.5" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

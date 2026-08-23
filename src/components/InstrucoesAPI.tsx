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
    titulo: "Registros oficiais por país",
    descricao:
      "A cobertura do OpenStreetMap é irregular fora do varejo, e o Google Places está DESCARTADO: os termos dele proíbem armazenar nome, endereço e telefone, que é exatamente o que este produto entrega. O caminho é o registro oficial de cada país — Companies House no Reino Unido, ABN Lookup na Austrália e a base aberta de CNPJ no Brasil. São públicos, permitem armazenamento e cobrem justamente os segmentos B2B que o mapa colaborativo ignora.",
    chave: "—",
    url: "https://developer.company-information.service.gov.uk",
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
            O WhoHiresYou usa dados simulados por padrão. Siga os passos abaixo para conectar APIs reais e obter leads verdadeiros.
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
                    ? "bg-azul-500 text-white"
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
              <pre>{`// A chamada mora na Edge Function, nunca no navegador:
// a chave não pode chegar ao cliente, e cada registro
// precisa nascer com procedência e data de coleta.

const empresa = {
  ...campos,
  pais: params.pais,        // decide se pode receber e-mail
  fonte: "companies-house", // de onde veio
  coletadoEm: new Date(),   // frescor do dado
}

// Regra dura: se a fonte não cobre o segmento pedido,
// devolva vazio. Nunca preencha com resultado genérico
// só para a tela não ficar em branco — dado errado gasta
// o crédito do cliente e queima a confiança.`}</pre>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Checklist de integração
            </p>
            {[
              "Ler a licença da fonte ANTES de integrar",
              "Guardar o segredo nos secrets do Supabase, nunca no .env do front",
              "Preencher pais, fonte e data de coleta em cada registro",
              "Amostrar 50 registros em segmento B2B real, não em restaurante",
              "Medir contatabilidade: quantos vieram com telefone ou e-mail",
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

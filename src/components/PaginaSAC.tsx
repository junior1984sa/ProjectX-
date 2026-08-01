import { useState } from "react"
import { MessageCircle, Mail, ChevronDown, HelpCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"
import toast from "react-hot-toast"

interface PerguntaFrequente {
  pergunta: string
  resposta: string
}

const PERGUNTAS_FREQUENTES: PerguntaFrequente[] = [
  {
    pergunta: "Como funciona o período de teste gratuito?",
    resposta:
      "Você cadastra seu cartão e tem 7 dias para usar a ferramenta sem nenhuma cobrança. Se não cancelar antes do fim do período, a primeira cobrança é feita automaticamente. Você pode cancelar a qualquer momento, em um clique, dentro da sua área de perfil, e receber de volta qualquer valor já pago — sem desconto e sem justificativa, conforme o artigo 49 do Código de Defesa do Consumidor.",
  },
  {
    pergunta: "Como funcionam os créditos de busca?",
    resposta:
      "Cada busca consome créditos de acordo com a quantidade de empresas retornadas: até 10 empresas custam 10 créditos, até 20 custam 18, até 30 custam 25, e até 40 custam 30. Seu saldo (100 ou 150 créditos, dependendo do plano) renova automaticamente todo mês.",
  },
  {
    pergunta: "Posso cancelar quando quiser?",
    resposta:
      "Sim. O cancelamento é feito em um único clique, dentro da sua área de perfil, sem precisar justificar o motivo. Depois de cancelar, você não é cobrado novamente.",
  },
  {
    pergunta: "Os dados das empresas encontradas são reais?",
    resposta:
      "Atualmente a busca usa dados simulados para demonstração. A ferramenta já está estruturada para conectar a APIs reais (Google Places, CNPJ.ws, etc.) — veja o botão 'Usar APIs reais' dentro do painel de busca para mais detalhes.",
  },
  {
    pergunta: "Como envio meu portfólio para os leads encontrados?",
    resposta:
      "Depois de assinar, envie seu portfólio ou proposta na área 'Meu perfil'. Cada empresa encontrada na busca tem um botão 'Enviar panfleto', que abre o WhatsApp já com uma mensagem pronta e o link do seu material mais recente.",
  },
  {
    pergunta: "Meus dados de cartão são seguros?",
    resposta:
      "Sim. O número do cartão e o código de segurança são processados diretamente pelo Mercado Pago, dentro do seu navegador — eles nunca chegam aos nossos servidores.",
  },
]

function ItemFAQ({ item }: { item: PerguntaFrequente }) {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <span className="text-sm font-medium text-foreground">{item.pergunta}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${aberto ? "rotate-180" : ""}`}
        />
      </button>
      {aberto && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
          {item.resposta}
        </div>
      )}
    </div>
  )
}

export function PaginaSAC() {
  const { email } = useAuthStore()
  const [nome, setNome] = useState("")
  const [emailContato, setEmailContato] = useState(email ?? "")
  const [assunto, setAssunto] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [enviando, setEnviando] = useState(false)

  const emailSuporte = "suporte@prospectx.com.br"
  const whatsappSuporte = "5548999999999" // TODO: substituir pelo número real de suporte

  function handleEnviarWhatsApp() {
    const texto = encodeURIComponent(
      `Olá! Preciso de ajuda com o ProspectX.\n\nNome: ${nome || "(não informado)"}\nAssunto: ${assunto || "(não informado)"}\n\n${mensagem || ""}`
    )
    window.open(`https://wa.me/${whatsappSuporte}?text=${texto}`, "_blank")
  }

  function handleEnviarEmail() {
    if (!nome.trim() || !mensagem.trim()) {
      toast.error("Preencha seu nome e a mensagem antes de enviar.")
      return
    }

    setEnviando(true)
    const corpo = encodeURIComponent(
      `Nome: ${nome}\nE-mail para retorno: ${emailContato}\n\n${mensagem}`
    )
    const linkMailto = `mailto:${emailSuporte}?subject=${encodeURIComponent(
      assunto || "Suporte ProspectX"
    )}&body=${corpo}`

    window.location.href = linkMailto
    setEnviando(false)
    toast.success("Abrindo seu aplicativo de e-mail...")
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-dourado-400" />
          Central de Ajuda
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tire suas dúvidas ou entre em contato direto com nosso suporte.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-green-800/40 bg-green-950/10">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">WhatsApp</p>
              <p className="text-xs text-muted-foreground">Resposta mais rápida</p>
            </div>
            <Button
              size="sm"
              onClick={handleEnviarWhatsApp}
              className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
            >
              Abrir chat
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">E-mail</p>
              <p className="text-xs text-muted-foreground">{emailSuporte}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
          Perguntas frequentes
        </h2>
        <div className="space-y-2">
          {PERGUNTAS_FREQUENTES.map((item) => (
            <ItemFAQ key={item.pergunta} item={item} />
          ))}
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Ainda precisa de ajuda? Envie uma mensagem
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Seu nome</Label>
              <Input
                placeholder="Como podemos te chamar?"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-background/60"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail para retorno</Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={emailContato}
                onChange={(e) => setEmailContato(e.target.value)}
                className="bg-background/60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assunto</Label>
            <Input
              placeholder="Ex: Dúvida sobre cobrança, problema técnico..."
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              className="bg-background/60"
            />
          </div>

          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea
              placeholder="Descreva sua dúvida ou problema com o máximo de detalhes possível..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="bg-background/60 min-h-[120px]"
            />
          </div>

          <Button
            onClick={handleEnviarEmail}
            disabled={enviando}
            className="w-full bg-gradient-to-r from-dourado-600 to-dourado-500 text-background font-semibold"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar mensagem
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

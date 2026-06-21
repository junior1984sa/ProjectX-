import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check, Loader2, Sparkles, ShieldCheck, TrendingUp, Calendar, CreditCard, Gift, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { iniciarAssinaturaComTrial, aplicarCodigoCortesia } from "@/lib/pagamento"
import { useAuthStore } from "@/store/useAuthStore"
import type { TipoPlano } from "@/types/prestador"
import type { DadosCartaoForm } from "@/lib/mercadopago"
import toast from "react-hot-toast"

const PRECO_MENSAL = Number(import.meta.env.VITE_PRECO_PLANO_MENSAL ?? "99.00")
const PRECO_ANUAL = Number(import.meta.env.VITE_PRECO_PLANO_ANUAL ?? "950.00")
const DIAS_TRIAL = 5

const ECONOMIA_ANUAL = Math.round((1 - PRECO_ANUAL / (PRECO_MENSAL * 12)) * 100)

const BENEFICIOS = [
  "Perfil completo visível no diretório nacional",
  "WhatsApp e e-mail liberados para quem buscar seu serviço",
  "Upload de portfólio, propostas e panfletos",
  "Disparo de mensagem com seu portfólio direto para os leads",
  "Acesso completo à ferramenta de prospecção de clientes",
]

const CARTAO_VAZIO: DadosCartaoForm = {
  numero: "",
  nomeTitular: "",
  mesValidade: "",
  anoValidade: "",
  cvv: "",
  cpf: "",
}

export function SelecaoPlano() {
  const navigate = useNavigate()
  const { carregarPerfil } = useAuthStore()
  const [planoSelecionado, setPlanoSelecionado] = useState<TipoPlano>("anual")
  const [cartao, setCartao] = useState<DadosCartaoForm>(CARTAO_VAZIO)
  const [carregando, setCarregando] = useState(false)
  const [mostrarCodigoCortesia, setMostrarCodigoCortesia] = useState(false)
  const [codigoCortesia, setCodigoCortesia] = useState("")
  const [validandoCodigo, setValidandoCodigo] = useState(false)

  async function handleAplicarCodigo() {
    if (!codigoCortesia.trim()) {
      toast.error("Digite o código de cortesia.")
      return
    }

    setValidandoCodigo(true)
    const resultado = await aplicarCodigoCortesia(codigoCortesia.trim())
    setValidandoCodigo(false)

    if (!resultado.sucesso) {
      toast.error(resultado.mensagem)
      return
    }

    toast.success(`🎁 ${resultado.diasConcedidos} dias de acesso liberados!`)
    await carregarPerfil()
    navigate("/buscar")
  }

  function atualizarCartao<K extends keyof DadosCartaoForm>(campo: K, valor: string) {
    setCartao((prev) => ({ ...prev, [campo]: valor }))
  }

  function formatarNumeroCartao(valor: string): string {
    const numeros = valor.replace(/\D/g, "").slice(0, 16)
    return numeros.replace(/(\d{4})(?=\d)/g, "$1 ")
  }

  function validarFormulario(): string | null {
    if (cartao.numero.replace(/\s/g, "").length < 13) return "Informe um número de cartão válido."
    if (!cartao.nomeTitular.trim()) return "Informe o nome impresso no cartão."
    if (!cartao.mesValidade || !cartao.anoValidade) return "Informe a validade do cartão."
    if (cartao.cvv.length < 3) return "Informe o código de segurança (CVV)."
    if (cartao.cpf.replace(/\D/g, "").length !== 11) return "Informe um CPF válido (titular do cartão)."
    return null
  }

  async function handleAssinar() {
    const erroValidacao = validarFormulario()
    if (erroValidacao) {
      toast.error(erroValidacao)
      return
    }

    setCarregando(true)
    const resultado = await iniciarAssinaturaComTrial(planoSelecionado, cartao)
    setCarregando(false)

    if (!resultado.sucesso) {
      toast.error(resultado.erro ?? "Não foi possível iniciar a assinatura.")
      return
    }

    toast.success(`Teste grátis de ${resultado.trialDias} dias iniciado! 🎉`)
    navigate("/buscar")
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 bg-dourado-900/30 border border-dourado-800/50 rounded-full px-3 py-1 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-dourado-400" />
          <span className="text-xs text-dourado-400 font-medium">
            {DIAS_TRIAL} dias grátis, cancele quando quiser
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Comece seu teste gratuito
        </h1>
        <p className="text-muted-foreground mt-2">
          Cadastre seu cartão agora — você só é cobrado depois de {DIAS_TRIAL} dias, e pode
          cancelar antes disso sem pagar nada.
        </p>
      </div>

      {/* Cards de planos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card
          onClick={() => setPlanoSelecionado("mensal")}
          className={`cursor-pointer transition-all border-2 ${
            planoSelecionado === "mensal"
              ? "border-prata-400 bg-prata-900/10"
              : "border-border/60 hover:border-border"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Plano Mensal</h3>
              {planoSelecionado === "mensal" && (
                <div className="w-5 h-5 rounded-full bg-prata-400 flex items-center justify-center">
                  <Check className="w-3 h-3 text-background" />
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">
                R$ {PRECO_MENSAL.toFixed(2).replace(".", ",")}
              </span>
              <span className="text-muted-foreground text-sm">/mês</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Após o período de teste</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setPlanoSelecionado("anual")}
          className={`cursor-pointer transition-all border-2 relative ${
            planoSelecionado === "anual"
              ? "border-dourado-500 bg-dourado-900/10"
              : "border-border/60 hover:border-border"
          }`}
        >
          {ECONOMIA_ANUAL > 0 && (
            <Badge className="absolute -top-2.5 right-4 text-xs bg-dourado-600 text-background">
              Economize {ECONOMIA_ANUAL}% + mais créditos/mês
            </Badge>
          )}
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Plano Anual</h3>
              {planoSelecionado === "anual" && (
                <div className="w-5 h-5 rounded-full bg-dourado-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-background" />
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">
                R$ {PRECO_ANUAL.toFixed(2).replace(".", ",")}
              </span>
              <span className="text-muted-foreground text-sm">/ano</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Equivalente a R$ {(PRECO_ANUAL / 12).toFixed(2).replace(".", ",")}/mês · Após o teste
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Linha do tempo do trial */}
      <Card className="border-border/60 mb-6 bg-gradient-to-r from-dourado-900/10 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-dourado-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-foreground/90 font-medium">
                Hoje: cadastro do cartão · sem cobrança
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Dia {DIAS_TRIAL}: primeira cobrança automática, a menos que você cancele antes —
                em um clique, sem burocracia, dentro do seu perfil.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-border/60 mb-6">
        <CardContent className="p-6">
          <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-dourado-400" />
            O que está incluído (já no período de teste)
          </h3>
          <div className="space-y-2.5">
            {BENEFICIOS.map((beneficio) => (
              <div key={beneficio} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{beneficio}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Formulário de cartão */}
      <Card className="border-border/60 mb-6">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-medium text-foreground flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-dourado-400" />
            Dados do cartão
          </h3>

          <div className="space-y-2">
            <Label>Número do cartão</Label>
            <Input
              placeholder="0000 0000 0000 0000"
              value={cartao.numero}
              onChange={(e) => atualizarCartao("numero", formatarNumeroCartao(e.target.value))}
              className="bg-background/60"
              maxLength={19}
            />
          </div>

          <div className="space-y-2">
            <Label>Nome impresso no cartão</Label>
            <Input
              placeholder="Como está no cartão"
              value={cartao.nomeTitular}
              onChange={(e) => atualizarCartao("nomeTitular", e.target.value.toUpperCase())}
              className="bg-background/60"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Mês</Label>
              <Input
                placeholder="MM"
                value={cartao.mesValidade}
                onChange={(e) => atualizarCartao("mesValidade", e.target.value.replace(/\D/g, "").slice(0, 2))}
                className="bg-background/60"
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Ano</Label>
              <Input
                placeholder="AAAA"
                value={cartao.anoValidade}
                onChange={(e) => atualizarCartao("anoValidade", e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="bg-background/60"
                maxLength={4}
              />
            </div>
            <div className="space-y-2">
              <Label>CVV</Label>
              <Input
                placeholder="123"
                value={cartao.cvv}
                onChange={(e) => atualizarCartao("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="bg-background/60"
                maxLength={4}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>CPF do titular</Label>
            <Input
              placeholder="000.000.000-00"
              value={cartao.cpf}
              onChange={(e) => atualizarCartao("cpf", e.target.value.replace(/\D/g, "").slice(0, 11))}
              className="bg-background/60"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleAssinar}
        disabled={carregando}
        size="xl"
        className="w-full bg-gradient-to-r from-dourado-600 to-dourado-500 hover:from-dourado-700 hover:to-dourado-600 text-background font-semibold shadow-lg shadow-dourado-900/30"
      >
        {carregando ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <ShieldCheck className="w-5 h-5 mr-2" />
        )}
        Começar teste grátis de {DIAS_TRIAL} dias
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Seus dados de cartão são processados com segurança pelo Mercado Pago — nunca passam
        pelos nossos servidores. Cancele em um clique antes do fim do teste e não pague nada.
      </p>

      {/* Código de cortesia — caminho alternativo discreto, sem cartão */}
      <div className="mt-8 pt-6 border-t border-border/60">
        <button
          onClick={() => setMostrarCodigoCortesia(!mostrarCodigoCortesia)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-dourado-300 transition-colors mx-auto"
        >
          <Gift className="w-3.5 h-3.5" />
          Tenho um código de cortesia
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mostrarCodigoCortesia ? "rotate-180" : ""}`} />
        </button>

        {mostrarCodigoCortesia && (
          <div className="flex gap-2 mt-3 max-w-sm mx-auto">
            <Input
              placeholder="Digite seu código"
              value={codigoCortesia}
              onChange={(e) => setCodigoCortesia(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleAplicarCodigo()}
              className="bg-background/60 text-center"
            />
            <Button
              onClick={handleAplicarCodigo}
              disabled={validandoCodigo}
              variant="outline"
              className="border-dourado-700 text-dourado-300 hover:bg-dourado-900/20 flex-shrink-0"
            >
              {validandoCodigo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

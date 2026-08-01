import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Check, Loader2, Sparkles, ShieldCheck, TrendingUp, Calendar, CreditCard, Gift, ChevronDown, Flame, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { iniciarAssinaturaComTrial, aplicarCodigoCortesia } from "@/lib/pagamento"
import { useAuthStore } from "@/store/useAuthStore"
import { usePromocaoStore } from "@/store/usePromocaoStore"
import {
  PLANOS,
  ORDEM_PLANOS,
  economiaPercentual,
  precoMensalEquivalente,
  type TipoPlano,
} from "@/types/prestador"
import type { DadosCartaoForm } from "@/lib/mercadopago"
import toast from "react-hot-toast"

const DIAS_TRIAL = 7

// Promoção de lançamento: percentual de desconto aplicado sobre QUALQUER
// plano, para os primeiros assinantes. Fica DESLIGADA por padrão.
// Para ativar: defina VITE_PROMOCAO_ATIVA=true na Vercel e ative também
// no banco (tabela promocao_vagas) — as duas travas precisam estar abertas.
const PROMOCAO_ATIVA = import.meta.env.VITE_PROMOCAO_ATIVA === "true"
/** 0.5 = 50% de desconto (ex: plano mensal de R$497 sai por R$248,50) */
const DESCONTO_PROMOCIONAL = Number(import.meta.env.VITE_PROMOCAO_DESCONTO ?? "0.5")

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
  const { ativa: promocaoAtivaNoBanco, vagasUsadas, vagasTotais, carregarStatus } = usePromocaoStore()
  const [planoSelecionado, setPlanoSelecionado] = useState<TipoPlano>("anual")
  const [cartao, setCartao] = useState<DadosCartaoForm>(CARTAO_VAZIO)
  const [carregando, setCarregando] = useState(false)
  const [mostrarCodigoCortesia, setMostrarCodigoCortesia] = useState(false)
  const [codigoCortesia, setCodigoCortesia] = useState("")
  const [validandoCodigo, setValidandoCodigo] = useState(false)

  useEffect(() => {
    if (PROMOCAO_ATIVA) {
      carregarStatus()
    }
  }, [])

  // A promoção só vale se estiver ligada no código E ativa no banco
  // (ambas as travas precisam estar abertas) E ainda houver vagas.
  const vagasRestantes = vagasTotais - vagasUsadas
  const promocaoDisponivel = PROMOCAO_ATIVA && promocaoAtivaNoBanco && vagasRestantes > 0

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

    // Se a promoção estiver disponível, reserva a vaga ANTES de cobrar —
    // a reserva é atômica no banco, então mesmo com várias pessoas
    // assinando ao mesmo tempo, ninguém passa do limite de vagas.
    let precoPromocionalConfirmado: number | null = null
    if (promocaoDisponivel) {
      const reserva = await usePromocaoStore.getState().reservarVaga()
      if (reserva.sucesso) {
        // Aplica o desconto sobre o preço real do plano escolhido,
        // qualquer que seja ele (mensal, trimestral, semestral ou anual).
        precoPromocionalConfirmado =
          PLANOS[planoSelecionado].precoTotal * (1 - DESCONTO_PROMOCIONAL)
      }
      // Se a reserva falhar (vagas esgotaram nesse instante), segue
      // normalmente com o preço de tabela — não trava a assinatura.
    }

    const resultado = await iniciarAssinaturaComTrial(planoSelecionado, cartao, precoPromocionalConfirmado)
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

      {/* Banner de promoção — bem explícito, só aparece quando ativada */}
      {promocaoDisponivel && (
        <div className="mb-6 rounded-xl border-2 border-dourado-500 bg-gradient-to-r from-dourado-900/30 to-dourado-900/10 p-4 text-center">
          <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-dourado-300">
            <Flame className="w-4 h-4" />
            PROMOÇÃO DE LANÇAMENTO — APENAS OS {vagasTotais} PRIMEIROS ASSINANTES
          </p>
          <p className="text-xs text-dourado-200/80 mt-1">
            Restam <span className="font-bold">{vagasRestantes}</span> de {vagasTotais} vagas com preço especial.
            Depois disso, o valor volta ao normal.
          </p>
        </div>
      )}

      {/* Cards de planos — renderizados a partir da configuração central
          em src/types/prestador.ts (PLANOS). Para alterar preço, desconto
          ou créditos, edite lá: esta tela se ajusta sozinha. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {ORDEM_PLANOS.map((idPlano) => {
          const config = PLANOS[idPlano]
          const selecionado = planoSelecionado === idPlano
          const economia = economiaPercentual(idPlano)
          const equivalenteMensal = precoMensalEquivalente(idPlano)
          const precoExibido = promocaoDisponivel
            ? config.precoTotal * (1 - DESCONTO_PROMOCIONAL)
            : config.precoTotal

          return (
            <Card
              key={idPlano}
              onClick={() => setPlanoSelecionado(idPlano)}
              className={`cursor-pointer transition-all border-2 relative ${
                selecionado
                  ? "border-dourado-500 bg-dourado-900/10"
                  : "border-border/60 hover:border-border"
              }`}
            >
              {economia > 0 && (
                <Badge className="absolute -top-2.5 right-3 text-[10px] bg-dourado-600 text-background">
                  {promocaoDisponivel ? "Promoção" : `${economia}% OFF`}
                </Badge>
              )}

              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{config.nome}</h3>
                    {config.destaque && (
                      <span className="text-[10px] text-dourado-400">{config.destaque}</span>
                    )}
                  </div>
                  {selecionado && (
                    <div className="w-5 h-5 rounded-full bg-dourado-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-background" />
                    </div>
                  )}
                </div>

                {/* O número que o cliente usa para comparar planos */}
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">
                    R$ {(promocaoDisponivel
                      ? equivalenteMensal * (1 - DESCONTO_PROMOCIONAL)
                      : equivalenteMensal
                    ).toFixed(0)}
                  </span>
                  <span className="text-muted-foreground text-xs">/mês</span>
                </div>

                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {config.meses === 1
                    ? "Cobrado mensalmente"
                    : `R$ ${precoExibido.toFixed(2).replace(".", ",")} a cada ${config.meses} meses`}
                </p>

                <p className="text-[11px] text-dourado-300/90 mt-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {config.creditosMensais} créditos por mês
                </p>
              </CardContent>
            </Card>
          )
        })}
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

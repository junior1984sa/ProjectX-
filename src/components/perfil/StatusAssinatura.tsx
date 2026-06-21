import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"
import { temAcessoLiberado } from "@/types/prestador"

interface StatusAssinaturaProps {
  resultado: "sucesso" | "erro" | "pendente"
  onContinuar: () => void
}

export function StatusAssinatura({ resultado, onContinuar }: StatusAssinaturaProps) {
  const { carregarPerfil, perfil } = useAuthStore()
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    // O webhook pode levar alguns segundos para processar.
    // Tentamos recarregar o perfil algumas vezes para refletir a ativação.
    let tentativas = 0
    const maxTentativas = 6

    async function verificar() {
      await carregarPerfil()
      tentativas++

      if (tentativas < maxTentativas) {
        setTimeout(verificar, 2500)
      } else {
        setVerificando(false)
      }
    }

    if (resultado === "sucesso") {
      verificar()
    } else {
      setVerificando(false)
    }
  }, [resultado])

  // Para de verificar assim que o perfil já estiver liberado (ativo ou em trial)
  useEffect(() => {
    if (temAcessoLiberado(perfil)) {
      setVerificando(false)
    }
  }, [perfil])

  const conteudo = {
    sucesso: {
      icone: <CheckCircle2 className="w-14 h-14 text-green-400" />,
      titulo: "Teste grátis iniciado!",
      mensagem: temAcessoLiberado(perfil)
        ? "Seu perfil já está ativo e visível no diretório."
        : "Estamos confirmando seus dados com o Mercado Pago. Isso pode levar alguns segundos.",
      cor: "border-green-800/50 bg-green-950/20",
    },
    erro: {
      icone: <XCircle className="w-14 h-14 text-red-400" />,
      titulo: "Não foi possível iniciar",
      mensagem: "Algo deu errado ao validar o cartão. Você pode tentar novamente.",
      cor: "border-red-800/50 bg-red-950/20",
    },
    pendente: {
      icone: <Clock className="w-14 h-14 text-yellow-400" />,
      titulo: "Em análise",
      mensagem: "Estamos processando seus dados. Avisaremos quando for confirmado.",
      cor: "border-yellow-800/50 bg-yellow-950/20",
    },
  }[resultado]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className={`max-w-md w-full border-2 ${conteudo.cor}`}>
        <CardContent className="p-8 text-center space-y-4">
          <div className="flex justify-center">{conteudo.icone}</div>
          <h2 className="text-xl font-bold text-foreground">{conteudo.titulo}</h2>
          <p className="text-sm text-muted-foreground">{conteudo.mensagem}</p>

          {resultado === "sucesso" && verificando && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Verificando status da assinatura...
            </div>
          )}

          <Button onClick={onContinuar} className="w-full mt-2" size="lg">
            Continuar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

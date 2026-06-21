import { useAuthStore } from "@/store/useAuthStore"
import { temAcessoLiberado } from "@/types/prestador"

interface NomeComPaywallProps {
  nome: string
}

/**
 * Mostra a primeira palavra do nome da empresa normalmente (geralmente o tipo
 * de negócio, ex: "Jateamento", "Pintura") e borra o restante (a parte que
 * de fato identifica a empresa) para quem não tem assinatura ativa.
 *
 * Isso evita que alguém copie o nome completo e ache o contato de graça
 * numa busca no Google, sem nunca assinar.
 */
export function NomeComPaywall({ nome }: NomeComPaywallProps) {
  const { perfil } = useAuthStore()
  const temAcesso = temAcessoLiberado(perfil)

  if (temAcesso) {
    return <span>{nome}</span>
  }

  const palavras = nome.split(" ")
  const primeira = palavras[0]
  const resto = palavras.slice(1).join(" ")

  // Nomes com uma palavra só: borra os últimos 60% dos caracteres
  if (palavras.length <= 1) {
    const cortePos = Math.max(1, Math.ceil(nome.length * 0.4))
    return (
      <span>
        {nome.slice(0, cortePos)}
        <span className="blur-[3px] select-none">{nome.slice(cortePos)}</span>
      </span>
    )
  }

  return (
    <span>
      {primeira}{" "}
      <span className="blur-[3px] select-none">{resto}</span>
    </span>
  )
}

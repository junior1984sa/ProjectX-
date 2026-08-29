import { useTemaStore } from "@/store/useTemaStore"

/**
 * MARCA — escolhe a variante certa para o tema
 *
 * Os arquivos SVG têm cor explícita, e não `currentColor`, porque
 * dentro de uma tag `<img>` o SVG é um documento isolado, sem contexto
 * de CSS: `currentColor` cairia para preto sobre fundo preto.
 *
 * A consequência é que existem duas variantes de cada arquivo, e
 * alguém precisa escolher. É este componente. Sem ele, o logotipo de
 * traço claro ficaria invisível no tema claro — que é exatamente o
 * tipo de defeito que aparece quando se inverte o fundo sem revisar o
 * que estava pintado por cima.
 */

function temaEfetivoEhClaro(tema: string): boolean {
  if (tema === "claro") return true
  if (tema === "escuro") return false
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches
  } catch {
    return false
  }
}

/** Logotipo horizontal: marca + assinatura. */
export function Logotipo({ className = "" }: { className?: string }) {
  const { tema } = useTemaStore()
  const claro = temaEfetivoEhClaro(tema)
  return (
    <img
      src={claro ? "/logo-whohiresyou-claro.svg" : "/logo-whohiresyou.svg"}
      alt="WhoHiresYou"
      width={470}
      height={100}
      className={className}
    />
  )
}

/**
 * Só o símbolo, sem a assinatura.
 *
 * O `alt` fica vazio de propósito nos lugares onde ele aparece ao lado
 * do nome escrito: repetir "WhoHiresYou" faria o leitor de tela dizer
 * a marca duas vezes seguidas. Onde o símbolo aparece sozinho, quem
 * usa passa um `alt` de verdade.
 */
export function MarcaIcone({
  className = "",
  alt = "",
}: {
  className?: string
  alt?: string
}) {
  const { tema } = useTemaStore()
  const claro = temaEfetivoEhClaro(tema)
  return (
    <img
      src={claro ? "/marca-clara.svg" : "/marca.svg"}
      alt={alt}
      width={100}
      height={100}
      className={className}
    />
  )
}

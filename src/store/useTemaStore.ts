import { create } from "zustand"

/**
 * TEMA — claro ou escuro
 *
 * O produto nasceu escuro e continua escuro por padrão. O tema claro
 * existe porque quem vem de ferramenta de vendas está acostumado a
 * interface clara, e porque tela clara é melhor em ambiente iluminado
 * — canteiro de obra, galpão, escritório com janela grande. O público
 * deste produto trabalha nesses lugares.
 *
 * TRÊS ESTADOS, NÃO DOIS
 *
 * "sistema" não é o mesmo que "escuro": é obedecer ao aparelho, e
 * muda sozinho quando o aparelho muda. Sem esse estado, quem configura
 * o telefone para escurecer à noite teria que vir aqui trocar na mão
 * duas vezes por dia.
 */

export type Tema = "escuro" | "claro" | "sistema"

const CHAVE = "whohiresyou:tema"

function preferenciaDoSistema(): "escuro" | "claro" {
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "claro" : "escuro"
  } catch {
    return "escuro"
  }
}

function lerSalvo(): Tema {
  try {
    const v = localStorage.getItem(CHAVE)
    if (v === "claro" || v === "escuro" || v === "sistema") return v
  } catch {
    // Navegador com armazenamento bloqueado. Não é motivo para quebrar.
  }
  return "sistema"
}

/**
 * Escreve o tema efetivo no elemento raiz.
 *
 * O CSS inteiro pende de `:root[data-tema="claro"]`. Só o tema CLARO
 * marca o atributo; o escuro o remove, porque ele é o padrão definido
 * em `:root` puro. Marcar os dois duplicaria a fonte de verdade.
 */
export function aplicarTema(tema: Tema): void {
  const efetivo = tema === "sistema" ? preferenciaDoSistema() : tema
  const raiz = document.documentElement
  if (efetivo === "claro") {
    raiz.setAttribute("data-tema", "claro")
  } else {
    raiz.removeAttribute("data-tema")
  }
  // Faz o navegador pintar barra de rolagem, campos nativos e menus de
  // contexto no esquema certo. Sem isto, a rolagem fica escura numa
  // página clara e entrega que o tema é um verniz.
  raiz.style.colorScheme = efetivo === "claro" ? "light" : "dark"
}

interface TemaState {
  tema: Tema
  definirTema: (t: Tema) => void
}

// Aplica ANTES de qualquer tela renderizar. Se esperasse o React, a
// página piscaria escura antes de virar clara a cada carregamento.
const INICIAL = lerSalvo()
aplicarTema(INICIAL)

// Quem está em "sistema" acompanha a mudança do aparelho em tempo
// real, sem precisar recarregar.
try {
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
    if (lerSalvo() === "sistema") aplicarTema("sistema")
  })
} catch {
  // Navegador antigo sem addEventListener em MediaQueryList.
}

export const useTemaStore = create<TemaState>((set) => ({
  tema: INICIAL,
  definirTema: (t) => {
    try {
      localStorage.setItem(CHAVE, t)
    } catch {
      // Sem armazenamento, o tema vale só para esta sessão. Melhor que
      // recusar a troca.
    }
    aplicarTema(t)
    set({ tema: t })
  },
}))

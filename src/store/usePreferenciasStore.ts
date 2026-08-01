import { create } from "zustand"
import i18n, { CHAVE_IDIOMA } from "@/i18n"
import { PAISES_DISPONIVEIS, obterPais } from "@/types/prestador"

const CHAVE_PAIS = "prospectx:pais"
const CHAVE_ESCOLHEU = "prospectx:escolheu-preferencias"

/**
 * PREFERÊNCIAS DE IDIOMA E PAÍS
 *
 * Precisa funcionar ANTES do login: quem chega pela primeira vez ainda
 * não tem perfil, mas já vai buscar empresas — e sem país a busca
 * assume Brasil e não encontra nada em Miami ou Sydney.
 *
 * Por isso a preferência vive no localStorage. Quando a pessoa se
 * cadastra, o `pais_foco` do perfil passa a mandar: é o dado oficial,
 * e é ele que define moeda e gateway de cobrança.
 *
 * `escolheu` controla se a tela de boas-vindas já foi respondida, para
 * não perguntar de novo a cada visita.
 */

function paisInicial(): string {
  const salvo = localStorage.getItem(CHAVE_PAIS)
  if (salvo && PAISES_DISPONIVEIS.some((p) => p.codigo === salvo)) {
    return salvo
  }

  // Sem escolha salva, tenta deduzir do idioma do navegador. É só um
  // palpite inicial: a pessoa confirma ou troca na tela de abertura.
  const idiomaNavegador = navigator.language?.toLowerCase() ?? ""
  const porIdioma: Record<string, string> = {
    "en-us": "US",
    "en-au": "AU",
    "en-gb": "GB",
    "pt-pt": "PT",
    "pt-br": "BR",
  }
  return porIdioma[idiomaNavegador] ?? "BR"
}

interface PreferenciasState {
  pais: string
  idioma: string
  escolheu: boolean

  definirPais: (codigo: string) => void
  definirIdioma: (codigo: string) => void
  confirmarEscolha: () => void
  reabrirEscolha: () => void
  /** Chamado após o login: o perfil é a fonte oficial do país */
  sincronizarComPerfil: (paisFoco: string | null | undefined) => void
}

export const usePreferenciasStore = create<PreferenciasState>((set) => ({
  pais: paisInicial(),
  idioma: i18n.language ?? "pt-BR",
  escolheu: localStorage.getItem(CHAVE_ESCOLHEU) === "1",

  definirPais: (codigo) => {
    const pais = obterPais(codigo)
    localStorage.setItem(CHAVE_PAIS, pais.codigo)
    set({ pais: pais.codigo })
  },

  definirIdioma: (codigo) => {
    i18n.changeLanguage(codigo)
    localStorage.setItem(CHAVE_IDIOMA, codigo)
    set({ idioma: codigo })
  },

  confirmarEscolha: () => {
    localStorage.setItem(CHAVE_ESCOLHEU, "1")
    set({ escolheu: true })
  },

  reabrirEscolha: () => {
    localStorage.removeItem(CHAVE_ESCOLHEU)
    set({ escolheu: false })
  },

  sincronizarComPerfil: (paisFoco) => {
    if (!paisFoco) return
    const pais = obterPais(paisFoco)
    localStorage.setItem(CHAVE_PAIS, pais.codigo)
    localStorage.setItem(CHAVE_ESCOLHEU, "1")
    set({ pais: pais.codigo, escolheu: true })
  },
}))

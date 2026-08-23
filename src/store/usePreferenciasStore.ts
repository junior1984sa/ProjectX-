import { create } from "zustand"
import i18n, { CHAVE_IDIOMA } from "@/i18n"
import { PAISES_DISPONIVEIS, obterPais } from "@/types/prestador"

const CHAVE_PAIS = "prospectx:pais"
const CHAVE_ESCOLHEU = "prospectx:escolheu-preferencias"
const CHAVE_IDIOMA_MANUAL = "prospectx:idioma-manual"

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

/**
 * Fuso horário → país.
 *
 * O fuso é um sinal muito melhor que o idioma do navegador para saber
 * ONDE a pessoa está. Um mexicano com Windows em inglês tem
 * navigator.language = "en-US", mas o fuso continua America/Mexico_City.
 * Como o país define moeda, preço e onde buscamos empresas, errar aqui
 * mostra o preço errado logo na primeira tela.
 */
const PAIS_POR_FUSO: Record<string, string> = {
  // Brasil
  "America/Sao_Paulo": "BR", "America/Bahia": "BR", "America/Fortaleza": "BR",
  "America/Recife": "BR", "America/Manaus": "BR", "America/Belem": "BR",
  "America/Cuiaba": "BR", "America/Campo_Grande": "BR", "America/Maceio": "BR",
  "America/Porto_Velho": "BR", "America/Boa_Vista": "BR", "America/Rio_Branco": "BR",
  "America/Araguaina": "BR", "America/Santarem": "BR", "America/Noronha": "BR",
  // Estados Unidos
  "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US",
  "America/Los_Angeles": "US", "America/Phoenix": "US", "America/Anchorage": "US",
  "America/Detroit": "US", "America/Boise": "US", "America/Juneau": "US",
  "Pacific/Honolulu": "US",
  // Reino Unido
  "Europe/London": "GB",
}

function paisPeloFuso(): string | null {
  try {
    const fuso = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (!fuso) return null
    // Fuso de país que não atendemos devolve null, e o visitante cai na
    // tela de escolha em vez de num país errado. Australianos e
    // canadenses eram detectados aqui antes; os dois saíram da lista
    // porque o registro público deles não serve ao produto.
    return PAIS_POR_FUSO[fuso] ?? null
  } catch {
    // Navegador muito antigo sem Intl: cai no palpite pelo idioma
    return null
  }
}

function paisInicial(): string {
  const salvo = localStorage.getItem(CHAVE_PAIS)
  if (salvo && PAISES_DISPONIVEIS.some((p) => p.codigo === salvo)) {
    return salvo
  }

  const peloFuso = paisPeloFuso()
  if (peloFuso) return peloFuso

  // Último recurso: o idioma do navegador. É um palpite pior que o
  // fuso, mas melhor que assumir Brasil para todo mundo.
  const idiomaNavegador = navigator.language?.toLowerCase() ?? ""
  // Só países que a lista realmente tem. Devolver um código removido
  // daqui deixaria a preferência apontando para um país inexistente:
  // `obterPais` cairia no Brasil, mas o estado guardaria "AU", e as
  // duas coisas discordariam pelo resto da sessão.
  const porIdioma: Record<string, string> = {
    "en-us": "US", "en-gb": "GB", "pt-br": "BR",
  }
  return porIdioma[idiomaNavegador] ?? "BR"
}

/**
 * Idioma que corresponde a um país.
 *
 * O campo `idioma` do país é um locale completo ("en-AU", "pt-PT"), mas
 * os pacotes de tradução são registrados sob o código base ("en", "pt").
 * Passar o locale completo aqui faria o i18next procurar um pacote que
 * não existe e renderizar a chave crua na tela.
 */
function idiomaDoPais(codigoPais: string): string {
  return obterPais(codigoPais).idioma.split("-")[0]
}

function idiomaInicial(): string {
  // Quem trocou o idioma de propósito manda mais que qualquer palpite.
  if (localStorage.getItem(CHAVE_IDIOMA_MANUAL) === "1") {
    return i18n.language?.split("-")[0] ?? "pt"
  }
  return idiomaDoPais(paisInicial())
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

/**
 * Aplica o idioma detectado já no carregamento, antes de qualquer tela
 * renderizar. Sem isso, quem chega do México veria a página piscar em
 * português antes de virar espanhol.
 */
const IDIOMA_INICIAL = idiomaInicial()
if (i18n.language?.split("-")[0] !== IDIOMA_INICIAL) {
  i18n.changeLanguage(IDIOMA_INICIAL)
}

export const usePreferenciasStore = create<PreferenciasState>((set) => ({
  pais: paisInicial(),
  idioma: IDIOMA_INICIAL,
  escolheu: localStorage.getItem(CHAVE_ESCOLHEU) === "1",

  /**
   * Trocar de país troca o idioma junto — quem passa a prospectar no
   * México deve ver o sistema em espanhol, que é o idioma de quem ele
   * vai abordar. A exceção é quem escolheu o idioma na mão: um
   * brasileiro prospectando nos EUA quer o sistema em português e as
   * empresas americanas, e forçar inglês nele seria um estorvo.
   */
  definirPais: (codigo) => {
    const pais = obterPais(codigo)
    localStorage.setItem(CHAVE_PAIS, pais.codigo)

    const escolheuIdiomaNaMao = localStorage.getItem(CHAVE_IDIOMA_MANUAL) === "1"
    if (escolheuIdiomaNaMao) {
      set({ pais: pais.codigo })
      return
    }

    const idioma = idiomaDoPais(pais.codigo)
    i18n.changeLanguage(idioma)
    localStorage.setItem(CHAVE_IDIOMA, idioma)
    set({ pais: pais.codigo, idioma })
  },

  definirIdioma: (codigo) => {
    i18n.changeLanguage(codigo)
    localStorage.setItem(CHAVE_IDIOMA, codigo)
    localStorage.setItem(CHAVE_IDIOMA_MANUAL, "1")
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

    const escolheuIdiomaNaMao = localStorage.getItem(CHAVE_IDIOMA_MANUAL) === "1"
    if (escolheuIdiomaNaMao) {
      set({ pais: pais.codigo, escolheu: true })
      return
    }

    const idioma = idiomaDoPais(pais.codigo)
    i18n.changeLanguage(idioma)
    localStorage.setItem(CHAVE_IDIOMA, idioma)
    set({ pais: pais.codigo, idioma, escolheu: true })
  },
}))

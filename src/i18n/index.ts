import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import DetectorDeIdioma from "i18next-browser-languagedetector"
import pt from "./locales/pt.json"
import en from "./locales/en.json"

/**
 * FUNDAÇÃO DE TRADUÇÃO
 *
 * Dois idiomas cobrem os cinco países atendidos:
 *   pt-BR → Brasil e Portugal
 *   en    → Estados Unidos, Austrália e Reino Unido
 *
 * `nonExplicitSupportedLngs` faz en-US, en-AU e en-GB caírem todos em
 * `en`, e pt-PT cair em pt-BR. Assim não é preciso manter um arquivo de
 * tradução por variante regional — o que mudaria entre en-US e en-GB é
 * ortografia pontual, não vale o custo de manutenção agora.
 *
 * A escolha do visitante fica no localStorage e tem prioridade sobre o
 * idioma do navegador: quem trocou para inglês de propósito não deve
 * voltar para português ao recarregar a página.
 */

export const CHAVE_IDIOMA = "prospectx:idioma"

export const IDIOMAS_DISPONIVEIS = [
  { codigo: "pt", nome: "Português", nomeNativo: "Português" },
  { codigo: "en", nome: "Inglês", nomeNativo: "English" },
] as const

export type CodigoIdioma = (typeof IDIOMAS_DISPONIVEIS)[number]["codigo"]

i18n
  .use(DetectorDeIdioma)
  .use(initReactI18next)
  .init({
    // Os recursos ficam sob o código BASE do idioma ("pt", "en"), não
    // sob a variante regional. Com nonExplicitSupportedLngs ativo o
    // i18next reduz pt-BR a "pt" ao resolver a chave — se o pacote
    // estivesse registrado como "pt-BR", ele não seria encontrado e a
    // tela mostraria a chave crua no lugar do texto.
    resources: {
      pt: { translation: pt },
      en: { translation: en },
    },
    fallbackLng: "pt",
    supportedLngs: ["pt", "en"],
    nonExplicitSupportedLngs: true,
    interpolation: {
      // React já escapa o que renderiza; escapar de novo geraria
      // entidades HTML visíveis no texto (&amp;, &#39;)
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: CHAVE_IDIOMA,
      caches: ["localStorage"],
    },
  })

export default i18n

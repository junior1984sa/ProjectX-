import { ptBR, enUS, es } from "date-fns/locale"
import i18n from "@/i18n"

/**
 * LOCALE DE DATA — acompanha o idioma da interface.
 *
 * O código usava `ptBR` fixo em todo lugar. O efeito era uma tela em
 * inglês mostrando "15 de janeiro": metade traduzida, metade não, que
 * passa a impressão de produto improvisado justamente na tela onde o
 * assinante confere quando será cobrado.
 *
 * O formato em si não vem daqui — vem das traduções, porque a ordem
 * dos campos muda por idioma ("15 de janeiro" x "January 15"). Aqui só
 * resolvemos o vocabulário (nomes de mês e de dia).
 */
export function localeDeData() {
  const base = i18n.language?.split("-")[0]
  if (base === "en") return enUS
  if (base === "es") return es
  return ptBR
}

import { supabase } from "@/lib/supabase"
import i18n from "@/i18n"
import type { Empresa } from "@/types/empresa"
import type { Profile } from "@/types/prestador"

/**
 * ASSISTENTE DE ABORDAGEM
 *
 * A mensagem que o produto gerava era a mesma para todo mundo:
 *
 *   "Olá! Sou Antônio. Vi que a Construtora Vale Norte pode ter
 *    interesse no nosso serviço. Posso te passar mais detalhes?"
 *
 * Ela não diz o que o prestador faz, nem por que ESSA empresa foi
 * procurada. Quem recebe não tem como avaliar se interessa — e o custo
 * de ignorar é zero. É a mensagem que a pessoa apaga sem ler até o fim.
 *
 * O sistema já sabe as duas pontas: o ramo de quem envia e o ramo de
 * quem recebe, porque foi exatamente esse cruzamento que trouxe a
 * empresa para a lista. Essa informação estava sendo jogada fora.
 *
 * Duas camadas, nesta ordem:
 *
 *   1. MODELO POR RAMO — determinístico, roda offline, custo zero.
 *      Já é muito melhor que o texto genérico porque nomeia a ligação
 *      entre os dois negócios.
 *
 *   2. IA — refina o texto quando a ANTHROPIC_API_KEY existir. Se não
 *      existir, a camada 1 responde e o usuário nem percebe: o recurso
 *      degrada, não quebra.
 */

export type TomAbordagem = "formal" | "direto" | "amigavel"
export type CanalAbordagem = "whatsapp" | "email"

export const TONS: TomAbordagem[] = ["direto", "amigavel", "formal"]

export interface DadosAbordagem {
  empresa: Empresa
  perfil: Profile
  /** Ramo-alvo que trouxe a empresa para a lista, quando conhecido */
  segmentoAlvo?: string
  tom: TomAbordagem
  canal: CanalAbordagem
  urlPortfolio?: string | null
}

export interface AbordagemGerada {
  assunto: string
  mensagem: string
  /** De onde veio o texto — a interface avisa quando foi a IA */
  origem: "modelo" | "ia"
  geracoesRestantes?: number
}

// ═══════════════════════════════════════════════════════════
// CAMADA 1 — MODELO POR RAMO
// ═══════════════════════════════════════════════════════════

/**
 * Primeiro nome apenas. "Sou Antônio Carlos da Silva Júnior" soa a
 * formulário; "Sou Antônio" soa a pessoa.
 */
function primeiroNome(nomeCompleto: string): string {
  return nomeCompleto.trim().split(/\s+/)[0] ?? nomeCompleto
}

/**
 * Monta a frase que liga os dois negócios.
 *
 * É a única linha da mensagem que o destinatário não recebe de mais
 * ninguém, porque depende de um cruzamento que só quem fez a busca
 * conhece. Sem o ramo-alvo, cai para uma versão que ainda cita a
 * cidade — específica o suficiente para não parecer disparo em massa.
 */
function fraseDeLigacao(dados: DadosAbordagem): string {
  const { empresa, perfil, segmentoAlvo } = dados
  const t = i18n.t

  if (segmentoAlvo) {
    return t("abordagem.ligacaoComRamo", {
      empresa: empresa.nome,
      alvo: segmentoAlvo.toLowerCase(),
      meuRamo: perfil.segmento.toLowerCase(),
      cidade: empresa.cidade,
    })
  }

  return t("abordagem.ligacaoSemRamo", {
    meuRamo: perfil.segmento.toLowerCase(),
    cidade: empresa.cidade,
  })
}

/**
 * Gera a mensagem sem depender de rede nem de chave de API.
 *
 * A estrutura é a de uma abordagem fria que funciona: quem sou e o que
 * faço, por que procurei VOCÊ, e uma pergunta de baixo atrito. Pedir
 * uma reunião no primeiro contato quase sempre recebe silêncio;
 * perguntar se pode enviar material recebe resposta.
 */
export function gerarPeloModelo(dados: DadosAbordagem): AbordagemGerada {
  const { empresa, perfil, tom, canal, urlPortfolio } = dados
  const t = i18n.t

  const variaveis = {
    contato: primeiroNome(perfil.nome_contato),
    minhaEmpresa: perfil.nome_empresa,
    meuRamo: perfil.segmento.toLowerCase(),
    empresa: empresa.nome,
    cidade: empresa.cidade,
  }

  const linhas = [
    t(`abordagem.tom.${tom}.abertura`, variaveis),
    fraseDeLigacao(dados),
  ]

  if (urlPortfolio) {
    linhas.push(t("abordagem.anexoPortfolio", { url: urlPortfolio }))
  }

  linhas.push(t(`abordagem.tom.${tom}.fecho`, variaveis))

  return {
    assunto: t("abordagem.assunto", variaveis),
    // WhatsApp usa quebras simples; e-mail respira melhor com parágrafo
    mensagem: linhas.join(canal === "email" ? "\n\n" : "\n"),
    origem: "modelo",
  }
}

// ═══════════════════════════════════════════════════════════
// CAMADA 2 — IA
// ═══════════════════════════════════════════════════════════

/**
 * Pede à IA uma versão refinada. Qualquer problema — chave ausente,
 * cota, rede — devolve o texto do modelo em vez de erro.
 *
 * O recurso PRECISA degradar em silêncio: quem está no meio de uma
 * fila de 40 empresas não quer descobrir que a IA está fora do ar,
 * quer a mensagem para seguir abordando.
 */
export async function gerarAbordagem(dados: DadosAbordagem): Promise<AbordagemGerada> {
  const modelo = gerarPeloModelo(dados)

  try {
    const { data: sessao } = await supabase.auth.getSession()
    const token = sessao.session?.access_token
    if (!token) return modelo

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gerar-abordagem`
    const resposta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        empresa: {
          nome: dados.empresa.nome,
          segmento: dados.segmentoAlvo ?? null,
          cidade: dados.empresa.cidade,
          estado: dados.empresa.estado,
        },
        prestador: {
          nomeEmpresa: dados.perfil.nome_empresa,
          segmento: dados.perfil.segmento,
          nomeContato: primeiroNome(dados.perfil.nome_contato),
          cidade: dados.perfil.cidade,
        },
        tom: dados.tom,
        canal: dados.canal,
        idioma: i18n.language,
      }),
    })

    if (!resposta.ok) return modelo

    const corpo = await resposta.json()
    if (corpo?.erro || !corpo?.mensagem) return modelo

    // O portfólio é acrescentado aqui, e não pedido à IA: o link tem
    // que sair exato, e modelo de linguagem reescreve URL.
    const mensagem = dados.urlPortfolio
      ? `${corpo.mensagem}\n\n${i18n.t("abordagem.anexoPortfolio", { url: dados.urlPortfolio })}`
      : corpo.mensagem

    return {
      assunto: corpo.assunto || modelo.assunto,
      mensagem,
      origem: "ia",
      geracoesRestantes: corpo.geracoesRestantes,
    }
  } catch {
    return modelo
  }
}

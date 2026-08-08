import { supabase } from "@/lib/supabase"
import type { Empresa } from "@/types/empresa"
import i18n from "@/i18n"

/**
 * PROSPECÇÃO — registro de quem já foi abordado
 *
 * Serve a três coisas ao mesmo tempo:
 *   • não abordar a mesma empresa duas vezes (o que queima a marca)
 *   • não gastar crédito de novo com quem já está na lista
 *   • guardar origem e data, que é o registro exigido pela LGPD em
 *     caso de fiscalização da ANPD
 *
 * O envio em si nunca é automatizado no WhatsApp: cada mensagem sai de
 * um clique humano. Disparo em massa por ferramenta não oficial é
 * detectável no protocolo e resulta em banimento do número.
 */

export type StatusContato =
  | "pendente"
  | "contatado"
  | "respondeu"
  | "sem_resposta"
  | "fechou"
  | "descartado"

export interface ContatoRegistrado {
  chave_empresa: string
  empresa_nome: string
  status: StatusContato
  contatado_em: string | null
}

/**
 * Identificador estável de uma empresa entre buscas diferentes.
 *
 * Não dá para usar o `id` do resultado: ele muda a cada busca, porque
 * é gerado na hora. Nome + cidade normalizados sobrevivem a isso e
 * são o que uma pessoa usaria para dizer "já falei com essa".
 */
export function chaveDaEmpresa(empresa: Empresa): string {
  const normalizar = (t: string) =>
    t
      .toLowerCase()
      // NFD separa a letra do acento em dois caracteres; o passo
      // seguinte descarta só os acentos. Sem ele, "São" viraria
      // "sa-o" (o acento vira hífen) e não casaria com "Sao".
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

  return `${normalizar(empresa.nome)}__${normalizar(empresa.cidade)}`
}

/** Empresas que este assinante já abordou, para filtrar da fila */
export async function carregarJaContatadas(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("prospeccao_contatos")
    .select("chave_empresa")

  if (error) {
    console.error("Erro ao carregar contatos anteriores:", error.message)
    return new Set()
  }

  return new Set((data ?? []).map((c) => c.chave_empresa as string))
}

/** Histórico completo, para a tela de acompanhamento */
export async function carregarHistoricoContatos(): Promise<ContatoRegistrado[]> {
  const { data, error } = await supabase
    .from("prospeccao_contatos")
    .select("chave_empresa, empresa_nome, status, contatado_em")
    .order("contatado_em", { ascending: false })

  if (error) {
    console.error("Erro ao carregar histórico:", error.message)
    return []
  }

  return (data ?? []) as ContatoRegistrado[]
}

/**
 * Marca uma empresa como abordada. O banco recusa se ela estiver na
 * lista de descadastro — por isso o erro é devolvido, não engolido.
 */
export async function registrarContato(
  empresa: Empresa,
  canal: "whatsapp" | "email" | "telefone" | "outro",
  pais: string
): Promise<{ sucesso: boolean; erro: string | null }> {
  const { error } = await supabase.rpc("registrar_contato", {
    p_empresa_nome: empresa.nome,
    p_chave_empresa: chaveDaEmpresa(empresa),
    p_canal: canal,
    p_telefone: empresa.telefone,
    p_email: empresa.email,
    p_cidade: empresa.cidade,
    p_estado: empresa.estado,
    p_pais: pais,
  })

  if (error) {
    console.error("Erro ao registrar contato:", error.message)
    return { sucesso: false, erro: error.message }
  }

  return { sucesso: true, erro: null }
}

export interface ResultadoDisparo {
  sucesso: boolean
  enviados: number
  bloqueados: number
  falhas: number
  erro: string | null
}

/**
 * Dispara o e-mail para várias empresas de uma vez.
 *
 * O rodapé com identificação e link de descadastro é montado no
 * SERVIDOR, não aqui — se dependesse do frontend, bastaria uma chamada
 * fora da tela para enviar sem ele, e o disparo deixaria de ser
 * legítimo interesse para virar infração.
 */
export async function dispararEmails(params: {
  empresas: Empresa[]
  assunto: string
  corpo: string
  remetente: { empresa: string; contato: string; cidade: string; email: string }
}): Promise<ResultadoDisparo> {
  const { data: sessao } = await supabase.auth.getSession()
  const token = sessao.session?.access_token

  if (!token) {
    return { sucesso: false, enviados: 0, bloqueados: 0, falhas: 0, erro: "Sessão expirada." }
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

  try {
    const resposta = await fetch(`${supabaseUrl}/functions/v1/enviar-email-lote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        assunto: params.assunto,
        corpo: params.corpo,
        remetente: params.remetente,
        // O rodapé legal é montado no servidor e precisa sair no idioma
        // de quem recebe, senão o aviso de descadastro não informa nada.
        idioma: i18n.language,
        destinatarios: params.empresas
          .filter((e) => e.email)
          .map((e) => ({
            nome: e.nome,
            email: e.email,
            cidade: e.cidade,
            estado: e.estado,
            chaveEmpresa: chaveDaEmpresa(e),
          })),
      }),
    })

    const dados = await resposta.json()

    if (!resposta.ok || dados.erro) {
      return {
        sucesso: false,
        enviados: 0,
        bloqueados: 0,
        falhas: 0,
        erro: dados.erro ?? "Não foi possível enviar.",
      }
    }

    return {
      sucesso: true,
      enviados: dados.enviados ?? 0,
      bloqueados: dados.bloqueados ?? 0,
      falhas: dados.falhas ?? 0,
      erro: null,
    }
  } catch (erro) {
    console.error("Erro ao disparar e-mails:", erro)
    return { sucesso: false, enviados: 0, bloqueados: 0, falhas: 0, erro: "Erro de conexão." }
  }
}

/** Atualiza o desfecho de um contato já feito */
export async function atualizarStatusContato(
  chaveEmpresa: string,
  status: StatusContato
): Promise<boolean> {
  const { error } = await supabase
    .from("prospeccao_contatos")
    .update({ status, atualizado_em: new Date().toISOString() })
    .eq("chave_empresa", chaveEmpresa)

  if (error) {
    console.error("Erro ao atualizar status:", error.message)
    return false
  }
  return true
}

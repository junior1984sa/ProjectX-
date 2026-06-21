import { supabase } from "@/lib/supabase"
import type { ArquivoPortfolio, TipoArquivo } from "@/types/prestador"

const NOME_BUCKET = "portfolios"
const TAMANHO_MAXIMO_MB = 10

/**
 * Valida se o arquivo é aceitável (tipo e tamanho)
 */
export function validarArquivo(arquivo: File): { valido: boolean; erro?: string } {
  const tiposAceitos = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ]

  if (!tiposAceitos.includes(arquivo.type)) {
    return { valido: false, erro: "Formato não aceito. Use PDF, JPG, PNG ou WEBP." }
  }

  const tamanhoMB = arquivo.size / (1024 * 1024)
  if (tamanhoMB > TAMANHO_MAXIMO_MB) {
    return { valido: false, erro: `Arquivo muito grande. Máximo de ${TAMANHO_MAXIMO_MB}MB.` }
  }

  return { valido: true }
}

/**
 * Faz upload de um arquivo para o Storage e registra na tabela arquivos_portfolio
 */
export async function enviarArquivoPortfolio(
  profileId: string,
  arquivo: File,
  tipo: TipoArquivo
): Promise<{ dados: ArquivoPortfolio | null; erro: string | null }> {
  const validacao = validarArquivo(arquivo)
  if (!validacao.valido) {
    return { dados: null, erro: validacao.erro ?? "Arquivo inválido." }
  }

  // Nome único: pasta do usuário + timestamp + nome original sanitizado
  const extensao = arquivo.name.split(".").pop()
  const nomeSanitizado = arquivo.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.]/g, "_")
  const caminhoStorage = `${profileId}/${Date.now()}_${nomeSanitizado}`

  // Upload para o Storage
  const { error: erroUpload } = await supabase.storage
    .from(NOME_BUCKET)
    .upload(caminhoStorage, arquivo, {
      cacheControl: "3600",
      upsert: false,
    })

  if (erroUpload) {
    return { dados: null, erro: `Erro ao enviar arquivo: ${erroUpload.message}` }
  }

  // Obtém URL pública
  const { data: urlData } = supabase.storage
    .from(NOME_BUCKET)
    .getPublicUrl(caminhoStorage)

  // Registra na tabela
  const { data: registro, error: erroInsercao } = await supabase
    .from("arquivos_portfolio")
    .insert({
      profile_id: profileId,
      nome_arquivo: arquivo.name,
      url_storage: urlData.publicUrl,
      tipo,
      tamanho_bytes: arquivo.size,
    })
    .select()
    .single()

  if (erroInsercao) {
    return { dados: null, erro: `Erro ao registrar arquivo: ${erroInsercao.message}` }
  }

  return { dados: registro as ArquivoPortfolio, erro: null }
}

/**
 * Lista os arquivos de portfólio de um prestador
 */
export async function listarArquivosPortfolio(
  profileId: string
): Promise<ArquivoPortfolio[]> {
  const { data, error } = await supabase
    .from("arquivos_portfolio")
    .select("*")
    .eq("profile_id", profileId)
    .order("criado_em", { ascending: false })

  if (error) {
    console.error("Erro ao listar arquivos:", error.message)
    return []
  }

  return data as ArquivoPortfolio[]
}

/**
 * Remove um arquivo do storage e da tabela
 */
export async function removerArquivoPortfolio(
  arquivo: ArquivoPortfolio
): Promise<{ erro: string | null }> {
  // Extrai o caminho relativo a partir da URL pública
  const partes = arquivo.url_storage.split(`${NOME_BUCKET}/`)
  const caminhoRelativo = partes[1]

  if (caminhoRelativo) {
    await supabase.storage.from(NOME_BUCKET).remove([caminhoRelativo])
  }

  const { error } = await supabase
    .from("arquivos_portfolio")
    .delete()
    .eq("id", arquivo.id)

  if (error) return { erro: error.message }
  return { erro: null }
}

/**
 * Formata tamanho de arquivo para exibição (KB/MB)
 */
export function formatarTamanhoArquivo(bytes: number | null): string {
  if (!bytes) return ""
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

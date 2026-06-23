import { supabase } from "@/lib/supabase"
import type {
  PerfilDiretorio,
  DadosPerfilDiretorioForm,
  FotoTrabalho,
  ResultadoBuscaDiretorio,
} from "@/types/prestador"

const NOME_BUCKET_FOTOS = "fotos-trabalhos"
const TAMANHO_MAXIMO_MB = 8

/**
 * Busca o perfil de diretório do usuário logado (se existir).
 */
export async function carregarPerfilDiretorio(
  profileId: string
): Promise<PerfilDiretorio | null> {
  const { data, error } = await supabase
    .from("perfis_diretorio")
    .select("*")
    .eq("id", profileId)
    .maybeSingle()

  if (error) {
    console.error("Erro ao carregar perfil de diretório:", error.message)
    return null
  }

  return data as PerfilDiretorio | null
}

/**
 * Cria ou atualiza o perfil de diretório do usuário.
 */
export async function salvarPerfilDiretorio(
  profileId: string,
  dados: DadosPerfilDiretorioForm,
  jaExiste: boolean
): Promise<{ erro: string | null }> {
  const payload = {
    titulo_publico: dados.titulo_publico,
    descricao_completa: dados.descricao_completa,
    area_atendimento: dados.area_atendimento || null,
    anos_de_mercado: dados.anos_de_mercado ? Number(dados.anos_de_mercado) : null,
    certificacoes: dados.certificacoes || null,
    tempo_resposta_estimado: dados.tempo_resposta_estimado || null,
  }

  if (jaExiste) {
    const { error } = await supabase
      .from("perfis_diretorio")
      .update(payload)
      .eq("id", profileId)

    if (error) return { erro: error.message }
  } else {
    const { error } = await supabase
      .from("perfis_diretorio")
      .insert({ id: profileId, ...payload })

    if (error) return { erro: error.message }
  }

  return { erro: null }
}

/**
 * Altera o status de publicação do perfil no diretório.
 */
export async function definirPublicacaoDiretorio(
  profileId: string,
  publicado: boolean
): Promise<{ erro: string | null }> {
  const { error } = await supabase
    .from("perfis_diretorio")
    .update({ publicado })
    .eq("id", profileId)

  if (error) return { erro: error.message }
  return { erro: null }
}

/**
 * Lista as fotos de trabalhos do prestador.
 */
export async function listarFotosTrabalhos(profileId: string): Promise<FotoTrabalho[]> {
  const { data, error } = await supabase
    .from("fotos_trabalhos")
    .select("*")
    .eq("profile_id", profileId)
    .order("ordem", { ascending: true })

  if (error) {
    console.error("Erro ao listar fotos:", error.message)
    return []
  }

  return data as FotoTrabalho[]
}

/**
 * Envia uma foto de trabalho para o Storage e registra na tabela.
 */
export async function enviarFotoTrabalho(
  profileId: string,
  arquivo: File,
  legenda: string,
  ordemAtual: number
): Promise<{ dados: FotoTrabalho | null; erro: string | null }> {
  const tiposAceitos = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  if (!tiposAceitos.includes(arquivo.type)) {
    return { dados: null, erro: "Formato não aceito. Use JPG, PNG ou WEBP." }
  }

  const tamanhoMB = arquivo.size / (1024 * 1024)
  if (tamanhoMB > TAMANHO_MAXIMO_MB) {
    return { dados: null, erro: `Arquivo muito grande. Máximo de ${TAMANHO_MAXIMO_MB}MB.` }
  }

  const nomeSanitizado = arquivo.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.]/g, "_")
  const caminhoStorage = `${profileId}/${Date.now()}_${nomeSanitizado}`

  const { error: erroUpload } = await supabase.storage
    .from(NOME_BUCKET_FOTOS)
    .upload(caminhoStorage, arquivo, { cacheControl: "3600", upsert: false })

  if (erroUpload) {
    return { dados: null, erro: `Erro ao enviar foto: ${erroUpload.message}` }
  }

  const { data: urlData } = supabase.storage
    .from(NOME_BUCKET_FOTOS)
    .getPublicUrl(caminhoStorage)

  const { data: registro, error: erroInsercao } = await supabase
    .from("fotos_trabalhos")
    .insert({
      profile_id: profileId,
      url_foto: urlData.publicUrl,
      legenda: legenda || null,
      ordem: ordemAtual,
    })
    .select()
    .single()

  if (erroInsercao) {
    return { dados: null, erro: `Erro ao registrar foto: ${erroInsercao.message}` }
  }

  return { dados: registro as FotoTrabalho, erro: null }
}

/**
 * Remove uma foto do storage e da tabela.
 */
export async function removerFotoTrabalho(
  foto: FotoTrabalho
): Promise<{ erro: string | null }> {
  const partes = foto.url_foto.split(`${NOME_BUCKET_FOTOS}/`)
  const caminhoRelativo = partes[1]

  if (caminhoRelativo) {
    await supabase.storage.from(NOME_BUCKET_FOTOS).remove([caminhoRelativo])
  }

  const { error } = await supabase.from("fotos_trabalhos").delete().eq("id", foto.id)

  if (error) return { erro: error.message }
  return { erro: null }
}

/**
 * Busca prestadores no diretório por segmento e/ou cidade. Só retorna
 * perfis publicados de assinantes ativos (ou em trial) — isso já é
 * garantido pelas políticas de RLS no banco.
 */
export async function buscarNoDiretorio(
  segmento: string,
  cidade: string
): Promise<ResultadoBuscaDiretorio[]> {
  let query = supabase
    .from("profiles")
    .select(
      `
      *,
      perfis_diretorio!inner(*)
    `
    )
    .eq("perfis_diretorio.publicado", true)

  if (segmento.trim()) {
    query = query.ilike("segmento", `%${segmento.trim()}%`)
  }
  if (cidade.trim()) {
    query = query.ilike("cidade", `%${cidade.trim()}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("Erro ao buscar no diretório:", error.message)
    return []
  }

  const resultados = await Promise.all(
    (data ?? []).map(async (linha: Record<string, unknown>) => {
      const profileId = linha.id as string
      const fotos = await listarFotosTrabalhos(profileId)
      const { perfis_diretorio, ...profile } = linha
      return {
        profile: profile as unknown as ResultadoBuscaDiretorio["profile"],
        diretorio: perfis_diretorio as unknown as ResultadoBuscaDiretorio["diretorio"],
        fotos,
      }
    })
  )

  return resultados
}

/**
 * Envia a imagem de capa/destaque do perfil de diretório — campo
 * separado da galeria de trabalhos, usado também no carrossel
 * público da tela de abertura.
 */
export async function enviarImagemCapa(
  profileId: string,
  arquivo: File
): Promise<{ url: string | null; erro: string | null }> {
  const tiposAceitos = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  if (!tiposAceitos.includes(arquivo.type)) {
    return { url: null, erro: "Formato não aceito. Use JPG, PNG ou WEBP." }
  }

  const tamanhoMB = arquivo.size / (1024 * 1024)
  if (tamanhoMB > TAMANHO_MAXIMO_MB) {
    return { url: null, erro: `Arquivo muito grande. Máximo de ${TAMANHO_MAXIMO_MB}MB.` }
  }

  const nomeSanitizado = arquivo.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.]/g, "_")
  // Prefixo "capa_" para diferenciar da galeria na mesma pasta do usuário
  const caminhoStorage = `${profileId}/capa_${Date.now()}_${nomeSanitizado}`

  const { error: erroUpload } = await supabase.storage
    .from(NOME_BUCKET_FOTOS)
    .upload(caminhoStorage, arquivo, { cacheControl: "3600", upsert: false })

  if (erroUpload) {
    return { url: null, erro: `Erro ao enviar imagem: ${erroUpload.message}` }
  }

  const { data: urlData } = supabase.storage
    .from(NOME_BUCKET_FOTOS)
    .getPublicUrl(caminhoStorage)

  const { error: erroUpdate } = await supabase
    .from("perfis_diretorio")
    .update({ logo_url: urlData.publicUrl })
    .eq("id", profileId)

  if (erroUpdate) {
    return { url: null, erro: `Erro ao salvar imagem de capa: ${erroUpdate.message}` }
  }

  return { url: urlData.publicUrl, erro: null }
}

/**
 * Busca perfis publicados com imagem de capa definida, para alimentar
 * o carrossel da tela de abertura. Não exige login — usa as policies
 * públicas restritas criadas na migration 010 (expõe só nome, cidade,
 * segmento e capa, nunca dados de contato).
 */
export interface ItemCarrossel {
  profileId: string
  nomeEmpresa: string
  segmento: string
  cidade: string
  estado: string
  logoUrl: string
}

export async function buscarItensCarrossel(limite = 12): Promise<ItemCarrossel[]> {
  const { data, error } = await supabase
    .from("perfis_diretorio")
    .select("id, logo_url, profiles!inner(nome_empresa, segmento, cidade, estado)")
    .eq("publicado", true)
    .not("logo_url", "is", null)
    .limit(limite)

  if (error) {
    console.error("Erro ao buscar itens do carrossel:", error.message)
    return []
  }

  return (data ?? []).map((linha: Record<string, unknown>) => {
    const profileInfo = linha.profiles as Record<string, unknown>
    return {
      profileId: linha.id as string,
      logoUrl: linha.logo_url as string,
      nomeEmpresa: profileInfo.nome_empresa as string,
      segmento: profileInfo.segmento as string,
      cidade: profileInfo.cidade as string,
      estado: profileInfo.estado as string,
    }
  })
}

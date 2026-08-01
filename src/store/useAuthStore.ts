import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import type { Profile, DadosPerfilForm } from "@/types/prestador"

interface AuthState {
  // Estado
  usuarioId: string | null
  email: string | null
  perfil: Profile | null
  carregandoAuth: boolean
  carregandoPerfil: boolean
  inicializado: boolean
  /** true quando o backend (Supabase) não respondeu — ex: projeto pausado por inatividade */
  backendIndisponivel: boolean

  // Ações
  inicializar: () => Promise<void>
  cadastrar: (email: string, senha: string) => Promise<{ erro: string | null }>
  entrar: (email: string, senha: string) => Promise<{ erro: string | null }>
  sair: () => Promise<void>
  carregarPerfil: () => Promise<void>
  criarOuAtualizarPerfil: (dados: DadosPerfilForm) => Promise<{ erro: string | null }>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  usuarioId: null,
  email: null,
  perfil: null,
  carregandoAuth: true,
  carregandoPerfil: false,
  inicializado: false,
  backendIndisponivel: false,

  /**
   * Verifica se já existe uma sessão ativa e escuta mudanças de auth
   */
  inicializar: async () => {
    // IMPORTANTE: esta função NUNCA pode lançar exceção sem marcar
    // `inicializado: true`. O App.tsx exibe a tela de carregamento
    // enquanto `!inicializado` — se uma falha de rede (ex: projeto
    // Supabase pausado, que responde HTTP 540) interrompesse o fluxo
    // antes dessa linha, o app ficaria travado no spinner para sempre,
    // parecendo "fora do ar" mesmo com o site publicado normalmente.
    try {
      // Timeout defensivo: se o Supabase não responder em 8s, seguimos
      // como visitante não logado em vez de esperar indefinidamente.
      const sessaoPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 8000)
      )

      const { data } = (await Promise.race([sessaoPromise, timeoutPromise])) as Awaited<
        ReturnType<typeof supabase.auth.getSession>
      >

      if (data.session) {
        set({
          usuarioId: data.session.user.id,
          email: data.session.user.email ?? null,
        })
        await get().carregarPerfil()
      }
    } catch (erro) {
      console.error(
        "Não foi possível verificar a sessão (backend indisponível?). Seguindo como visitante.",
        erro
      )
      set({ usuarioId: null, email: null, perfil: null, backendIndisponivel: true })
    } finally {
      // Roda sempre, com sucesso ou erro — garante que o app carregue.
      set({ carregandoAuth: false, inicializado: true })
    }

    // Escuta mudanças futuras (login/logout em outra aba, expiração, etc.)
    try {
      supabase.auth.onAuthStateChange(async (_evento, session) => {
        if (session) {
          set({
            usuarioId: session.user.id,
            email: session.user.email ?? null,
          })
          await get().carregarPerfil()
        } else {
          set({ usuarioId: null, email: null, perfil: null })
        }
      })
    } catch (erro) {
      console.error("Não foi possível registrar o listener de auth:", erro)
    }
  },

  /**
   * Cria uma nova conta de usuário (e-mail + senha)
   */
  cadastrar: async (email: string, senha: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    })

    if (error) {
      return { erro: traduzirErroAuth(error.message) }
    }

    if (data.session) {
      set({
        usuarioId: data.session.user.id,
        email: data.session.user.email ?? null,
      })
    }

    return { erro: null }
  },

  /**
   * Autentica usuário existente
   */
  entrar: async (email: string, senha: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      return { erro: traduzirErroAuth(error.message) }
    }

    set({
      usuarioId: data.session.user.id,
      email: data.session.user.email ?? null,
    })
    await get().carregarPerfil()

    return { erro: null }
  },

  /**
   * Encerra a sessão do usuário
   */
  sair: async () => {
    await supabase.auth.signOut()
    set({ usuarioId: null, email: null, perfil: null })
  },

  /**
   * Busca o perfil de prestador do usuário logado (se existir)
   */
  carregarPerfil: async () => {
    const { usuarioId } = get()
    if (!usuarioId) return

    set({ carregandoPerfil: true })

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", usuarioId)
        .maybeSingle()

      if (error) {
        console.error("Erro ao carregar perfil:", error.message)
      }

      set({ perfil: data as Profile | null, carregandoPerfil: false })
    } catch (erro) {
      // Falha de rede (ex: backend pausado). Não pode deixar
      // `carregandoPerfil` travado em true — isso congelaria a UI.
      console.error("Falha de rede ao carregar perfil:", erro)
      set({ carregandoPerfil: false, backendIndisponivel: true })
    }
  },

  /**
   * Cria o perfil de prestador (primeira vez) ou atualiza dados existentes
   */
  criarOuAtualizarPerfil: async (dados: DadosPerfilForm) => {
    const { usuarioId, perfil } = get()
    if (!usuarioId) return { erro: "Você precisa estar logado." }

    // Mapeia campos do formulário (camelCase) para colunas do banco (snake_case)
    const { paisFoco, ...resto } = dados
    const dadosBanco = { ...resto, pais_foco: paisFoco }

    if (perfil) {
      // Atualiza perfil existente
      const { error } = await supabase
        .from("profiles")
        .update(dadosBanco)
        .eq("id", usuarioId)

      if (error) return { erro: error.message }
    } else {
      // Cria novo perfil (status_assinatura fica 'pendente' por padrão)
      const { error } = await supabase
        .from("profiles")
        .insert({ id: usuarioId, ...dadosBanco })

      if (error) return { erro: error.message }
    }

    await get().carregarPerfil()
    return { erro: null }
  },
}))

/**
 * Traduz mensagens de erro comuns do Supabase Auth para português
 */
function traduzirErroAuth(mensagem: string): string {
  const traducoes: Record<string, string> = {
    "Invalid login credentials": "E-mail ou senha incorretos.",
    "User already registered": "Este e-mail já está cadastrado. Tente entrar.",
    "Password should be at least 6 characters": "A senha deve ter no mínimo 6 caracteres.",
    "Email not confirmed": "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
    "Unable to validate email address: invalid format": "Formato de e-mail inválido.",
  }

  for (const [chave, traducao] of Object.entries(traducoes)) {
    if (mensagem.includes(chave)) return traducao
  }

  return mensagem
}

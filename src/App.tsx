import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { TelaAbertura } from "@/components/TelaAbertura"
import { FormularioBusca } from "@/components/FormularioBusca"
import { Dashboard } from "@/components/Dashboard"
import { NavegacaoTopo } from "@/components/NavegacaoTopo"
import { PromptInstalarApp } from "@/components/PromptInstalarApp"
import { BannerContextual } from "@/components/BannerContextual"
import { PaginaSAC } from "@/components/PaginaSAC"
import { BuscaDiretorio } from "@/components/diretorio/BuscaDiretorio"
import { PaginaAdmin } from "@/components/admin/PaginaAdmin"
import { TelaAuth } from "@/components/auth/TelaAuth"
import { AbasPerfil } from "@/components/perfil/AbasPerfil"
import { SelecaoPlano } from "@/components/perfil/SelecaoPlano"
import { StatusAssinatura } from "@/components/perfil/StatusAssinatura"
import { useAppStore } from "@/store/useAppStore"
import { useAuthStore } from "@/store/useAuthStore"
import { usePreferenciasStore } from "@/store/usePreferenciasStore"
import { temAcessoLiberado } from "@/types/prestador"

/** Página de busca: formulário livre (sem login) ou dashboard de resultados */
function PaginaBusca() {
  const { buscaAtual, carregando } = useAppStore()
  const mostrarDashboard = buscaAtual !== null || carregando
  return mostrarDashboard ? <Dashboard /> : <FormularioBusca />
}

/** Página de login/cadastro */
function PaginaAuth() {
  const navigate = useNavigate()
  const { usuarioId } = useAuthStore()

  if (usuarioId) {
    return <Navigate to="/perfil" replace />
  }

  return <TelaAuth onSucesso={() => navigate("/perfil")} />
}

/** Página de perfil: exige login */
function PaginaPerfil() {
  const navigate = useNavigate()
  const { usuarioId, perfil, carregandoAuth } = useAuthStore()

  if (carregandoAuth) {
    return <TelaCarregando />
  }

  if (!usuarioId) {
    return <Navigate to="/entrar" replace />
  }

  return (
    <AbasPerfil
      onConcluido={() => {
        if (!perfil || !temAcessoLiberado(perfil)) {
          navigate("/planos")
        }
      }}
    />
  )
}

/** Área administrativa: exige login; a permissão de admin é checada dentro da página */
function PaginaAdministracao() {
  const { usuarioId, carregandoAuth } = useAuthStore()

  if (carregandoAuth) {
    return <TelaCarregando />
  }

  if (!usuarioId) {
    return <Navigate to="/entrar" replace />
  }

  return <PaginaAdmin />
}

/** Página de busca no diretório: exige login (qualquer empresa cadastrada, mesmo sem assinatura) */
function PaginaDiretorio() {
  const { usuarioId, carregandoAuth } = useAuthStore()

  if (carregandoAuth) {
    return <TelaCarregando />
  }

  if (!usuarioId) {
    return <Navigate to="/entrar" replace />
  }

  return <BuscaDiretorio />
}

/**
 * Página de planos — PÚBLICA.
 *
 * Antes exigia login e perfil, e ainda mandava para /buscar quem já
 * tinha assinatura ativa. O efeito era que o botão "Ver planos" nunca
 * mostrava plano nenhum: visitante ia parar no login, e assinante ia
 * parar na busca. Preço escondido atrás de cadastro derruba conversão,
 * porque ninguém cria conta para descobrir quanto custa.
 *
 * A trava de assinar continua existindo, mas dentro do SelecaoPlano:
 * ver o preço é livre, contratar é que pede conta.
 */
function PaginaPlanos() {
  const { carregandoAuth } = useAuthStore()

  if (carregandoAuth) {
    return <TelaCarregando />
  }

  return <SelecaoPlano />
}

/** Páginas de retorno do checkout do Mercado Pago */
function PaginaRetornoCheckout({ resultado }: { resultado: "sucesso" | "erro" | "pendente" }) {
  const navigate = useNavigate()
  return <StatusAssinatura resultado={resultado} onContinuar={() => navigate("/buscar")} />
}

function TelaCarregando() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-dourado-400 animate-spin" />
    </div>
  )
}

/** Componente interno que inicializa autenticação e define as rotas */
function ConteudoApp() {
  const { inicializar, inicializado, backendIndisponivel, perfil } = useAuthStore()
  const sincronizarComPerfil = usePreferenciasStore((s) => s.sincronizarComPerfil)
  const location = useLocation()

  useEffect(() => {
    inicializar()
  }, [])

  // Depois do login, o país do perfil é a fonte oficial e substitui a
  // escolha provisória feita na tela de abertura — é ele que define
  // moeda e gateway de cobrança.
  useEffect(() => {
    sincronizarComPerfil(perfil?.pais_foco)
  }, [perfil?.pais_foco])

  if (!inicializado) {
    return <TelaCarregando />
  }

  // A página inicial é a vitrine da marca: sem header e sem faixa de
  // anúncio, para que nada dispute atenção com a apresentação.
  const naPaginaInicial = location.pathname === "/"

  return (
    <>
      {/* Aviso de backend fora do ar — a causa mais comum é o projeto
          Supabase ter sido pausado por inatividade (plano gratuito
          pausa após 7 dias sem requisições). Os dados não são perdidos:
          basta restaurar o projeto no painel do Supabase. */}
      {backendIndisponivel && (
        <div className="bg-destructive/90 text-white text-center text-xs py-2 px-4">
          Não foi possível conectar ao servidor. Login, cadastro e dados salvos
          estão temporariamente indisponíveis.
        </div>
      )}

      {/* O header de navegação não aparece na tela de abertura (splash) */}
      {!naPaginaInicial && <NavegacaoTopo />}
      <PromptInstalarApp />

      {/* Reserva a altura exata da faixa de anúncios do rodapé
          (80px no celular, 96px no computador), garantindo que nenhum
          conteúdo fique escondido atrás dela. Na página inicial não há
          faixa, então também não há altura a reservar. */}
      <div className={naPaginaInicial ? "" : "pb-20 md:pb-24"}>
      <Routes>
        <Route path="/" element={<TelaAbertura />} />
        <Route path="/buscar" element={<PaginaBusca />} />
        <Route path="/ajuda" element={<PaginaSAC />} />
        <Route path="/diretorio" element={<PaginaDiretorio />} />
        <Route path="/admin" element={<PaginaAdministracao />} />
        <Route path="/entrar" element={<PaginaAuth />} />
        <Route path="/perfil" element={<PaginaPerfil />} />
        <Route path="/planos" element={<PaginaPlanos />} />
        <Route path="/assinatura/sucesso" element={<PaginaRetornoCheckout resultado="sucesso" />} />
        <Route path="/assinatura/erro" element={<PaginaRetornoCheckout resultado="erro" />} />
        <Route path="/assinatura/pendente" element={<PaginaRetornoCheckout resultado="pendente" />} />
        <Route path="*" element={<Navigate to="/buscar" replace />} />
      </Routes>
      </div>

      {/* Banner contextual — faixa no rodapé das páginas internas.
          Mostra apenas anunciantes que vendem para o ramo de quem está
          navegando. Fica no rodapé de propósito: a lateral tem espaço
          sobrando, mas fica ao lado do formulário de busca e disputaria
          atenção com a ação principal do site. Não bloqueia nada: sem
          pop-up e sem exigir clique para dispensar.

          NÃO aparece na página inicial. Ali a única marca à vista deve
          ser a nossa: quem chega de anúncio decide em segundos se o
          produto é sério, e uma faixa vendendo outra empresa na
          primeira dobra entrega a atenção que acabamos de comprar. */}
      {!naPaginaInicial && <BannerContextual />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      {/* Configuração global do react-hot-toast */}
      <Toaster
        position="bottom-right"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background: "hsl(222 47% 14%)",
            color: "hsl(213 31% 91%)",
            border: "1px solid hsl(222 47% 22%)",
            borderRadius: "8px",
            fontSize: "13px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          },
          success: {
            iconTheme: { primary: "#38a169", secondary: "hsl(222 47% 14%)" },
          },
          error: {
            iconTheme: { primary: "#e53e3e", secondary: "hsl(222 47% 14%)" },
          },
        }}
      />

      <ConteudoApp />
    </BrowserRouter>
  )
}

export default App

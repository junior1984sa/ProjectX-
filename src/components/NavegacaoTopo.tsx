import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { LogOut, User, Building2, Zap, Gift, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/useAuthStore"
import { useCreditosStore } from "@/store/useCreditosStore"
import { temAcessoLiberado } from "@/types/prestador"
import toast from "react-hot-toast"

export function NavegacaoTopo() {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuarioId, email, perfil, sair } = useAuthStore()
  const { creditos, carregarCreditos } = useCreditosStore()

  const estaLogado = !!usuarioId
  const acessoLiberado = temAcessoLiberado(perfil)
  const emTrial = perfil?.status_assinatura === "trial"

  useEffect(() => {
    if (estaLogado && acessoLiberado) {
      carregarCreditos()
    }
  }, [estaLogado, acessoLiberado])

  async function handleSair() {
    await sair()
    toast.success("Você saiu da sua conta.")
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/60">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate("/buscar")}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <img
            src="/logo-x-apenas.png"
            alt="ProjectX"
            className="w-7 h-7 object-contain"
          />
          <span className="font-bold text-foreground tracking-tight hidden sm:inline">
            Prospect<span className="text-dourado-400">X</span>
          </span>
        </button>

        {/* Ações de navegação */}
        <div className="flex items-center gap-2">
          {estaLogado ? (
            <>
              {/* Indicador de trial */}
              {emTrial && (
                <Badge variant="secondary" className="text-xs hidden sm:inline-flex items-center gap-1 bg-dourado-900/20 text-dourado-300 border border-dourado-700/40">
                  <Gift className="w-3 h-3" />
                  Em teste grátis
                </Badge>
              )}

              {/* Saldo de créditos */}
              {acessoLiberado && creditos && (
                <button
                  onClick={() => navigate("/perfil")}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-dourado-700/40 bg-dourado-900/15 text-dourado-300 hover:bg-dourado-900/25 transition-colors"
                  title={`Renova em ${new Date(creditos.ciclo_fim).toLocaleDateString("pt-BR")}`}
                >
                  <Zap className="w-3 h-3" />
                  <span className="font-semibold">{creditos.creditos_disponiveis}</span>
                  <span className="hidden sm:inline text-dourado-400/70">
                    / {creditos.creditos_totais_ciclo} créditos
                  </span>
                </button>
              )}

              {/* Status da assinatura */}
              {perfil && !acessoLiberado && (
                <Badge variant="warning" className="text-xs hidden sm:inline-flex">
                  Pendente
                </Badge>
              )}

              {/* Link para perfil */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/perfil")}
                className={`h-8 text-xs ${location.pathname === "/perfil" ? "text-dourado-400" : "text-muted-foreground"}`}
              >
                <Building2 className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">
                  {perfil ? "Meu perfil" : "Cadastrar empresa"}
                </span>
              </Button>

              {/* Ajuda / SAC */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/ajuda")}
                className={`h-8 w-8 ${location.pathname === "/ajuda" ? "text-dourado-400" : "text-muted-foreground"}`}
                title="Central de Ajuda"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>

              {/* E-mail do usuário */}
              <span className="text-xs text-muted-foreground hidden md:inline truncate max-w-[160px]">
                {email}
              </span>

              {/* Sair */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSair}
                className="h-8 w-8 text-muted-foreground hover:text-red-400"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/ajuda")}
                className={`h-8 w-8 ${location.pathname === "/ajuda" ? "text-dourado-400" : "text-muted-foreground"}`}
                title="Central de Ajuda"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/entrar")}
                className="h-8 text-xs bg-dourado-600 hover:bg-dourado-700 text-white"
              >
                <User className="w-3.5 h-3.5 mr-1.5" />
                Cadastrar empresa
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

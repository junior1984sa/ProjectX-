import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { LogOut, User, Building2, Zap, Gift, HelpCircle, Search, LayoutDashboard, ListChecks } from "lucide-react"
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
  const { t, i18n } = useTranslation()

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
    toast.success(t("nav.saiuDaConta"))
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
            src="/logo-x.png"
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
                  {t("nav.emTesteGratis")}
                </Badge>
              )}

              {/* Saldo de créditos */}
              {acessoLiberado && creditos && (
                <button
                  onClick={() => navigate("/perfil")}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-dourado-700/40 bg-dourado-900/15 text-dourado-300 hover:bg-dourado-900/25 transition-colors"
                  title={t("nav.proximaRecarga", {
                    // A data segue o idioma da interface: "01/08/2026"
                    // para pt-BR e "8/1/2026" para en-US
                    data: new Date(creditos.ciclo_fim).toLocaleDateString(i18n.language),
                  })}
                >
                  <Zap className="w-3 h-3" />
                  <span className="font-semibold">{creditos.creditos_disponiveis}</span>
                  {/* Sem "X / Y": com créditos acumulativos o saldo pode
                      passar da franquia do ciclo, e "150 / 100" confunde */}
                  <span className="hidden sm:inline text-dourado-400/70">
                    {t("nav.creditos")}
                  </span>
                </button>
              )}

              {/* Status da assinatura */}
              {perfil && !acessoLiberado && (
                <Badge variant="warning" className="text-xs hidden sm:inline-flex">
                  {t("nav.pendente")}
                </Badge>
              )}

              {/* Administração — só aparece para o dono do negócio */}
              {perfil?.is_admin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/admin")}
                  className={`h-8 w-8 ${location.pathname === "/admin" ? "text-dourado-400" : "text-muted-foreground"}`}
                  title={t("nav.administracao")}
                >
                  <LayoutDashboard className="w-4 h-4" />
                </Button>
              )}

              {/* Buscar prestadores (diretório) — só faz sentido para quem já tem perfil */}
              {perfil && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/diretorio")}
                  className={`h-8 text-xs ${location.pathname === "/diretorio" ? "text-dourado-400" : "text-muted-foreground"}`}
                >
                  <Search className="w-3.5 h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">{t("nav.buscarPrestadores")}</span>
                </Button>
              )}

              {/* Funil de contatos — só faz sentido para quem já abordou
                  alguém, ou seja, para quem tem acesso liberado */}
              {acessoLiberado && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/contatos")}
                  className={`h-8 text-xs ${location.pathname === "/contatos" ? "text-dourado-400" : "text-muted-foreground"}`}
                >
                  <ListChecks className="w-3.5 h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">{t("nav.meusContatos")}</span>
                </Button>
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
                  {perfil ? t("nav.meuPerfil") : t("nav.cadastrarEmpresa")}
                </span>
              </Button>

              {/* Ajuda / SAC */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/ajuda")}
                className={`h-8 w-8 ${location.pathname === "/ajuda" ? "text-dourado-400" : "text-muted-foreground"}`}
                title={t("nav.centralAjuda")}
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
                title={t("nav.sair")}
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
                title={t("nav.centralAjuda")}
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/entrar")}
                className="h-8 text-xs"
              >
                <User className="w-3.5 h-3.5 mr-1.5" />
                {t("nav.cadastrarEmpresa")}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

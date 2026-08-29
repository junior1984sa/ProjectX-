import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Search, GitBranch, Building2, User, ShieldCheck, HelpCircle,
  LogOut, PanelLeftClose, PanelLeftOpen, Menu, X, Coins,
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useCreditosStore } from "@/store/useCreditosStore"
import { MarcaIcone, Logotipo } from "@/components/Marca"
import { SeletorTema } from "@/components/SeletorTema"
import { temAcessoLiberado } from "@/types/prestador"
import toast from "react-hot-toast"

/**
 * MENU LATERAL
 *
 * Substitui a barra de navegação no topo para quem está logado.
 *
 * POR QUE LATERAL, E NÃO ABAS NO TOPO
 *
 * Aba no topo tem largura finita: cada item novo espreme os outros, e
 * a partir de cinco começa a esconder coisa atrás de "mais". Menu
 * lateral cresce para baixo, que é a direção que sobra numa tela
 * larga. É por isso que ferramenta de trabalho usa lateral e site
 * institucional usa topo — e este produto é ferramenta de trabalho.
 *
 * O QUE ELE RESOLVE ALÉM DE ORGANIZAR
 *
 * O saldo de créditos estava escondido num badge pequeno no topo. É a
 * informação que responde "posso buscar de novo?", e ela precisa estar
 * sempre visível, não a um clique de distância. Aqui ela mora no
 * rodapé do menu, com o ciclo de renovação junto.
 *
 * COLAPSO
 *
 * Colapsado, o menu vira uma coluna de ícones de 68px. Não é enfeite:
 * a tela de resultados é uma tabela larga, e 180px a mais de largura
 * mudam quantas colunas cabem. O estado fica salvo, porque quem
 * escolheu trabalhar colapsado não quer reescolher a cada visita.
 *
 * NO CELULAR
 *
 * Vira gaveta, e não some. Menu que desaparece no celular obriga a
 * voltar ao computador para tarefas simples — e parte do público
 * trabalha em obra, com o telefone na mão.
 */

const CHAVE_COLAPSO = "whohiresyou:menu-colapsado"

interface ItemMenu {
  para: string
  Icone: typeof Search
  chave: string
  /** Só aparece para administrador */
  somenteAdmin?: boolean
}

const ITENS: ItemMenu[] = [
  { para: "/buscar", Icone: Search, chave: "nav.buscar" },
  { para: "/contatos", Icone: GitBranch, chave: "nav.meusContatos" },
  { para: "/diretorio", Icone: Building2, chave: "nav.buscarPrestadores" },
  { para: "/perfil", Icone: User, chave: "nav.meuPerfil" },
  { para: "/admin", Icone: ShieldCheck, chave: "nav.administracao", somenteAdmin: true },
]

function lerColapso(): boolean {
  try {
    return localStorage.getItem(CHAVE_COLAPSO) === "1"
  } catch {
    return false
  }
}

export function MenuLateral() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { t, i18n } = useTranslation()
  const { email, perfil, sair } = useAuthStore()
  const { creditos, carregarCreditos } = useCreditosStore()

  const [colapsado, setColapsado] = useState(lerColapso)
  const [gavetaAberta, setGavetaAberta] = useState(false)

  useEffect(() => {
    carregarCreditos()
  }, [carregarCreditos])

  // Navegar fecha a gaveta. Sem isto, no celular o menu fica por cima
  // da página que a pessoa acabou de abrir.
  useEffect(() => {
    setGavetaAberta(false)
  }, [pathname])

  // Escape fecha a gaveta: é o gesto que todo mundo tenta primeiro.
  useEffect(() => {
    if (!gavetaAberta) return
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setGavetaAberta(false)
    }
    window.addEventListener("keydown", aoTeclar)
    return () => window.removeEventListener("keydown", aoTeclar)
  }, [gavetaAberta])

  function alternarColapso() {
    const novo = !colapsado
    setColapsado(novo)
    try {
      localStorage.setItem(CHAVE_COLAPSO, novo ? "1" : "0")
    } catch {
      // Sem armazenamento, vale só para esta sessão.
    }
  }

  async function handleSair() {
    await sair()
    toast.success(t("nav.saiuDaConta"))
    navigate("/")
  }

  const acessoLiberado = temAcessoLiberado(perfil)
  const itensVisiveis = ITENS.filter((i) => !i.somenteAdmin || perfil?.is_admin)

  const largura = colapsado ? "lg:w-[68px]" : "lg:w-[248px]"

  const conteudo = (
    <>
      {/* ── Marca ── */}
      <div className={`h-14 flex items-center flex-shrink-0 ${colapsado ? "justify-center px-2" : "px-4"}`}>
        <Link to="/" className="flex items-center gap-2 min-w-0" aria-label="WhoHiresYou">
          {colapsado ? (
            <MarcaIcone className="w-7 h-7" />
          ) : (
            <Logotipo className="h-6 w-auto" />
          )}
        </Link>
      </div>

      {/* ── Navegação ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-2" aria-label={t("nav.principal")}>
        <ul className="space-y-1">
          {itensVisiveis.map(({ para, Icone, chave }) => {
            const ativo = pathname === para || pathname.startsWith(para + "/")
            return (
              <li key={para}>
                <Link
                  to={para}
                  /* `aria-current` é o que informa o item ativo a quem usa
                     leitor de tela. Cor sozinha não informa nada a ele. */
                  aria-current={ativo ? "page" : undefined}
                  title={colapsado ? t(chave) : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 h-10 text-[13.5px] transition-colors ${
                    colapsado ? "justify-center px-0" : ""
                  } ${
                    ativo
                      ? "bg-azul-600 text-white"
                      : "text-prata-300 hover:bg-prata-800 hover:text-prata-100"
                  }`}
                >
                  <Icone className="w-[18px] h-[18px] flex-shrink-0" />
                  {!colapsado && <span className="truncate">{t(chave)}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ── Rodapé: crédito, tema, conta ── */}
      <div className="flex-shrink-0 border-t border-prata-700 p-2 space-y-2">
        {/* O saldo sai do badge escondido e vira informação permanente:
            é o que responde "posso buscar de novo?". */}
        {acessoLiberado && creditos && (
          <Link
            to="/perfil"
            title={
              colapsado
                ? t("nav.creditosDisponiveis", { saldo: creditos.creditos_disponiveis })
                : t("nav.proximaRecarga", {
                    data: new Date(creditos.ciclo_fim).toLocaleDateString(i18n.language),
                  })
            }
            className={`flex items-center rounded-lg border border-dourado-700/40 bg-dourado-900/15 hover:bg-dourado-900/25 transition-colors ${
              colapsado ? "justify-center h-10" : "gap-2 px-3 h-12"
            }`}
          >
            <Coins className="w-4 h-4 text-dourado-400 flex-shrink-0" />
            {!colapsado && (
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-dourado-300 leading-tight">
                  {creditos.creditos_disponiveis}
                </p>
                <p className="text-[11px] text-dourado-400/80 leading-tight truncate">
                  {t("nav.creditos")}
                </p>
              </div>
            )}
          </Link>
        )}

        <div className={`flex items-center gap-1 ${colapsado ? "flex-col" : ""}`}>
          {!colapsado && <SeletorTema compacto />}
          <Link
            to="/ajuda"
            title={t("nav.centralAjuda")}
            aria-label={t("nav.centralAjuda")}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-prata-400 hover:text-prata-100 hover:bg-prata-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </Link>
          <button
            onClick={handleSair}
            title={t("nav.sair")}
            aria-label={t("nav.sair")}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-prata-400 hover:text-prata-100 hover:bg-prata-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {!colapsado && email && (
          <p className="px-1 text-[11px] text-prata-400 truncate" title={email}>
            {email}
          </p>
        )}

        {/* Colapsar só existe onde há tela sobrando. No celular o menu
            é gaveta, e gaveta colapsada não faz sentido. */}
        <button
          onClick={alternarColapso}
          aria-label={colapsado ? t("nav.expandirMenu") : t("nav.recolherMenu")}
          title={colapsado ? t("nav.expandirMenu") : t("nav.recolherMenu")}
          className={`hidden lg:flex h-8 w-full items-center gap-2 rounded-lg px-2 text-[12px] text-prata-400 hover:text-prata-100 hover:bg-prata-800 transition-colors ${
            colapsado ? "justify-center" : ""
          }`}
        >
          {colapsado ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4" />
              <span>{t("nav.recolherMenu")}</span>
            </>
          )}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ── Barra fina no celular, só para abrir a gaveta ── */}
      <div className="lg:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-3 bg-obsidian border-b border-prata-700">
        <button
          onClick={() => setGavetaAberta(true)}
          aria-label={t("nav.abrirMenu")}
          aria-expanded={gavetaAberta}
          className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-prata-300 hover:bg-prata-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" aria-label="WhoHiresYou">
          <Logotipo className="h-5 w-auto" />
        </Link>
        <div className="w-9" aria-hidden="true" />
      </div>

      {/* ── Fundo escurecido da gaveta ── */}
      {gavetaAberta && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setGavetaAberta(false)}
          aria-hidden="true"
        />
      )}

      {/* ── O menu ── */}
      <aside
        className={`bg-prata-900 border-r border-prata-700 flex flex-col
          fixed inset-y-0 left-0 z-50 w-[248px] transition-transform duration-normal
          ${gavetaAberta ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-svh lg:z-30 ${largura}`}
      >
        {/* Fechar só aparece na gaveta */}
        {gavetaAberta && (
          <button
            onClick={() => setGavetaAberta(false)}
            aria-label={t("nav.fecharMenu")}
            className="lg:hidden absolute top-3 right-3 h-8 w-8 inline-flex items-center justify-center rounded-lg text-prata-400 hover:bg-prata-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {conteudo}
      </aside>
    </>
  )
}

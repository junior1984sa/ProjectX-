import { Moon, Sun, Monitor } from "lucide-react"
import { useTemaStore, type Tema } from "@/store/useTemaStore"
import { useTranslation } from "react-i18next"

/**
 * SELETOR DE TEMA
 *
 * Três botões visíveis em vez de um interruptor que alterna. Um
 * interruptor não consegue expressar "siga o sistema" — ele só tem dois
 * estados, e o terceiro é justamente o padrão de quem já configurou o
 * aparelho.
 *
 * Os ícones vêm com rótulo acessível porque ícone sozinho é adivinhação
 * para leitor de tela: lua e sol são convenção visual, não texto.
 */

const OPCOES: { valor: Tema; Icone: typeof Sun; chave: string }[] = [
  { valor: "claro", Icone: Sun, chave: "tema.claro" },
  { valor: "escuro", Icone: Moon, chave: "tema.escuro" },
  { valor: "sistema", Icone: Monitor, chave: "tema.sistema" },
]

export function SeletorTema({ compacto = false }: { compacto?: boolean }) {
  const { tema, definirTema } = useTemaStore()
  const { t } = useTranslation()

  return (
    <div
      role="radiogroup"
      aria-label={t("tema.rotulo")}
      className="inline-flex items-center rounded-lg border border-prata-700 p-0.5"
    >
      {OPCOES.map(({ valor, Icone, chave }) => {
        const ativo = tema === valor
        return (
          <button
            key={valor}
            role="radio"
            aria-checked={ativo}
            aria-label={t(chave)}
            title={t(chave)}
            onClick={() => definirTema(valor)}
            className={`inline-flex items-center justify-center rounded-[6px] transition-colors ${
              compacto ? "h-7 w-7" : "h-8 w-8"
            } ${
              ativo
                ? "bg-prata-800 text-prata-100"
                : "text-prata-400 hover:text-prata-200"
            }`}
          >
            <Icone className={compacto ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </button>
        )
      })}
    </div>
  )
}

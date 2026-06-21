import { useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"

/**
 * Tela de abertura: o logo grande funciona como um portal de entrada.
 * É a primeira impressão do app — clicar nele leva para a busca de
 * prospecção, que já funciona livremente, sem exigir login.
 */
export function TelaAbertura() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Glow decorativo atrás do logo */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-dourado-500/5 blur-3xl pointer-events-none" />

      <button
        onClick={() => navigate("/buscar")}
        className="group relative flex flex-col items-center gap-6 transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
      >
        <img
          src="/logo-projectx.png"
          alt="ProjectX"
          className="w-64 sm:w-80 md:w-96 drop-shadow-[0_0_40px_rgba(212,176,106,0.15)]"
        />

        <span className="flex items-center gap-1.5 text-sm text-muted-foreground group-hover:text-dourado-300 transition-colors">
          Toque para entrar
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </span>
      </button>

      <p className="absolute bottom-10 text-xs text-muted-foreground/60 max-w-sm text-center px-6">
        Prospecção ativa para qualquer prestador de serviço do Brasil.
      </p>
    </div>
  )
}

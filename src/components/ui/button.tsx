import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * BOTÃO — a peça onde a regra de cor do sistema fica mais visível.
 *
 * `default` é AZUL porque o botão padrão é sempre uma ação, e azul é a
 * cor da ação. O ouro ficou reservado para `premium`: ele marca o que
 * é da marca ou excepcional, e perde esse significado se pintar todo
 * clique da interface.
 *
 * Antes, o CTA era ouro com texto branco — 2,83:1, reprovado em WCAG
 * AA por larga margem. Em celular sob sol, aquele botão simplesmente
 * não era legível. Todas as combinações abaixo foram verificadas.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md text-sm font-medium",
    "transition-colors duration-fast",
    // O foco é desenhado pelo :focus-visible global (contorno azul).
    // Aqui só garantimos que o contorno não seja cortado pelo overflow.
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-55",
    "[&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Ação principal.
            Usa azul-600, e não o azul-500 da marca: branco sobre
            #287BFF dá 3,91:1 e REPROVA o mínimo de 4,5:1 para texto.
            #1E63D6 entrega 5,51:1. O azul-500 continua sendo a cor da
            marca em ícone, link e borda — ali 3:1 basta e ele passa. */
        default:
          "bg-azul-600 text-white hover:bg-azul-500 active:bg-azul-700",

        /** Ação secundária: presente, sem competir com a principal */
        secondary:
          "bg-prata-800 text-prata-100 border border-prata-500 hover:bg-prata-700 hover:border-prata-400",

        /** Contorno: mesma hierarquia da secundária, menos peso visual */
        outline:
          "border border-prata-500 bg-transparent text-prata-100 hover:bg-prata-800 hover:border-prata-400",

        /** Terciária: para ações que não devem chamar atenção */
        ghost:
          "text-prata-300 hover:bg-prata-800 hover:text-prata-100",

        /** Marca e planos. Obsidian sobre ouro → 8,04:1 ✓ AAA */
        premium:
          "bg-dourado-500 text-obsidian font-semibold hover:bg-dourado-400 active:bg-dourado-600",

        /** Destrutiva. Obsidian sobre vermelho claro → contraste alto */
        destructive:
          "bg-destructive text-obsidian font-semibold hover:bg-destructive/90",

        success:
          "bg-verde-500 text-obsidian font-semibold hover:bg-verde-400",

        link:
          "text-azul-400 underline-offset-4 hover:underline hover:text-azul-300 h-auto p-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-[13px]",
        lg: "h-11 px-6",
        xl: "h-14 px-8 text-base font-semibold rounded-lg",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * Mostra o indicador e desabilita o clique. Existe como prop para que
   * nenhuma tela precise reinventar o estado de carregamento — antes,
   * cada uma montava o próprio spinner de um jeito diferente.
   */
  carregando?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, carregando, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    // Com `asChild`, o Radix exige um único filho e repassa as props
    // para ele — injetar o spinner aqui quebraria essa regra.
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || carregando}
        aria-busy={carregando || undefined}
        {...props}
      >
        {carregando && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

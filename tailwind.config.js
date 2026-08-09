/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // Títulos em Space Grotesk, corpo em Inter. As duas são
        // self-hosted (@fontsource), então não há requisição a
        // terceiro no caminho crítico.
        sans: ['"Inter Variable"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter Variable"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /**
         * AZUL — a cor da AÇÃO.
         * CTA, navegação ativa, link, foco, informação. Se o elemento
         * não é clicável nem indica estado de interação, não é azul.
         */
        azul: {
          900: "#0C2B5E",
          800: "#123C82",
          700: "#1750AE",
          600: "#1E63D6",
          500: "#287BFF",
          400: "#3D8BFF",
          300: "#6BA5FF",
          200: "#9CC3FF",
          100: "#D0E1FF",
        },

        /**
         * OURO — a cor da MARCA.
         * Identidade, premium, oportunidade excepcional. Meta de
         * ocupação: ~5% da área pintada. O nome `dourado` foi mantido
         * porque já é usado em 95 lugares; os VALORES é que mudaram,
         * então todo o produto adota a paleta nova de uma vez.
         */
        dourado: {
          900: "#5C4318",
          800: "#7A5920",
          700: "#9B7128",
          600: "#BC9142",
          500: "#D4A84F",
          400: "#E0B85C",
          300: "#F0C96A",
          200: "#F5E3BE",
          100: "#FAF0DC",
        },

        /**
         * NEUTROS — estrutura e texto.
         * Mesma observação: o nome `prata` ficou, os valores agora são
         * os do sistema novo (obsidian → grafite → texto).
         */
        prata: {
          900: "#11151B",
          800: "#181D24",
          700: "#292F38",
          600: "#4A525C",
          500: "#626B76",
          400: "#8B949E",
          300: "#C2C9D1",
          200: "#DDE2E7",
          100: "#F4F6F8",
        },

        /** Fundo mais profundo que a superfície dos cards */
        obsidian: "#080A0D",

        verde: {
          700: "#1B6B45",
          600: "#228555",
          500: "#2F9E68",
          400: "#3DBB7E",
          300: "#5FD69C",
        },
      },
      borderRadius: {
        sm: "var(--px-radius-sm)",
        DEFAULT: "var(--px-radius)",
        md: "var(--px-radius)",
        lg: "var(--px-radius-md)",
        xl: "var(--px-radius-lg)",
        "2xl": "var(--px-radius-xl)",
      },
      boxShadow: {
        sm: "var(--px-shadow-sm)",
        DEFAULT: "var(--px-shadow-md)",
        md: "var(--px-shadow-md)",
        lg: "var(--px-shadow-lg)",
      },
      transitionDuration: {
        fast: "120ms",
        DEFAULT: "200ms",
        normal: "200ms",
        medium: "300ms",
        slow: "450ms",
      },
      zIndex: {
        dropdown: "40",
        sticky: "50",
        drawer: "60",
        modal: "70",
        toast: "80",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        /** Pulso do X quando a IA está processando */
        pulseSuave: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 1.5s infinite linear",
        fadeIn: "fadeIn 0.3s ease-out",
        pulseSuave: "pulseSuave 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

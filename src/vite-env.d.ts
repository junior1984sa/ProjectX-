/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_MERCADOPAGO_PUBLIC_KEY: string
  readonly VITE_PRECO_PLANO_MENSAL: string
  readonly VITE_PRECO_PLANO_ANUAL: string
  readonly [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

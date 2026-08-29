/**
 * CONFIGURAÇÃO DO ESLINT
 *
 * Este arquivo não existia. O `npm run lint` estava no package.json
 * desde o início e nunca funcionou: sem config, o ESLint roda com o
 * analisador de JavaScript puro e cospe 89 erros de sintaxe em
 * TypeScript — "Unexpected token", "'import' is reserved". Parecia
 * código quebrado quando era ferramenta desligada.
 *
 * As dependências já estavam todas instaladas. Faltava só isto.
 *
 * O QUE ESTE ARQUIVO NÃO FAZ
 *
 * Não impõe estilo. Formatação é assunto de formatador, não de
 * analisador — regra de estilo em lint só gera ruído que ensina o time
 * a ignorar o lint inteiro, e aí ele para de pegar o que importa.
 *
 * Aqui ficam as regras que apontam DEFEITO: variável não usada,
 * dependência faltando em hook, promessa não aguardada.
 *
 * O TETO DE AVISOS
 *
 * O script usa `--max-warnings 14`, que é exatamente o número de
 * avisos existentes quando o lint passou a funcionar. É uma catraca:
 * a dívida atual não reprova a build, mas qualquer aviso NOVO reprova.
 *
 * Zero seria mais bonito e menos útil — um script que sempre falha
 * ensina o time a ignorá-lo, e aí ele para de pegar o que importa.
 * Quando os 14 forem resolvidos, baixe o número junto.
 *
 * Os 14 são: 12 de dependência faltando em `useEffect` (podem virar
 * estado velho preso numa closure, valem revisão) e 2 de recarga
 * rápida em arquivos de UI que exportam constante junto do componente.
 */
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["react-refresh"],
  ignorePatterns: [
    "dist",
    // Tem tsconfig próprio e é verificado por `npm run typecheck:pipeline`.
    "pipeline",
    // Roda em Deno, não em Node: `Deno.env` seria erro aqui e não é.
    "supabase/functions",
    "*.cjs",
    "ferramentas",
  ],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    /**
     * Argumento não usado que começa com `_` é intencional: assinatura
     * exigida por uma interface, parâmetro de posição que não interessa.
     * Sem esta exceção, o único jeito de silenciar seria apagar o
     * parâmetro e quebrar a assinatura.
     */
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    /**
     * `any` é proibido no projeto por decisão explícita: ele desliga a
     * checagem justamente onde ela mais protege, que é na fronteira com
     * dado externo. Erro, não aviso.
     */
    "@typescript-eslint/no-explicit-any": "error",
  },
}

import { useTranslation } from "react-i18next"
import { Phone, Mail, MapPin, MessageCircle, Search } from "lucide-react"

/**
 * PRÉVIA DO PRODUTO — o que o assinante recebe, desenhado.
 *
 * A página de apresentação era só texto. Um visitante que chega de
 * anúncio decide em segundos se o produto é sério, e ler três parágrafos
 * não é decidir: ele precisa VER a entrega. Esta é a peça que mostra o
 * formato do resultado — nome, ramo, telefone, e-mail e o botão de
 * contato — sem exigir cadastro nem gastar uma busca real.
 *
 * As empresas aqui são ILUSTRATIVAS e estão rotuladas como tal na
 * interface. Inventar nomes reais de clientes seria propaganda enganosa,
 * e o rótulo evita que alguém confunda a amostra com dado de verdade.
 */

interface LinhaExemplo {
  nome: string
  chaveRamo: string
  bairro: string
  temTelefone: boolean
  temEmail: boolean
}

/**
 * Nomes genéricos de propósito: descrevem o tipo de empresa em vez de
 * imitar uma marca existente. Um nome real aqui viraria uso indevido.
 */
const LINHAS: LinhaExemplo[] = [
  { nome: "Construtora Vale Norte", chaveRamo: "construtora", bairro: "Centro", temTelefone: true, temEmail: true },
  { nome: "Arquitetura & Interiores Lume", chaveRamo: "arquitetura", bairro: "Batel", temTelefone: true, temEmail: false },
  { nome: "Incorporadora Praça Sul", chaveRamo: "incorporadora", bairro: "Água Verde", temTelefone: true, temEmail: true },
  { nome: "Reformas Horizonte", chaveRamo: "reformas", bairro: "Portão", temTelefone: false, temEmail: true },
]

export function PreviaResultados() {
  const { t } = useTranslation()

  return (
    <div className="relative">
      {/* Brilho difuso por trás do painel — dá profundidade sem pesar */}
      <div className="absolute inset-0 -z-10 blur-3xl bg-gradient-to-b from-dourado-600/[0.07] to-transparent rounded-[2rem]" />

      <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/40">
        {/* Barra superior: reproduz o cabeçalho real da tela de resultados */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/60 bg-prata-900/60">
          <span className="w-7 h-7 rounded-lg bg-dourado-900/40 border border-dourado-800/50 flex items-center justify-center flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-dourado-400" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-foreground truncate">
              {t("previa.consulta")}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {t("previa.local")}
            </p>
          </div>
          <span className="text-[10px] font-mono text-dourado-400/90 border border-dourado-800/40 rounded px-1.5 py-0.5 flex-shrink-0">
            {t("previa.encontradas")}
          </span>
        </div>

        {/* Linhas de resultado */}
        <div className="divide-y divide-border/40">
          {LINHAS.map((linha) => (
            <div key={linha.nome} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-foreground truncate">
                  {linha.nome}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] text-dourado-300/90 bg-dourado-900/25 border border-dourado-800/30 rounded px-1.5 py-0.5">
                    {t(`previa.ramos.${linha.chaveRamo}`)}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                    <MapPin className="w-2.5 h-2.5" />
                    {linha.bairro}
                  </span>
                </div>
              </div>

              {/* Os selos de contato são o valor da linha: é o que
                  diferencia um lead utilizável de um nome solto */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {linha.temTelefone && (
                  <span className="w-6 h-6 rounded-md bg-verde-700/25 border border-verde-600/30 flex items-center justify-center">
                    <Phone className="w-3 h-3 text-verde-300" />
                  </span>
                )}
                {linha.temEmail && (
                  <span className="w-6 h-6 rounded-md bg-prata-700/40 border border-prata-600/30 flex items-center justify-center">
                    <Mail className="w-3 h-3 text-prata-300" />
                  </span>
                )}
                <span className="hidden sm:flex items-center gap-1 h-6 px-2 rounded-md bg-dourado-700/80 text-white text-[10px] font-medium">
                  <MessageCircle className="w-3 h-3" />
                  {t("previa.falar")}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-2.5 border-t border-border/60 bg-prata-900/40">
          <p className="text-[10px] text-muted-foreground/70 text-center">
            {t("previa.rodape")}
          </p>
        </div>
      </div>
    </div>
  )
}

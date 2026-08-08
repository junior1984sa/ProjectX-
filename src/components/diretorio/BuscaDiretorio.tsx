import { useState } from "react"
import { Search, MapPin, Loader2, ShieldCheck, Clock, Award, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buscarNoDiretorio } from "@/lib/diretorio"
import { gerarLinkWhatsAppComNumero, gerarLinkWhatsAppSemNumero } from "@/lib/utils"
import { obterPais, type ResultadoBuscaDiretorio } from "@/types/prestador"
import { useAuthStore } from "@/store/useAuthStore"
import { usePreferenciasStore } from "@/store/usePreferenciasStore"
import { useTranslation } from "react-i18next"

export function BuscaDiretorio() {
  const { perfil } = useAuthStore()
  const { t } = useTranslation()
  const paisPreferido = usePreferenciasStore((s) => s.pais)
  const configPais = obterPais(perfil?.pais_foco ?? paisPreferido)
  const [segmento, setSegmento] = useState("")
  const [cidade, setCidade] = useState("")
  const [resultados, setResultados] = useState<ResultadoBuscaDiretorio[]>([])
  const [buscou, setBuscou] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function handleBuscar() {
    setCarregando(true)
    setBuscou(true)
    const lista = await buscarNoDiretorio(segmento, cidade)
    setResultados(lista)
    setCarregando(false)
  }

  function handleContato(resultado: ResultadoBuscaDiretorio) {
    const nomeContatoSolicitante = perfil?.nome_contato ?? "uma empresa interessada"
    const link = resultado.profile.whatsapp
      ? gerarLinkWhatsAppComNumero(
          resultado.profile.whatsapp,
          resultado.profile.nome_empresa,
          nomeContatoSolicitante
        )
      : gerarLinkWhatsAppSemNumero(resultado.profile.nome_empresa, nomeContatoSolicitante)

    window.open(link, "_blank")
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleBuscar()
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("diretorio.titulo")}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("diretorio.subtitulo")}
        </p>
      </div>

      <Card className="border-border/60 mb-6">
        <CardContent className="p-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("diretorio.placeholderSegmento")}
              value={segmento}
              onChange={(e) => setSegmento(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 bg-background/60"
            />
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("diretorio.placeholderCidade", { exemplo: configPais.exemploCidade })}
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 bg-background/60"
            />
          </div>
          <Button
            onClick={handleBuscar}
            disabled={carregando}
            className="bg-gradient-to-r from-dourado-600 to-dourado-500 text-background font-semibold flex-shrink-0"
          >
            {carregando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            {t("diretorio.buscar")}
          </Button>
        </CardContent>
      </Card>

      {carregando ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : buscou && resultados.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">{t("diretorio.nenhumEncontrado")}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {t("diretorio.tenteOutro")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resultados.map((resultado) => (
            <Card key={resultado.profile.id} className="border-border/60 overflow-hidden">
              {resultado.fotos.length > 0 && (
                <div className="h-36 overflow-hidden">
                  <img
                    src={resultado.fotos[0].url_foto}
                    alt={resultado.diretorio.titulo_publico}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-5 space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground text-sm leading-snug">
                      {resultado.diretorio.titulo_publico}
                    </h3>
                    <Badge variant="success" className="text-[10px] flex items-center gap-1 flex-shrink-0">
                      <ShieldCheck className="w-3 h-3" />
                      {t("diretorio.verificado")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {resultado.profile.cidade}, {resultado.profile.estado}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {resultado.diretorio.descricao_completa}
                </p>

                <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  {resultado.diretorio.anos_de_mercado && (
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {t("diretorio.anosDeMercado", { count: resultado.diretorio.anos_de_mercado })}
                    </span>
                  )}
                  {resultado.diretorio.tempo_resposta_estimado && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {resultado.diretorio.tempo_resposta_estimado}
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => handleContato(resultado)}
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  {t("diretorio.entrarEmContato")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

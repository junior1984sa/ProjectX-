import { useState, useEffect } from "react"
import { Building2, MapPin, User, Phone, Mail, Globe, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"
import { UploadPortfolio } from "@/components/perfil/UploadPortfolio"
import { PainelCreditos } from "@/components/perfil/PainelCreditos"
import { CancelarAssinatura } from "@/components/perfil/CancelarAssinatura"
import {
  SEGMENTOS_SUGERIDOS,
  PAISES_DISPONIVEIS,
  temAcessoLiberado,
  obterPais,
  divisoesDoPais,
  rotuloDivisao,
  type DadosPerfilForm,
} from "@/types/prestador"
import { useTranslation } from "react-i18next"
import toast from "react-hot-toast"

interface FormularioPerfilProps {
  onConcluido?: () => void
}

export function FormularioPerfil({ onConcluido }: FormularioPerfilProps) {
  const { perfil, usuarioId, email, criarOuAtualizarPerfil } = useAuthStore()
  const { t } = useTranslation()

  const [form, setForm] = useState<DadosPerfilForm>({
    nome_empresa: "",
    segmento: "",
    cidade: "",
    estado: "",
    endereco_postal: "",
    nome_contato: "",
    whatsapp: "",
    email_contato: email ?? "",
    descricao: "",
    website: "",
    paisFoco: "BR",
  })

  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const [salvando, setSalvando] = useState(false)

  // Preenche o formulário se já existir um perfil (modo edição)
  useEffect(() => {
    if (perfil) {
      setForm({
        nome_empresa: perfil.nome_empresa,
        segmento: perfil.segmento,
        cidade: perfil.cidade,
        estado: perfil.estado,
        endereco_postal: perfil.endereco_postal ?? "",
        nome_contato: perfil.nome_contato,
        whatsapp: perfil.whatsapp,
        email_contato: perfil.email_contato,
        descricao: perfil.descricao ?? "",
        website: perfil.website ?? "",
        paisFoco: perfil.pais_foco ?? "BR",
      })
    }
  }, [perfil])

  function atualizarCampo<K extends keyof DadosPerfilForm>(campo: K, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function formatarWhatsapp(valor: string): string {
    const numeros = valor.replace(/\D/g, "").slice(0, 11)
    if (numeros.length <= 2) return numeros
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
  }

  function validarFormulario(): string | null {
    if (!form.nome_empresa.trim()) return t("perfil.erro.nomeEmpresa")
    if (!form.segmento.trim()) return t("perfil.erro.segmento")
    if (!form.cidade.trim()) return t("perfil.erro.cidade")
    if (!form.estado.trim()) return t("perfil.erro.divisao")
    if (!form.nome_contato.trim()) return t("perfil.erro.nomeContato")
    if (form.whatsapp.replace(/\D/g, "").length < 10) return t("perfil.erro.whatsapp")
    if (!form.email_contato.trim() || !form.email_contato.includes("@")) {
      return t("perfil.erro.email")
    }
    return null
  }

  async function handleSalvar() {
    const erroValidacao = validarFormulario()
    if (erroValidacao) {
      toast.error(erroValidacao)
      return
    }

    setSalvando(true)
    const { erro } = await criarOuAtualizarPerfil(form)
    setSalvando(false)

    if (erro) {
      toast.error(`Erro ao salvar: ${erro}`)
      return
    }

    toast.success(perfil ? t("perfil.ok.atualizado") : t("perfil.ok.criado"))
    onConcluido?.()
  }

  const sugestoesFiltradas = SEGMENTOS_SUGERIDOS.filter(
    (s) => s.toLowerCase().includes(form.segmento.toLowerCase()) && form.segmento.length > 0
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {perfil ? t("perfil.tituloEditar") : t("perfil.tituloCriar")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("perfil.subtitulo")}
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-dourado-400" />
            {t("perfil.dadosEmpresa")}
          </CardTitle>
          <CardDescription>{t("perfil.dadosEmpresaDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nome da empresa */}
          <div className="space-y-2">
            <Label htmlFor="nome_empresa">{t("perfil.nomeEmpresa")}</Label>
            <Input
              id="nome_empresa"
              placeholder={t("perfil.placeholderNomeEmpresa")}
              value={form.nome_empresa}
              onChange={(e) => atualizarCampo("nome_empresa", e.target.value)}
              className="bg-background/60"
            />
          </div>

          {/* Segmento */}
          <div className="space-y-2 relative">
            <Label htmlFor="segmento">Segmento / Ramo de atuação *</Label>
            <Input
              id="segmento"
              placeholder={t("perfil.placeholderSegmento")}
              value={form.segmento}
              onChange={(e) => atualizarCampo("segmento", e.target.value)}
              onFocus={() => setMostrarSugestoes(true)}
              onBlur={() => setTimeout(() => setMostrarSugestoes(false), 150)}
              className="bg-background/60"
            />
            {mostrarSugestoes && sugestoesFiltradas.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                {sugestoesFiltradas.map((sug) => (
                  <button
                    key={sug}
                    className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm transition-colors"
                    onMouseDown={() => atualizarCampo("segmento", sug)}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Vale para qualquer ramo de prestação de serviço: jateamento, pintura industrial,
              aluguel de containers, caminhões, betoneiras, locação de equipamentos, e muito mais.
            </p>
          </div>

          {/* País de foco — define onde a busca procura empresas e, no
              futuro, qual gateway cobra a assinatura. A busca já funciona
              nos quatro países; o que ainda falta em alguns é a cobrança. */}
          <div className="space-y-2">
            <Label>{t("perfil.paisAtuacao")}</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PAISES_DISPONIVEIS.map((pais) => (
                <button
                  key={pais.codigo}
                  type="button"
                  disabled={!pais.buscaDisponivel}
                  onClick={() =>
                    pais.buscaDisponivel && atualizarCampo("paisFoco", pais.codigo)
                  }
                  className={`flex flex-col items-center justify-center py-2.5 rounded-md text-xs font-medium border transition-all ${
                    form.paisFoco === pais.codigo
                      ? "bg-azul-500/15 border-azul-500 text-azul-300"
                      : pais.buscaDisponivel
                      ? "bg-secondary border-transparent text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                      : "bg-secondary/40 border-transparent text-muted-foreground/40 cursor-not-allowed"
                  }`}
                >
                  <span>{pais.nome}</span>
                  {pais.gateway === null && (
                    <span className="text-[9px] opacity-70 mt-0.5">
                      pagamento em breve
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              O WhoHiresYou atende Brasil, Estados Unidos e Reino Unido, cada um
              com preço e moeda próprios. O país escolhido define onde buscamos
              empresas e em que moeda a assinatura é cobrada.
            </p>
          </div>

          {/* Cidade + Estado */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="cidade">{t("perfil.cidade")}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="cidade"
                  placeholder={t("perfil.placeholderCidade", { exemplo: obterPais(form.paisFoco).exemploCidade })}
                  value={form.cidade}
                  onChange={(e) => atualizarCampo("cidade", e.target.value)}
                  className="pl-9 bg-background/60"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">{rotuloDivisao(form.paisFoco)} *</Label>
              <select
                id="estado"
                value={form.estado}
                onChange={(e) => atualizarCampo("estado", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">--</option>
                {divisoesDoPais(form.paisFoco).map((divisao) => (
                  <option key={divisao} value={divisao}>{divisao}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Endereço postal — exigência legal, não capricho de cadastro */}
          <div className="space-y-2">
            <Label htmlFor="endereco_postal">Endereço postal completo</Label>
            <Input
              id="endereco_postal"
              value={form.endereco_postal}
              onChange={(e) => atualizarCampo("endereco_postal", e.target.value)}
              placeholder="Rua, número, complemento, bairro, CEP"
            />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Sai no rodapé dos e-mails que você dispara. É{" "}
              <strong className="text-foreground/80">obrigatório por lei</strong>{" "}
              para enviar a empresas nos Estados Unidos — sem ele o disparo
              para lá fica bloqueado. Para envio só dentro do Brasil, é
              opcional.
            </p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">{t("perfil.descricao")}</Label>
            <Textarea
              id="descricao"
              placeholder={t("perfil.placeholderDescricao")}
              value={form.descricao}
              onChange={(e) => atualizarCampo("descricao", e.target.value)}
              className="bg-background/60 min-h-[90px]"
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website (opcional)</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="website"
                placeholder={t("perfil.placeholderWebsite")}
                value={form.website}
                onChange={(e) => atualizarCampo("website", e.target.value)}
                className="pl-9 bg-background/60"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de contato */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-green-400" />
            {t("perfil.contato")}
          </CardTitle>
          <CardDescription>{t("perfil.contatoDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome_contato">{t("perfil.nomeResponsavel")}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="nome_contato"
                placeholder={t("perfil.placeholderResponsavel")}
                value={form.nome_contato}
                onChange={(e) => atualizarCampo("nome_contato", e.target.value)}
                className="pl-9 bg-background/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  placeholder="(00) 00000-0000"
                  value={form.whatsapp}
                  onChange={(e) => atualizarCampo("whatsapp", formatarWhatsapp(e.target.value))}
                  className="pl-9 bg-background/60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_contato">E-mail de contato *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email_contato"
                  type="email"
                  placeholder={t("perfil.placeholderEmailContato")}
                  value={form.email_contato}
                  onChange={(e) => atualizarCampo("email_contato", e.target.value)}
                  className="pl-9 bg-background/60"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Painel de créditos e cancelamento — para assinantes ativos ou em trial */}
      {perfil && temAcessoLiberado(perfil) && (
        <>
          {perfil.status_assinatura === "trial" && (
            <div className="rounded-lg bg-dourado-900/15 border border-dourado-800/40 p-4 flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-dourado-300">
                🎁 {t("perfil.avisoTrial")}
              </p>
              <CancelarAssinatura />
            </div>
          )}
          <PainelCreditos />
          {perfil.status_assinatura === "ativa" && (
            <div className="flex justify-end">
              <CancelarAssinatura />
            </div>
          )}
        </>
      )}

      {/* Card de upload — só aparece se o perfil já existir (precisa de profile_id) */}
      {perfil && usuarioId && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              {t("perfil.portfolio")}
            </CardTitle>
            <CardDescription>{t("perfil.portfolioDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <UploadPortfolio profileId={usuarioId} />
          </CardContent>
        </Card>
      )}

      {!perfil && (
        <div className="rounded-lg bg-dourado-900/20 border border-dourado-800/40 p-4">
          <p className="text-sm text-dourado-300">
            💡 {t("perfil.avisoDepoisDeSalvar")}
          </p>
        </div>
      )}

      <Button
        onClick={handleSalvar}
        disabled={salvando}
        size="lg"
        className="w-full"
      >
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {perfil ? t("perfil.salvarAlteracoes") : t("perfil.salvarContinuar")}
      </Button>
    </div>
  )
}

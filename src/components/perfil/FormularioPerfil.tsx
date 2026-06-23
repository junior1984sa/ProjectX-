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
import { SEGMENTOS_SUGERIDOS, PAISES_DISPONIVEIS, temAcessoLiberado, type DadosPerfilForm } from "@/types/prestador"
import toast from "react-hot-toast"

interface FormularioPerfilProps {
  onConcluido?: () => void
}

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
]

export function FormularioPerfil({ onConcluido }: FormularioPerfilProps) {
  const { perfil, usuarioId, email, criarOuAtualizarPerfil } = useAuthStore()

  const [form, setForm] = useState<DadosPerfilForm>({
    nome_empresa: "",
    segmento: "",
    cidade: "",
    estado: "",
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
    if (!form.nome_empresa.trim()) return "Informe o nome da empresa."
    if (!form.segmento.trim()) return "Informe o segmento de atuação."
    if (!form.cidade.trim()) return "Informe a cidade."
    if (!form.estado.trim()) return "Selecione o estado."
    if (!form.nome_contato.trim()) return "Informe o nome do responsável pelo contato."
    if (form.whatsapp.replace(/\D/g, "").length < 10) return "Informe um WhatsApp válido com DDD."
    if (!form.email_contato.trim() || !form.email_contato.includes("@")) {
      return "Informe um e-mail de contato válido."
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

    toast.success(perfil ? "Perfil atualizado!" : "Perfil criado! Agora escolha seu plano.")
    onConcluido?.()
  }

  const sugestoesFiltradas = SEGMENTOS_SUGERIDOS.filter(
    (s) => s.toLowerCase().includes(form.segmento.toLowerCase()) && form.segmento.length > 0
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {perfil ? "Editar perfil da empresa" : "Cadastre sua empresa"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Essas informações são o que conecta você às empresas que estão, agora,
          procurando o serviço que você presta — não é só um perfil, é a sua porta de entrada.
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-dourado-400" />
            Dados da empresa
          </CardTitle>
          <CardDescription>Informações principais do seu negócio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nome da empresa */}
          <div className="space-y-2">
            <Label htmlFor="nome_empresa">Nome da empresa *</Label>
            <Input
              id="nome_empresa"
              placeholder="Ex: Jateamento Industrial Santos Ltda"
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
              placeholder="Ex: Jateamento abrasivo, pintura industrial..."
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

          {/* País de foco — preparado para expansão internacional futura */}
          <div className="space-y-2">
            <Label>País de atuação</Label>
            <div className="grid grid-cols-3 gap-2">
              {PAISES_DISPONIVEIS.map((pais) => (
                <button
                  key={pais.codigo}
                  type="button"
                  disabled={!pais.disponivel}
                  onClick={() => pais.disponivel && atualizarCampo("paisFoco", pais.codigo)}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-md text-xs font-medium border transition-all ${
                    form.paisFoco === pais.codigo
                      ? "bg-dourado-900/30 border-dourado-600 text-dourado-300"
                      : pais.disponivel
                      ? "bg-secondary border-transparent text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                      : "bg-secondary/40 border-transparent text-muted-foreground/40 cursor-not-allowed"
                  }`}
                >
                  <span>{pais.nome}</span>
                  {!pais.disponivel && (
                    <span className="text-[9px] opacity-70 mt-0.5">em breve</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Por enquanto, o ProspectX atua no Brasil. Em breve, expansão para outros países
              com preços e moeda locais.
            </p>
          </div>

          {/* Cidade + Estado */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="cidade">Cidade *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="cidade"
                  placeholder="Ex: Biguaçu"
                  value={form.cidade}
                  onChange={(e) => atualizarCampo("cidade", e.target.value)}
                  className="pl-9 bg-background/60"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">UF *</Label>
              <select
                id="estado"
                value={form.estado}
                onChange={(e) => atualizarCampo("estado", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">--</option>
                {ESTADOS_BR.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição do serviço (opcional)</Label>
            <Textarea
              id="descricao"
              placeholder="Conte um pouco sobre sua empresa, diferenciais, área de atendimento..."
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
                placeholder="www.suaempresa.com.br"
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
            Informações de contato
          </CardTitle>
          <CardDescription>
            Como as empresas interessadas vão falar com você
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome_contato">Nome do responsável *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="nome_contato"
                placeholder="Ex: Antônio Silva"
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
                  placeholder="contato@suaempresa.com"
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
                🎁 Você está no período de teste gratuito. A primeira cobrança ocorre
                automaticamente ao final do período, salvo cancelamento.
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
              Portfólio e materiais
            </CardTitle>
            <CardDescription>
              Envie seu portfólio, proposta comercial ou panfleto para apresentar seu trabalho.
              O arquivo mais recente é usado automaticamente quando você disparar mensagens para os leads.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadPortfolio profileId={usuarioId} />
          </CardContent>
        </Card>
      )}

      {!perfil && (
        <div className="rounded-lg bg-dourado-900/20 border border-dourado-800/40 p-4">
          <p className="text-sm text-dourado-300">
            💡 Depois de salvar os dados acima, você poderá enviar seu portfólio, proposta ou
            panfleto nesta mesma tela.
          </p>
        </div>
      )}

      <Button
        onClick={handleSalvar}
        disabled={salvando}
        size="lg"
        className="w-full bg-gradient-to-r from-dourado-600 to-dourado-700 hover:from-dourado-700 hover:to-dourado-800 text-white font-semibold"
      >
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {perfil ? "Salvar alterações" : "Salvar e continuar"}
      </Button>
    </div>
  )
}

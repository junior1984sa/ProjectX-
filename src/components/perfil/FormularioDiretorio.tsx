import { useState, useEffect, useRef } from "react"
import { Sparkles, Loader2, Eye, EyeOff, ImageIcon, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/useAuthStore"
import {
  carregarPerfilDiretorio,
  salvarPerfilDiretorio,
  definirPublicacaoDiretorio,
  enviarImagemCapa,
} from "@/lib/diretorio"
import { GaleriaFotosTrabalhos } from "@/components/perfil/GaleriaFotosTrabalhos"
import { temAcessoLiberado, type DadosPerfilDiretorioForm, type PerfilDiretorio } from "@/types/prestador"
import toast from "react-hot-toast"

const FORM_VAZIO: DadosPerfilDiretorioForm = {
  titulo_publico: "",
  descricao_completa: "",
  area_atendimento: "",
  anos_de_mercado: "",
  certificacoes: "",
  tempo_resposta_estimado: "",
}

export function FormularioDiretorio() {
  const { usuarioId, perfil } = useAuthStore()
  const [perfilDiretorio, setPerfilDiretorio] = useState<PerfilDiretorio | null>(null)
  const [form, setForm] = useState<DadosPerfilDiretorioForm>(FORM_VAZIO)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [alternandoPublicacao, setAlternandoPublicacao] = useState(false)
  const [enviandoCapa, setEnviandoCapa] = useState(false)
  const inputCapaRef = useRef<HTMLInputElement>(null)

  const acessoLiberado = temAcessoLiberado(perfil)

  useEffect(() => {
    if (!usuarioId) return
    carregarPerfilDiretorio(usuarioId).then((dados) => {
      if (dados) {
        setPerfilDiretorio(dados)
        setForm({
          titulo_publico: dados.titulo_publico,
          descricao_completa: dados.descricao_completa,
          area_atendimento: dados.area_atendimento ?? "",
          anos_de_mercado: dados.anos_de_mercado?.toString() ?? "",
          certificacoes: dados.certificacoes ?? "",
          tempo_resposta_estimado: dados.tempo_resposta_estimado ?? "",
        })
      }
      setCarregando(false)
    })
  }, [usuarioId])

  function atualizarCampo<K extends keyof DadosPerfilDiretorioForm>(campo: K, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function validar(): string | null {
    if (!form.titulo_publico.trim()) return "Informe um título público para o seu perfil."
    if (!form.descricao_completa.trim() || form.descricao_completa.trim().length < 30) {
      return "Escreva uma descrição com pelo menos 30 caracteres — é o que convence quem está buscando."
    }
    return null
  }

  async function handleEnviarCapa(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo || !usuarioId) return

    setEnviandoCapa(true)
    const { url, erro } = await enviarImagemCapa(usuarioId, arquivo)
    setEnviandoCapa(false)

    if (erro) {
      toast.error(erro)
      return
    }

    if (url) {
      setPerfilDiretorio((prev) => (prev ? { ...prev, logo_url: url } : prev))
      toast.success("Imagem de capa atualizada!")
    }

    if (inputCapaRef.current) inputCapaRef.current.value = ""
  }

  async function handleSalvar() {
    if (!usuarioId) return

    const erroValidacao = validar()
    if (erroValidacao) {
      toast.error(erroValidacao)
      return
    }

    setSalvando(true)
    const { erro } = await salvarPerfilDiretorio(usuarioId, form, !!perfilDiretorio)
    setSalvando(false)

    if (erro) {
      toast.error(`Erro ao salvar: ${erro}`)
      return
    }

    toast.success("Perfil do diretório salvo!")
    const atualizado = await carregarPerfilDiretorio(usuarioId)
    setPerfilDiretorio(atualizado)
  }

  async function handleAlternarPublicacao() {
    if (!usuarioId || !perfilDiretorio) return

    if (!acessoLiberado) {
      toast.error("Assine um plano para publicar seu perfil no diretório.")
      return
    }

    setAlternandoPublicacao(true)
    const { erro } = await definirPublicacaoDiretorio(usuarioId, !perfilDiretorio.publicado)
    setAlternandoPublicacao(false)

    if (erro) {
      toast.error("Erro ao atualizar publicação.")
      return
    }

    setPerfilDiretorio((prev) => (prev ? { ...prev, publicado: !prev.publicado } : prev))
    toast.success(
      perfilDiretorio.publicado
        ? "Perfil removido do diretório."
        : "Perfil publicado! Agora você pode ser encontrado diretamente."
    )
  }

  if (carregando) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-dourado-900/15 border border-dourado-800/40 p-4">
        <p className="text-sm text-dourado-300 flex items-start gap-2">
          <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Esse perfil é o que outras empresas veem quando buscam um prestador como você
            diretamente no diretório — diferente do perfil de prospecção, aqui você pode
            ser mais detalhado e persuasivo.
          </span>
        </p>
      </div>

      {perfilDiretorio && (
        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {perfilDiretorio.publicado ? (
                <Badge variant="success" className="text-xs flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Publicado no diretório
                </Badge>
              ) : (
                <Badge variant="muted" className="text-xs flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />
                  Não publicado
                </Badge>
              )}
              {!acessoLiberado && (
                <span className="text-xs text-muted-foreground">
                  Assine um plano para publicar
                </span>
              )}
            </div>
            <Button
              size="sm"
              variant={perfilDiretorio.publicado ? "outline" : "default"}
              onClick={handleAlternarPublicacao}
              disabled={alternandoPublicacao || !acessoLiberado}
              className={!perfilDiretorio.publicado ? "bg-dourado-600 hover:bg-dourado-700 text-background" : ""}
            >
              {alternandoPublicacao ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : perfilDiretorio.publicado ? (
                "Remover do diretório"
              ) : (
                "Publicar no diretório"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Apresentação pública</CardTitle>
          <CardDescription>O que aparece em destaque no seu perfil do diretório</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Imagem de capa/destaque — também usada no carrossel da página inicial */}
          <div className="space-y-2">
            <Label>Imagem de capa/destaque</Label>
            <div className="flex items-center gap-3">
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-border bg-secondary/40 flex-shrink-0 flex items-center justify-center">
                {perfilDiretorio?.logo_url ? (
                  <img src={perfilDiretorio.logo_url} alt="Capa" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inputCapaRef.current?.click()}
                  disabled={enviandoCapa || !perfilDiretorio}
                >
                  {enviandoCapa ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  {perfilDiretorio?.logo_url ? "Trocar imagem" : "Enviar imagem"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Essa imagem também pode aparecer no carrossel de destaque da página inicial.
                  {!perfilDiretorio && " Salve o perfil primeiro para liberar o envio."}
                </p>
              </div>
            </div>
            <input
              ref={inputCapaRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleEnviarCapa}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label>Título público *</Label>
            <Input
              placeholder="Ex: Jateamento Industrial Santos — Especialistas em Estruturas Metálicas"
              value={form.titulo_publico}
              onChange={(e) => atualizarCampo("titulo_publico", e.target.value)}
              className="bg-background/60"
            />
            <p className="text-xs text-muted-foreground">
              Mais persuasivo que o nome simples — destaque sua especialidade.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Descrição completa *</Label>
            <Textarea
              placeholder="Conte sua história, diferenciais, tipos de projeto que já realizou..."
              value={form.descricao_completa}
              onChange={(e) => atualizarCampo("descricao_completa", e.target.value)}
              className="bg-background/60 min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Área de atendimento</Label>
            <Input
              placeholder="Ex: Grande Florianópolis e litoral de SC"
              value={form.area_atendimento}
              onChange={(e) => atualizarCampo("area_atendimento", e.target.value)}
              className="bg-background/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Anos de mercado</Label>
              <Input
                type="number"
                placeholder="Ex: 12"
                value={form.anos_de_mercado}
                onChange={(e) => atualizarCampo("anos_de_mercado", e.target.value)}
                className="bg-background/60"
              />
            </div>
            <div className="space-y-2">
              <Label>Tempo médio de resposta</Label>
              <Input
                placeholder="Ex: Responde em até 2 horas"
                value={form.tempo_resposta_estimado}
                onChange={(e) => atualizarCampo("tempo_resposta_estimado", e.target.value)}
                className="bg-background/60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Certificações e registros (opcional)</Label>
            <Textarea
              placeholder="Ex: ISO 9001, CREA ativo, NR-35..."
              value={form.certificacoes}
              onChange={(e) => atualizarCampo("certificacoes", e.target.value)}
              className="bg-background/60 min-h-[70px]"
            />
          </div>
        </CardContent>
      </Card>

      {perfilDiretorio && usuarioId && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-dourado-400" />
              Fotos de trabalhos realizados
            </CardTitle>
            <CardDescription>
              Prova visual do seu trabalho — quem está buscando confia mais ao ver fotos reais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GaleriaFotosTrabalhos profileId={usuarioId} />
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleSalvar}
        disabled={salvando}
        className="w-full bg-gradient-to-r from-dourado-600 to-dourado-500 text-background font-semibold"
      >
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {perfilDiretorio ? "Salvar alterações" : "Criar perfil do diretório"}
      </Button>
    </div>
  )
}

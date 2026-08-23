import { useState } from "react"
import { MessageCircle, Mail, ChevronDown, HelpCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"
import { useTranslation } from "react-i18next"
import toast from "react-hot-toast"

/** Só as chaves: o texto vive nas traduções, em pt/en/es. */
const CHAVES_FAQ = ["1", "2", "3", "4", "5", "6"]

function ItemFAQ({ chave }: { chave: string }) {
  const { t } = useTranslation()
  const [aberto, setAberto] = useState(false)

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <span className="text-sm font-medium text-foreground">{t(`sac.faq.p${chave}`)}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${aberto ? "rotate-180" : ""}`}
        />
      </button>
      {aberto && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
          {t(`sac.faq.r${chave}`)}
        </div>
      )}
    </div>
  )
}

export function PaginaSAC() {
  const { email } = useAuthStore()
  const { t } = useTranslation()
  const [nome, setNome] = useState("")
  const [emailContato, setEmailContato] = useState(email ?? "")
  const [assunto, setAssunto] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [enviando, setEnviando] = useState(false)

  // [PREENCHER] Trocar assim que o domínio for registrado. O endereço
  // antigo apontava para prospectx.com.br, que nunca foi nosso — o nome
  // pertence a outra empresa. Deixar um e-mail que não existe é pior que
  // deixar visível que ele está pendente.
  const emailSuporte = "[PREENCHER: e-mail de suporte no domínio novo]"
  const whatsappSuporte = "5548999999999" // TODO: substituir pelo número real de suporte

  function handleEnviarWhatsApp() {
    const texto = encodeURIComponent(
      `Olá! Preciso de ajuda com o WhoHiresYou.\n\nNome: ${nome || "(não informado)"}\nAssunto: ${assunto || "(não informado)"}\n\n${mensagem || ""}`
    )
    window.open(`https://wa.me/${whatsappSuporte}?text=${texto}`, "_blank")
  }

  function handleEnviarEmail() {
    if (!nome.trim() || !mensagem.trim()) {
      toast.error(t("sac.erroPreencha"))
      return
    }

    setEnviando(true)
    const corpo = encodeURIComponent(
      `Nome: ${nome}\nE-mail para retorno: ${emailContato}\n\n${mensagem}`
    )
    const linkMailto = `mailto:${emailSuporte}?subject=${encodeURIComponent(
      assunto || t("sac.assuntoPadrao")
    )}&body=${corpo}`

    window.location.href = linkMailto
    setEnviando(false)
    toast.success(t("sac.abrindoEmail"))
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-dourado-400" />
          {t("sac.titulo")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("sac.subtitulo")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-green-800/40 bg-green-950/10">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">WhatsApp</p>
              <p className="text-xs text-muted-foreground">{t("sac.respostaRapida")}</p>
            </div>
            <Button
              size="sm"
              onClick={handleEnviarWhatsApp}
              className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
            >
              {t("sac.abrirChat")}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{t("sac.email")}</p>
              <p className="text-xs text-muted-foreground">{emailSuporte}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
          {t("sac.perguntasFrequentes")}
        </h2>
        <div className="space-y-2">
          {CHAVES_FAQ.map((chave) => (
            <ItemFAQ key={chave} chave={chave} />
          ))}
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            {t("sac.aindaPrecisaAjuda")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("sac.seuNome")}</Label>
              <Input
                placeholder={t("sac.placeholderNome")}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-background/60"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail para retorno</Label>
              <Input
                type="email"
                placeholder={t("sac.placeholderEmail")}
                value={emailContato}
                onChange={(e) => setEmailContato(e.target.value)}
                className="bg-background/60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assunto</Label>
            <Input
              placeholder={t("sac.placeholderAssunto")}
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              className="bg-background/60"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("sac.mensagem")}</Label>
            <Textarea
              placeholder={t("sac.placeholderMensagem")}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="bg-background/60 min-h-[120px]"
            />
          </div>

          <Button
            onClick={handleEnviarEmail}
            disabled={enviando}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {t("sac.enviarMensagem")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

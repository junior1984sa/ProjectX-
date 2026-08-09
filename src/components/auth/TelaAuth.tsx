import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAuthStore } from "@/store/useAuthStore"
import toast from "react-hot-toast"

interface TelaAuthProps {
  onSucesso?: () => void
}

export function TelaAuth({ onSucesso }: TelaAuthProps) {
  const { entrar, cadastrar } = useAuthStore()
  const { t } = useTranslation()

  const [aba, setAba] = useState<"entrar" | "cadastrar">("cadastrar")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function handleEntrar() {
    if (!email.trim() || !senha.trim()) {
      toast.error(t("auth.erro.preenchaCampos"))
      return
    }

    setCarregando(true)
    const { erro } = await entrar(email.trim(), senha)
    setCarregando(false)

    if (erro) {
      toast.error(erro)
      return
    }

    toast.success(t("auth.ok.login"))
    onSucesso?.()
  }

  async function handleCadastrar() {
    if (!email.trim() || !senha.trim()) {
      toast.error(t("auth.erro.preenchaCampos"))
      return
    }
    if (senha.length < 6) {
      toast.error(t("auth.erro.senhaCurta"))
      return
    }
    if (senha !== confirmarSenha) {
      toast.error(t("auth.erro.senhasDiferentes"))
      return
    }

    setCarregando(true)
    const { erro } = await cadastrar(email.trim(), senha)
    setCarregando(false)

    if (erro) {
      toast.error(erro)
      return
    }

    toast.success(t("auth.ok.contaCriada"))
    onSucesso?.()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Enter") return
    if (aba === "entrar") handleEntrar()
    else handleCadastrar()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 text-center animate-fadeIn">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img
            src="/logo-x.png"
            alt="ProjectX"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Prospect<span className="text-dourado-400">X</span>
          </h1>
        </div>
        <p className="text-muted-foreground max-w-sm mx-auto">
          {t("auth.chamada")}
        </p>
      </div>

      <Card className="w-full max-w-md border-border/60 shadow-2xl shadow-black/30 animate-fadeIn">
        <CardContent className="p-6 md:p-8">
          <Tabs value={aba} onValueChange={(v) => setAba(v as "entrar" | "cadastrar")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="cadastrar">{t("auth.criarConta")}</TabsTrigger>
              <TabsTrigger value="entrar">{t("auth.jaTenhoConta")}</TabsTrigger>
            </TabsList>

            {/* Campos comuns às duas abas */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-muted-foreground">
                  {t("auth.email")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.placeholderEmail")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-9 h-11 bg-background/60"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha" className="text-sm text-muted-foreground">
                  {t("auth.senha")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-9 pr-10 h-11 bg-background/60"
                    autoComplete={aba === "entrar" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <TabsContent value="cadastrar" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="confirmar-senha" className="text-sm text-muted-foreground">
                    {t("auth.confirmarSenha")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmar-senha"
                      type={mostrarSenha ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="pl-9 h-11 bg-background/60"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCadastrar}
                  disabled={carregando}
                  size="lg"
                  className="w-full"
                >
                  {carregando ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {t("auth.criarMinhaConta")}
                </Button>
              </TabsContent>

              <TabsContent value="entrar" className="mt-0">
                <Button
                  onClick={handleEntrar}
                  disabled={carregando}
                  size="lg"
                  className="w-full"
                >
                  {carregando ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {t("auth.entrar")}
                </Button>
              </TabsContent>
            </div>
          </Tabs>

          <p className="text-xs text-muted-foreground text-center mt-6">
            {t("auth.termos")}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

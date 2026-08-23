import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import toast from "react-hot-toast"
import { useAppStore } from "@/store/useAppStore"
import { useAuthStore } from "@/store/useAuthStore"
import { usePreferenciasStore } from "@/store/usePreferenciasStore"
import { useCreditosStore } from "@/store/useCreditosStore"
import {
  FAIXAS_CREDITO,
  temAcessoLiberado,
  obterSegmentosClientesComFallback,
  type ModoBusca,
} from "@/types/prestador"
import { type ParametrosBusca } from "@/types/empresa"

/**
 * EXECUÇÃO DA BUSCA — uma implementação só, usada por duas telas.
 *
 * A página inicial e a tela de busca disparam a mesma operação, mas com
 * enquadramentos diferentes: a home pede só ramo e cidade, a tela de
 * busca deixa escolher raio e tamanho. Duplicar o fluxo em dois lugares
 * significaria manter em dois lugares o débito de créditos, o teto
 * diário, a busca de demonstração e o mapeamento por IA — e é
 * exatamente o tipo de código que passa a divergir em silêncio.
 *
 * Por isso a lógica mora aqui, e cada tela só decide os parâmetros.
 */

export interface ParametrosExecucao {
  segmento: string
  cidade: string
  raioKm: number
  /** Índice em FAIXAS_CREDITO — define quantas empresas e quanto custa */
  faixaSelecionada: number
  modoBusca: ModoBusca
}

export function useExecutarBusca() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { buscarEmpresas, carregando } = useAppStore()
  const { usuarioId, perfil } = useAuthStore()
  const paisPreferido = usePreferenciasStore((s) => s.pais)
  const { consumirCreditos } = useCreditosStore()

  const [buscandoMapeamento, setBuscandoMapeamento] = useState(false)

  const paisDaBusca = perfil?.pais_foco ?? paisPreferido
  const temAcesso = temAcessoLiberado(perfil)

  async function executarBusca({
    segmento,
    cidade,
    raioKm,
    faixaSelecionada,
    modoBusca,
  }: ParametrosExecucao): Promise<void> {
    if (!segmento.trim()) {
      toast.error(t("busca.erro.informeRamo"))
      return
    }
    if (!cidade.trim()) {
      toast.error(t("busca.erro.informeCidade"))
      return
    }

    // Extrai cidade e estado do campo (ex: "São Paulo, SP")
    // Aceita "Cidade", "Cidade, UF" e "Bairro, Cidade, UF".
    //
    // Com três partes assume que a primeira é bairro: em cidade grande
    // é o que faz a busca render, porque leads a 40 km do prestador não
    // são visitados. Com duas, mantém o formato antigo — quem já usava
    // "São Paulo, SP" não vê diferença.
    const partes = cidade.split(",").map((p) => p.trim()).filter(Boolean)
    const temBairro = partes.length >= 3
    const bairro = temBairro ? partes[0] : ""
    const nomeCidade = temBairro ? partes[1] : partes[0] ?? ""
    const estado = temBairro ? partes[2] : partes[1] ?? ""

    // No modo "clientes potenciais", traduz o segmento do prestador
    // para os segmentos que tipicamente CONTRATAM esse serviço — usa
    // a tabela fixa primeiro e, se não achar, recorre à inferência por IA.
    let segmentosBusca: string[] | undefined
    if (modoBusca === "clientes") {
      setBuscandoMapeamento(true)
      const { segmentos, fonte } = await obterSegmentosClientesComFallback(segmento.trim())
      setBuscandoMapeamento(false)

      if (segmentos.length === 0) {
        toast.error(t("busca.erro.semClientesPotenciais"))
        return
      }
      if (fonte === "ia") {
        toast.success(t("busca.ok.iaIdentificou"))
      }
      segmentosBusca = segmentos
    }

    // Visitante sem login: libera uma busca de demonstração, sem gastar
    // créditos, para que a pessoa sinta a ferramenta antes de criar conta.
    // O tamanho fica fixo em 10 empresas e fica marcado como "demo" na sessão.
    if (!usuarioId) {
      if (sessionStorage.getItem("whohiresyou_demo_usado")) {
        toast.error(t("busca.erro.demoUsada"))
        navigate("/entrar")
        return
      }

      const params: ParametrosBusca = {
        segmento: segmento.trim(),
        cidade: nomeCidade,
        estado,
        raioKm,
        quantidadeDesejada: 10,
        segmentosBusca,
        pais: paisDaBusca,
        bairro,
        // Único ponto do sistema que autoriza empresas de exemplo: o
        // visitante não gastou crédito e a tela marca o resultado como
        // simulado.
        permitirSimulado: true,
        timestamp: new Date(),
      }

      sessionStorage.setItem("whohiresyou_demo_usado", "true")
      toast.success(t("busca.ok.demonstracao"))
      await buscarEmpresas(params)
      return
    }

    if (!temAcesso) {
      toast.error(t("busca.erro.assineParaLiberar"))
      navigate(perfil ? "/planos" : "/perfil")
      return
    }

    const faixa = FAIXAS_CREDITO[faixaSelecionada]

    // Verifica e debita créditos de forma atômica no banco antes de gerar a busca
    const resultado = await consumirCreditos({
      quantidadeEmpresas: faixa.max,
      segmento: segmento.trim(),
      cidade: nomeCidade,
      estado,
      raioKm,
      pais: paisDaBusca,
    })

    if (!resultado.sucesso) {
      // Duas recusas bem diferentes: sem saldo pede recarga; teto do
      // dia significa que o saldo existe e só precisa voltar amanhã.
      // Dar a mensagem errada aqui faria o cliente achar que acabou.
      // Três recusas bem diferentes. Dar a mensagem errada aqui faz o
      // cliente achar que acabou o crédito quando o caso é outro.
      if (resultado.motivo === "restricao_exportacao") {
        toast.error(t("busca.erro.restricaoExportacao"))
        return
      }
      toast.error(
        resultado.motivo === "limite_diario"
          ? t("busca.erro.limiteDiario", { restantes: resultado.creditos_restantes })
          : t("busca.erro.creditosInsuficientes", {
              custo: resultado.custo,
              saldo: resultado.creditos_restantes,
            })
      )
      return
    }

    const params: ParametrosBusca = {
      segmento: segmento.trim(),
      cidade: nomeCidade,
      estado,
      raioKm,
      quantidadeDesejada: faixa.max,
      segmentosBusca,
      pais: paisDaBusca,
      bairro,
      timestamp: new Date(),
    }

    toast.success(
      t("busca.ok.creditosUsados", {
        custo: resultado.custo,
        saldo: resultado.creditos_restantes,
      })
    )
    await buscarEmpresas(params)
  }

  return { executarBusca, buscandoMapeamento, carregando }
}

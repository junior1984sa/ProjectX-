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
  const { podeBuscar, cobrarPelaEntrega } = useCreditosStore()

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

    // ── 1. A BUSCA NÃO CUSTA MAIS NADA ────────────────────────
    //
    // Antes o crédito era debitado aqui, pela quantidade PEDIDA. A
    // medição do Reino Unido mostrou que só cerca de 10% das empresas
    // chegam com contato utilizável — cobrar por 40 e entregar 4 é a
    // conta que destrói confiança.
    //
    // Agora esta chamada só PERGUNTA se pode buscar. Ela não debita.
    const permissao = await podeBuscar(paisDaBusca)

    if (!permissao.pode) {
      // Três recusas bem diferentes. Dar a mensagem errada aqui faz o
      // cliente achar que acabou o crédito quando o caso é outro.
      if (permissao.motivo === "restricao_exportacao") {
        toast.error(t("busca.erro.restricaoExportacao"))
        return
      }
      toast.error(
        permissao.motivo === "limite_diario"
          ? t("busca.erro.limiteDiario", { restantes: permissao.restante_hoje })
          : t("busca.erro.semCreditos")
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

    const empresas = await buscarEmpresas(params)

    // ── 2. COBRA PELO QUE VEIO ────────────────────────────────
    //
    // Um crédito por contato entregue. Empresa sem telefone e sem
    // e-mail não é contato: é nome numa lista, e o cliente já vê isso
    // de graça. Busca que não achou nada não custa nada.
    const comContato = (empresas ?? []).filter((e) => e.telefone || e.email).length

    const cobranca = await cobrarPelaEntrega({
      contatosEntregues: comContato,
      segmento: segmento.trim(),
      cidade: nomeCidade,
      estado,
      raioKm,
      pais: paisDaBusca,
    })

    if (cobranca.cobrados > 0) {
      toast.success(
        t("busca.ok.contatosEntregues", {
          contatos: cobranca.cobrados,
          saldo: cobranca.saldo_creditos,
        })
      )
    } else {
      // Dizer isto em voz alta importa: o cliente precisa saber que a
      // busca fraca não custou nada, senão ele conta a busca como
      // desperdício de crédito e desconta da confiança.
      toast(t("busca.ok.semContatoSemCusto"))
    }
  }

  return { executarBusca, buscandoMapeamento, carregando }
}

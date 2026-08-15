# Análise dos três documentos estratégicos

**Documentos analisados:**
- `Relatório estratégico: plataforma global de prospecção direta B2B` (12 páginas)
- `Especificação de produto — Plataforma global de prospecção B2B` ("B2B Connect", 12 páginas)
- `MASTER_PROMPT_B2B_PROSPECCAO_GLOBAL.md` (blueprint de 43 seções)

**Data:** 15 de agosto de 2026

---

## 1. Onde os três concordam — e estão certos

Os documentos convergem num diagnóstico que a ProspectX precisa aceitar:

**Competir por tamanho de base é uma guerra perdida.** Apollo, ZoomInfo, Cognism e People Data Labs têm bases construídas ao longo de anos, com times de dados e contratos com dezenas de fornecedores. Uma operação de uma pessoa não alcança isso — e não precisa.

**A diferenciação tem que vir da inferência, não do volume.** Os três documentos, cada um do seu jeito, dizem a mesma coisa: o valor não está em *quantos* contatos você tem, está em *saber qual deles importa e por quê*.

Isso é uma boa notícia, porque é exatamente onde a ProspectX já tem algo que ninguém tem.

---

## 2. Onde eu discordo — a recomendação de virar marketplace

Os dois PDFs recomendam transformar o produto numa **plataforma bilateral**: o comprador publica uma necessidade, fornecedores qualificados respondem. É o modelo do Alibaba RFQ aplicado a serviços.

O raciocínio é bom e o diagnóstico é correto. **A recomendação, no nosso contexto, é errada.** Três motivos:

### 2.1 O próprio relatório aponta o problema fatal

> *"O maior risco do produto não é técnico; é o problema de marketplace vazio."*

Marketplace de dois lados só funciona com liquidez: sem compradores publicando, nenhum fornecedor assina; sem fornecedores respondendo, nenhum comprador publica. O relatório reconhece isso e propõe a solução padrão — **recrutar manualmente os primeiros dos dois lados**.

Recrutamento manual bilateral é uma operação de vendas em tempo integral, para duas populações diferentes, provavelmente em dois países. A ProspectX é operada por uma pessoa, que não é vendedor de formação e tem zero assinantes. Esse plano não é ambicioso demais; é de outra empresa.

### 2.2 Joga fora o único ativo que já existe

O mapa de 1.187 pares "quem contrata quem" custou trabalho e não existe em nenhum concorrente listado nos documentos. Num marketplace ele fica **inútil**: se o comprador declara o que precisa, ninguém precisa inferir quem contrataria o quê.

Trocar um ativo pronto por um problema de galinha e ovo é o pior negócio disponível.

### 2.3 O produto atual está a uma correção da tese; o marketplace está a um ano

O que falta hoje na ProspectX é **uma fonte de dados que cubra segmento B2B**. É um problema difícil, mas é um problema técnico com solução conhecida — registros oficiais por país. Está em andamento.

O que falta para o marketplace é demanda real de dois lados, moderação, verificação de identidade empresarial, reputação, chat, proposta, agenda, e um time para operar tudo isso. São coisas de natureza diferente.

### Veredito

**Não virar marketplace agora.** Mas guardar a ideia, porque ela tem um caminho natural: o funil de acompanhamento já registra quais empresas responderam à abordagem. Isso é o embrião de dado de intenção. Quando houver volume, a "demanda declarada" pode nascer de dentro do produto, sem recrutamento manual — o oposto de começar pelo marketplace vazio.

---

## 3. O que deve ser adotado — e por que cada coisa

Separando o que é aplicável hoje do que é conversa para depois.

### 3.1 Adotar agora (baixo custo, alto efeito)

| Recomendação | De onde vem | Por que importa aqui |
|---|---|---|
| **Confidence score e data de verificação em cada dado** | Cognism / seção 25 do blueprint | Resolve o problema real: quando o dado é fraco, dizer que é fraco vale mais que esconder. O cliente que recebe "telefone: não verificado desde 2023" confia mais que o que recebe um telefone morto sem aviso |
| **Procedência visível por registro** | seção 35, *source attribution* | Já é obrigação da licença ODbL. Falta trazer para o nível do registro, não só da tela |
| **Match score explicável** | seção 16 | Já existe um score no produto, mas ele não se explica. "94/100 porque atua no setor-alvo e tem porte adequado" transforma número em argumento de venda |
| **Não cobrar crédito para ver, salvar ou conversar** | espec., seção 3 | Cobrar por ação básica é a reclamação nº 1 contra os concorrentes. Verificar se o nosso modelo faz isso |
| **Nunca devolver resultado genérico quando a busca falha** | seção 34 | Já corrigido: a Edge Function devolve `semCobertura` em vez de encher com lixo |
| **Onboarding por objetivo comercial, não por configuração** | seção 30 | As sete perguntas da seção 30 são melhores que o nosso cadastro atual |

### 3.2 Adotar depois da fonte de dados resolvida

| Recomendação | Por que esperar |
|---|---|
| **ICP Builder em linguagem natural** (seção 14) | Excelente ideia — o usuário escreve "empresas de mineração na Austrália com mais de 100 funcionários" e a IA estrutura. Mas traduzir para filtros que a base não sabe responder gera frustração maior que não ter o recurso |
| **AI Company Researcher** (seção 15) | Depende de ter empresa real para pesquisar |
| **Buying Signal Engine** (seção 17) | Sinais de contratação, expansão e funding exigem fontes que ainda não temos |
| **Top 25 contas para contatar hoje** (seção 18) | É a melhor ideia de interface dos três documentos: substituir "10.000 leads" por 25 contas justificadas. Mas priorizar lixo continua sendo lixo |

### 3.3 Rejeitar ou adiar indefinidamente

| Recomendação | Motivo |
|---|---|
| **Marketplace bilateral** | Ver seção 2 |
| **Elasticsearch, Kafka, Redis, multi-cloud** (seção 37) | Arquitetura para escala que não existe. O Supabase atual comporta muitos milhares de assinantes. Trocar agora é gastar meses para resolver um problema que não temos |
| **10 idiomas nativos** (seção 20) | Três idiomas já cobrem os mercados-alvo. Cada idioma novo é dívida permanente de manutenção |
| **CRM completo + integrações HubSpot/Salesforce** (seção 21) | O funil leve que já existe basta até haver cliente pedindo |
| **API pública e webhooks** (seções 22 e 23) | API-first antes do primeiro cliente é engenharia sem cliente |
| **Multi-provider waterfall com 150 fornecedores** (seção 10) | O conceito está certo e deve orientar a arquitetura. O tamanho está errado: comece com duas fontes por país |
| **SOC 2 e ISO 27001** (seção 36) | Certificação custa dezenas de milhares de dólares e existe para destravar venda enterprise. Não é o nosso cliente |

---

## 4. O posicionamento que os documentos ajudam a fechar

Os três documentos rejeitam a mesma frase: *"another lead generation tool"*. Estão certos, e o motivo é concreto: essa categoria já tem oito concorrentes com mais dinheiro.

O blueprint propõe:
> *The intelligence layer between companies and their next business opportunity.*

Bonito, mas genérico — poderia estar no site de qualquer um dos oito.

**A ProspectX tem uma frase melhor, e ela já existe no produto:**

> **Find the companies that hire what you do.**

A diferença não é estilística. Apollo, ZoomInfo, Hunter e Lusha respondem *"como encontro o contato desta empresa"*. Nenhum deles responde *"quais empresas contratariam o meu serviço"*. Essa segunda pergunta é a que o prestador de serviço pequeno realmente tem — e é a que o mapa de 1.187 pares responde.

**Recomendação de posicionamento:** não somos uma base de dados menor que a do Apollo. Somos a camada que responde uma pergunta que o Apollo não responde. A base precisa ser boa o suficiente para não desmentir a promessa — não precisa ser a maior.

### ⚠️ Correção posterior — o mapa não é fosso

*Adicionado depois do teardown competitivo (`ANALISE-CONCORRENCIA.md`).*

Escrevi acima que o mapa "quem contrata quem" era o ativo defensável. **Isso está errado, e a correção muda o que construir.**

O argumento que derruba: qualquer modelo de linguagem responde "quem contrata manutenção industrial" de graça, em 2026. O conhecimento não é escasso. A prova de que o mercado já sabe disso: a UpLead vende busca por código setorial e **publica blog ensinando o cliente a descobrir o próprio código** — o problema foi resolvido como conteúdo, não como produto. O quadrante está vazio porque o valor não se defende, não porque ninguém pensou.

O que o mapa continua sendo, e que não é pouco:

- **Camada de conversão.** O usuário não precisa saber o que procurar. Isso reduz o atrito do primeiro uso, que é onde a maioria dos concorrentes perde o visitante.
- **Ativo de SEO.** 531 termos × 3 idiomas × cidades é uma malha de páginas que ninguém replica numa tarde. Com a ressalva de que página programática com resultado vazio é pior que página inexistente.

O que ele **não** é: barreira de entrada. Um concorrente com orçamento reproduz o mapa numa semana com um LLM.

**Consequência prática:** o fosso tem que ser a base de dados ou a profundidade num vertical. As duas exigem o mesmo pré-requisito — resolver a fonte. A ordem da seção 7 não muda; o que muda é parar de tratar o mapa como se ele sozinho justificasse o preço.

---

## 5. Correções que os documentos revelaram no nosso produto

Achados concretos, não filosofia:

1. **Preço desalinhado.** US$ 92–98/mês nos coloca acima do Hunter Starter (US$ 49) com base pior. Análise completa em `CUSTOS-ALIQUOTAS-E-PRECO.md`, seção 6.

2. **Falta o degrau de entrada.** Os dois PDFs recomendam Starter em US$ 29–49. Hoje o nosso degrau mais barato é o preço fundador, que é temporário e some depois de 100 assinantes — ou seja, não existe degrau permanente de entrada.

3. **O free tier não tem tempo-de-valor definido.** A meta do blueprint é *time to value < 5 minutos*. Hoje temos uma busca de demonstração. Falta medir se ela entrega valor perceptível.

4. **O score não se explica.** Existe, mas o usuário não sabe de onde vem.

5. **Não há data de verificação nem confiança por registro.** É a correção mais alinhada com o problema real da base — e a que eu recomendo fazer primeiro depois da fonte de dados.

---

## 6. Sobre "Lovable ou Claude Code"

O relatório sugere prototipar no Lovable e consolidar depois. **Essa recomendação não se aplica**: ela vale para quem está começando do zero e precisa validar a experiência.

A ProspectX já tem a aplicação construída, no ar, com autenticação, pagamento, busca internacionalizada em três idiomas, funil, disparo de e-mail com conformidade por país e painel administrativo. Reconstruir isso num protótipo seria andar para trás.

---

## 7. Recomendação final, em ordem

1. **Resolver a fonte de dados.** Nada mais importa até isso fechar. Em andamento.
2. **Tornar o "quem contrata quem" visível e explicado.** Não porque seja fosso — não é —, mas porque é o que reduz o atrito do primeiro uso e o que sustenta a malha de SEO.
3. **Adicionar confiança e data de verificação por registro.** Honestidade sobre o dado é vantagem competitiva quando o dado é imperfeito — e o dos concorrentes também é.
4. **Trocar "10.000 leads" por "as 25 contas de hoje, com justificativa".** Melhor ideia de interface dos três documentos, e barata de implementar.
5. **Só então revisar preço**, criando o degrau de entrada em torno de US$ 29–39.
6. **Guardar o marketplace** para quando o funil já tiver gerado dado de intenção próprio.

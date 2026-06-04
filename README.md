# PrecificaAlim - Precificação Inteligente para Alimentação Artesanal

O **Precifica+** é um sistema web moderno e responsivo desenvolvido especialmente para confeiteiros e produtores de alimentação artesanal gerenciarem seus custos de insumos, embalagens, mão de obra e taxas fixas de forma prática e em conformidade com a LGPD.

O sistema calcula automaticamente o custo total de receitas, custo unitário (por porção e por peso) e sugere o preço ideal de venda utilizando as lógicas e fórmulas exatas da sua planilha de precificação.

---

## 📖 Guia e Conceitos Importantes

### Preço Praticado

O **Preço Praticado** é o valor real de venda que você de fato cobra do seu cliente pela receita completa produzida. Ele tem um papel fundamental no funcionamento dos alertas do sistema:

1. **Cálculo da Margem Real:**
   O sistema compara o **Preço Praticado** (o valor de venda inserido por você) com o **Custo Total** da receita (calculado com base em ingredientes, embalagens e tempo de preparo). Com isso, ele encontra a sua **Margem Real de Lucro** atual sobre a venda.

2. **Geração de Alertas no Dashboard:**
   * **Margem Segura (Alerta Verde):** Se o seu preço praticado for suficiente para cobrir todos os custos e atingir ou superar a **Margem Alvo** configurada na receita, ela aparecerá como saudável.
   * **Alerta de Queda de Lucro (Alerta Vermelho):** Se o seu preço praticado estiver abaixo da margem que você definiu como alvo (devido ao encarecimento de algum ingrediente, por exemplo), o sistema avisa que a receita está operando com baixa lucratividade ou até mesmo gerando prejuízo.

3. **Recomendação de Preço Ideal:**
   Caso a sua margem real fique abaixo da margem alvo, o sistema exibirá no Dashboard uma sugestão de **Ajustes Recomendados** (Preço Venda Ideal) indicando por quanto você deveria vender aquela receita para alcançar os seus objetivos financeiros.

#### Exemplo Prático:
Se o custo total de uma receita de bolo é **R$ 64,00** e a sua Margem Alvo é **30%**:
* O **Preço Venda Ideal** calculado pelo sistema será de **R$ 83,20**.
* Se no campo **Preço Praticado** você definir que vende o bolo por **R$ 85,00**, o sistema indicará que você está em **Margem Segura** (margem real de 24,7% sobre a venda).
* Se você definir no **Preço Praticado** que vende por **R$ 70,00**, o sistema apontará que a sua margem caiu para apenas 8,5%, emitindo um alerta de atenção para você reajustar o preço cobrado.

---

### Fator de Perda (%)

O **Fator de Perda** representa a porcentagem de desperdício ou redução natural que ocorre durante o processo de produção dos ingredientes (ex: cascas de frutas, perda de peso da massa ao assar, sobras no recipiente).

* No sistema, este fator incide **exclusivamente sobre os insumos classificados como ingredientes** (a massa crua).
* Insumos do tipo **embalagens** e os **custos operacionais rateados** (mão de obra e custos fixos) não sofrem alteração, mantendo a precisão matemática da ficha técnica de custos.

---

## 🛠️ Tecnologias Utilizadas

* **React** com **TypeScript**
* **Vite** como empacotador de desenvolvimento rápido
* **Vanilla CSS** para estilização personalizada e moderna
* **Supabase** como backend de banco de dados e autenticação (ou fallback localStorage)
* **Lucide React** para iconografia moderna

---

## 🚀 Como Rodar o Projeto Localmente

1. **Instalar Dependências:**
   ```bash
   npm install
   ```

2. **Configuração de Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto com as chaves correspondentes (consulte o `.env.example`). Para rodar localmente de forma simulada no localStorage, utilize as configurações padrão de mock.

3. **Rodar em Modo de Desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Gerar Build de Produção:**
   ```bash
   npm run build
   ```

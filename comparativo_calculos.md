# Relatorio de Analise Comparativa de Calculos

Este relatorio apresenta um comparativo detalhado entre os calculos matematicos empregados na planilha do usuario (conforme a imagem enviada) e os metodos implementados no sistema PrecificaAlim.

---

## 1. Mapeamento de Dados e Arredondamentos (Caso de Estudo: Biscoito de Baunilha)

Com base na imagem, os dados de entrada sao:
* **Tempo de Preparo:** 2 horas
* **Rendimento da Receita:** 20 unidades
* **Fator de Perda:** 10%
* **Custo Cruzeiro da Massa (Insumos):** R$ 9,14 (ja inflacionado pela perda)
* **Embalagens (Saco, Fecho, Adesivo, Etiqueta):** R$ 0,36

### Mapeamento dos Rateios
1. **Mao de Obra (Pro-labore):** R$ 51,14 para 2 horas de preparo.
   * *Equivalente a uma taxa horaria de R$ 25,57/hora.*
2. **Outros Custos (Custos Fixos):** R$ 3,41 para 2 horas de preparo.
   * *Equivalente a uma taxa horaria de R$ 1,705/hora.*
3. **Custo Total de Producao (sem lucro):** R$ 64,04
   * *Formula: Custo Massa (9,14) + Outros Custos (3,41) + Mao de Obra (51,14) + Embalagens (0,36) = R$ 64,05 (arredondado na planilha para R$ 64,04).*

---

## 2. Diferencas Principais de Logica Matematica

### A. Calculo do Preco de Venda e Margem de Lucro

Existe uma divergencia na forma como a margem de lucro e aplicada para obter o preco sugerido de venda:

* **Metodo da Planilha (Lucro por Fora / Margem sobre o Custo):**
  * Aplica a margem de 30% multiplicando diretamente sobre o custo.
  * *Formula:* `Preco = CustoTotal * (1 + MargemAlvo)`
  * *Calculo:* `64,04 * 1,30 = R$ 83,26`
  * *Margem de Lucro Real na Venda:* O lucro absoluto e R$ 19,21. Dividido pelo preco de venda (83,26), a margem de lucro real sobre o faturamento e de **23%** (exibido corretamente no resumo da planilha).

* **Metodo do Sistema PrecificaAlim (Lucro por Dentro / Margem sobre a Venda):**
  * Utiliza a formula de divisor de margem, garantindo que a margem alvo seja obtida sobre o preco de venda final (pratica financeira padrao recomendada para comercio).
  * *Formula:* `Preco = CustoTotal / (1 - MargemAlvo)`
  * *Calculo:* `64,04 / (1 - 0,30) = 64,04 / 0,70 = R$ 91,48`
  * *Margem de Lucro Real na Venda:* O lucro absoluto e R$ 27,44. Dividido pelo preco de venda (91,48), a margem de lucro real sobre o faturamento e de exatamente **30%**.

> [!NOTE]
> O metodo do sistema (lucro por dentro) gera um preco de venda R$ 8,22 maior para a mesma receita, garantindo que o negocio realmente retenha os 30% de margem desejada sobre o dinheiro que entra no caixa.

---

## 3. Fator de Perda de Producao

* **Na Planilha:** 
  Aplica-se um fator de perda de 10% que atua como um multiplicador sobre o custo liquido dos ingredientes da massa.
  * *Formula:* `CustoMassa = CustoIngredientesCru * (1 + Perda%)`
  * No exemplo, se o custo cru dos ingredientes fosse R$ 8,31, a perda de 10% eleva o custo da massa para R$ 9,14.

* **No Sistema:**
  Nao temos o campo de perda na receita. Os insumos sao calculados com base no rendimento liquido final cru informado na ficha tecnica.

---

## 4. Tabela de Comparacao Direta

| Item | Calculo na Planilha (Imagem) | Calculo no Sistema (PrecificaAlim) | Impacto no Negocio |
| :--- | :--- | :--- | :--- |
| **Custo de Insumos** | R$ 9,14 (com 10% de perda inclusa) | R$ 8,31 (base crua, sem perda inclusa) | O sistema pode subestimar desperdicios caso o usuario nao inclua a perda no peso do insumo. |
| **Preco de Venda (Margem 30%)** | R$ 83,26 (Markup multiplicativo) | R$ 91,48 (Divisor de Margem / LTC) | O sistema garante mais rentabilidade real sobre o faturamento. |
| **Margem Real Retida** | 23,07% (Lucro por fora) | 30,00% (Lucro por dentro) | A planilha entrega menos lucro real do que a porcentagem selecionada indica. |

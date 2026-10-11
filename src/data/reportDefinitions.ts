import {
  ReportCategory,
  ReportDefinition,
  ReportFilterField,
  ReportFilterOption,
} from "../types/reportPdf";

const dateRange = (
  startKey = "startDate",
  endKey = "endDate",
): ReportFilterField => ({
  key: `${startKey}_${endKey}`,
  label: "Período",
  type: "dateRange",
  startKey,
  endKey,
});

const city: ReportFilterField = {
  key: "city",
  label: "Cidade",
  type: "city",
};

const client: ReportFilterField = {
  key: "clientId",
  label: "Cliente",
  type: "client",
};

const seller: ReportFilterField = {
  key: "sellerId",
  label: "Vendedor",
  type: "seller",
};

const collector: ReportFilterField = {
  key: "collectorId",
  label: "Cobrador",
  type: "collector",
};

const product: ReportFilterField = {
  key: "productId",
  label: "Produto",
  type: "product",
};

const paymentOptions: ReportFilterOption[] = [
  { label: "Todas as formas", value: "" },
  { label: "Dinheiro", value: "CASH" },
  { label: "Parcelado", value: "PARCEL" },
  { label: "Cartão de crédito", value: "CREDIT" },
  { label: "Cartão de débito", value: "DEBIT" },
  { label: "Pix", value: "PIX" },
];

const stockStatusOptions: ReportFilterOption[] = [
  { label: "Todos os status", value: "" },
  { label: "Disponível", value: "1" },
  { label: "Indisponível", value: "2" },
  { label: "Zerado", value: "3" },
  { label: "Pouco estoque", value: "4" },
];

const saleStatusOptions: ReportFilterOption[] = [
  { label: "Todos os status", value: "" },
  { label: "Ativo", value: "1" },
  { label: "Defeito no produto", value: "2" },
  { label: "Devolvido pelo cliente", value: "3" },
  { label: "Desistência", value: "4" },
  { label: "Recuperado", value: "5" },
  { label: "Danificado", value: "6" },
  { label: "Finalizado", value: "7" },
];

const returnStatusOptions: ReportFilterOption[] = [
  { label: "Todos os status", value: "" },
  { label: "Na garantia", value: "2" },
  { label: "Devolvido", value: "3" },
  { label: "Desistência", value: "4" },
  { label: "Recuperado", value: "5" },
  { label: "Danificado", value: "6" },
];

const sortOptions = (options: ReportFilterOption[]): ReportFilterField => ({
  key: "sort",
  label: "Ordenação",
  type: "sort",
  options: [{ label: "Padrão do relatório", value: "" }, ...options],
});

const status = (options: ReportFilterOption[]): ReportFilterField => ({
  key: "status",
  label: "Status",
  type: "status",
  options,
});

const paymentMethod: ReportFilterField = {
  key: "paymentMethod",
  label: "Forma de pagamento",
  type: "paymentMethod",
  options: paymentOptions,
};

const paymentType: ReportFilterField = {
  key: "paymentType",
  label: "Tipo de pagamento",
  type: "paymentType",
  options: paymentOptions,
};

const collectionStatusOptions: ReportFilterOption[] = [
  { label: "Todos os status", value: "" },
  { label: "Pagas", value: "PAID" },
  { label: "Pendentes", value: "PENDING" },
  { label: "Atrasadas", value: "OVERDUE" },
  { label: "A vencer", value: "UPCOMING" },
];

const dateTypeOptions: ReportFilterOption[] = [
  { label: "Data de vencimento", value: "DUE" },
  { label: "Data de pagamento", value: "PAYMENT" },
];

const dimensionOptions: ReportFilterOption[] = [
  { label: "Produto", value: "product" },
  { label: "Vendedor", value: "seller" },
  { label: "Cliente", value: "client" },
  { label: "Forma de pagamento", value: "payment" },
];

const stockSort = sortOptions([
  { label: "Nome A-Z", value: "name,asc" },
  { label: "Nome Z-A", value: "name,desc" },
  { label: "Maior estoque", value: "amount,desc" },
  { label: "Menor estoque", value: "amount,asc" },
]);

const rankingSort = sortOptions([
  { label: "Maior resultado", value: "total,desc" },
  { label: "Menor resultado", value: "total,asc" },
]);

const dateSort = sortOptions([
  { label: "Mais recentes", value: "date,desc" },
  { label: "Mais antigos", value: "date,asc" },
]);

const citySort = sortOptions([
  { label: "Cidade A-Z", value: "city,asc" },
  { label: "Cidade Z-A", value: "city,desc" },
  { label: "Maior resultado", value: "total,desc" },
]);

const reportDefinitions: ReportDefinition[] = [
  {
    key: "stock",
    category: "stock",
    title: "Estoque atual",
    description: "Exporte a posição atual do estoque com filtros de produto e ordenação.",
    endpoint: "/reports/stock/pdf",
    fields: [
      { ...product, key: "name", label: "Produto", valueMode: "label" },
      status(stockStatusOptions),
      stockSort,
    ],
    filename: "relatorio-estoque.pdf",
  },
  {
    key: "stock-products-ranking",
    category: "stock",
    title: "Ranking de produtos",
    description: "Baixe o ranking de produtos considerando o período e os responsáveis selecionados.",
    endpoint: "/reports/stock/products/ranking/pdf",
    fields: [dateRange(), city, seller, product, rankingSort],
    filename: "ranking-produtos.pdf",
  },
  {
    key: "stock-loadings",
    category: "stock",
    title: "Carregamentos",
    description: "Consulte os carregamentos realizados por período e responsável.",
    endpoint: "/reports/stock/loadings/pdf",
    fields: [dateRange(), { ...collector, key: "responsibleId", label: "Responsável", type: "responsible" }, dateSort],
    filename: "relatorio-carregamentos.pdf",
  },
  {
    key: "sales",
    category: "sales",
    title: "Vendas detalhadas",
    description: "Exporte as vendas com os filtros comerciais e financeiros necessários.",
    endpoint: "/reports/sales/pdf",
    fields: [
      dateRange(), city, client, seller, collector, product, paymentMethod,
      status(saleStatusOptions), dateSort,
    ],
    filename: "relatorio-vendas.pdf",
  },
  {
    key: "sales-summary",
    category: "sales",
    title: "Resumo de vendas",
    description: "Gere um resumo consolidado das vendas do período informado.",
    endpoint: "/reports/sales/summary/pdf",
    fields: [dateRange(), city, client, seller, collector, product, paymentMethod, status(saleStatusOptions)],
    filename: "resumo-vendas.pdf",
  },
  {
    key: "sales-ranking",
    category: "sales",
    title: "Ranking de vendas",
    description: "Compare resultados por produto, vendedor, cliente ou forma de pagamento.",
    endpoint: "/reports/sales/ranking/pdf",
    fields: [
      { key: "dimension", label: "Dimensão", type: "dimension", options: dimensionOptions },
      dateRange(), city, rankingSort,
    ],
    filename: "ranking-vendas.pdf",
  },
  {
    key: "collections",
    category: "collections",
    title: "Cobranças",
    description: "Exporte as cobranças por vencimento ou pagamento, com seus respectivos status.",
    endpoint: "/reports/collections/pdf",
    fields: [
      dateRange(),
      { key: "dateType", label: "Considerar data de", type: "dateType", options: dateTypeOptions },
      city, client, collector,
      paymentType,
      status(collectionStatusOptions),
      dateSort,
    ],
    filename: "relatorio-cobrancas.pdf",
  },
  {
    key: "collections-summary",
    category: "collections",
    title: "Resumo de cobranças",
    description: "Gere uma visão resumida das cobranças filtradas.",
    endpoint: "/reports/collections/summary/pdf",
    fields: [
      dateRange(),
      { key: "dateType", label: "Considerar data de", type: "dateType", options: dateTypeOptions },
      city, client, collector,
      paymentType,
    ],
    filename: "resumo-cobrancas.pdf",
  },
  {
    key: "cities",
    category: "cities",
    title: "Desempenho por cidade",
    description: "Exporte os resultados agrupados por cidade e período.",
    endpoint: "/reports/cities/pdf",
    fields: [dateRange(), city, citySort],
    filename: "relatorio-cidades.pdf",
  },
  {
    key: "cities-products",
    category: "cities",
    title: "Produtos por cidade",
    description: "Consulte a distribuição de produtos por cidade dentro do período.",
    endpoint: "/reports/cities/products/pdf",
    fields: [city, dateRange()],
    filename: "produtos-por-cidade.pdf",
  },
  {
    key: "returns",
    category: "returns",
    title: "Devoluções",
    description: "Exporte as devoluções com filtros de venda, cliente e produto.",
    endpoint: "/reports/returns/pdf",
    fields: [dateRange(), city, client, seller, collector, product, status(returnStatusOptions)],
    filename: "relatorio-devolucoes.pdf",
  },
  {
    key: "returns-summary",
    category: "returns",
    title: "Resumo de devoluções",
    description: "Gere o resumo das devoluções por período e status.",
    endpoint: "/reports/returns/summary/pdf",
    fields: [dateRange(), status(returnStatusOptions)],
    filename: "resumo-devolucoes.pdf",
  },
  {
    key: "returns-products",
    category: "returns",
    title: "Produtos devolvidos",
    description: "Exporte os produtos envolvidos nas devoluções do período.",
    endpoint: "/reports/returns/products/pdf",
    fields: [dateRange(), status(returnStatusOptions)],
    filename: "produtos-devolvidos.pdf",
  },
  {
    key: "guarantees-requests",
    category: "guarantees",
    title: "Solicitações de garantia",
    description: "Baixe as solicitações de garantia realizadas no período.",
    endpoint: "/reports/guarantees/requests/pdf",
    fields: [dateRange()],
    filename: "solicitacoes-garantia.pdf",
  },
  {
    key: "clients-ranking",
    category: "clients",
    title: "Ranking de clientes",
    description: "Compare o desempenho dos clientes por período e cidade.",
    endpoint: "/reports/clients/ranking/pdf",
    fields: [dateRange(), city, rankingSort],
    filename: "ranking-clientes.pdf",
  },
];

export const reportCategories: ReportCategory[] = [
  { key: "stock", label: "Produtos e estoque", description: "Inventário e movimentações", icon: "ti ti-package" },
  { key: "sales", label: "Vendas", description: "Vendas e rankings", icon: "ti ti-receipt" },
  { key: "collections", label: "Cobranças e pagamentos", description: "Recebimentos e pendências", icon: "ti ti-cash" },
  { key: "cities", label: "Cidades", description: "Desempenho geográfico", icon: "ti ti-map-pin" },
  { key: "returns", label: "Devoluções", description: "Ocorrências e produtos", icon: "ti ti-arrow-back-up" },
  { key: "guarantees", label: "Garantias", description: "Solicitações registradas", icon: "ti ti-shield-check" },
  { key: "clients", label: "Clientes", description: "Rankings de clientes", icon: "ti ti-users" },
];

export default reportDefinitions;

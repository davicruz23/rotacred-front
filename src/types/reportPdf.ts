export type ReportFilterValue = string | number;

export type ReportFilterValues = Record<string, ReportFilterValue>;

export type ReportFilterOption = {
  label: string;
  value: string;
};

export type ReportFilterType =
  | "dateRange"
  | "text"
  | "city"
  | "client"
  | "seller"
  | "collector"
  | "responsible"
  | "product"
  | "status"
  | "paymentMethod"
  | "paymentType"
  | "dateType"
  | "dimension"
  | "sort";

export type ReportFilterField = {
  key: string;
  label: string;
  type: ReportFilterType;
  placeholder?: string;
  options?: ReportFilterOption[];
  valueMode?: "id" | "label";
  startKey?: string;
  endKey?: string;
};

export type ReportCategoryKey =
  | "stock"
  | "sales"
  | "collections"
  | "cities"
  | "returns"
  | "guarantees"
  | "clients";

export type ReportDefinition = {
  key: string;
  category: ReportCategoryKey;
  title: string;
  description: string;
  endpoint: string;
  fields: ReportFilterField[];
  filename: string;
};

export type ReportCategory = {
  key: ReportCategoryKey;
  label: string;
  description: string;
  icon: string;
};

export type ReportPdfParams = Record<
  string,
  string | number | null | undefined
>;

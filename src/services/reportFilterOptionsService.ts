import api from "./api";

export type ReportLookupOption = {
  value: string;
  label: string;
};

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const firstValue = (record: UnknownRecord, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return undefined;
};

const normalizeOptions = (
  data: unknown,
  valueKeys: string[],
  labelKeys: string[],
): ReportLookupOption[] => {
  const source = Array.isArray(data)
    ? data
    : Array.isArray(asRecord(data).content)
      ? (asRecord(data).content as unknown[])
      : [];

  return source
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        return { value: String(item), label: String(item) };
      }

      const record = asRecord(item);
      const value = firstValue(record, valueKeys);
      const label = firstValue(record, labelKeys) ?? value;

      return value === undefined || label === undefined
        ? null
        : { value: String(value), label: String(label) };
    })
    .filter((option): option is ReportLookupOption => option !== null);
};

export const getReportCollectors = async () => {
  const response = await api.get("/collector/name/all");
  return normalizeOptions(response.data, ["id", "collectorId", "userId"], ["collectorName", "name", "nome"]);
};

export const getReportSellers = async () => {
  const response = await api.get("/seller/name/all");
  return normalizeOptions(response.data, ["idSeller", "sellerId", "id", "userId"], ["nomeSeller", "sellerName", "name", "nome"]);
};

export const getReportProducts = async () => {
  const response = await api.get("/product/all", {
    params: { page: 0, size: 1000 },
  });

  return normalizeOptions(response.data, ["id", "productId"], ["name", "nameProduct", "productName"]);
};

export const searchReportClients = async (search: string) => {
  const response = await api.get("/client/search", { params: { search } });
  return normalizeOptions(response.data, ["id", "clientId"], ["name", "clientName"]);
};

/**
 * O endpoint ainda não existe entre os endpoints consumidos pelo front.
 * A tela chama este contrato quando o filtro de cidade é usado.
 */
export const getReportCities = async () => {
  const response = await api.get("/city/name/all");
  return normalizeOptions(response.data, ["name", "city", "label", "value"], ["name", "city", "label"]);
};

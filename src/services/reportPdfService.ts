import axios, { AxiosError } from "axios";
import api from "./api";
import { ReportPdfParams } from "../types/reportPdf";

const PDF_CONTENT_TYPE = "application/pdf";

const getHeader = (headers: Record<string, unknown>, name: string) => {
  const headerKey = Object.keys(headers).find(
    (key) => key.toLowerCase() === name.toLowerCase(),
  );

  return headerKey ? String(headers[headerKey]) : "";
};

const cleanParams = (params: ReportPdfParams = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (key === "page" || key === "size") return;
    if (value === null || value === undefined || value === "") return;

    searchParams.set(key, String(value));
  });

  return searchParams;
};

const getFilenameFromDisposition = (
  contentDisposition: string,
  fallbackFilename: string,
) => {
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  const filenameMatch = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);
  const filename = utf8Match?.[1] || filenameMatch?.[1];

  if (!filename) return fallbackFilename;

  try {
    return decodeURIComponent(filename.trim());
  } catch {
    return filename.trim();
  }
};

const readBlobMessage = async (blob: Blob) => {
  try {
    const text = await blob.text();
    const data = JSON.parse(text) as { message?: string };
    return data.message || "O servidor não retornou um PDF válido.";
  } catch {
    return "O servidor não retornou um PDF válido.";
  }
};

const getFriendlyError = async (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (responseData instanceof Blob) {
      return readBlobMessage(responseData);
    }

    if (typeof responseData === "object" && responseData !== null) {
      const message = (responseData as { message?: string }).message;
      if (message) return message;
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      return "Você não tem permissão para baixar este relatório.";
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return "Não foi possível baixar o relatório. Tente novamente.";
};

export const downloadReportPdf = async (
  endpoint: string,
  params: ReportPdfParams = {},
  fallbackFilename: string,
) => {
  const token = localStorage.getItem("token");

  try {
    const response = await api.get<Blob>(endpoint, {
      params: cleanParams(params),
      responseType: "blob",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const contentType = getHeader(
      response.headers as Record<string, unknown>,
      "content-type",
    ).toLowerCase();

    if (!contentType.includes(PDF_CONTENT_TYPE)) {
      throw new Error(await readBlobMessage(response.data));
    }

    const contentDisposition = getHeader(
      response.headers as Record<string, unknown>,
      "content-disposition",
    );
    const filename = getFilenameFromDisposition(
      contentDisposition,
      fallbackFilename,
    );
    const blob = new Blob([response.data], { type: PDF_CONTENT_TYPE });
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);

    return filename;
  } catch (error: unknown) {
    const message = await getFriendlyError(error as AxiosError<Blob>);
    throw new Error(message);
  }
};

export { cleanParams, getFilenameFromDisposition };

const reportPdfService = { downloadReportPdf };

export default reportPdfService;

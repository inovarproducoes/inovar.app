import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma string de data no formato YYYY-MM-DD para DD/MM/YYYY.
 */
export function formatarData(dataStr: string | null | undefined): string {
  if (!dataStr) return "-";
  const parts = dataStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dataStr;
}

/**
 * Formata um número para moeda brasileira (R$).
 */
export function formatarMoeda(valor: number | null | undefined): string {
  if (valor == null) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

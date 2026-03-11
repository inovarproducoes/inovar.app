export interface ParcelaSGE {
  CPF: string; NumeroProjeto: string; DescricaoProjeto: string;
  DataVencimento: string; Valor: number; ValorOriginal: number;
  Multa: number; Juros: number; ValorPago: number;
  TipoParcela: string; DataPagamento: string | null;
  TipoLancamento: string;
  GuidPIX: string | null; GuidBoleto: string | null;
  UrlPix: string | null; UrlBoleto: string | null; LinhaDigitavel: string | null;
}
export interface AlunoSGE { CPF: string; Nome: string; [key: string]: unknown; }
export interface ResumoFinanceiro {
  totalOriginal: number; totalAtualizado: number; totalPago: number;
  totalMultas: number; totalJuros: number;
  parcelasPendentes: number; parcelasPagas: number;
}
export function calcularResumo(parcelas: ParcelaSGE[]): ResumoFinanceiro {
  return parcelas.reduce(
    (acc, parcela) => {
      acc.totalOriginal += parcela.ValorOriginal;
      acc.totalAtualizado += parcela.Valor;
      acc.totalMultas += parcela.Multa;
      acc.totalJuros += parcela.Juros;
      acc.totalPago += parcela.ValorPago;
      if (parcela.ValorPago >= parcela.Valor) {
        acc.parcelasPagas += 1;
      } else {
        acc.parcelasPendentes += 1;
      }
      return acc;
    },
    {
      totalOriginal: 0,
      totalAtualizado: 0,
      totalPago: 0,
      totalMultas: 0,
      totalJuros: 0,
      parcelasPendentes: 0,
      parcelasPagas: 0,
    }
  );
}

"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, DollarSign, AlertCircle, CheckCircle2, QrCode, FileText, Clock } from "lucide-react";
import { formatarCPF } from "@/lib/cpfUtils";
import { formatarData, formatarMoeda } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function FinanceiroPage() {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [buscaFeita, setBuscaFeita] = useState(false);

  const [aluno, setAluno] = useState<any>(null);
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [resumo, setResumo] = useState({
    totalOriginal: 0, totalAtualizado: 0, totalPago: 0,
    totalMultas: 0, totalJuros: 0, parcelasPendentes: 0, parcelasPagas: 0
  });

  const handleBuscar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (cpf.length !== 14) {
      toast.error("CPF inválido", { description: "Digite um CPF completo no formato 000.000.000-00." });
      return;
    }
    setLoading(true);
    setBuscaFeita(true);
    
    setTimeout(() => {
       setAluno({ Nome: "João Silva Sauro", CPF: cpf });
       setParcelas([
         { DescricaoProjeto: "Formatura 3º Ano Médio", TipoParcela: "Mensalidade", DataVencimento: "2025-10-10", ValorOriginal: 350.00, Valor: 350.00, ValorPago: 350.00, Multa: 0, Juros: 0, Status: 'Pago' },
         { DescricaoProjeto: "Formatura 3º Ano Médio", TipoParcela: "Mensalidade", DataVencimento: "2025-11-10", ValorOriginal: 350.00, Valor: 365.50, ValorPago: 0, Multa: 7.00, Juros: 8.50, Status: 'Vencida' },
         { DescricaoProjeto: "Formatura 3º Ano Médio", TipoParcela: "Mensalidade", DataVencimento: "2025-12-10", ValorOriginal: 350.00, Valor: 350.00, ValorPago: 0, Multa: 0, Juros: 0, Status: 'Pendente' }
       ]);
       setResumo({
         totalOriginal: 1050.00, totalAtualizado: 1065.50, totalPago: 350.00,
         totalMultas: 7.00, totalJuros: 8.50, parcelasPendentes: 2, parcelasPagas: 1
       });
       setLoading(false);
    }, 1200);
  };


  return (
    <MainLayout title="Financeiro (SGE)" subtitle="Consulta consolidada de parcelas no Sistema de Gestão Escolar">
      <div className="bg-card p-6 rounded-lg border shadow-sm mb-6 max-w-2xl">
        <h2 className="text-lg font-bold mb-4">Buscar Situação Financeira</h2>
        <form onSubmit={handleBuscar} className="flex gap-4">
          <Input 
            placeholder="Digite o CPF do responsável..." 
            value={cpf} 
            onChange={e => setCpf(formatarCPF(e.target.value))} 
            maxLength={14}
            className="flex-1"
          />
          <Button type="submit" disabled={loading} className="gap-2">
            <Search className="w-4 h-4"/> {loading ? "Buscando..." : "Buscar"}
          </Button>
        </form>
      </div>

      {buscaFeita && !loading && aluno && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-lg border-l-4 border-primary">
              <h3 className="font-bold text-lg">{aluno.Nome}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2">CPF: {aluno.CPF} <Badge variant="outline" className="ml-2">Importado do SGE</Badge></p>
           </div>

           <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-xl border flex flex-col justify-center">
                <span className="text-muted-foreground text-sm flex items-center gap-2"><DollarSign className="w-4 h-4"/> Total Original</span>
                <span className="text-xl font-bold mt-1">{formatarMoeda(resumo.totalOriginal)}</span>
              </div>
              <div className="bg-card p-4 rounded-xl border flex flex-col justify-center">
                <span className="text-destructive text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Multas e Juros</span>
                <span className="text-xl font-bold text-destructive mt-1">{formatarMoeda(resumo.totalMultas + resumo.totalJuros)}</span>
              </div>
              <div className="bg-success/10 border-success/20 p-4 rounded-xl border flex flex-col justify-center">
                <span className="text-success md:text-sm text-xs flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Total Pago ({resumo.parcelasPagas} parc.)</span>
                <span className="text-xl font-bold text-success mt-1">{formatarMoeda(resumo.totalPago)}</span>
              </div>
              <div className="bg-warning/10 border-warning/20 p-4 rounded-xl border flex flex-col justify-center">
                <span className="text-warning-foreground md:text-sm text-xs flex items-center gap-2"><Clock className="w-4 h-4"/> Valor Pendente</span>
                <span className="text-xl font-bold mt-1">{formatarMoeda(resumo.totalAtualizado - resumo.totalPago)}</span>
              </div>
           </div>

           <div className="border rounded-lg overflow-x-auto bg-card">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Projeto / Tipo</th>
                    <th className="px-6 py-3">Vencimento</th>
                    <th className="px-6 py-3">Valor Orig.</th>
                    <th className="px-6 py-3">Valor Atual</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Ações de Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {parcelas.map((p, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground truncate max-w-[200px]" title={p.DescricaoProjeto}>{p.DescricaoProjeto}</p>
                        <p className="text-xs text-muted-foreground">{p.TipoParcela}</p>
                      </td>
                      <td className="px-6 py-4">{formatarData(p.DataVencimento)}</td>
                      <td className="px-6 py-4">{formatarMoeda(p.ValorOriginal)}</td>
                      <td className="px-6 py-4 font-medium">{formatarMoeda(p.Valor)}</td>
                      <td className="px-6 py-4">
                        {p.Status === 'Pago' && <Badge className="bg-success hover:bg-success/90">Pago</Badge>}
                        {p.Status === 'Vencida' && <Badge variant="destructive">Vencida</Badge>}
                        {p.Status === 'Pendente' && <Badge variant="outline" className="border-warning text-warning-foreground">Pendente</Badge>}
                      </td>
                      <td className="px-6 py-4">
                        {p.Status !== 'Pago' ? (
                          <div className="flex gap-2">
                             <Button variant="outline" size="sm" title="Gerar PIX" className="px-2 border-success text-success hover:bg-success/10"><QrCode className="w-4 h-4"/></Button>
                             <Button variant="outline" size="sm" title="Gerar Boleto" className="px-2 text-primary border-primary hover:bg-primary/10"><FileText className="w-4 h-4"/></Button>
                             <Button variant="outline" size="sm" title="Copiar Linha Digitável" className="text-xs font-mono">Linha Digitável</Button>
                          </div>
                        ) : <span className="text-muted-foreground text-xs italic">Já liquidado</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
       )}
     </MainLayout>
  );
}

import { OS } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function RecentOsTable({ ordens }: { ordens: OS[] }) {
  if (ordens.length === 0) return (
    <div className="glass-card p-12 text-center fade-up-5">
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
        <span className="text-xl">📁</span>
      </div>
      <p className="text-muted-foreground font-dm text-sm tracking-wide">Nenhuma Ordem de Serviço recente</p>
    </div>
  );

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (['concluida', 'concluido', 'finalizada', 'finalizado', 'sucesso'].some(x => s.includes(x))) {
      return { bg: 'rgba(0,107,98,0.15)', color: '#00b4a0', dot: '#00b4a0' };
    }
    if (['andamento', 'processando', 'atendimento', 'execucao'].some(x => s.includes(x))) {
      return { bg: 'rgba(74,75,215,0.15)', color: '#8083ff', dot: '#8083ff' };
    }
    if (['pendente', 'aberta', 'aberto', 'nova'].some(x => s.includes(x))) {
      return { bg: 'rgba(247,158,0,0.12)', color: '#f79e00', dot: '#f79e00' };
    }
    return { bg: 'rgba(255,255,255,0.06)', color: '#9090b0', dot: '#9090b0' };
  };

  return (
    <div className="glass-card overflow-hidden fade-up-5">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] font-mono">OS / Ticket</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] font-mono">Número</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] font-mono">Data</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] font-mono">Responsável</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] font-mono">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {ordens.map((os) => {
              const st = getStatusStyle(os.status);
              return (
                <tr key={os.id} className="group hover:bg-white/[0.03] transition-all duration-300 cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-syne font-bold text-[13px] text-foreground group-hover:text-primary transition-colors">{os.nome}</span>
                      <span className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[220px] font-dm opacity-70">{os.descricao || 'Sem descrição'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-white/5 px-2 py-1 rounded text-[10px] font-mono font-bold text-muted-foreground border border-white/10 uppercase tracking-wider">
                      {os.numero || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-dm text-muted-foreground">
                      {format(new Date(os.created_at), "dd MMM, yyyy", { locale: ptBR })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded-md bg-gradient-brand text-[8px] font-bold text-white flex items-center justify-center shrink-0">
                          {os.responsavel_nome ? os.responsavel_nome[0].toUpperCase() : '?'}
                       </div>
                       <span className="text-xs font-medium text-foreground truncate max-w-[120px] font-dm">
                         {os.responsavel_nome || 'Não atribuído'}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border"
                      style={{ backgroundColor: st.bg, color: st.color, borderColor: `${st.color}22` }}
                    >
                      <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: st.dot }} />
                      {os.status.replace(/_/g, ' ')}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer */}
      <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
         <span className="text-[11px] text-muted-foreground font-dm">Mostrando os últimos <strong className="text-foreground">{ordens.length}</strong> registros</span>
         <button className="text-[11px] font-bold text-primary hover:text-primary-foreground transition-colors uppercase tracking-widest font-mono">Ver Tudo →</button>
      </div>
    </div>
  );
}

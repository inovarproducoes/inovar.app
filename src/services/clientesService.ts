import { Cliente, HistoricoConversa } from "@/types/clientes";

export const clientesService = {
  buscarClientes: async (termo?: string) => {
    const res = await fetch(termo ? `/api/clientes?termo=${termo}` : `/api/clientes`);
    if (!res.ok) throw new Error("Erro");
    return res.json() as Promise<Cliente[]>;
  },
  buscarHistoricoConversas: async (telefone: string) => {
    const res = await fetch("/api/clientes/conversas", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ telefone })
    });
    if (!res.ok) throw new Error("Erro ao buscar histórico");
    return res.json() as Promise<HistoricoConversa>;
  },
  alternarAgenteCliente: async (telefone: string, ativo: boolean) => {
    const res = await fetch("/api/clientes/agente", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ telefone, ativo })
    });
    if (!res.ok) throw new Error("Erro ao alternar agente");
    return res.json();
  }
}

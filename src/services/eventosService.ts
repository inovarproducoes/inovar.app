import { Evento } from "@/types/database";

export const eventosService = {
  getEventos: async (dias?: number) => {
    const url = dias ? `/api/eventos?dias=${dias}` : `/api/eventos`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro ao buscar eventos");
    return res.json() as Promise<Evento[]>;
  },
  getEventoById: async (id: string) => {
    const res = await fetch(`/api/eventos/${id}`);
    if (!res.ok) throw new Error("Erro ao buscar evento");
    return res.json() as Promise<Evento>;
  },
  createEvento: async (data: Partial<Evento>) => {
    const res = await fetch(`/api/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Erro ao criar evento");
    return res.json() as Promise<Evento>;
  },
  updateEvento: async (id: string, data: Partial<Evento>) => {
    const res = await fetch(`/api/eventos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Erro ao atualizar");
    return res.json() as Promise<Evento>;
  },
  deleteEvento: async (id: string) => {
    const res = await fetch(`/api/eventos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Erro ao deletar");
    return res.json();
  }
};

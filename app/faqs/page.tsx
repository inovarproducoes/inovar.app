"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, PlusCircle, Eye, EyeOff, Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

const mockFaqs = [
  { id: '1', pergunta: 'Como solicitar reembolso de parcela?', resposta: 'O reembolso deve ser solicitado via ticket no módulo Suporte. O prazo para análise é de 5 dias úteis, conforme contrato da Inovar.', categoria: 'Pagamentos', visualizacoes: 142, ativo: true },
  { id: '2', pergunta: 'Onde encontro o comprovante do PIX gerado?', resposta: 'Tanto pelo site da Instituição quanto pelo App da Inovar, na aba Financeiro ao clicar em "Parcela Paga" você poderá baixar o recibo em PDF.', categoria: 'Pagamentos', visualizacoes: 89, ativo: true },
  { id: '3', pergunta: 'Quando receberei o meu kit formatura?', resposta: 'Os kits formatura são entregues presencialmente na Instituição 30 dias antes do evento oficial (Baile/Colação). O calendário exato será notificado por e-mail e Whats.', categoria: 'Eventos', visualizacoes: 350, ativo: true },
  { id: '4', pergunta: 'É possível transferir minha cota para outro aluno?', resposta: 'Sim. A transferência requer o cancelamento do contrato atual com taxa administrativa de 10% e nova adesão pelo segundo aluno.', categoria: 'Contratos', visualizacoes: 56, ativo: false },
];

export default function FAQsPage() {
  const [busca, setBusca] = useState("");
  const debouncedBusca = useDebounce(busca, 200);
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredFaqs = mockFaqs.filter(f => 
    f.pergunta.toLowerCase().includes(debouncedBusca.toLowerCase()) || 
    f.resposta.toLowerCase().includes(debouncedBusca.toLowerCase()) ||
    f.categoria.toLowerCase().includes(debouncedBusca.toLowerCase())
  );

  const categorias = Array.from(new Set(filteredFaqs.map(f => f.categoria)));

  return (
    <MainLayout title="Perguntas Frequentes (FAQs)" subtitle="Base de conhecimento para alunos e agentes IA">
       <div className="flex flex-col sm:flex-row gap-4 mb-8">
         <div className="relative flex-1">
           <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
           <Input placeholder="Pesquisar dúvidas comuns..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-9 h-10 lg:max-w-xl text-md" />
         </div>
         <Button className="gap-2"><PlusCircle className="w-4 h-4"/> Nova FAQ</Button>
       </div>

       <div className="space-y-8">
         {categorias.map(cat => (
           <div key={cat} className="space-y-3">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2 border-b pb-2">
                 {cat} <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{filteredFaqs.filter(f => f.categoria === cat).length}</span>
              </h3>
              <div className="grid gap-3">
                 {filteredFaqs.filter(f => f.categoria === cat).map(faq => (
                   <div key={faq.id} className="bg-card border rounded-lg overflow-hidden transition-all duration-200">
                      <button 
                        onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 focus:outline-none"
                      >
                         <div className="flex items-center gap-3">
                           <span className={`font-medium ${openId === faq.id ? 'text-primary' : 'text-foreground'}`}>{faq.pergunta}</span>
                           {!faq.ativo && <span className="bg-destructive/10 text-destructive text-xs px-2 py-0.5 rounded-full flex gap-1 items-center"><EyeOff className="w-3 h-3"/> Inativo</span>}
                         </div>
                         <div className="flex items-center gap-4 text-muted-foreground">
                           <span className="text-xs hidden sm:flex items-center gap-1"><Eye className="w-3 h-3"/> {faq.visualizacoes}</span>
                           <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${openId === faq.id ? 'rotate-180 text-primary' : ''}`} />
                         </div>
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openId === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                         <div className="p-4 pt-0 border-t bg-muted/10 text-muted-foreground text-sm leading-relaxed mt-2 mx-4 mb-4 rounded-b-lg border-x border-b">
                           {faq.resposta}
                           <div className="flex justify-end mt-3 gap-2">
                             <Button variant="ghost" size="sm" className="h-7 text-xs">Editar</Button>
                           </div>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
         ))}
         {categorias.length === 0 && (
           <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
             Não encontramos nenhuma FAQ para &quot;{busca}&quot;.
           </div>
         )}
       </div>
    </MainLayout>
  );
}

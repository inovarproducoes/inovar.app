"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Trash2, Sparkles, AlertCircle } from "lucide-react";

interface Message {
  id: number;
  role: 'bot' | 'user';
  text: string;
  isError?: boolean;
}

export default function SuporteIAPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: Date.now(), role: 'bot', text: 'Olá! Sou a Sophia, assistente IA da Inovar. Em que posso te ajudar hoje?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const messageToSend = text || inputMsg;
    if (!messageToSend.trim() || isLoading) return;
    
    setInputMsg('');
    const userMsg: Message = { id: Date.now(), role: 'user', text: messageToSend };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/suporte", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
             conversa_id: "demo-id",
             pergunta: messageToSend,
             usuario: "Admin",
             timestamp: new Date().toISOString(),
             historico: messages.slice(-5)
         })
      });

      if (!res.ok) throw new Error("Erro na rede");
      const data = await res.json();
      const respostaIA = data.resposta || data.message || data.text || "Desculpe, obtive uma resposta vazia.";
      
      setMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: respostaIA }]);
    } catch {
       // Since the webhook won't work locally without n8n, we simulate a mock reply.
       setTimeout(() => {
         setMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: `Simulação: Entendi que você falou sobre "${messageToSend}". Como este é um ambiente de demonstração sem a API n8n rodando, estou respondendo com este placeholder mockado.`, isError: true }]);
         setIsLoading(false);
       }, 1500);
       return;
    }

    setIsLoading(false);
  };

  const handleLimpar = () => {
    setMessages([{ id: Date.now(), role: 'bot', text: 'Novo chat iniciado. Como posso ajudar?' }]);
  };

  const sugestoes = [
    "Resumo financeiro João Silva",
    "Listar alunos pendentes da turma 3º B",
    "Como reembolso funciona?"
  ];

  return (
    <MainLayout title="Suporte Sophia IA (Chat)" subtitle="Converse com a assistente oficial conectada à base de FAQs e dados.">
      <div className="max-w-4xl mx-auto bg-card border rounded-xl shadow-sm flex flex-col h-[calc(100vh-140px)] overflow-hidden">
        
        {/* Header Chat */}
        <div className="bg-primary/5 p-4 border-b flex justify-between items-center">
           <div className="flex items-center gap-3">
             <div className="bg-primary p-2 rounded-full text-primary-foreground relative">
                <Bot className="w-5 h-5"/>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></span>
             </div>
             <div>
               <h2 className="font-bold text-primary">Agente Sophia</h2>
               <p className="text-xs text-muted-foreground">GPT-4.1 mini - Ativa e escutando</p>
             </div>
           </div>
           <Button variant="ghost" size="sm" onClick={handleLimpar} title="Limpar Histórico" className="text-muted-foreground hover:text-destructive">
             <Trash2 className="w-4 h-4 mr-2"/> Nova Conversa
           </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 h-full">
           {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`p-2 rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-primary/20 text-primary'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4"/> : <Bot className="w-4 h-4"/>}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${
                        msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 
                        msg.isError ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-none' :
                        'bg-card border shadow-sm text-card-foreground rounded-tl-none'
                    }`}>
                      {msg.isError && <AlertCircle className="w-4 h-4 mb-2 inline-block mr-1"/>}
                      {msg.text}
                    </div>
                 </div>
              </div>
           ))}
           {isLoading && (
              <div className="flex justify-start">
                 <div className="flex gap-3 max-w-[85%] flex-row">
                    <div className="p-2 rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center bg-primary/20 text-primary">
                      <Bot className="w-4 h-4"/>
                    </div>
                    <div className="p-4 rounded-2xl bg-card border shadow-sm rounded-tl-none flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
                    </div>
                 </div>
              </div>
           )}
           <div ref={scrollRef} />
        </div>

        {/* Sugestões */}
        <div className="px-4 py-2 border-t bg-background overflow-x-auto flex gap-2 no-scrollbar">
           {sugestoes.map((s, idx) => (
             <Button key={idx} variant="outline" size="sm" className="rounded-full text-xs whitespace-nowrap bg-muted/50 hover:bg-muted" onClick={() => handleSend(s)}>
               <Sparkles className="w-3 h-3 mr-1 text-primary"/> {s}
             </Button>
           ))}
        </div>

        {/* Input Area */}
        <form className="p-4 bg-background border-t" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
           <div className="relative flex items-center">
             <Input 
               placeholder="Digite uma mensagem ou comando..." 
               value={inputMsg} 
               onChange={e => setInputMsg(e.target.value)} 
               className="pr-12 py-6 rounded-full bg-muted/50 border-transparent focus-visible:ring-primary/50 focus-visible:bg-background"
               disabled={isLoading}
             />
             <Button type="submit" size="icon" disabled={!inputMsg.trim() || isLoading} className="absolute right-1.5 rounded-full w-9 h-9 bg-primary hover:bg-primary/90 text-white">
                <Send className="w-4 h-4"/>
             </Button>
           </div>
        </form>

      </div>
    </MainLayout>
  );
}

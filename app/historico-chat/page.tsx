"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { MessageSquare, Search, User, Bot, Calendar, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: number;
  session_id: string;
  message: {
    text: string;
    type?: string;
    role?: string;
    sender?: string;
  };
}

interface ChatSession {
  session_id: string;
  last_id: number;
}

export default function ChatHistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      fetchMessages(selectedSessionId);
    }
  }, [selectedSessionId]);

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await fetch("/api/chat-history");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Erro ao buscar sessões:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      setLoadingMessages(true);
      const res = await fetch(`/api/chat-history?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.session_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="Histórico de Conversas" subtitle="Logs de interações do Agente IA (n8n)">
      <div className="flex h-[calc(100vh-180px)] -mx-6 -my-6 overflow-hidden">
        {/* Sidebar de Sessões */}
        <div className="w-80 border-r border-border/40 bg-muted/5 flex flex-col">
          <div className="p-4 border-b border-border/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar ID da sessão..." 
                className="pl-9 bg-background/50 border-none rounded-xl text-xs h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {loadingSessions ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded-full opacity-10" />
                    <Skeleton className="h-3 w-1/2 rounded-full opacity-5" />
                  </div>
                ))
              ) : (
                filteredSessions.map((session) => (
                  <button
                    key={session.session_id}
                    onClick={() => setSelectedSessionId(session.session_id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all group relative overflow-hidden ${
                      selectedSessionId === session.session_id
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Sessão</span>
                        <span className="text-xs font-bold truncate">{session.session_id}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${selectedSessionId === session.session_id ? "translate-x-1" : "opacity-0 group-hover:opacity-100"}`} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Área de Chat */}
        <div className="flex-1 flex flex-col bg-background/30 backdrop-blur-sm relative">
          {!selectedSessionId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-6 border border-primary/10">
                <MessageSquare className="w-10 h-10 text-primary/40" />
              </div>
              <h3 className="font-syne font-bold text-xl text-foreground mb-2">Selecione uma conversa</h3>
              <p className="text-muted-foreground text-sm max-w-xs font-dm">
                Clique em uma sessão na lateral para visualizar o histórico completo de mensagens do n8n.
              </p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-border/40 bg-background/50 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center font-syne font-bold text-sm shadow-lg">
                    {selectedSessionId.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-syne font-bold text-sm text-foreground">Sessão: {selectedSessionId}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[9px] px-2 h-4 font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        Ativa
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-dm flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {messages.length} mensagens totais
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                  {loadingMessages ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className={`flex gap-4 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                        <Skeleton className="w-10 h-10 rounded-xl opacity-10 shrink-0" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-20 w-full rounded-2xl opacity-5" />
                        </div>
                      </div>
                    ))
                  ) : (
                    messages.map((msg) => {
                      const isAi = msg.message.type === "ai" || msg.message.role === "assistant" || msg.message.sender === "ai";
                      return (
                        <div key={msg.id} className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isAi ? "flex-row" : "flex-row-reverse text-right"}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                            isAi ? "bg-primary text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                          }`}>
                            {isAi ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                          </div>
                          <div className={`flex flex-col max-w-[80%] ${isAi ? "items-start" : "items-end"}`}>
                             <div className={`p-4 rounded-2xl text-sm font-dm leading-relaxed shadow-sm ${
                               isAi 
                                ? "bg-white dark:bg-zinc-900 border border-border/40 text-foreground" 
                                : "bg-primary text-white"
                             }`}>
                               {msg.message.text}
                             </div>
                             <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mt-2 px-1">
                               {isAi ? "Assistente IA" : "Usuário"}
                             </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {messages.length === 0 && !loadingMessages && (
                    <p className="text-center text-muted-foreground text-xs py-12">Nenhuma mensagem encontrada nesta sessão.</p>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

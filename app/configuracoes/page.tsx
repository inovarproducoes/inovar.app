"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  User, 
  Globe, 
  Bell, 
  Camera, 
  Lock, 
  Mail, 
  Save, 
  Plus, 
  Trash2, 
  Settings, 
  CheckCircle2, 
  Webhook, 
  Key,
  Users,
  Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function SettingsPage() {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Record<string, string | boolean | object | null>[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Profile states
  const [profileName, setProfileName] = useState(usuario?.nome || "");
  const [profileEmail, setProfileEmail] = useState(usuario?.email || "");
  const [profilePhoto, setProfilePhoto] = useState(usuario?.foto_url || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (usuario) {
      setProfileName(usuario.nome);
      setProfileEmail(usuario.email);
      setProfilePhoto(usuario.foto_url || "");
    }
    fetchUsers();
  }, [usuario]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch("/api/configuracoes/usuarios");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/configuracoes/perfil", {
        method: "PATCH",
        body: JSON.stringify({
          id: usuario?.id,
          nome: profileName,
          email: profileEmail,
          foto_url: profilePhoto,
          senha_atual: currentPassword,
          nova_senha: newPassword
        })
      });

      if (res.ok) {
        toast.success("Perfil atualizado com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao atualizar perfil");
      }
    } catch {
      toast.error("Erro na conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Configurações" subtitle="Gerencie seu perfil, equipe e integrações do sistema.">
      <div className="max-w-6xl mx-auto py-4">
        <Tabs defaultValue="perfil" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList className="bg-zinc-100/50 dark:bg-zinc-900/50 p-1 rounded-2xl border border-border/40 backdrop-blur-sm">
              <TabsTrigger value="perfil" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                <User size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Meu Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="equipe" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                <Users size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Equipe</span>
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                <Webhook size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Webhooks</span>
              </TabsTrigger>
              <TabsTrigger value="sistema" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                <Layout size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Sistema</span>
              </TabsTrigger>
            </TabsList>

            <Button 
              onClick={handleUpdateProfile}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-8 h-12 font-syne font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-3"
            >
              {loading ? "Salvando..." : <><Save size={16} /> Salvar Alterações</>}
            </Button>
          </div>

          <TabsContent value="perfil" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <Card className="lg:col-span-1 border-border/40 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md rounded-3xl overflow-hidden shadow-sm">
                <CardHeader className="text-center pb-2">
                  <div className="relative w-32 h-32 mx-auto mb-4 group">
                    <div className="absolute inset-0 rounded-full bg-gradient-brand animate-pulse opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-full h-full rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden bg-muted flex items-center justify-center shadow-2xl">
                      {profilePhoto ? (
                        <Image src={profilePhoto} alt={profileName} fill className="object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-muted-foreground" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Camera className="text-white w-6 h-6" />
                      </div>
                    </div>
                  </div>
                  <CardTitle className="font-syne font-black text-xl">{profileName}</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-widest font-bold text-primary mt-1">{usuario?.role || "Usuário"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-muted/30">
                    <span className="text-muted-foreground font-medium">Membro desde</span>
                    <span className="font-bold text-foreground">Abril 2024</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-muted/30">
                    <span className="text-muted-foreground font-medium">Status da Conta</span>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-2 py-0.5">Ativo</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Details */}
              <Card className="lg:col-span-2 border-border/40 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="font-syne font-black text-lg">Informações Pessoais</CardTitle>
                  <CardDescription className="text-xs font-dm">Atualize seus dados de acesso e visibilidade.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          value={profileName}
                          onChange={e => setProfileName(e.target.value)}
                          className="pl-12 h-14 bg-background/50 border-border/40 rounded-2xl focus:ring-primary/10 transition-all text-sm font-dm" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">E-mail Corporativo</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          value={profileEmail}
                          onChange={e => setProfileEmail(e.target.value)}
                          className="pl-12 h-14 bg-background/50 border-border/40 rounded-2xl focus:ring-primary/10 transition-all text-sm font-dm" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">URL da Foto de Perfil</Label>
                    <Input 
                      value={profilePhoto}
                      onChange={e => setProfilePhoto(e.target.value)}
                      placeholder="https://..."
                      className="h-14 bg-background/50 border-border/40 rounded-2xl focus:ring-primary/10 transition-all text-sm font-dm" 
                    />
                  </div>

                  <div className="pt-6 border-t border-border/40 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-primary" />
                      <h4 className="font-syne font-black text-sm uppercase tracking-wider">Segurança</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Senha Atual</Label>
                        <Input 
                          type="password"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="h-14 bg-background/50 border-border/40 rounded-2xl focus:ring-primary/10 transition-all text-sm font-dm" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Nova Senha</Label>
                        <Input 
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                          className="h-14 bg-background/50 border-border/40 rounded-2xl focus:ring-primary/10 transition-all text-sm font-dm" 
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="equipe" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Card className="border-border/40 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md rounded-3xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-syne font-black text-lg">Gestão de Equipe</CardTitle>
                    <CardDescription className="text-xs font-dm">Controle os usuários que têm acesso ao painel Inovar.</CardDescription>
                  </div>
                  <Button className="rounded-2xl h-11 bg-zinc-900 text-white font-syne font-black text-[10px] uppercase tracking-widest px-6 gap-2">
                    <Plus size={14} /> Convidar Integrante
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {loadingUsers ? (
                      Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl opacity-10" />)
                    ) : (
                      users.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:bg-muted/30 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex items-center justify-center font-bold text-xs">
                              {u.foto_url ? <Image src={u.foto_url} alt={u.nome} width={48} height={48} /> : u.nome[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{u.nome}</p>
                              <p className="text-[10px] text-muted-foreground font-dm">{u.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden md:block">
                              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5">
                                {u.role}
                              </Badge>
                              <p className="text-[9px] text-muted-foreground font-dm mt-1">Acesso: {u.role === 'admin' ? 'Total' : 'Limitado'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                <Settings size={16} className="text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Card className="border-border/40 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="font-syne font-black text-lg">Integrações Webhook (n8n)</CardTitle>
                  <CardDescription className="text-xs font-dm">Configure os URLs de destino para automações e fluxos de dados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Webhook Suporte IA</Label>
                          <div className="relative">
                             <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                             <Input 
                                defaultValue="https://n8n.inovarapp.com/webhook/agenteinovar"
                                className="pl-12 h-14 bg-background/50 border-border/40 rounded-2xl font-dm text-xs" 
                             />
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground px-2 font-dm leading-relaxed">
                          Este URL recebe as interações do chat e processa via Agente IA.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Webhook Base CRM</Label>
                          <div className="relative">
                             <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                             <Input 
                                defaultValue="https://n8n.inovarapp.com/webhook/crm"
                                className="pl-12 h-14 bg-background/50 border-border/40 rounded-2xl font-dm text-xs" 
                             />
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground px-2 font-dm leading-relaxed">
                          URL base para sincronização de novos leads e atualizações de O.S.
                        </p>
                      </div>
                   </div>

                   <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                         <Bell className="text-primary w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-syne font-bold text-sm text-primary mb-1">Dica de Integração</h5>
                        <p className="text-xs text-primary/70 font-dm leading-relaxed">
                          Certifique-se de habilitar as permissões de CORS no seu n8n para permitir que o painel Inovar envie requisições diretamente se necessário.
                        </p>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="sistema" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-border/40 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md rounded-3xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-syne font-black text-lg">Aparência do Painel</CardTitle>
                    <CardDescription className="text-xs font-dm">Customize a experiência visual da plataforma.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
                              <Layout size={16} />
                           </div>
                           <span className="text-xs font-bold font-syne tracking-tight">Modo Escuro (Cinematic)</span>
                        </div>
                        <Switch checked />
                     </div>
                     <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                              <Globe size={16} />
                           </div>
                           <span className="text-xs font-bold font-syne tracking-tight">Animações de Interface</span>
                        </div>
                        <Switch checked />
                     </div>
                  </CardContent>
                </Card>

                <Card className="border-border/40 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md rounded-3xl shadow-sm border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="font-syne font-black text-lg text-primary">Status do Sistema</CardTitle>
                    <CardDescription className="text-xs font-dm text-primary/60">Informações técnicas do servidor Inovar.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                           <span>Carga do Servidor</span>
                           <span className="text-primary">12%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                           <div className="h-full bg-primary w-[12%]" />
                        </div>
                     </div>
                     <div className="flex items-center gap-3 text-xs font-bold font-syne text-foreground pt-4">
                        <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                        API Gateway Operational
                     </div>
                     <div className="flex items-center gap-3 text-xs font-bold font-syne text-foreground">
                        <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                        Database Pool Connected
                     </div>
                  </CardContent>
                </Card>
             </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <style>{`
        .bg-gradient-brand {
          background: linear-gradient(135deg, #7D539F 0%, #5e3a7a 100%);
        }
      `}</style>
    </MainLayout>
  );
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "outline" }) {
  const variants = {
    default: "bg-primary text-white",
    outline: "border border-border/40 text-muted-foreground"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

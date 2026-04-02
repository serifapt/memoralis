import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Users, Bell, Flower, Loader2, Upload, X, Crop, Image, Plus, Trash2 } from "lucide-react";
import { useFlowerService } from "@/hooks/useFlowerService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PublicPageTab } from "@/components/settings/PublicPageTab";
import { LogoCropper } from "@/components/settings/LogoCropper";
import { useFunerariaRole } from "@/hooks/useFunerariaRole";
import { MembersTab } from "@/components/settings/MembersTab";

const DEFAULT_SERVICES = [
  "Funerais e Cerimónias",
  "Cremação",
  "Tanatopraxia",
  "Transporte Nacional",
  "Transporte Internacional",
  "Repatriamento",
  "Trasladação",
  "Exumação",
  "Velório",
  "Florista",
  "Apoio Administrativo",
  "Apoio ao Luto",
];

interface CompanyData {
  nome_comercial: string;
  nif: string;
  telefone: string;
  email: string;
  morada: string;
  localidade: string;
  codigo_postal: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const { isFlowerServiceActive, funerariaId, toggleFlowerService } = useFlowerService();
  const { isEditor, loading: roleLoading } = useFunerariaRole();

  // Redirect editors away from settings
  useEffect(() => {
    if (!roleLoading && isEditor) {
      toast.error("Não tem permissão para aceder às configurações");
      navigate("/dashboard", { replace: true });
    }
  }, [roleLoading, isEditor, navigate]);
  const [companyData, setCompanyData] = useState<CompanyData>({
    nome_comercial: "", nif: "", telefone: "", email: "", morada: "", localidade: "", codigo_postal: "",
  });
  const [saving, setSaving] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(true);

  // Logo state
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [savingLogo, setSavingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropSource, setCropSource] = useState<string>("");

  // Services state
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServiceInput, setCustomServiceInput] = useState("");
  const [savingServices, setSavingServices] = useState(false);

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("funerarias")
        .select("nome_comercial, nif, telefone, email, morada, logo_url, localidade, codigo_postal, servicos")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setCompanyData({
          nome_comercial: data.nome_comercial || "",
          nif: data.nif || "",
          telefone: data.telefone || "",
          email: data.email || "",
          morada: data.morada || "",
          localidade: data.localidade || "",
          codigo_postal: data.codigo_postal || "",
        });
        if (data.logo_url) {
          setLogoUrl(data.logo_url);
          setLogoPreview(data.logo_url);
        }
      }
    } catch (err) {
      console.error("Error loading company data:", err);
    } finally {
      setLoadingCompany(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!funerariaId) {
      toast.error("Funerária não encontrada");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("funerarias")
        .update({
          nome_comercial: companyData.nome_comercial,
          nif: companyData.nif,
          telefone: companyData.telefone,
          email: companyData.email,
          morada: companyData.morada,
          localidade: companyData.localidade || null,
          codigo_postal: companyData.codigo_postal || null,
        })
        .eq("id", funerariaId);

      if (error) throw error;
      toast.success("Dados da empresa guardados com sucesso");
    } catch (err) {
      console.error("Error saving:", err);
      toast.error("Erro ao guardar os dados");
    } finally {
      setSaving(false);
    }
  };

  const autoCropToSquare = (src: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        const ox = (img.naturalWidth - side) / 2;
        const oy = (img.naturalHeight - side) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = side;
        canvas.height = side;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, ox, oy, side, side, 0, 0, side, side);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob failed"));
        }, "image/png", 1);
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecione um ficheiro de imagem");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("O ficheiro não pode exceder 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const src = reader.result as string;
      // Detect dimensions
      const img = new window.Image();
      img.onload = async () => {
        if (img.naturalWidth > img.naturalHeight) {
          // Horizontal: auto-crop to 1:1
          try {
            const blob = await autoCropToSquare(src);
            handleCropComplete(blob);
            toast.success("Logótipo otimizado automaticamente para 1:1");
          } catch {
            setCropSource(src);
            setShowCropper(true);
          }
        } else {
          // Square or vertical: open cropper
          setCropSource(src);
          setShowCropper(true);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "logo_cropped.png", { type: "image/png" });
    setLogoFile(file);
    const url = URL.createObjectURL(croppedBlob);
    setLogoPreview(url);
    setShowCropper(false);
    setCropSource("");
  };

  const handleOpenCropper = () => {
    if (logoPreview) {
      setCropSource(logoPreview);
      setShowCropper(true);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleSaveLogo = async () => {
    if (!funerariaId) {
      toast.error("Funerária não encontrada");
      return;
    }
    setSavingLogo(true);
    try {
      let newLogoUrl = logoPreview;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop() || "png";
        const fileName = `${funerariaId}/logo_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("funeraria-logos")
          .upload(fileName, logoFile, { contentType: logoFile.type, upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("funeraria-logos").getPublicUrl(fileName);
        newLogoUrl = urlData.publicUrl;
      }
      const urlToSave = newLogoUrl || null;
      const { error } = await supabase
        .from("funerarias")
        .update({ logo_url: urlToSave })
        .eq("id", funerariaId);
      if (error) throw error;
      setLogoUrl(urlToSave || "");
      setLogoFile(null);
      toast.success("Logótipo guardado com sucesso");
    } catch (err) {
      console.error("Error saving logo:", err);
      toast.error("Erro ao guardar o logótipo");
    } finally {
      setSavingLogo(false);
    }
  };

  const handleToggleFlowerService = async () => {
    const success = await toggleFlowerService();
    if (success) {
      toast.success(isFlowerServiceActive ? "Serviço de flores desativado" : "Serviço de flores ativado");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-archivo font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerir preferências e dados da empresa</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company"><Building2 className="w-4 h-4 mr-2" />Empresa</TabsTrigger>
          <TabsTrigger value="services"><Flower className="w-4 h-4 mr-2" />Serviços</TabsTrigger>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Utilizadores</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          {/* Company Info */}
          <Card className="p-6">
            <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">Informações da Empresa</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input id="company-name" value={companyData.nome_comercial} onChange={(e) => setCompanyData(prev => ({ ...prev, nome_comercial: e.target.value }))} placeholder="Casa Funerária..." disabled={loadingCompany} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nif">NIF</Label>
                  <Input id="nif" value={companyData.nif} onChange={(e) => setCompanyData(prev => ({ ...prev, nif: e.target.value }))} placeholder="000000000" disabled={loadingCompany} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Morada</Label>
                <Input id="address" value={companyData.morada} onChange={(e) => setCompanyData(prev => ({ ...prev, morada: e.target.value }))} placeholder="Rua..." disabled={loadingCompany} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="localidade">Localidade</Label>
                  <Input id="localidade" value={companyData.localidade} onChange={(e) => setCompanyData(prev => ({ ...prev, localidade: e.target.value }))} placeholder="Arcos de Valdevez" disabled={loadingCompany} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo-postal">Código Postal</Label>
                  <Input id="codigo-postal" value={companyData.codigo_postal} onChange={(e) => setCompanyData(prev => ({ ...prev, codigo_postal: e.target.value }))} placeholder="4970-446" disabled={loadingCompany} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" value={companyData.telefone} onChange={(e) => setCompanyData(prev => ({ ...prev, telefone: e.target.value }))} placeholder="+351..." disabled={loadingCompany} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={companyData.email} onChange={(e) => setCompanyData(prev => ({ ...prev, email: e.target.value }))} placeholder="contacto@..." disabled={loadingCompany} />
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleSaveCompany} disabled={saving || loadingCompany}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Guardar Alterações
              </Button>
            </div>
          </Card>

          {/* Logo */}
          <Card className="p-6">
            <h3 className="text-lg font-archivo font-semibold text-foreground mb-2">Logótipo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              O logótipo é utilizado nos cards de obituário, cabeçalhos de PDF, página pública e detalhe do obituário.
            </p>
            <div className="space-y-4">
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFileChange} />
              {logoPreview ? (
                <div className="flex flex-col items-center gap-4 p-6 rounded-lg border border-border bg-muted/20">
                  <div className="relative">
                    <img src={logoPreview} alt="Logótipo" className="h-40 w-auto object-contain rounded-lg" />
                    <button onClick={handleRemoveLogo} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                      <Image className="w-4 h-4 mr-1" />
                      Alterar
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleOpenCropper}>
                      <Crop className="w-4 h-4 mr-1" />
                      Recortar
                    </Button>
                  </div>
                </div>
              ) : (
                <div onClick={() => logoInputRef.current?.click()} className="border-2 border-dashed border-border rounded-lg p-10 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground">Arraste o logótipo ou clique para selecionar</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou SVG até 5MB</p>
                </div>
              )}
              <Button className="bg-primary hover:bg-primary/90" onClick={handleSaveLogo} disabled={savingLogo || loadingCompany}>
                {savingLogo && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Guardar Logótipo
              </Button>
            </div>

            {/* Cropper Dialog */}
            <LogoCropper
              open={showCropper}
              imageSrc={cropSource}
              onClose={() => setShowCropper(false)}
              onCropComplete={handleCropComplete}
            />
          </Card>

          {/* Public Page */}
          <PublicPageTab funerariaId={funerariaId} />
        </TabsContent>

        <TabsContent value="services">
          <Card className="p-6">
            <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">Serviços Opcionais</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Flower className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Catálogo de Flores</p>
                    <p className="text-sm text-muted-foreground">Permita que visitantes enviem flores para os funerais</p>
                  </div>
                </div>
                <Switch checked={isFlowerServiceActive} onCheckedChange={handleToggleFlowerService} disabled={!funerariaId} />
              </div>
              {isFlowerServiceActive && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    O serviço de flores está ativo. Aceda ao <strong>Catálogo de Flores</strong> no menu lateral para gerir os seus produtos.
                  </p>
                </div>
              )}
              {!funerariaId && (
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <p className="text-sm text-destructive">Não foi possível carregar os dados da funerária. Por favor, recarregue a página.</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          {funerariaId ? (
            <MembersTab funerariaId={funerariaId} />
          ) : (
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">A carregar...</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">Preferências de Notificações</h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Configurações de notificações serão implementadas em breve.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

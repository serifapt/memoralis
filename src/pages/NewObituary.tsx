import { useState, useEffect, useRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Eye, Upload, Heart, MessageCircle, Calendar, Clock, MapPin, Map, User, Plus, X, Receipt, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddRelationshipDialog } from "@/components/obituaries/AddRelationshipDialog";
import { AnnouncementGenerator } from "@/components/obituaries/AnnouncementGenerator";
import { DocumentsTab } from "@/components/obituaries/DocumentsTab";
import { useClients } from "@/hooks/useClients";

export default function NewObituary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { findOrCreateClient } = useClients();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUuid = id ? uuidRegex.test(id) : false;
  const isEditing = !!id && isValidUuid;
  const [isPublic, setIsPublic] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [funerariaId, setFunerariaId] = useState<string>("");
  const [responsibleClientId, setResponsibleClientId] = useState<string | null>(null);
  const [relatedObituaries, setRelatedObituaries] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  // Ceremony toggles
  const [velorio, setVelorio] = useState(false);
  const [funeral, setFuneral] = useState(false);
  const [cremacao, setCremacao] = useState(false);
  const [missa7, setMissa7] = useState(false);
  const [missa30, setMissa30] = useState(false);
  const [missa1ano, setMissa1ano] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: "",
    fullName: "",
    birthDate: "",
    freguesia: "",
    locality: "",
    birthPlace: "",
    nationality: "",
    civilStatus: "",
    profession: "",
    idCard: "",
    taxId: "",
    socialSecurity: "",
    beneficiary: "",
    deathLocation: "",
    deathDate: "",
    deathTime: "",
    cause: "",
    doctor: "",
    medicalCertificate: "",
    publicMessage: "",
    // Velório
    velorioDate: "",
    velorioTime: "",
    velorioLocation: "",
    velorioMapLink: "",
    // Funeral
    funeralDate: "",
    funeralTime: "",
    funeralCemetery: "",
    funeralMapLink: "",
    funeralResponsible: "",
    funeralPhone: "",
    // Cremação
    cremacaoDate: "",
    cremacaoTime: "",
    cremacaoCemetery: "",
    cremacaoMapLink: "",
    cremacaoResponsible: "",
    cremacaoPhone: "",
    // Missa 7º Dia
    missa7Date: "",
    missa7Time: "",
    missa7Location: "",
    missa7MapLink: "",
    // Missa 30º Dia
    missa30Date: "",
    missa30Time: "",
    missa30Location: "",
    missa30MapLink: "",
    // Missa 1º Ano
    missa1anoDate: "",
    missa1anoTime: "",
    missa1anoLocation: "",
    missa1anoMapLink: "",
    // Notas
    observations: "",
    hideCondolences: false,
    // Informação Família / Responsável
    familyName: "",
    familyRelationship: "",
    familyEmail: "",
    familyPhone: "",
    familyNif: "",
    familyNiss: "",
    familyNaturalidade: "",
    familyIban: "",
    familyAddress: "",
    familyLocality: "",
    familyPostalCode: "",
    familyObservations: "",
    // Informação do Serviço
    serviceType: "",
    coffinBrand: "",
    coffinRef: "",
    servicePrice: "",
  });

  const completionPercentage = Math.round(
    (Object.values(formData).filter((v) => v !== "").length /
      Object.values(formData).length) *
      100
  );

  const handleInputChange = (
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    fetchFunerariaId();
    if (isEditing && id) {
      fetchRelatedObituaries();
    }
  }, [id, isEditing]);

  useEffect(() => {
    // Scroll to anchor if present in URL
    if (location.hash) {
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  const fetchFunerariaId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('funerarias')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setFunerariaId(data.id);
        }
      }
    } catch (error) {
      console.error('Error fetching funeraria:', error);
    }
  };

  const fetchRelatedObituaries = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('obituary_relationships')
        .select(`
          id,
          relationship_type,
          related_obituary:obituaries!obituary_relationships_related_obituary_id_fkey(
            id,
            display_name,
            death_date
          )
        `)
        .eq('obituary_id', id);

      if (error) throw error;
      setRelatedObituaries(data || []);
    } catch (error) {
      console.error('Error fetching related obituaries:', error);
    }
  };

  const handleRemoveRelationship = async (relationshipId: string) => {
    try {
      const { error } = await supabase
        .from('obituary_relationships')
        .delete()
        .eq('id', relationshipId);

      if (error) throw error;

      toast({
        title: "Relação removida",
        description: "O óbito foi desvinculado com sucesso",
      });

      fetchRelatedObituaries();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover a relação",
        variant: "destructive",
      });
    }
  };

  const getRelationshipLabel = (type: string) => {
    const labels: Record<string, string> = {
      pai: "Pai/Mãe",
      filho: "Filho(a)",
      conjuge: "Cônjuge",
      irmao: "Irmão(ã)",
      avo: "Avô/Avó",
      neto: "Neto(a)",
      tio: "Tio(a)",
      sobrinho: "Sobrinho(a)",
      outro: "Outro Familiar"
    };
    return labels[type] || type;
  };

  // Load obituary data when editing
  useEffect(() => {
    const loadObituaryData = async () => {
      if (!isEditing || !id) return;
      
      try {
        const { data, error } = await supabase
          .from('obituaries')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) return;

        setIsPublic(data.is_public);
        setIsCompleted(data.is_completed);
        setResponsibleClientId(data.responsible_client_id);
        if (data.photo_url) setPhotoPreview(data.photo_url);
        
        setFormData({
          displayName: data.display_name || "",
          fullName: data.full_name || "",
          birthDate: data.birth_date || "",
          freguesia: data.freguesia || "",
          locality: data.locality || "",
          birthPlace: data.birth_place || "",
          nationality: data.nationality || "",
          civilStatus: data.civil_status || "",
          profession: data.profession || "",
          idCard: data.id_card || "",
          taxId: data.tax_id || "",
          socialSecurity: data.social_security || "",
          beneficiary: data.beneficiary || "",
          deathLocation: data.death_location || "",
          deathDate: data.death_date || "",
          deathTime: data.death_time || "",
          cause: data.cause || "",
          doctor: data.doctor || "",
          medicalCertificate: data.medical_certificate || "",
          publicMessage: data.public_message || "",
          velorioDate: "",
          velorioTime: "",
          velorioLocation: "",
          velorioMapLink: "",
          funeralDate: "",
          funeralTime: "",
          funeralCemetery: "",
          funeralMapLink: "",
          funeralResponsible: "",
          funeralPhone: "",
          cremacaoDate: "",
          cremacaoTime: "",
          cremacaoCemetery: "",
          cremacaoMapLink: "",
          cremacaoResponsible: "",
          cremacaoPhone: "",
          missa7Date: "",
          missa7Time: "",
          missa7Location: "",
          missa7MapLink: "",
          missa30Date: "",
          missa30Time: "",
          missa30Location: "",
          missa30MapLink: "",
          missa1anoDate: "",
          missa1anoTime: "",
          missa1anoLocation: "",
          missa1anoMapLink: "",
          observations: data.observations || "",
          hideCondolences: data.hide_condolences || false,
          familyName: "",
          familyRelationship: "",
          familyEmail: "",
          familyPhone: "",
          familyNif: "",
          familyNiss: "",
          familyNaturalidade: "",
          familyIban: "",
          familyAddress: "",
          familyLocality: "",
          familyPostalCode: "",
          familyObservations: "",
          serviceType: data.service_type || "",
          coffinBrand: data.coffin_brand || "",
          coffinRef: data.coffin_ref || "",
          servicePrice: data.service_price?.toString() || "",
        });

        // Load responsible client data
        if (data.responsible_client_id) {
          const { data: clientData } = await supabase
            .from('clients')
            .select('*')
            .eq('id', data.responsible_client_id)
            .maybeSingle();

          if (clientData) {
            setFormData(prev => ({
              ...prev,
              familyName: clientData.full_name || "",
              familyRelationship: clientData.relationship_degree || "",
              familyEmail: clientData.email || "",
              familyPhone: clientData.phone || "",
              familyNif: clientData.nif || "",
              familyNiss: clientData.niss || "",
              familyNaturalidade: clientData.nationality_place || "",
              familyIban: clientData.iban || "",
              familyAddress: clientData.address || "",
              familyLocality: clientData.city || "",
              familyPostalCode: clientData.postal_code || "",
              familyObservations: clientData.notes || "",
            }));
          }
        }

        // Load ceremony events
        const { data: events } = await supabase
          .from('ceremony_events')
          .select('*')
          .eq('obituary_id', id);

        if (events) {
          events.forEach(event => {
            if (event.event_type === 'velorio') {
              setVelorio(true);
              setFormData(prev => ({
                ...prev,
                velorioDate: event.event_date || "",
                velorioTime: event.event_time || "",
                velorioLocation: event.location || "",
                velorioMapLink: event.map_link || "",
              }));
            } else if (event.event_type === 'funeral') {
              setFuneral(true);
              setFormData(prev => ({
                ...prev,
                funeralDate: event.event_date || "",
                funeralTime: event.event_time || "",
                funeralCemetery: event.location || "",
                funeralMapLink: event.map_link || "",
                funeralResponsible: event.responsible_name || "",
                funeralPhone: event.responsible_phone || "",
              }));
            } else if (event.event_type === 'cremacao') {
              setCremacao(true);
              setFormData(prev => ({
                ...prev,
                cremacaoDate: event.event_date || "",
                cremacaoTime: event.event_time || "",
                cremacaoCemetery: event.location || "",
                cremacaoMapLink: event.map_link || "",
                cremacaoResponsible: event.responsible_name || "",
                cremacaoPhone: event.responsible_phone || "",
              }));
            } else if (event.event_type === 'missa7') {
              setMissa7(true);
              setFormData(prev => ({
                ...prev,
                missa7Date: event.event_date || "",
                missa7Time: event.event_time || "",
                missa7Location: event.location || "",
                missa7MapLink: event.map_link || "",
              }));
            } else if (event.event_type === 'missa30') {
              setMissa30(true);
              setFormData(prev => ({
                ...prev,
                missa30Date: event.event_date || "",
                missa30Time: event.event_time || "",
                missa30Location: event.location || "",
                missa30MapLink: event.map_link || "",
              }));
            } else if (event.event_type === 'missa1ano') {
              setMissa1ano(true);
              setFormData(prev => ({
                ...prev,
                missa1anoDate: event.event_date || "",
                missa1anoTime: event.event_time || "",
                missa1anoLocation: event.location || "",
                missa1anoMapLink: event.map_link || "",
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error loading obituary:', error);
      }
    };

    loadObituaryData();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      // Validate funerariaId
      if (!funerariaId) {
        toast({ title: "Erro", description: "Funerária não encontrada. Tente recarregar a página.", variant: "destructive" });
        setIsSaving(false);
        return;
      }

      // Validate required fields
      if (!formData.displayName.trim()) {
        toast({ title: "Erro", description: "O nome do falecido é obrigatório.", variant: "destructive" });
        setIsSaving(false);
        return;
      }

      // 1. First, sync client if family data is provided
      let clientId = responsibleClientId;
      if (formData.familyName && formData.familyName.trim() !== "") {
        const client = await findOrCreateClient({
          full_name: formData.familyName,
          relationship_degree: formData.familyRelationship || undefined,
          email: formData.familyEmail || undefined,
          phone: formData.familyPhone || undefined,
          nif: formData.familyNif || undefined,
          niss: formData.familyNiss || undefined,
          nationality_place: formData.familyNaturalidade || undefined,
          iban: formData.familyIban || undefined,
          address: formData.familyAddress || undefined,
          city: formData.familyLocality || undefined,
          postal_code: formData.familyPostalCode || undefined,
          notes: formData.familyObservations || undefined,
        });
        if (client) {
          clientId = client.id;
          setResponsibleClientId(client.id);
        }
      }

      // 2. Upload photo if selected
      let photoUrl: string | null = photoPreview && !photoFile ? photoPreview : null;
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${funerariaId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('obituary-photos')
          .upload(fileName, photoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('obituary-photos')
          .getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }

      // 3. Prepare obituary data
      const obituaryData = {
        funeraria_id: funerariaId,
        display_name: formData.displayName.trim(),
        full_name: formData.fullName.trim() || formData.displayName.trim(),
        birth_date: formData.birthDate || null,
        freguesia: formData.freguesia || null,
        locality: formData.locality || null,
        birth_place: formData.birthPlace || null,
        nationality: formData.nationality || null,
        civil_status: formData.civilStatus || null,
        profession: formData.profession || null,
        id_card: formData.idCard || null,
        tax_id: formData.taxId || null,
        social_security: formData.socialSecurity || null,
        beneficiary: formData.beneficiary || null,
        death_location: formData.deathLocation || null,
        death_date: formData.deathDate || null,
        death_time: formData.deathTime || null,
        cause: formData.cause || null,
        doctor: formData.doctor || null,
        medical_certificate: formData.medicalCertificate || null,
        public_message: formData.publicMessage || null,
        observations: formData.observations || null,
        hide_condolences: formData.hideCondolences,
        is_public: isPublic,
        is_completed: isCompleted,
        service_type: formData.serviceType || null,
        coffin_brand: formData.coffinBrand || null,
        coffin_ref: formData.coffinRef || null,
        service_price: formData.servicePrice ? parseFloat(formData.servicePrice) : null,
        responsible_client_id: clientId,
        photo_url: photoUrl,
      };

      let obituaryId = id;

      if (isEditing && id) {
        // Update existing obituary
        const { error } = await supabase
          .from('obituaries')
          .update(obituaryData)
          .eq('id', id);

        if (error) throw error;
      } else {
        // Create new obituary
        const { data, error } = await supabase
          .from('obituaries')
          .insert(obituaryData)
          .select()
          .single();

        if (error) throw error;
        obituaryId = data.id;
      }

      // 3. Save ceremony events
      if (obituaryId) {
        // Delete existing events
        await supabase.from('ceremony_events').delete().eq('obituary_id', obituaryId);

        const eventsToInsert = [];

        if (velorio) {
          eventsToInsert.push({
            obituary_id: obituaryId,
            event_type: 'velorio',
            event_date: formData.velorioDate || null,
            event_time: formData.velorioTime || null,
            location: formData.velorioLocation || null,
            map_link: formData.velorioMapLink || null,
          });
        }

        if (funeral) {
          eventsToInsert.push({
            obituary_id: obituaryId,
            event_type: 'funeral',
            event_date: formData.funeralDate || null,
            event_time: formData.funeralTime || null,
            location: formData.funeralCemetery || null,
            map_link: formData.funeralMapLink || null,
            responsible_name: formData.funeralResponsible || null,
            responsible_phone: formData.funeralPhone || null,
          });
        }

        if (cremacao) {
          eventsToInsert.push({
            obituary_id: obituaryId,
            event_type: 'cremacao',
            event_date: formData.cremacaoDate || null,
            event_time: formData.cremacaoTime || null,
            location: formData.cremacaoCemetery || null,
            map_link: formData.cremacaoMapLink || null,
            responsible_name: formData.cremacaoResponsible || null,
            responsible_phone: formData.cremacaoPhone || null,
          });
        }

        if (missa7) {
          eventsToInsert.push({
            obituary_id: obituaryId,
            event_type: 'missa7',
            event_date: formData.missa7Date || null,
            event_time: formData.missa7Time || null,
            location: formData.missa7Location || null,
            map_link: formData.missa7MapLink || null,
          });
        }

        if (missa30) {
          eventsToInsert.push({
            obituary_id: obituaryId,
            event_type: 'missa30',
            event_date: formData.missa30Date || null,
            event_time: formData.missa30Time || null,
            location: formData.missa30Location || null,
            map_link: formData.missa30MapLink || null,
          });
        }

        if (missa1ano) {
          eventsToInsert.push({
            obituary_id: obituaryId,
            event_type: 'missa1ano',
            event_date: formData.missa1anoDate || null,
            event_time: formData.missa1anoTime || null,
            location: formData.missa1anoLocation || null,
            map_link: formData.missa1anoMapLink || null,
          });
        }

        if (eventsToInsert.length > 0) {
          await supabase.from('ceremony_events').insert(eventsToInsert);
        }
      }

      toast({
        title: isEditing ? "Obituário atualizado" : "Obituário criado",
        description: isEditing ? "Os dados foram atualizados com sucesso" : "O obituário foi criado com sucesso",
      });

      setHasUnsavedChanges(false);

      if (!isEditing && obituaryId) {
        navigate(`/obituaries/${obituaryId}/edit`);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível guardar o obituário",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateBudget = () => {
    if (id) {
      navigate(`/budgets/new?obituaryId=${id}`);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-archivo font-bold text-foreground">
          {isEditing ? "Editar Processo Obituário" : "Novo Obituário"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditing ? "Atualize os dados do obituário" : "Preencha os dados para criar um novo obituário"}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-4 lg:gap-8 max-w-full">
        {/* Form Section */}
        <div className="min-w-0 overflow-hidden">
          <Tabs defaultValue="pessoais" className="w-full">
            <TabsList className="w-full mb-4 md:mb-8 justify-start max-w-full">
              <TabsTrigger value="pessoais">Informações Pessoais</TabsTrigger>
              <TabsTrigger value="funebres">Informações Fúnebres</TabsTrigger>
              <TabsTrigger value="familia">Família / Responsável</TabsTrigger>
              <TabsTrigger value="servico">Informação do Serviço</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
              <TabsTrigger value="anuncios">Anúncios</TabsTrigger>
            </TabsList>

            {/* Tab: Informações Pessoais */}
            <TabsContent value="pessoais" className="space-y-4 md:space-y-8 max-w-full">
              {/* Informações Obituário */}
              <Card className="p-6">
                <h2 className="text-xl font-archivo font-semibold mb-2">
                  Informações Obituário
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Os campos marcados com * são obrigatórios para a geração automática de certificados e documentos oficiais no tab Documentos.
                </p>

                <div className="space-y-6">
                  {/* Nome */}
                  <div>
                    <Label htmlFor="displayName">Nome*</Label>
                    <Input
                      id="displayName"
                      placeholder="Nome a apresentar anúncio"
                      value={formData.displayName}
                      onChange={(e) =>
                        handleInputChange("displayName", e.target.value)
                      }
                    />
                  </div>

                  {/* Nome Completo and Data Nascimento */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Nome Completo*</Label>
                      <Input
                        id="fullName"
                        placeholder="Nome completo do óbito"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="birthDate">Data Nascimento*</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) =>
                          handleInputChange("birthDate", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Freguesia, Localidade, Naturalidade */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="freguesia">Freguesia*</Label>
                      <Input
                        id="freguesia"
                        placeholder="Couto"
                        value={formData.freguesia}
                        onChange={(e) =>
                          handleInputChange("freguesia", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="locality">Localidade*</Label>
                      <Input
                        id="locality"
                        placeholder="Arcos de Valdevez"
                        value={formData.locality}
                        onChange={(e) =>
                          handleInputChange("locality", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="birthPlace">Naturalidade*</Label>
                      <Input
                        id="birthPlace"
                        placeholder="Couto"
                        value={formData.birthPlace}
                        onChange={(e) =>
                          handleInputChange("birthPlace", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Nacionalidade, Estado Civil, Profissão */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="nationality">Nacionalidade* (para documentos consulares)</Label>
                      <Input
                        id="nationality"
                        placeholder="Arcos de Valdevez"
                        value={formData.nationality}
                        onChange={(e) =>
                          handleInputChange("nationality", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="civilStatus">Estado Civil*</Label>
                      <Input
                        id="civilStatus"
                        placeholder="Arcos de Valdevez"
                        value={formData.civilStatus}
                        onChange={(e) =>
                          handleInputChange("civilStatus", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="profession">Profissão</Label>
                      <Input
                        id="profession"
                        placeholder="Couto"
                        value={formData.profession}
                        onChange={(e) =>
                          handleInputChange("profession", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="idCard">Cartão Cidadão*</Label>
                      <Input
                        id="idCard"
                        placeholder="Inserir Número"
                        value={formData.idCard}
                        onChange={(e) =>
                          handleInputChange("idCard", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxId" className="flex items-center gap-1.5">
                        NIF*
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent><p>Necessário para documentos fiscais</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Input
                        id="taxId"
                        placeholder="Inserir Número"
                        value={formData.taxId}
                        onChange={(e) =>
                          handleInputChange("taxId", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="socialSecurity" className="flex items-center gap-1.5">
                        Segurança Social*
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent><p>Necessário para subsídio funeral</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Input
                        id="socialSecurity"
                        placeholder="Inserir Número"
                        value={formData.socialSecurity}
                        onChange={(e) =>
                          handleInputChange("socialSecurity", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="beneficiary">Beneficiário (SNS ou CGA)*</Label>
                      <Input
                        id="beneficiary"
                        placeholder="Inserir Número"
                        value={formData.beneficiary}
                        onChange={(e) =>
                          handleInputChange("beneficiary", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Death Information */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="deathLocation">Local Falecimento*</Label>
                      <Input
                        id="deathLocation"
                        placeholder="Hospital, domicílio..."
                        value={formData.deathLocation}
                        onChange={(e) =>
                          handleInputChange("deathLocation", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="deathDate">Data Falecimento*</Label>
                      <Input
                        id="deathDate"
                        type="date"
                        value={formData.deathDate}
                        onChange={(e) =>
                          handleInputChange("deathDate", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="deathTime">Hora Falecimento</Label>
                      <Input
                        id="deathTime"
                        type="time"
                        value={formData.deathTime}
                        onChange={(e) =>
                          handleInputChange("deathTime", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="cause">Causa</Label>
                      <Input
                        id="cause"
                        placeholder="Info Opcional"
                        value={formData.cause}
                        onChange={(e) =>
                          handleInputChange("cause", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="doctor">Médico Declarante*</Label>
                      <Input
                        id="doctor"
                        placeholder="Nome Médico"
                        value={formData.doctor}
                        onChange={(e) =>
                          handleInputChange("doctor", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="medicalCertificate">Cédula do Médico</Label>
                      <Input
                        id="medicalCertificate"
                        placeholder="Número da Cédula"
                        value={formData.medicalCertificate}
                        onChange={(e) =>
                          handleInputChange("medicalCertificate", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Photo Upload */}
              <Card className="p-6">
                <h3 className="font-medium mb-4">Adicionar foto destaque óbito</h3>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPhotoFile(file);
                      setPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {photoPreview ? (
                  <div className="relative w-40 h-40">
                    <img
                      src={photoPreview}
                      alt="Foto destaque"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview("");
                        if (photoInputRef.current) photoInputRef.current.value = "";
                      }}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Selecionar ficheiro..."
                        readOnly
                        onClick={() => photoInputRef.current?.click()}
                        className="cursor-pointer"
                      />
                    </div>
                    <Button type="button" variant="default" className="gap-2" onClick={() => photoInputRef.current?.click()}>
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </Card>

              {/* Public Message */}
              <Card className="p-6">
                <div className="mb-2">
                  <Label htmlFor="publicMessage">Mensagem Pública *</Label>
                  <p className="text-sm text-muted-foreground">Mensagem da família</p>
                </div>
                <Textarea
                  id="publicMessage"
                  placeholder="Máximo 2000 caracteres"
                  rows={6}
                  maxLength={2000}
                  value={formData.publicMessage}
                  onChange={(e) =>
                    handleInputChange("publicMessage", e.target.value)
                  }
                />
              </Card>
            </TabsContent>

            {/* Tab: Informações Fúnebres */}
            <TabsContent value="funebres" className="space-y-4 md:space-y-8 max-w-full">
              {/* Informações Fúnebres */}
              <Card className="p-6">
                <h2 className="text-xl font-archivo font-semibold mb-6">
                  Informações Fúnebres
                </h2>

                <div className="space-y-8">
                  {/* Velório */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={velorio} onCheckedChange={setVelorio} />
                      <Label className="font-medium">Velório</Label>
                    </div>
                    {velorio && (
                      <div className="grid md:grid-cols-4 gap-4 pl-8">
                        <div>
                          <Label htmlFor="velorioDate" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Data
                          </Label>
                          <Input
                            id="velorioDate"
                            type="date"
                            value={formData.velorioDate}
                            onChange={(e) =>
                              handleInputChange("velorioDate", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="velorioTime" className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Hora
                          </Label>
                          <Input
                            id="velorioTime"
                            type="time"
                            value={formData.velorioTime}
                            onChange={(e) =>
                              handleInputChange("velorioTime", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="velorioLocation" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Nome do Local
                          </Label>
                          <Input
                            id="velorioLocation"
                            value={formData.velorioLocation}
                            onChange={(e) =>
                              handleInputChange("velorioLocation", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="velorioMapLink" className="flex items-center gap-2">
                            <Map className="w-4 h-4" />
                            Link do mapa
                          </Label>
                          <Input
                            id="velorioMapLink"
                            value={formData.velorioMapLink}
                            onChange={(e) =>
                              handleInputChange("velorioMapLink", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Funeral */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={funeral} onCheckedChange={setFuneral} />
                      <Label className="font-medium">Funeral</Label>
                    </div>
                    {funeral && (
                      <div className="space-y-4 pl-8">
                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor="funeralDate" className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Data
                            </Label>
                            <Input
                              id="funeralDate"
                              type="date"
                              value={formData.funeralDate}
                              onChange={(e) =>
                                handleInputChange("funeralDate", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="funeralTime" className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Hora
                            </Label>
                            <Input
                              id="funeralTime"
                              type="time"
                              value={formData.funeralTime}
                              onChange={(e) =>
                                handleInputChange("funeralTime", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="funeralCemetery" className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Nome do Cemitério* (necessário para documentos oficiais)
                            </Label>
                            <Input
                              id="funeralCemetery"
                              value={formData.funeralCemetery}
                              onChange={(e) =>
                                handleInputChange("funeralCemetery", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="funeralMapLink" className="flex items-center gap-2">
                              <Map className="w-4 h-4" />
                              Link do mapa
                            </Label>
                            <Input
                              id="funeralMapLink"
                              value={formData.funeralMapLink}
                              onChange={(e) =>
                                handleInputChange("funeralMapLink", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="funeralResponsible">Nome</Label>
                            <Input
                              id="funeralResponsible"
                              placeholder="Nome do(a) Responsável"
                              value={formData.funeralResponsible}
                              onChange={(e) =>
                                handleInputChange("funeralResponsible", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="funeralPhone">Contacto Telefónico</Label>
                            <Input
                              id="funeralPhone"
                              placeholder="+351 000 000 000"
                              value={formData.funeralPhone}
                              onChange={(e) =>
                                handleInputChange("funeralPhone", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cremação */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={cremacao} onCheckedChange={setCremacao} />
                      <Label className="font-medium">Cremação</Label>
                    </div>
                    {cremacao && (
                      <div className="space-y-4 pl-8">
                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor="cremacaoDate" className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Data
                            </Label>
                            <Input
                              id="cremacaoDate"
                              type="date"
                              value={formData.cremacaoDate}
                              onChange={(e) =>
                                handleInputChange("cremacaoDate", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="cremacaoTime" className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Hora
                            </Label>
                            <Input
                              id="cremacaoTime"
                              type="time"
                              value={formData.cremacaoTime}
                              onChange={(e) =>
                                handleInputChange("cremacaoTime", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="cremacaoCemetery" className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Nome do Cemitério
                            </Label>
                            <Input
                              id="cremacaoCemetery"
                              value={formData.cremacaoCemetery}
                              onChange={(e) =>
                                handleInputChange("cremacaoCemetery", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="cremacaoMapLink" className="flex items-center gap-2">
                              <Map className="w-4 h-4" />
                              Link do mapa
                            </Label>
                            <Input
                              id="cremacaoMapLink"
                              value={formData.cremacaoMapLink}
                              onChange={(e) =>
                                handleInputChange("cremacaoMapLink", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cremacaoResponsible">Nome</Label>
                            <Input
                              id="cremacaoResponsible"
                              placeholder="Nome do(a) Responsável"
                              value={formData.cremacaoResponsible}
                              onChange={(e) =>
                                handleInputChange("cremacaoResponsible", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="cremacaoPhone">Contacto Telefónico</Label>
                            <Input
                              id="cremacaoPhone"
                              placeholder="+351 000 000 000"
                              value={formData.cremacaoPhone}
                              onChange={(e) =>
                                handleInputChange("cremacaoPhone", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Missa 7º Dia */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={missa7} onCheckedChange={setMissa7} />
                      <Label className="font-medium">Missa 7º Dia</Label>
                    </div>
                    {missa7 && (
                      <div className="grid md:grid-cols-4 gap-4 pl-8">
                        <div>
                          <Label htmlFor="missa7Date" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Data
                          </Label>
                          <Input
                            id="missa7Date"
                            type="date"
                            value={formData.missa7Date}
                            onChange={(e) =>
                              handleInputChange("missa7Date", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="missa7Time" className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Hora
                          </Label>
                          <Input
                            id="missa7Time"
                            type="time"
                            value={formData.missa7Time}
                            onChange={(e) =>
                              handleInputChange("missa7Time", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="missa7Location" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Nome do Local
                          </Label>
                          <Input
                            id="missa7Location"
                            value={formData.missa7Location}
                            onChange={(e) =>
                              handleInputChange("missa7Location", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="missa7MapLink" className="flex items-center gap-2">
                            <Map className="w-4 h-4" />
                            Link do mapa
                          </Label>
                          <Input
                            id="missa7MapLink"
                            value={formData.missa7MapLink}
                            onChange={(e) =>
                              handleInputChange("missa7MapLink", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Missa 30º Dia */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={missa30} onCheckedChange={setMissa30} />
                      <Label className="font-medium">Missa 30º Dia</Label>
                    </div>
                    {missa30 && (
                      <div className="grid md:grid-cols-4 gap-4 pl-8">
                        <div>
                          <Label htmlFor="missa30Date" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Data
                          </Label>
                          <Input
                            id="missa30Date"
                            type="date"
                            value={formData.missa30Date}
                            onChange={(e) =>
                              handleInputChange("missa30Date", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="missa30Time" className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Hora
                          </Label>
                          <Input
                            id="missa30Time"
                            type="time"
                            value={formData.missa30Time}
                            onChange={(e) =>
                              handleInputChange("missa30Time", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="missa30Location" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Nome do Local
                          </Label>
                          <Input
                            id="missa30Location"
                            value={formData.missa30Location}
                            onChange={(e) =>
                              handleInputChange("missa30Location", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="missa30MapLink" className="flex items-center gap-2">
                            <Map className="w-4 h-4" />
                            Link do mapa
                          </Label>
                          <Input
                            id="missa30MapLink"
                            value={formData.missa30MapLink}
                            onChange={(e) =>
                              handleInputChange("missa30MapLink", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Missa 1º Ano */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={missa1ano} onCheckedChange={setMissa1ano} />
                      <Label className="font-medium">Missa 1º Ano</Label>
                    </div>
                    {missa1ano && (
                      <div className="grid md:grid-cols-4 gap-4 pl-8">
                        <div>
                          <Label htmlFor="missa1anoDate" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Data
                          </Label>
                          <Input
                            id="missa1anoDate"
                            type="date"
                            value={formData.missa1anoDate}
                            onChange={(e) =>
                              handleInputChange("missa1anoDate", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="missa1anoTime" className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Hora
                          </Label>
                          <Input
                            id="missa1anoTime"
                            type="time"
                            value={formData.missa1anoTime}
                            onChange={(e) =>
                              handleInputChange("missa1anoTime", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="missa1anoLocation" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Nome do Local
                          </Label>
                          <Input
                            id="missa1anoLocation"
                            value={formData.missa1anoLocation}
                            onChange={(e) =>
                              handleInputChange("missa1anoLocation", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="missa1anoMapLink" className="flex items-center gap-2">
                            <Map className="w-4 h-4" />
                            Link do mapa
                          </Label>
                          <Input
                            id="missa1anoMapLink"
                            value={formData.missa1anoMapLink}
                            onChange={(e) =>
                              handleInputChange("missa1anoMapLink", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Observações / Notas / Pedidos */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="mb-2">
                      <Label htmlFor="observations">Observações / Notas / Pedidos</Label>
                    </div>
                    <Textarea
                      id="observations"
                      placeholder="Deixe aqui as notas ou pedidos dos familiares"
                      rows={8}
                      value={formData.observations}
                      onChange={(e) =>
                        handleInputChange("observations", e.target.value)
                      }
                    />
                  </div>
                </div>
              </Card>

              {/* Detalhes */}
              <Card className="p-6">
                <h3 className="font-medium mb-4">Detalhes</h3>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hideCondolences"
                    checked={formData.hideCondolences}
                    onCheckedChange={(checked) =>
                      handleInputChange("hideCondolences", checked as boolean)
                    }
                  />
                  <Label htmlFor="hideCondolences" className="cursor-pointer">
                    Ocultar Condolências
                  </Label>
                </div>
              </Card>
            </TabsContent>

            {/* Tab: Informação Família / Responsável */}
            <TabsContent value="familia" className="space-y-4 md:space-y-8 max-w-full">
              {/* Informação Família / Responsável */}
              <Card className="p-6">
                <h2 className="text-xl font-archivo font-semibold mb-6">
                  Informação Família / Responsável
                </h2>

                <div className="space-y-4">
                  {/* Nome and Grau Parentesco */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="familyName">Nome*</Label>
                      <Input
                        id="familyName"
                        placeholder="Nome do(a) Responsável"
                        value={formData.familyName}
                        onChange={(e) =>
                          handleInputChange("familyName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="familyRelationship">Grau Parentesco*</Label>
                      <Select
                        value={formData.familyRelationship}
                        onValueChange={(value) =>
                          handleInputChange("familyRelationship", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conjuge">Cônjuge</SelectItem>
                          <SelectItem value="filho">Filho(a)</SelectItem>
                          <SelectItem value="pai">Pai/Mãe</SelectItem>
                          <SelectItem value="irmao">Irmão(ã)</SelectItem>
                          <SelectItem value="neto">Neto(a)</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Email, Phone */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="familyEmail">Email*</Label>
                      <Input
                        id="familyEmail"
                        type="email"
                        placeholder="Email"
                        value={formData.familyEmail}
                        onChange={(e) =>
                          handleInputChange("familyEmail", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="familyPhone">Contacto Telefónico *</Label>
                      <Input
                        id="familyPhone"
                        type="tel"
                        placeholder="+351 000 000 000"
                        value={formData.familyPhone}
                        onChange={(e) =>
                          handleInputChange("familyPhone", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* NIF, NISS, Naturalidade */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="familyNif">NIF *</Label>
                      <Input
                        id="familyNif"
                        placeholder="000 000 000"
                        value={formData.familyNif}
                        onChange={(e) =>
                          handleInputChange("familyNif", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="familyNiss">NISS *</Label>
                      <Input
                        id="familyNiss"
                        placeholder="00000000000"
                        value={formData.familyNiss}
                        onChange={(e) =>
                          handleInputChange("familyNiss", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="familyNaturalidade">Naturalidade *</Label>
                      <Input
                        id="familyNaturalidade"
                        placeholder="Local de nascimento"
                        value={formData.familyNaturalidade}
                        onChange={(e) =>
                          handleInputChange("familyNaturalidade", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* IBAN */}
                  <div>
                    <Label htmlFor="familyIban">IBAN *</Label>
                    <Input
                      id="familyIban"
                      placeholder="PT50 0000 0000 0000 0000 0000 0"
                      value={formData.familyIban}
                      onChange={(e) =>
                        handleInputChange("familyIban", e.target.value)
                      }
                    />
                  </div>

                  {/* Morada, Localidade, Código Postal */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="familyAddress">Morada *</Label>
                      <Input
                        id="familyAddress"
                        placeholder="Morada"
                        value={formData.familyAddress}
                        onChange={(e) =>
                          handleInputChange("familyAddress", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="familyLocality">Localidade *</Label>
                      <Input
                        id="familyLocality"
                        placeholder="Localidade"
                        value={formData.familyLocality}
                        onChange={(e) =>
                          handleInputChange("familyLocality", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="familyPostalCode">Código Postal *</Label>
                      <Input
                        id="familyPostalCode"
                        placeholder="0000-000"
                        value={formData.familyPostalCode}
                        onChange={(e) =>
                          handleInputChange("familyPostalCode", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <Label htmlFor="familyObservations">Observações / Notas / Pedidos</Label>
                    <Textarea
                      id="familyObservations"
                      placeholder="Deixe aqui as notas ou pedidos dos familiares"
                      rows={6}
                      value={formData.familyObservations}
                      onChange={(e) =>
                        handleInputChange("familyObservations", e.target.value)
                      }
                    />
                  </div>
                </div>
              </Card>

              {/* Óbitos da Mesma Família */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-archivo font-semibold">
                      Óbitos da Mesma Família
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Processos relacionados da mesma família
                    </p>
                  </div>
                  {isEditing && id && funerariaId && (
                    <AddRelationshipDialog 
                      currentObituaryId={id}
                      funerariaId={funerariaId}
                      onRelationshipAdded={fetchRelatedObituaries}
                    />
                  )}
                </div>

                {/* Lista de óbitos relacionados */}
                <div className="space-y-3">
                  {relatedObituaries.length > 0 ? (
                    relatedObituaries.map((rel: any) => (
                      <div 
                        key={rel.id}
                        className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">
                                {rel.related_obituary?.display_name || 'Nome não disponível'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {getRelationshipLabel(rel.relationship_type)}
                                {rel.related_obituary?.death_date && 
                                  ` • Falecido em ${new Date(rel.related_obituary.death_date).getFullYear()}`
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/obituaries/${rel.related_obituary?.id}/edit`)}
                            >
                              Ver Processo
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRelationship(rel.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum óbito relacionado</p>
                      <p className="text-sm mt-1">
                        {isEditing 
                          ? "Adicione relações para vincular processos da mesma família" 
                          : "Guarde este obituário primeiro para adicionar relações"
                        }
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Tab: Informação do Serviço */}
            <TabsContent value="servico" className="space-y-4 md:space-y-8 max-w-full">
              <Card className="p-6">
                <h2 className="text-xl font-archivo font-semibold mb-6">
                  Informação do Serviço
                </h2>

                <div className="space-y-4">
                  {/* Tipo de Serviço, Marca Caixão, Caixão Ref. */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="serviceType">Tipo de Serviço*</Label>
                      <Select
                        value={formData.serviceType}
                        onValueChange={(value) =>
                          handleInputChange("serviceType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="funeral_completo">Funeral Completo</SelectItem>
                          <SelectItem value="cremacao">Cremação</SelectItem>
                          <SelectItem value="translado">Translado</SelectItem>
                          <SelectItem value="basico">Serviço Básico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="coffinBrand">Marca Caixão</Label>
                      <Input
                        id="coffinBrand"
                        placeholder="Marca"
                        value={formData.coffinBrand}
                        onChange={(e) =>
                          handleInputChange("coffinBrand", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="coffinRef">Caixão Ref.</Label>
                      <Input
                        id="coffinRef"
                        placeholder="ID. Ref Interna"
                        value={formData.coffinRef}
                        onChange={(e) =>
                          handleInputChange("coffinRef", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Preço */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="servicePrice">Preço *</Label>
                      <Input
                        id="servicePrice"
                        type="number"
                        placeholder="41900"
                        value={formData.servicePrice}
                        onChange={(e) =>
                          handleInputChange("servicePrice", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Tab: Documentos */}
            <TabsContent value="documentos" className="space-y-4 md:space-y-8 max-w-full">
              <DocumentsTab 
                obituaryId={id || ""}
                obituaryData={formData}
              />
            </TabsContent>

            {/* Tab: Anúncios */}
            <TabsContent value="anuncios" className="space-y-4 md:space-y-8 max-w-full">
              <Card className="p-6">
                <h2 className="text-xl font-archivo font-semibold mb-2">
                  Anúncios dos Óbitos
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Gere automaticamente anúncios para impressão e redes sociais a partir dos dados do óbito.
                </p>
                <AnnouncementGenerator 
                  obituaryData={{
                    displayName: formData.displayName,
                    birthDate: formData.birthDate,
                    deathDate: formData.deathDate,
                    publicMessage: formData.publicMessage,
                    velorioDate: formData.velorioDate,
                    velorioTime: formData.velorioTime,
                    velorioLocation: formData.velorioLocation,
                    funeralDate: formData.funeralDate,
                    funeralTime: formData.funeralTime,
                    funeralCemetery: formData.funeralCemetery,
                  }}
                />
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          {/* Status Toggles Card */}
          <Card className="p-6">
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-medium mb-2">Estado do Perfil</p>
                <div className="flex items-center gap-2">
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  <span className="text-sm text-muted-foreground">Público</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Estado do Processo</p>
                <div className="flex items-center gap-2">
                  <Switch checked={isCompleted} onCheckedChange={setIsCompleted} />
                  <span className="text-sm text-muted-foreground">Terminado</span>
                </div>
              </div>
            </div>

            {/* Completion Progress */}
            <div className="pt-6 border-t mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Preenchimento de informação</span>
                <span className="text-sm font-semibold text-primary">{completionPercentage}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isEditing && id && (
                <Button variant="outline" className="w-full gap-2" onClick={handleCreateBudget}>
                  <Receipt className="w-4 h-4" />
                  Criar Orçamento
                </Button>
              )}
              {isEditing && id && (
                isPublic ? (
                  <Link to={`/obituario/${id}`} target="_blank">
                    <Button variant="outline" className="w-full gap-2">
                      <Eye className="w-4 h-4" />
                      Ver Perfil Público
                    </Button>
                  </Link>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="w-full">
                          <Button variant="outline" className="w-full gap-2" disabled>
                            <Eye className="w-4 h-4" />
                            Ver Perfil Público
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ative o estado "Público" para ver o perfil</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              )}
               <Button className="w-full gap-2" onClick={handleSubmit} disabled={isSaving}>
                <Upload className="w-4 h-4" />
                {isSaving ? "A guardar..." : "Guardar"}
              </Button>
              {hasUnsavedChanges && (
                <p className="text-xs text-destructive text-center mt-1">⚠ Alterações não guardadas</p>
              )}
            </div>
          </Card>

          {/* Sticky Preview Container */}
          <div className="sticky top-6 space-y-6">
            {/* Preview Card Header */}
            <Card className="p-4">
              <h3 className="font-semibold text-center">Pré-visualizar</h3>
            </Card>

            {/* Preview Card - Matching ObituaryArchive Style */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Foto destaque" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
                <div className="absolute top-3 left-3 bg-background/90 text-foreground border border-border rounded-md px-2 py-1 text-xs font-medium">
                  Funeral
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-archivo font-bold text-foreground text-lg mb-1">
                    {formData.displayName || "Nome do Óbito"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {formData.birthDate ? formData.birthDate.split("-")[0] : "—"} -{" "}
                    {formData.deathDate ? formData.deathDate.split("-")[0] : "—"}
                    {(() => {
                      if (!formData.birthDate || !formData.deathDate) return "";
                      const [bY, bM, bD] = formData.birthDate.split("-").map(Number);
                      const [dY, dM, dD] = formData.deathDate.split("-").map(Number);
                      let age = dY - bY;
                      if (dM < bM || (dM === bM && dD < bD)) age--;
                      return ` | ${age} Anos`;
                    })()}
                  </p>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <span className="text-xs">📍</span>
                    <span className="text-xs">
                      {formData.freguesia || "Couto"} - {formData.locality || "Arcos de Valdevez"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Agência</p>
                  <p className="text-sm text-foreground font-medium">Funerária S. João</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    Condolências
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Enviar Flores
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>678</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>1</span>
                  </div>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}

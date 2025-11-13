import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Eye, Upload, Heart, MessageCircle, Calendar, Clock, MapPin, Map, User, Plus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddRelationshipDialog } from "@/components/obituaries/AddRelationshipDialog";
import { AnnouncementGenerator } from "@/components/obituaries/AnnouncementGenerator";

export default function NewObituary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isEditing = !!id;
  const [isPublic, setIsPublic] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [funerariaId, setFunerariaId] = useState<string>("");
  const [relatedObituaries, setRelatedObituaries] = useState<any[]>([]);
  
  // Ceremony toggles
  const [velorio, setVelorio] = useState(false);
  const [cerimonia, setCerimonia] = useState(false);
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
    // Cerimónia
    cerimoniaDate: "",
    cerimoniaTime: "",
    cerimoniaChurch: "",
    cerimoniaMapLink: "",
    cerimoniaResponsible: "",
    cerimoniaPhone: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // TODO: Save to backend
    navigate("/obituaries");
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

      <div className="grid lg:grid-cols-[1fr_280px] gap-8">
        {/* Form Section */}
        <div>
          <Tabs defaultValue="pessoais" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="pessoais">Informações Pessoais</TabsTrigger>
              <TabsTrigger value="funebres">Informações Fúnebres</TabsTrigger>
              <TabsTrigger value="familia">Família / Responsável</TabsTrigger>
              <TabsTrigger value="servico">Informação do Serviço</TabsTrigger>
              <TabsTrigger value="anuncios">Anúncios</TabsTrigger>
            </TabsList>

            {/* Tab: Informações Pessoais */}
            <TabsContent value="pessoais" className="space-y-8">
              {/* Informações Obituário */}
              <Card className="p-6">
                <h2 className="text-xl font-archivo font-semibold mb-6">
                  Informações Obituário
                </h2>

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
                      <Label htmlFor="nationality">Nacionalidade*</Label>
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
                      <Label htmlFor="taxId">Identificação Fiscal*</Label>
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
                      <Label htmlFor="socialSecurity">Segurança Social*</Label>
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
                      <Label htmlFor="deathLocation">Local Falecimento</Label>
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
                      <Label htmlFor="deathDate">Data Falecimento</Label>
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
                      <Label htmlFor="doctor">Médico Declarante</Label>
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
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input type="text" placeholder="Selecionar ficheiro..." />
                  </div>
                  <Button variant="default" className="gap-2">
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
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
            <TabsContent value="funebres" className="space-y-8">
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

                  {/* Cerimónia */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={cerimonia} onCheckedChange={setCerimonia} />
                      <Label className="font-medium">Cerimónia</Label>
                    </div>
                    {cerimonia && (
                      <div className="space-y-4 pl-8">
                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor="cerimoniaDate" className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Data
                            </Label>
                            <Input
                              id="cerimoniaDate"
                              type="date"
                              value={formData.cerimoniaDate}
                              onChange={(e) =>
                                handleInputChange("cerimoniaDate", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="cerimoniaTime" className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Hora
                            </Label>
                            <Input
                              id="cerimoniaTime"
                              type="time"
                              value={formData.cerimoniaTime}
                              onChange={(e) =>
                                handleInputChange("cerimoniaTime", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="cerimoniaChurch" className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Nome da Igreja
                            </Label>
                            <Input
                              id="cerimoniaChurch"
                              value={formData.cerimoniaChurch}
                              onChange={(e) =>
                                handleInputChange("cerimoniaChurch", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="cerimoniaMapLink" className="flex items-center gap-2">
                              <Map className="w-4 h-4" />
                              Link do mapa
                            </Label>
                            <Input
                              id="cerimoniaMapLink"
                              value={formData.cerimoniaMapLink}
                              onChange={(e) =>
                                handleInputChange("cerimoniaMapLink", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cerimoniaResponsible">Nome</Label>
                            <Input
                              id="cerimoniaResponsible"
                              placeholder="Nome do(a) Responsável"
                              value={formData.cerimoniaResponsible}
                              onChange={(e) =>
                                handleInputChange("cerimoniaResponsible", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="cerimoniaPhone">Contacto Telefónico</Label>
                            <Input
                              id="cerimoniaPhone"
                              placeholder="+351 000 000 000"
                              value={formData.cerimoniaPhone}
                              onChange={(e) =>
                                handleInputChange("cerimoniaPhone", e.target.value)
                              }
                            />
                          </div>
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
                              Nome do Cemitério
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
            <TabsContent value="familia" className="space-y-8">
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

                  {/* Email, Phone, NIF */}
                  <div className="grid md:grid-cols-3 gap-4">
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
            <TabsContent value="servico" className="space-y-8">
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

            {/* Tab: Anúncios */}
            <TabsContent value="anuncios" className="space-y-8">
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
                    cerimoniaDate: formData.cerimoniaDate,
                    cerimoniaTime: formData.cerimoniaTime,
                    cerimoniaChurch: formData.cerimoniaChurch,
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
              <Button variant="outline" className="w-full gap-2">
                <Eye className="w-4 h-4" />
                Ver Perfil Público
              </Button>
              <Button className="w-full gap-2" onClick={handleSubmit}>
                <Upload className="w-4 h-4" />
                Guardar
              </Button>
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
                <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center">
                  <Camera className="w-16 h-16 text-muted-foreground" />
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
                    {formData.birthDate ? new Date(formData.birthDate).getFullYear() : "1970"} -{" "}
                    {formData.deathDate ? new Date(formData.deathDate).getFullYear() : "2025"} | 55 Anos
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

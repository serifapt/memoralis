import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Camera, Eye, Upload, Heart, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NewObituary() {
  const navigate = useNavigate();
  const [isPublic, setIsPublic] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
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
  });

  const completionPercentage = Math.round(
    (Object.values(formData).filter((v) => v !== "").length /
      Object.values(formData).length) *
      100
  );

  const handleInputChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-archivo font-bold text-foreground">
          Adicionar / Arquivo Óbito
        </h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-8">
        {/* Form Section */}
        <div className="space-y-8">
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
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          {/* Status Toggles Card */}
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-4">
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

            {/* Completion Progress Card */}
            <Card className="p-4">
              <div className="mb-4">
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
                <Button className="w-full gap-2">
                  <Upload className="w-4 h-4" />
                  Guardar
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

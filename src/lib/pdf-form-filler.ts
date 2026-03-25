import { PDFDocument } from 'pdf-lib';

export interface ObituaryFormData {
  // Deceased
  fullName?: string;
  birthDate?: string;
  deathDate?: string;
  deathTime?: string;
  birthPlace?: string;
  nationality?: string;
  civilStatus?: string;
  profession?: string;
  taxId?: string;
  socialSecurity?: string;
  deathLocation?: string;
  cause?: string;
  doctor?: string;
  beneficiary?: string;
  idCard?: string;
  // Applicant/Family
  familyName?: string;
  familyRelationship?: string;
  familyEmail?: string;
  familyPhone?: string;
  familyNif?: string;
  familyNiss?: string;
  familyNaturalidade?: string;
  familyIban?: string;
  familyAddress?: string;
  familyLocality?: string;
  familyPostalCode?: string;
  familyBirthDate?: string;
}

// Helper to split a date string "YYYY-MM-DD" or "DD/MM/YYYY" into {dia, mes, ano}
function splitDate(dateStr?: string): { dia: string; mes: string; ano: string } {
  if (!dateStr) return { dia: '', mes: '', ano: '' };
  // Try YYYY-MM-DD first
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [ano, mes, dia] = dateStr.split('-');
    return { dia, mes, ano };
  }
  // Try DD/MM/YYYY
  if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [dia, mes, ano] = dateStr.split('/');
    return { dia, mes, ano };
  }
  return { dia: '', mes: '', ano: dateStr };
}

// Helper to format date as DD/MM/YYYY
function formatDatePt(dateStr?: string): string {
  if (!dateStr) return '';
  const { dia, mes, ano } = splitDate(dateStr);
  if (dia && mes && ano) return `${dia}/${mes}/${ano}`;
  return dateStr;
}

// Helper to split postal code "1234-567" into parts
function splitPostalCode(pc?: string): { cp1: string; cp2: string } {
  if (!pc) return { cp1: '', cp2: '' };
  const parts = pc.split('-');
  return { cp1: parts[0] || '', cp2: parts[1] || '' };
}

// Safe set text field
function setTextField(form: any, fieldName: string, value: string) {
  try {
    const field = form.getTextField(fieldName);
    if (field && value) {
      field.setText(value);
    }
  } catch {
    // Field not found, skip silently
  }
}

// Safe set radio group
function setRadioField(form: any, fieldName: string, value: string) {
  try {
    const field = form.getRadioGroup(fieldName);
    if (field && value) {
      field.select(value);
    }
  } catch {
    // Field not found, skip silently
  }
}

// Safe set checkbox
function setCheckbox(form: any, fieldName: string, checked: boolean, checkedValue?: string) {
  try {
    const field = form.getCheckBox(fieldName);
    if (field) {
      if (checked) {
        field.check();
      } else {
        field.uncheck();
      }
    }
  } catch {
    // Field not found, skip silently
  }
}

// ====== FIELD MAPPINGS PER FORM ======

function fillRP5033(form: any, data: ObituaryFormData) {
  const reqDate = splitDate(data.familyBirthDate);
  const deceasedDate = splitDate(data.birthDate);
  const deathDate = splitDate(data.deathDate);

  // Requerente (applicant)
  setTextField(form, 'Nome completo', data.familyName || '');
  setTextField(form, 'Data de nascimento', formatDatePt(data.familyBirthDate));
  setTextField(form, 'N de  Identificação de Segurança Social', data.familyNiss || '');
  setTextField(form, 'N de Identificação Fiscal', data.familyNif || '');
  setTextField(form, 'País', '');
  setTextField(form, 'Distrito', '');
  setTextField(form, 'Concelho', '');
  setTextField(form, 'Freguesia', '');
  setTextField(form, 'Nacionalidade', data.nationality || '');
  setTextField(form, 'Morada', data.familyAddress || '');
  setTextField(form, 'Localidade', data.familyLocality || '');
  
  const pc = splitPostalCode(data.familyPostalCode);
  setTextField(form, 'Código postal', pc.cp1);
  setTextField(form, 'undefined_2', pc.cp2);
  
  setTextField(form, 'Telemóvel  Telefone', data.familyPhone || '');
  setTextField(form, 'Email', data.familyEmail || '');
  setTextField(form, 'undefined_3', data.familyLocality || '');

  // Falecido (deceased)
  setTextField(form, 'Nome completo_2', data.fullName || '');
  setTextField(form, 'Data de nascimento_2', formatDatePt(data.birthDate));
  setTextField(form, 'N de Identificação de Segurança Social', data.socialSecurity || '');
  setTextField(form, 'Data de falecimento.0', formatDatePt(data.deathDate));

  // Date of request
  setTextField(form, 'Data requerimento1', new Date().toLocaleDateString('pt-PT'));
}

function fillRP5075(form: any, data: ObituaryFormData) {
  const reqBirth = splitDate(data.familyBirthDate);
  const decBirth = splitDate(data.birthDate);
  const decDeath = splitDate(data.deathDate);

  // Requerente
  setTextField(form, 'Nome_completo_requerente', data.familyName || '');
  setTextField(form, 'Data_nascimento_requerente_dia', reqBirth.dia);
  setTextField(form, 'Data_nascimento_requerente_mês', reqBirth.mes);
  setTextField(form, 'Data_nascimento_requerente_ano', reqBirth.ano);
  setTextField(form, 'NISS_requerente', data.familyNiss || '');
  setTextField(form, 'NIF_requerente', data.familyNif || '');
  setTextField(form, 'Relação_familiar_beneficiário_falecido', data.familyRelationship || '');
  setTextField(form, 'Estado_civil_requerente', data.civilStatus || '');
  setTextField(form, 'Morada_requerente', data.familyAddress || '');
  
  const pc = splitPostalCode(data.familyPostalCode);
  setTextField(form, 'Código_postal', pc.cp1);
  setTextField(form, 'Código_+postal_digitos', pc.cp2);
  setTextField(form, 'Código_postal_1', data.familyLocality || '');
  setTextField(form, 'Localidade_requerente', data.familyLocality || '');
  setTextField(form, 'Telemovel_requerente', data.familyPhone || '');
  setTextField(form, 'E-mail_requerente', data.familyEmail || '');

  // Beneficiário falecido
  setTextField(form, 'Nome_completo_beneficiário_falecido', data.fullName || '');
  setTextField(form, 'Data_nascimento_beneficiário_falecido_dia', decBirth.dia);
  setTextField(form, 'Data_nascimento_beneficiário_falecido_mês', decBirth.mes);
  setTextField(form, 'Data_nascimento_beneficiário_falecido_ano', decBirth.ano);
  setTextField(form, 'NISS_beneficiário_falecido', data.socialSecurity || '');
  setTextField(form, 'Estado_civil_data_falecimento', data.civilStatus || '');
  setTextField(form, 'Data_falecimento_beneficiário_falecido_dia', decDeath.dia);
  setTextField(form, 'Data_falecimento_beneficiário_falecido_mês', decDeath.mes);
  setTextField(form, 'Data_falecimento_beneficiário_falecido_ano', decDeath.ano);
}

function fillMG14(form: any, data: ObituaryFormData) {
  const reqBirth = splitDate(data.familyBirthDate);
  
  setTextField(form, 'Nome Completo 2', data.familyName || '');
  setTextField(form, 'dia', reqBirth.dia);
  setTextField(form, 'mês', reqBirth.mes);
  setTextField(form, 'ano', reqBirth.ano);
  setTextField(form, 'NISS', data.familyNiss || '');
  setTextField(form, 'Telemóvel', data.familyPhone || '');
  setTextField(form, 'Email', data.familyEmail || '');
  setTextField(form, 'IBAN', data.familyIban || '');
  setTextField(form, 'Data_declaração', new Date().toLocaleDateString('pt-PT'));
}

function fillRP5018(form: any, data: ObituaryFormData) {
  const reqBirth = splitDate(data.familyBirthDate);
  const decBirth = splitDate(data.birthDate);
  const decDeath = splitDate(data.deathDate);
  const pc = splitPostalCode(data.familyPostalCode);

  // Requerente
  setTextField(form, 'Nome_Req', data.familyName || '');
  setTextField(form, 'Data_nascimento_Req', formatDatePt(data.familyBirthDate));
  setTextField(form, 'NIF_Req', data.familyNif || '');
  setTextField(form, 'NISS_Req', data.familyNiss || '');
  
  // Beneficiário falecido
  setTextField(form, 'Nome_beneffalecido', data.fullName || '');
  setTextField(form, 'Data_nascimento_beneffalecido', formatDatePt(data.birthDate));
  setTextField(form, 'NISS_beneffalecido', data.socialSecurity || '');
  setTextField(form, 'Data_falecimento_benef', formatDatePt(data.deathDate));

  // Requerente - page 1 fields
  setTextField(form, 'Nome', data.familyName || '');
  setTextField(form, 'NIF', data.familyNif || '');
  setTextField(form, 'Data_nascimento', formatDatePt(data.familyBirthDate));
  setTextField(form, 'NISS', data.familyNiss || '');
  setTextField(form, 'Morada', data.familyAddress || '');
  setTextField(form, 'Localidade', data.familyLocality || '');
  setTextField(form, 'Código_postal1', pc.cp1);
  setTextField(form, 'Código_postal', pc.cp2);
  setTextField(form, 'Telemóvel', data.familyPhone || '');
  setTextField(form, 'E-mail', data.familyEmail || '');

  // Page 2 - Requerente address
  setTextField(form, 'Morada2', data.familyAddress || '');
  setTextField(form, 'Localidade2', data.familyLocality || '');
  setTextField(form, 'Código_postal2', pc.cp1);
  setTextField(form, 'Código_postal3', pc.cp2);
  setTextField(form, 'E-mail2', data.familyEmail || '');
  setTextField(form, 'Telemóvel2', data.familyPhone || '');
  setTextField(form, 'RelacaoFamiliar', data.familyRelationship || '');

  // Date of request
  setTextField(form, 'Data_Req', new Date().toLocaleDateString('pt-PT'));
}

function fillRP5076(form: any, data: ObituaryFormData) {
  const reqBirth = splitDate(data.familyBirthDate);
  const decBirth = splitDate(data.birthDate);
  const decDeath = splitDate(data.deathDate);
  const pc = splitPostalCode(data.familyPostalCode);

  // Falecido
  setTextField(form, 'Nome_completo_requerente', data.fullName || '');
  setTextField(form, 'NISS_requerente', data.socialSecurity || '');
  setTextField(form, 'Data_nascimento_requerente_dia', decBirth.dia);
  setTextField(form, 'Data_nascimento_requerente_mês', decBirth.mes);
  setTextField(form, 'Data_nascimento_requerente_ano', decBirth.ano);
  setTextField(form, 'NIF_requerente', data.taxId || '');
  setTextField(form, 'estado civil à data do falecimento', data.civilStatus || '');
  setTextField(form, 'Data_falecimento_ano', decDeath.ano);
  setTextField(form, 'Data_falecimento_mês', decDeath.mes);
  setTextField(form, 'Data_falecimnto_dia', decDeath.dia);

  // Requerente (person requesting reimbursement)
  setTextField(form, 'Nome_completo_requerente1', data.familyName || '');
  setTextField(form, 'Data_nascimento_requerente_dia1', reqBirth.dia);
  setTextField(form, 'Data_nascimento_requerente_mês1', reqBirth.mes);
  setTextField(form, 'Data_nascimento_requerente_ano1', reqBirth.ano);
  setTextField(form, 'NISS_requerente1', data.familyNiss || '');
  setTextField(form, 'NIF_requerente1', data.familyNif || '');
  setTextField(form, 'estado civil', data.civilStatus || '');
  setTextField(form, 'relação familiar', data.familyRelationship || '');
  setTextField(form, 'Morada_requerente', data.familyAddress || '');
  setTextField(form, 'Código_postal', pc.cp1);
  setTextField(form, 'Código_+postal_digitos', pc.cp2);
  setTextField(form, 'Código_postal_1', data.familyLocality || '');
  setTextField(form, 'Localidade_requerente', data.familyLocality || '');
  setTextField(form, 'E-mail_requerente', data.familyEmail || '');
  setTextField(form, 'Telemovel_requerente', data.familyPhone || '');

  // Date
  const today = new Date();
  setTextField(form, 'Data_declarações_dia', String(today.getDate()).padStart(2, '0'));
  setTextField(form, 'Data_declarações_mês', String(today.getMonth() + 1).padStart(2, '0'));
  setTextField(form, 'Data_declarações_ano', String(today.getFullYear()));
}

function fillRP5077(form: any, data: ObituaryFormData) {
  // Beneficiário falecido
  setTextField(form, 'Nome_BenefFalecido', data.fullName || '');
  setTextField(form, 'NISS', data.socialSecurity || '');
  setTextField(form, 'NIF', data.taxId || '');
  setTextField(form, 'Data_nascimento', formatDatePt(data.birthDate));
  setTextField(form, 'Estado_civil', data.civilStatus || '');
  setTextField(form, 'Data_falecimento', formatDatePt(data.deathDate));
  setTextField(form, 'Ultima_profissao', data.profession || '');

  // Cônjuge/Requerente
  setTextField(form, 'Nome_conjuge', data.familyName || '');
  setTextField(form, 'Data_nascimento_conjuge', formatDatePt(data.familyBirthDate));
  setTextField(form, 'Parentesco', data.familyRelationship || '');
  setTextField(form, 'Telemóvel', data.familyPhone || '');
  setTextField(form, 'E-mail', data.familyEmail || '');

  // Date of request
  setTextField(form, 'Data_Req', new Date().toLocaleDateString('pt-PT'));
}

function fillRP5078(form: any, data: ObituaryFormData) {
  const decDeath = splitDate(data.deathDate);

  // Pessoa falecida
  setTextField(form, 'Nome_completo_requerente', data.fullName || '');
  setTextField(form, 'NISS_requerente', data.socialSecurity || '');
  setTextField(form, 'NIF_requerente', data.taxId || '');
  setTextField(form, 'Data_falecimento_ano', decDeath.ano);
  setTextField(form, 'Data_falecimento_mês', decDeath.mes);
  setTextField(form, 'Data_falecimnto_dia', decDeath.dia);
  setTextField(form, 'Telemovel_pessoa_falecida', data.familyPhone || '');
  setTextField(form, 'E-mail_pessoa_falecida', data.familyEmail || '');

  // Declarante
  setTextField(form, 'Nome_completo_declarante', data.familyName || '');
  setTextField(form, 'NISS_declarante', data.familyNiss || '');
  setTextField(form, 'NIF_declarante', data.familyNif || '');

  // Date
  const today = new Date();
  setTextField(form, 'Data_declarações_dia', String(today.getDate()).padStart(2, '0'));
  setTextField(form, 'Data_declarações_mês', String(today.getMonth() + 1).padStart(2, '0'));
  setTextField(form, 'Data_declarações_ano', String(today.getFullYear()));
}

function fillRP5083(form: any, data: ObituaryFormData) {
  const decBirth = splitDate(data.birthDate);
  const decDeath = splitDate(data.deathDate);
  const reqBirth = splitDate(data.familyBirthDate);

  // Membro A (falecido)
  setTextField(form, '1 nome', data.fullName || '');
  setTextField(form, '2 Niss', data.socialSecurity || '');
  setTextField(form, '3 ano', decBirth.ano);
  setTextField(form, '4 mês', decBirth.mes);
  setTextField(form, '5 dia', decBirth.dia);
  setTextField(form, '6 n. ident civil', data.idCard || '');

  // Data de falecimento
  setTextField(form, '7 ano', decDeath.ano);
  setTextField(form, '8 mes', decDeath.mes);
  setTextField(form, '9 dia', decDeath.dia);

  // Membro B (requerente)
  setTextField(form, '110 nome.0', data.familyName || '');
  setTextField(form, '111 Niss.0', data.familyNiss || '');
  setTextField(form, '110 nome.1', data.familyName || '');
  setTextField(form, '111 Niss.1', data.familyNiss || '');
  setTextField(form, '119 ano.1', reqBirth.ano);
  setTextField(form, '120 mes.1', reqBirth.mes);
  setTextField(form, '121 dia.1', reqBirth.dia);

  // Morada
  setTextField(form, '43 morada', data.familyAddress || '');
  setTextField(form, '44 localidade', data.familyLocality || '');
  const pc = splitPostalCode(data.familyPostalCode);
  setTextField(form, '45', pc.cp1);
  setTextField(form, '46 cp2', pc.cp2);

  // Date
  const today = new Date();
  setTextField(form, '48 ano', String(today.getFullYear()));
  setTextField(form, '49 mes', String(today.getMonth() + 1).padStart(2, '0'));
  setTextField(form, '50 dia', String(today.getDate()).padStart(2, '0'));
}

function fillRV1017(form: any, data: ObituaryFormData) {
  // Main person (deceased - identification)
  setTextField(form, 'topmostSubform[0].Page1[0].Nomes_próprios[0]', data.fullName || '');
  setTextField(form, 'topmostSubform[0].Page1[0].Data_de_nascimento[0]', formatDatePt(data.birthDate));
  setTextField(form, 'topmostSubform[0].Page1[0].N__Identificação_de_Segurança_Social[0]', data.socialSecurity || '');
  setTextField(form, 'topmostSubform[0].Page1[0].N__Identificação_Fiscal[0]', data.taxId || '');
  setTextField(form, 'topmostSubform[0].Page1[0].País[0]', data.nationality || '');
  setTextField(form, 'topmostSubform[0].Page1[0].Estado_civil[0]', data.civilStatus || '');
  setTextField(form, 'topmostSubform[0].Page1[0].N__de_documento_de_identificação_civil[0]', data.idCard || '');
  setTextField(form, 'topmostSubform[0].Page1[0].Morada[0]', data.familyAddress || '');
  
  const pc = splitPostalCode(data.familyPostalCode);
  setTextField(form, 'topmostSubform[0].Page1[0].Código_Postal[0]', pc.cp1);
  setTextField(form, 'topmostSubform[0].Page1[0].undefined_2[0]', pc.cp2);
  setTextField(form, 'topmostSubform[0].Page1[0].Telefone[0]', data.familyPhone || '');

  // Family member (requerente)
  setTextField(form, 'topmostSubform[0].Page1[0].Nome_completo[0]', data.familyName || '');
  setTextField(form, 'topmostSubform[0].Page1[0].Data_de_nascimento[1]', formatDatePt(data.familyBirthDate));
  setTextField(form, 'topmostSubform[0].Page1[0].N__Identificação_Fiscal[1]', data.familyNif || '');
}

// Map of form IDs to fill functions
const FILL_FUNCTIONS: Record<string, (form: any, data: ObituaryFormData) => void> = {
  'rp5033': fillRP5033,
  'rp5075': fillRP5075,
  'mg14': fillMG14,
  'rp5018': fillRP5018,
  'rp5076': fillRP5076,
  'rp5077': fillRP5077,
  'rp5078': fillRP5078,
  'rp5083': fillRP5083,
  'rv1017': fillRV1017,
};

// Template file paths
export const TEMPLATE_FILES: Record<string, string> = {
  'rp5033': '/templates/RP-5033.pdf',
  'rp5075': '/templates/RP-5075.pdf',
  'mg14': '/templates/MG-14.pdf',
  'rp5018': '/templates/RP-5018.pdf',
  'rp5076': '/templates/RP-5076.pdf',
  'rp5077': '/templates/RP-5077.pdf',
  'rp5078': '/templates/RP-5078.pdf',
  'rp5083': '/templates/RP-5083.pdf',
  'rv1017': '/templates/RV-1017.pdf',
};

/**
 * Load a PDF template, fill its form fields with obituary data, and return as Blob
 */
export async function fillPdfForm(
  formId: string,
  data: ObituaryFormData
): Promise<Blob> {
  const templatePath = TEMPLATE_FILES[formId];
  if (!templatePath) {
    throw new Error(`Template não encontrado para: ${formId}`);
  }

  const fillFn = FILL_FUNCTIONS[formId];
  if (!fillFn) {
    throw new Error(`Função de preenchimento não encontrada para: ${formId}`);
  }

  // Fetch the template PDF
  const response = await fetch(templatePath);
  if (!response.ok) {
    throw new Error(`Erro ao carregar template: ${response.statusText}`);
  }
  const templateBytes = await response.arrayBuffer();

  // Load and fill the PDF
  const pdfDoc = await PDFDocument.load(templateBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();

  // Fill the fields
  fillFn(form, data);

  // Flatten the form so the filled values are embedded (optional, makes it non-editable)
  // form.flatten(); // Uncomment to make fields non-editable

  // Save and return as Blob
  const filledBytes = await pdfDoc.save();
  return new Blob([filledBytes], { type: 'application/pdf' });
}

/**
 * Debug: list all form fields in a PDF template
 */
export async function listPdfFields(formId: string): Promise<Array<{ name: string; type: string }>> {
  const templatePath = TEMPLATE_FILES[formId];
  if (!templatePath) return [];

  const response = await fetch(templatePath);
  const templateBytes = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(templateBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  return fields.map(field => ({
    name: field.getName(),
    type: field.constructor.name,
  }));
}

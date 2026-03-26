export interface WakeDetails {
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
}

export interface FuneralDetails {
  date?: string;
  time?: string;
  location?: string;
}

export interface CemeteryDetails {
  location?: string;
}

export interface ObituaryTemplateProps {
  memoralisLogo?: boolean;
  photo?: string;
  fullName?: string;
  age?: number;
  birthYear?: number;
  deathYear?: number;
  parish?: string;
  municipality?: string;
  deathCountry?: string;
  familyText?: string;
  wake?: WakeDetails;
  funeral?: FuneralDetails;
  cemetery?: CemeteryDetails;
  condolencesText?: string;
  qrCodeImage?: string;
  funeralHomeLogo?: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  website?: string;
  flowerImage?: string;
}

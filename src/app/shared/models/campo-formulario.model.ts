export interface OpcionSelect {
  value: any;
  label: string;
}

export interface CampoFormulario {
  key: string;
  label: string;
  tipo: 'text' | 'number' | 'select' | 'checkbox';
  placeholder?: string;
  requerido?: boolean;
  opciones?: OpcionSelect[];
}
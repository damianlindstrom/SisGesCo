/**
 * Definición de un campo para el modal de alta rápida genérico.
 * La misma forma sirve para el alta de Cliente (comprador) y de
 * Proveedor: cambian los campos que se pasan, no el componente.
 */
export interface CampoFormulario {
  key: string;
  label: string;
  tipo: 'text' | 'select' | 'number';
  placeholder?: string;
  requerido?: boolean;
  opciones?: { value: string | number; label: string }[];
}

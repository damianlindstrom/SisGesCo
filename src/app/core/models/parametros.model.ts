export interface Impuesto {
  id?: number;
  nombre: string;
  alicuota?: number;      // <-- Cambiado a opcional
  porcentaje?: number;
  
  vigenciaDesde?: string | null;
  vigenciaHasta?: string | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;

  enVentas?: boolean;
  enCompras?: boolean;
  enGastos?: boolean;
  enGastosVarios?: boolean;
  
  activo?: boolean;
}

export interface FormaPago {
  id?: number | string;
  nombre: string;         // Ej: "Efectivo", "Transferencia", "Tarjeta de Débito", "Mercado Pago"
  descripcion?: string;
  activa: boolean;
}
export interface MovimientoImpositivo {
  fecha: string;
  origen: 'VENTA' | 'COMPRA' | 'GASTO';
  concepto: string;
  contraparte: string;
  cuit?: string;
  comprobante?: string;
  neto: number;
  montoImpuesto: number;
}

export interface ReporteImpositivo {
  impuesto: string;
  desde: string;
  hasta: string;
  movimientos: MovimientoImpositivo[];
  totalNeto: number;
  totalImpuesto: number;
}

export interface CompraResumen {
  fecha: string;
  proveedor: string;
  nroComprobante: string | null;
  tipo: string;
  monto: number;
}

export interface GastoResumen {
  fecha: string;
  nombreCorto: string;
  tipo: string;
  importe: number;
  formaPago: string;
}

export interface ResultadoPeriodo {
  desde: string;
  hasta: string;
  ventas: { total: number };
  compras: { total: number; detalle: CompraResumen[] };
  gastos: { total: number; detalle: GastoResumen[] };
  cmv: number;
  totalImpuestosPeriodo: number;
  resultadoBruto: number;
  resultadoNeto: number;
}

export interface MovimientoGeneral {
  fecha: string;
  modulo: 'VENTAS' | 'COMPRAS' | 'GASTOS';
  concepto: string;
  contraparte?: string;
  comprobante?: string;
  formaPago?: string;
  neto?: number;
  iva?: number;
  iibb?: number;
  impuestosMonto?: number;
  monto: number;
}

// ===== NUEVAS INTERFACES =====
export interface Proveedor {
  id: number;
  nombre: string;
  cuit?: string | null;
  categoria?: string | null;
  activo: boolean;
}

export interface Cliente {
  id: number;
  nombre: string;
  dniCuit?: string | null;
  categoriaId: number;
  categoriaNombre?: string;
  cuentaCorriente: boolean;
  activo: boolean;
}

export interface CampoFormulario {
  key: string;
  label: string;
  tipo: 'text' | 'number' | 'select' | 'checkbox';
  requerido?: boolean;
  placeholder?: string;
  opciones?: Array<{ value: string | number; label: string }>;
}
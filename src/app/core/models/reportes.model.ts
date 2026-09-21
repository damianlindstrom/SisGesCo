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
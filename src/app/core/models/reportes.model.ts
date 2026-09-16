// Los KPIs de ventas y el resto de los "reportes operativos" quedaron
// afuera a propósito: son parte del plan pago que todavía no se
// desarrolla (ver pestaña "Reportes Operativos"). Solo modelamos acá
// el reporte impositivo, que sí se construye ahora.

export interface MovimientoImpositivo {
  fecha: string;
  origen: 'VENTA' | 'COMPRA';
  concepto: string;      // ej: nro de comprobante, o "Venta a <cliente>"
  contraparte: string;   // cliente o proveedor
  neto: number;
  montoImpuesto: number; // el monto del impuesto consultado (IVA o IIBB) para ese movimiento
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
  resultadoBruto: number;
  resultadoNeto: number;
}

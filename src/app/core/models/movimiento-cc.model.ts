export interface MovimientoCC {
  fecha: string;
  concepto: string;
  debe: number;
  haber: number;
  saldoAcumulado: number;
}

export interface CobroCCInput {
  clienteId: number;
  monto: number;
  formaPago: string;
  observaciones?: string;
}

export interface MovimientoArqueo {
  fecha: string;
  concepto: string;
  formaPago: string;
  ingreso: number;
  egreso: number;
}

export interface ResumenArqueo {
  totalIngresos: number;
  totalEgresos: number;
  saldoNeto: number;
  porFormaPago: { formaPago: string; total: number }[];
  movimientos: MovimientoArqueo[];
}

export interface PagoCompraInput {
  proveedorId: number;
  comprobanteIds: number[];
  importe: number;
  formaPago: string;
}

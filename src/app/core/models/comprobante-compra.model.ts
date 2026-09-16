export type TipoComprobante = 'FACTURA_MERCADERIA' | 'NOTA_DEBITO' | 'NOTA_CREDITO';
export type EstadoComprobante = 'PENDIENTE' | 'PAGO_PARCIAL' | 'PAGADO' | 'CREDITO_DISPONIBLE';

export interface ItemComprobanteInput {
  productoNombre: string; // se crea el producto si no existe, igual que el original
  cantidad: number;
  costoUnitario: number;
}

export interface ComprobanteCompraInput {
  proveedorId: number;
  tipo: TipoComprobante;
  nroComprobante: string;
  detalle?: string;
  neto: number;
  iva: number;
  iibb: number;
  noGravado: number;
  items?: ItemComprobanteInput[]; // solo aplica si tipo = FACTURA_MERCADERIA
  comprobanteVinculadoId?: number; // solo aplica si tipo = NOTA_CREDITO y está vinculada a un comprobante existente
}

export interface ComprobanteCompra {
  id: number;
  fecha: string;
  tipo: TipoComprobante;
  proveedorId: number;
  nroComprobante: string;
  montoTotal: number;
  saldo: number;
  estado: EstadoComprobante;
}

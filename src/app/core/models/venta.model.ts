export interface ItemVentaInput {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface VentaInput {
  clienteId: number;
  formaPago: string;
  items: ItemVentaInput[];
}

export interface Venta {
  id: number;
  fecha: string;
  clienteId: number;
  formaPago: string;
  total: number;
}

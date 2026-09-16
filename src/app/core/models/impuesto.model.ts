// Catálogo extensible de impuestos. Hoy solo IVA e IIBB, pero la idea es
// que cualquier impuesto que se agregue acá después también pueda
// aparecer como opción al cargar una venta (a un Resp. Inscripto, por
// ejemplo) o un comprobante de compra — todavía no implementado ahí,
// pero el catálogo ya nace pensado para eso.
export interface Impuesto {
  id: number;
  nombre: string; // "IVA", "IIBB", ...
}

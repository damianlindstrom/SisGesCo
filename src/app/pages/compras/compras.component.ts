import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BuscadorComponent } from '../../shared/buscador/buscador.component';
import { AltaRapidaModalComponent } from '../../shared/alta-rapida-modal/alta-rapida-modal.component';
import { CampoFormulario } from '../../shared/models/campo-formulario.model';
import { ProveedoresService } from '../../core/proveedores.service';
import { ProductosService } from '../../core/productos.service';
import { ComprasService } from '../../core/compras.service';
import { Proveedor } from '../../core/models/proveedor.model';
import { Producto } from '../../core/models/producto.model';
import {
  ComprobanteCompra, ComprobanteCompraInput, ItemComprobanteInput, TipoComprobante,
} from '../../core/models/comprobante-compra.model';

const CAMPOS_PRODUCTO: CampoFormulario[] = [
  { key: 'nombre', label: 'Nombre del producto', tipo: 'text', placeholder: 'Ej: Viga 1.2m', requerido: true },
  { key: 'rubro', label: 'Rubro', tipo: 'text', placeholder: 'Ej: Materiales' },
  { key: 'tipo', label: 'Tipo', tipo: 'text', placeholder: 'Ej: Vigas' },
  { key: 'costo', label: 'Costo ($)', tipo: 'number', placeholder: '0.00', requerido: true },
  { key: 'stock', label: 'Stock inicial', tipo: 'number', placeholder: '0', requerido: true },
  { key: 'pctRespInsc', label: 'Multiplicador Resp. Inscripto (ej: 1.40)', tipo: 'number', placeholder: '1.40', requerido: true },
  { key: 'pctConsFinal', label: 'Multiplicador Consumidor Final (ej: 1.64)', tipo: 'number', placeholder: '1.64', requerido: true },
  { key: 'pctCtaCte', label: 'Multiplicador Cliente c/cta. cte. (ej: 1.68)', tipo: 'number', placeholder: '1.68', requerido: true },
];

type Pestana = 'comprobantes' | 'pagos';

interface ItemCompraUI extends ItemComprobanteInput {
  subtotal: number;
}

const FORMAS_PAGO = [
  'Efectivo', 'Transferencia', 'Tarjeta débito', 'Tarjeta crédito',
  'Cuenta corriente', 'MercadoPago', 'Cheque Físico Diferido', 'E-cheq Diferido',
];

const TIPOS: { valor: TipoComprobante; label: string }[] = [
  { valor: 'FACTURA_MERCADERIA', label: '🛒 Factura Mercadería' },
  { valor: 'NOTA_DEBITO', label: '📈 Nota de Débito' },
  { valor: 'NOTA_CREDITO', label: '📉 Nota de Crédito' },
];

function calcularPrecio(costo: number, pct: number): number {
  if (!costo || !pct) return 0;
  return Math.round(((costo / 1.245) * pct) * 1.245 * 100) / 100;
}

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule, BuscadorComponent, AltaRapidaModalComponent],
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.css'
})
export class ComprasComponent implements OnInit {
  pestana: Pestana = 'comprobantes';
  cargando = true;
  mensaje: { tipo: 'ok' | 'error'; texto: string } | null = null;

  proveedores: Proveedor[] = [];
  productos: Producto[] = [];
  formasPago = FORMAS_PAGO;
  tipos = TIPOS;

  // --- Modal alta rápida de proveedor (reusado en Comprobantes y Pagos) ---
  modalProveedorVisible = false;
  guardandoProveedor = false;
  origenModalProveedor: 'comprobante' | 'pago' = 'comprobante';
  camposProveedor: CampoFormulario[] = [
    { key: 'nombre', label: 'Nombre o razón social', tipo: 'text', placeholder: 'Nombre o razón social', requerido: true },
    { key: 'cuit', label: 'CUIT (opcional)', tipo: 'text', placeholder: 'XXXXXXXXXXX' },
    {
      key: 'categoria', label: 'Categoría', tipo: 'select',
      opciones: [
        { value: 'Mercadería', label: 'Mercadería' },
        { value: 'Servicio', label: 'Servicio' },
        { value: 'Ambos', label: 'Ambos' },
      ],
    },
  ];

  // ---------- Sección Comprobantes ----------
  proveedorComp: Proveedor | null = null;
  tipoComp: TipoComprobante | null = null;
  nroComprobante = '';
  neto = 0;
  iva = 0;
  iibb = 0;
  noGravado = 0;

  // Factura Mercadería
  productoComp: Producto | null = null;
  cantidadComp = 1;
  nuevoCosto: number | null = null;
  itemsComp: ItemCompraUI[] = [];

  // Nota de Débito / Crédito
  motivoNDNC = '';
  montoNDNC: number | null = null;
  ncVinculada: boolean | null = null;
  comprobantesProveedor: ComprobanteCompra[] = [];
  comprobantePadre: ComprobanteCompra | null = null;

  guardandoComprobante = false;

  // ---------- Sección Pagos ----------
  proveedorPago: Proveedor | null = null;
  cargandoPendientes = false;
  comprobantesPendientes: ComprobanteCompra[] = [];
  comprobantesSeleccionados: Set<number> = new Set();
  formaPagoPago = '';
  montoAPagar: number | null = null;
  guardandoPago = false;

  tituloProveedor = (p: Proveedor) => p.nombre;
  subtituloProveedor = (p: Proveedor) => p.categoria ?? '';
  tituloProducto = (p: Producto) => p.nombre;
  tituloComprobante = (c: ComprobanteCompra) => `${c.nroComprobante} — $${c.montoTotal.toFixed(2)}`;

  constructor(
    private proveedoresService: ProveedoresService,
    private productosService: ProductosService,
    private comprasService: ComprasService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      [this.proveedores, this.productos] = await Promise.all([
        this.proveedoresService.listar(),
        this.productosService.listar(),
      ]);
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudieron cargar proveedores/productos: ' + (e as Error).message);
    } finally {
      this.cargando = false;
    }
  }

  cambiarPestana(p: Pestana): void {
    this.pestana = p;
  }

  private mostrarMensaje(tipo: 'ok' | 'error', texto: string): void {
    this.mensaje = { tipo, texto };
    setTimeout(() => (this.mensaje = null), 4000);
  }

  // ---------- Modal alta rápida de proveedor ----------

  abrirModalProveedor(origen: 'comprobante' | 'pago'): void {
    this.origenModalProveedor = origen;
    this.modalProveedorVisible = true;
  }

  cerrarModalProveedor(): void {
    this.modalProveedorVisible = false;
  }

  async guardarProveedor(valores: Record<string, string>): Promise<void> {
    this.guardandoProveedor = true;
    try {
      const nuevo = await this.proveedoresService.crear({
        nombre: valores['nombre'],
        cuit: valores['cuit'] || undefined,
        categoria: valores['categoria'] || undefined,
      });
      this.proveedores = [...this.proveedores, nuevo];
      if (this.origenModalProveedor === 'comprobante') {
        this.proveedorComp = nuevo;
      } else {
        await this.onProveedorPagoSeleccionado(nuevo);
      }
      this.modalProveedorVisible = false;
      this.mostrarMensaje('ok', 'Proveedor creado correctamente.');
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo crear el proveedor: ' + (e as Error).message);
    } finally {
      this.guardandoProveedor = false;
    }
  }

  // ---------- Comprobantes ----------

  onProveedorCompSeleccionado(p: Proveedor | null): void {
    this.proveedorComp = p;
  }

  async seleccionarTipo(t: TipoComprobante): Promise<void> {
    this.tipoComp = t;
    if (t === 'NOTA_CREDITO' && this.proveedorComp) {
      this.comprobantesProveedor = await this.comprasService.comprobantesPendientes(this.proveedorComp.id);
    }
  }

  get totalComprobante(): number {
    return Math.round((Number(this.neto) + Number(this.iva) + Number(this.iibb) + Number(this.noGravado)) * 100) / 100;
  }

  onProductoCompSeleccionado(p: Producto | null): void {
  this.productoComp = p;
  this.nuevoCosto = null;
}

  get costoAAplicar(): number {
    return this.nuevoCosto ?? this.productoComp?.costo ?? 0;
  }

  get previewPrecios(): { respInsc: number; consFinal: number; ctaCte: number } | null {
    if (!this.productoComp) return null;
    // Preview simulado con el mismo % que ya tiene el producto — el costo
    // nuevo puede cambiar el precio final, el % de margen no.
    const costo = this.costoAAplicar;
    return {
      respInsc: calcularPrecio(costo, this.productoComp.precioRespInsc / (this.productoComp.costo || 1)),
      consFinal: calcularPrecio(costo, this.productoComp.precioConsFinal / (this.productoComp.costo || 1)),
      ctaCte: calcularPrecio(costo, this.productoComp.precioCtaCte / (this.productoComp.costo || 1)),
    };
  }

  agregarItemComp(): void {
    if (!this.productoComp || this.cantidadComp < 1) return;
    const costoUnitario = this.costoAAplicar;
    this.itemsComp.push({
      productoNombre: this.productoComp.nombre,
      cantidad: this.cantidadComp,
      costoUnitario,
      subtotal: Math.round(costoUnitario * this.cantidadComp * 100) / 100,
    });
    this.productoComp = null;
    this.cantidadComp = 1;
    this.nuevoCosto = null;
  }

  quitarItemComp(i: number): void {
    this.itemsComp.splice(i, 1);
  }

  get totalItemsComp(): number {
    return Math.round(this.itemsComp.reduce((acc, it) => acc + it.subtotal, 0) * 100) / 100;
  }

  onComprobantePadreSeleccionado(c: ComprobanteCompra | null): void {
  this.comprobantePadre = c;
}

  get puedeGrabarComprobante(): boolean {
  if (!this.proveedorComp || !this.tipoComp || !this.nroComprobante.trim() || this.guardandoComprobante) return false;
  if (this.tipoComp === 'FACTURA_MERCADERIA') {
    // Valida que existan ítems Y que el Neto coincida exactamente con el total de los productos
    const coincidenMontos = Math.abs(Number(this.neto) - this.totalItemsComp) < 0.01;
    return this.itemsComp.length > 0 && coincidenMontos;
  }
  if (this.tipoComp === 'NOTA_CREDITO' || this.tipoComp === 'NOTA_DEBITO') {
    if (!this.motivoNDNC.trim() || !this.montoNDNC) return false;
    if (this.tipoComp === 'NOTA_CREDITO' && this.ncVinculada === null) return false;
    if (this.tipoComp === 'NOTA_CREDITO' && this.ncVinculada === true && !this.comprobantePadre) return false;
    return true;
  }
  return false;
}

  async grabarComprobante(): Promise<void> {
    if (!this.puedeGrabarComprobante || !this.proveedorComp || !this.tipoComp) return;
    this.guardandoComprobante = true;
    try {
      const datos: ComprobanteCompraInput = {
        proveedorId: this.proveedorComp.id,
        tipo: this.tipoComp,
        nroComprobante: this.nroComprobante.trim(),
        neto: this.neto,
        iva: this.iva,
        iibb: this.iibb,
        noGravado: this.noGravado,
      };
      if (this.tipoComp === 'FACTURA_MERCADERIA') {
        datos.items = this.itemsComp.map(({ productoNombre, cantidad, costoUnitario }) => ({ productoNombre, cantidad, costoUnitario }));
      } else {
        datos.detalle = this.motivoNDNC;
        if (this.tipoComp === 'NOTA_CREDITO' && this.ncVinculada && this.comprobantePadre) {
          datos.comprobanteVinculadoId = this.comprobantePadre.id;
        }
      }
      await this.comprasService.registrarComprobante(datos);
      this.mostrarMensaje('ok', 'Comprobante registrado correctamente.');
      this.resetFormularioComprobante();
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo registrar el comprobante: ' + (e as Error).message);
    } finally {
      this.guardandoComprobante = false;
    }
  }

  private resetFormularioComprobante(): void {
    this.proveedorComp = null;
    this.tipoComp = null;
    this.nroComprobante = '';
    this.neto = 0;
    this.iva = 0;
    this.iibb = 0;
    this.noGravado = 0;
    this.itemsComp = [];
    this.motivoNDNC = '';
    this.montoNDNC = null;
    this.ncVinculada = null;
    this.comprobantePadre = null;
  }

  // ---------- Pagos ----------

  async onProveedorPagoSeleccionado(p: Proveedor | null): Promise<void> {
  this.proveedorPago = p;
  this.comprobantesSeleccionados.clear();
  if (!p) {
    this.comprobantesPendientes = [];
    return;
  }
  this.cargandoPendientes = true;
  try {
    this.comprobantesPendientes = await this.comprasService.comprobantesPendientes(p.id);
  } catch (e) {
    this.mostrarMensaje('error', 'No se pudieron obtener los comprobantes pendientes: ' + (e as Error).message);
  } finally {
    this.cargandoPendientes = false;
  }
}

  toggleComprobanteSeleccionado(c: ComprobanteCompra): void {
    if (this.comprobantesSeleccionados.has(c.id)) {
      this.comprobantesSeleccionados.delete(c.id);
    } else {
      this.comprobantesSeleccionados.add(c.id);
    }
  }

  get totalSeleccionadoPago(): number {
    return this.comprobantesPendientes
      .filter((c) => this.comprobantesSeleccionados.has(c.id))
      .reduce((acc, c) => acc + c.saldo, 0);
  }

  get puedeConfirmarPago(): boolean {
    return this.comprobantesSeleccionados.size > 0 && !!this.formaPagoPago && !!this.montoAPagar && !this.guardandoPago;
  }

  async confirmarPago(): Promise<void> {
    if (!this.puedeConfirmarPago || !this.proveedorPago || !this.montoAPagar) return;
    this.guardandoPago = true;
    try {
      await this.comprasService.registrarPago({
        proveedorId: this.proveedorPago.id,
        comprobanteIds: Array.from(this.comprobantesSeleccionados),
        importe: this.montoAPagar,
        formaPago: this.formaPagoPago,
      });
      this.mostrarMensaje('ok', 'Pago registrado correctamente.');
      this.proveedorPago = null;
      this.comprobantesPendientes = [];
      this.comprobantesSeleccionados.clear();
      this.formaPagoPago = '';
      this.montoAPagar = null;
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo registrar el pago: ' + (e as Error).message);
    } finally {
      this.guardandoPago = false;
    }
  }
  modalProductoVisible = false;
guardandoProducto = false;
camposProducto = CAMPOS_PRODUCTO;

abrirModalProducto(): void {
  this.modalProductoVisible = true;
}

cerrarModalProducto(): void {
  this.modalProductoVisible = false;
}

async guardarProducto(valores: Record<string, string>): Promise<void> {
  this.guardandoProducto = true;
  const datos = {
    nombre: valores['nombre'],
    rubro: valores['rubro'] || undefined,
    tipo: valores['tipo'] || undefined,
    costo: Number(valores['costo']),
    stock: Number(valores['stock']),
    pctRespInsc: Number(valores['pctRespInsc']),
    pctConsFinal: Number(valores['pctConsFinal']),
    pctCtaCte: Number(valores['pctCtaCte']),
  };
  try {
    const nuevo = await this.productosService.crear(datos);
    this.productos = [...this.productos, nuevo];
    this.productoComp = nuevo; // Lo selecciona automáticamente en la compra
    this.modalProductoVisible = false;
    this.mostrarMensaje('ok', 'Producto creado y seleccionado correctamente.');
  } catch (e) {
    this.mostrarMensaje('error', 'No se pudo crear el producto: ' + (e as Error).message);
  } finally {
    this.guardandoProducto = false;
  }
}
}

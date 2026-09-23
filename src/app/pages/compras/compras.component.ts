import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BuscadorComponent } from '../../shared/buscador/buscador.component';
import { AltaRapidaModalComponent } from '../../shared/alta-rapida-modal/alta-rapida-modal.component';
import { CampoFormulario } from '../../shared/models/campo-formulario.model';
import { ProveedoresService } from '../../core/proveedores.service';
import { ProductosService } from '../../core/productos.service';
import { ComprasService } from '../../core/compras.service';
import { ParametrosService } from '../../core/parametros.service';
import { Proveedor } from '../../core/models/proveedor.model';
import { Producto } from '../../core/models/producto.model';
import { Impuesto, FormaPago } from '../../core/models/parametros.model';
import {
  ComprobanteCompra, ComprobanteCompraInput, ItemComprobanteInput, TipoComprobante,
} from '../../core/models/comprobante-compra.model';

const CAMPOS_PRODUCTO: CampoFormulario[] = [
  { key: 'nombre', label: 'Nombre del producto', tipo: 'text', placeholder: 'Ej: Viga 1.2m', requerido: true },
  { key: 'rubro', label: 'Rubro', tipo: 'text', placeholder: 'Ej: Materiales' },
  { key: 'tipo', label: 'Tipo', tipo: 'text', placeholder: 'Ej: Vigas' },
  { key: 'costo', label: 'Costo ($)', tipo: 'number', placeholder: '0.00', requerido: true },
  { key: 'pctRespInsc', label: 'Multiplicador Resp. Inscripto (ej: 1.40)', tipo: 'number', placeholder: '1.40', requerido: true },
  { key: 'pctConsFinal', label: 'Multiplicador Consumidor Final (ej: 1.64)', tipo: 'number', placeholder: '1.64', requerido: true },
  { key: 'pctCtaCte', label: 'Multiplicador Cliente c/cta. cte. (ej: 1.68)', tipo: 'number', placeholder: '1.68', requerido: true },
];

type Pestana = 'comprobantes' | 'pagos';

interface ItemCompraUI extends ItemComprobanteInput {
  subtotal: number;
}

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
  public pestana: Pestana = 'comprobantes';
  public cargando = true;
  public mensaje: { tipo: 'ok' | 'error'; texto: string } | null = null;

  public proveedores: Proveedor[] = [];
  public productos: Producto[] = [];
  
  public impuestosDisponibles: Array<Impuesto & { id: number }> = [];
  public impuestosValores: Record<number, number> = {};

  public formasPago: string[] = [];
  public tipos = TIPOS;

  // Modal alta rápida proveedor
  public modalProveedorVisible = false;
  public guardandoProveedor = false;
  public origenModalProveedor: 'comprobante' | 'pago' = 'comprobante';
  public camposProveedor: CampoFormulario[] = [
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

  // Comprobantes
  public proveedorComp: Proveedor | null = null;
  public tipoComp: TipoComprobante | null = null;
  public nroComprobante = '';
  public neto = 0;
  public noGravado = 0;

  // Factura Mercadería
  public productoComp: Producto | null = null;
  public cantidadComp = 1;
  public nuevoCosto: number | null = null;
  public itemsComp: ItemCompraUI[] = [];

  // Nota de Débito / Crédito
  public motivoNDNC = '';
  public montoNDNC: number | null = null;
  public ncVinculada: boolean | null = null;
  public comprobantesProveedor: ComprobanteCompra[] = [];
  public comprobantePadre: ComprobanteCompra | null = null;

  public guardandoComprobante = false;

  // Pagos
  public proveedorPago: Proveedor | null = null;
  public cargandoPendientes = false;
  public comprobantesPendientes: ComprobanteCompra[] = [];
  public comprobantesSeleccionados: Set<number> = new Set();
  public formaPagoPago = '';
  public montoAPagar: number | null = null;
  public guardandoPago = false;

  public tituloProveedor = (p: Proveedor) => p.nombre;
  public subtituloProveedor = (p: Proveedor) => p.categoria ?? '';
  public tituloProducto = (p: Producto) => p.nombre;
  public tituloComprobante = (c: ComprobanteCompra) => `${c.nroComprobante} — $${c.montoTotal.toFixed(2)}`;

  public modalProductoVisible = false;
  public guardandoProducto = false;
  public camposProducto = CAMPOS_PRODUCTO;

  constructor(
    private proveedoresService: ProveedoresService,
    private productosService: ProductosService,
    private comprasService: ComprasService,
    private parametrosService: ParametrosService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const [provs, prods, listaImpuestos, listaFormasPago] = await Promise.all([
        this.proveedoresService.listar(),
        this.productosService.listar(),
        this.parametrosService.getImpuestos(),
        this.parametrosService.getFormasPago(),
      ]);
      this.proveedores = provs as Proveedor[];
      this.productos = prods;
      
      this.formasPago = listaFormasPago
        .filter(f => f.activa)
        .map(f => f.nombre);

      this.impuestosDisponibles = listaImpuestos
        .filter((i): i is Impuesto & { id: number } => i.activo === true && i.enCompras === true && typeof i.id === 'number')
        .map(i => {
          const alic = i.alicuota ?? 0;
          return {
            ...i,
            id: i.id as number,
            porcentaje: i.porcentaje ?? (alic > 1 ? alic : alic * 100)
          };
        });
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudieron cargar los datos iniciales: ' + (e as Error).message);
    } finally {
      this.cargando = false;
    }
  }

  onNetoChange(): void {
    const netoVal = Number(this.neto) || 0;
    const nuevosValores: Record<number, number> = {};
    
    this.impuestosDisponibles.forEach(imp => {
      const alicuotaVal = imp.porcentaje ?? (imp as any).alicuota ?? 0; 
      nuevosValores[imp.id] = Math.round(netoVal * (alicuotaVal / 100) * 100) / 100;
    });

    this.impuestosValores = nuevosValores;
  }

  cambiarPestana(p: Pestana): void {
    this.pestana = p;
  }

  private mostrarMensaje(tipo: 'ok' | 'error', texto: string): void {
    this.mensaje = { tipo, texto };
    setTimeout(() => (this.mensaje = null), 4000);
  }

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
      const nuevo = (await this.proveedoresService.crear({
        nombre: valores['nombre'],
        cuit: valores['cuit'] || undefined,
        categoria: valores['categoria'] || undefined,
      })) as Proveedor;

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

  onProveedorCompSeleccionado(p: Proveedor | null): void {
    this.proveedorComp = p;
  }

  async seleccionarTipo(t: TipoComprobante): Promise<void> {
    this.tipoComp = t;
    if (t === 'NOTA_CREDITO' && this.proveedorComp) {
      this.comprobantesProveedor = await this.comprasService.comprobantesPendientes(this.proveedorComp.id);
    }
  }

  get totalImpuestosDinamicos(): number {
    return Object.values(this.impuestosValores).reduce((acc, val) => acc + (Number(val) || 0), 0);
  }

  get totalComprobante(): number {
    const total = Number(this.neto) + Number(this.noGravado) + this.totalImpuestosDinamicos;
    return Math.round(total * 100) / 100;
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

    this.neto = this.totalItemsComp;
    this.onNetoChange();
  }

  quitarItemComp(i: number): void {
    this.itemsComp.splice(i, 1);
    this.neto = this.totalItemsComp;
    this.onNetoChange();
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
      const impuestosAplicados = Object.entries(this.impuestosValores)
        .filter(([_, monto]) => Number(monto) > 0)
        .map(([impuestoId, monto]) => ({ impuestoId: Number(impuestoId), monto: Number(monto) }));

      const datos: ComprobanteCompraInput & { impuestos?: { impuestoId: number; monto: number }[] } = {
        proveedorId: this.proveedorComp.id,
        tipo: this.tipoComp,
        nroComprobante: this.nroComprobante.trim(),
        neto: Number(this.neto) || 0,
        noGravado: Number(this.noGravado) || 0,
        iva: 0,
        iibb: 0,
        impuestos: impuestosAplicados,
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
    this.noGravado = 0;
    Object.keys(this.impuestosValores).forEach(id => (this.impuestosValores[Number(id)] = 0));
    this.itemsComp = [];
    this.motivoNDNC = '';
    this.montoNDNC = null;
    this.ncVinculada = null;
    this.comprobantePadre = null;
  }

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
      stock: 0,
      pctRespInsc: Number(valores['pctRespInsc']),
      pctConsFinal: Number(valores['pctConsFinal']),
      pctCtaCte: Number(valores['pctCtaCte']),
    };
    try {
      const nuevo = await this.productosService.crear(datos);
      this.productos = [...this.productos, nuevo];
      this.productoComp = nuevo;
      this.modalProductoVisible = false;
      this.mostrarMensaje('ok', 'Producto creado y seleccionado correctamente.');
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo crear el producto: ' + (e as Error).message);
    } finally {
      this.guardandoProducto = false;
    }
  }
}
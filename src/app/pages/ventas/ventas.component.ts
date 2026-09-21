import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BuscadorComponent } from '../../shared/buscador/buscador.component';
import { AltaRapidaModalComponent } from '../../shared/alta-rapida-modal/alta-rapida-modal.component';
import { CampoFormulario } from '../../shared/models/campo-formulario.model';
import { ClientesService } from '../../core/clientes.service';
import { CategoriasClienteService } from '../../core/categorias-cliente.service';
import { ProductosService } from '../../core/productos.service';
import { VentasService } from '../../core/ventas.service';
import { ParametrosService } from '../../core/parametros.service';
import { Cliente } from '../../core/models/cliente.model';
import { CategoriaCliente } from '../../core/models/categoria-cliente.model';
import { Producto } from '../../core/models/producto.model';
import { Impuesto } from '../../core/models/parametros.model';
import { ItemVentaInput } from '../../core/models/venta.model';
import { MovimientoCC } from '../../core/models/movimiento-cc.model';

type Pestana = 'venta' | 'cobro';
type OrigenModalCliente = 'venta' | 'cobro';

interface ItemVentaUI extends ItemVentaInput {
  productoNombre: string;
  subtotal: number;
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, BuscadorComponent, AltaRapidaModalComponent],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent implements OnInit {
  pestana: Pestana = 'venta';
  cargando = true;
  mensaje: { tipo: 'ok' | 'error'; texto: string } | null = null;

  clientes: Cliente[] = [];
  categoriasCliente: CategoriaCliente[] = [];
  productos: Producto[] = [];
  
  formasPagoVenta: string[] = [];
  formasPagoCobro: string[] = [];

  // --- Impuestos dinámicos ---
  impuestosDisponibles: Array<Impuesto & { id: number }> = [];
  impuestosValores: Record<number, number> = {};

  // --- Modal de alta rápida de cliente ---
  modalClienteVisible = false;
  origenModalCliente: OrigenModalCliente = 'venta';
  guardandoCliente = false;
  camposCliente: CampoFormulario[] = [];

  // --- Sección Nueva Venta ---
  compradorSeleccionado: Cliente | null = null;
  productoSeleccionado: Producto | null = null;
  cantidad = 1;
  items: ItemVentaUI[] = [];
  formaPago = '';
  nroComprobante = '';
  neto = 0;
  noGravado = 0;
  guardandoVenta = false;

  // --- Sección Cuenta Corriente ---
  clienteCC: Cliente | null = null;
  cargandoCC = false;
  historialCC: MovimientoCC[] = [];
  montoCobro: number | null = null;
  formaPagoCobro = '';
  obsCobro = '';
  guardandoCobro = false;

  tituloCliente = (c: Cliente) => c.nombre;
  subtituloCliente = (c: Cliente) => c.categoriaNombre;
  tituloProducto = (p: Producto) => p.nombre;

  constructor(
    private clientesService: ClientesService,
    private categoriasClienteService: CategoriasClienteService,
    private productosService: ProductosService,
    private ventasService: VentasService,
    private parametrosService: ParametrosService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const [cls, prods, cats, listaImpuestos, listaFormasPago] = await Promise.all([
        this.clientesService.listar(),
        this.productosService.listar(),
        this.categoriasClienteService.listar(),
        this.parametrosService.getImpuestos(),
        this.parametrosService.getFormasPago(),
      ]);
      this.clientes = cls;
      this.productos = prods;
      this.categoriasCliente = cats;

      const formasActivas = listaFormasPago
        .filter(f => f.activa)
        .map(f => f.nombre);

      this.formasPagoVenta = formasActivas;
      this.formasPagoCobro = formasActivas.filter(f => f.toLowerCase() !== 'cuenta corriente');

      this.impuestosDisponibles = listaImpuestos.filter(
        (i): i is Impuesto & { id: number } => i.activo === true && i.enVentas === true && typeof i.id === 'number'
      );

      this.impuestosDisponibles.forEach(imp => {
        this.impuestosValores[imp.id] = 0;
      });

      this.cargarCamposCliente();
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudieron cargar los datos iniciales: ' + (e as Error).message);
    } finally {
      this.cargando = false;
    }
  }

  cargarCamposCliente(): void {
    this.camposCliente = [
      { key: 'nombre', label: 'Nombre y Apellido', tipo: 'text', placeholder: 'Ej: Damian Lindstrom', requerido: true },
      { key: 'dniCuit', label: 'DNI / CUIT', tipo: 'text', placeholder: 'XX-XXXXXXXX-X' },
      {
        key: 'categoriaId',
        label: 'Categoría',
        tipo: 'select',
        requerido: true,
        opciones: this.categoriasCliente.map((c) => ({ value: c.id, label: c.nombre })),
      },
    ];
  }

  cambiarPestana(p: Pestana): void {
    this.pestana = p;
  }

  private hoyISO(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private mostrarMensaje(tipo: 'ok' | 'error', texto: string): void {
    this.mensaje = { tipo, texto };
    setTimeout(() => (this.mensaje = null), 4000);
  }

  // ---------- Nueva Venta ----------

  get precioAplicar(): number | null {
    if (!this.productoSeleccionado || !this.compradorSeleccionado) return null;
    return this.precioSegunCategoria(this.productoSeleccionado, this.compradorSeleccionado.categoriaNombre);
  }

  private precioSegunCategoria(p: Producto, categoria: string): number {
    if (categoria === 'Resp. Inscripto') return p.precioRespInsc;
    if (categoria === 'Cliente con c/corriente') return p.precioCtaCte;
    return p.precioConsFinal;
  }

  onCompradorSeleccionado(c: Cliente | null): void {
    this.compradorSeleccionado = c;
  }

  onProductoSeleccionado(p: Producto | null): void {
    this.productoSeleccionado = p;
  }

  agregarItem(): void {
    if (!this.productoSeleccionado || !this.compradorSeleccionado || this.cantidad < 1) return;
    const precio = this.precioAplicar!;
    this.items.push({
      productoId: this.productoSeleccionado.id,
      productoNombre: this.productoSeleccionado.nombre,
      cantidad: this.cantidad,
      precioUnitario: precio,
      subtotal: Math.round(precio * this.cantidad * 100) / 100,
    });
    this.productoSeleccionado = null;
    this.cantidad = 1;
    this.recalcularNetoSegunItems();
  }

  quitarItem(i: number): void {
    this.items.splice(i, 1);
    this.recalcularNetoSegunItems();
  }

  get totalItems(): number {
    return Math.round(this.items.reduce((acc, it) => acc + it.subtotal, 0) * 100) / 100;
  }

  private recalcularNetoSegunItems(): void {
    this.neto = this.totalItems;
  }

  get totalImpuestosDinamicos(): number {
    return Object.values(this.impuestosValores).reduce((acc, val) => acc + (Number(val) || 0), 0);
  }

  get totalVenta(): number {
    const total = Number(this.neto) + Number(this.noGravado) + this.totalImpuestosDinamicos;
    return Math.round(total * 100) / 100;
  }

  get puedeConfirmarVenta(): boolean {
    return !!this.compradorSeleccionado && this.items.length > 0 && !!this.formaPago && !this.guardandoVenta;
  }

  async confirmarVenta(): Promise<void> {
    if (!this.puedeConfirmarVenta || !this.compradorSeleccionado) return;
    this.guardandoVenta = true;
    try {
      const impuestosAplicados = Object.entries(this.impuestosValores)
        .filter(([_, monto]) => Number(monto) > 0)
        .map(([impuestoId, monto]) => ({ impuestoId: Number(impuestoId), monto: Number(monto) }));

      const payload: any = {
        clienteId: this.compradorSeleccionado.id,
        formaPago: this.formaPago,
        nroComprobante: this.nroComprobante.trim() || undefined,
        neto: Number(this.neto) || 0,
        noGravado: Number(this.noGravado) || 0,
        iva: 0,
        iibb: 0,
        impuestos: impuestosAplicados,
        items: this.items.map(({ productoId, cantidad, precioUnitario }) => ({ productoId, cantidad, precioUnitario })),
      };

      await this.ventasService.registrar(payload);
      this.mostrarMensaje('ok', 'Venta registrada correctamente.');
      this.resetVentaFormulario();
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo registrar la venta: ' + (e as Error).message);
    } finally {
      this.guardandoVenta = false;
    }
  }

  private resetVentaFormulario(): void {
    this.items = [];
    this.formaPago = '';
    this.compradorSeleccionado = null;
    this.nroComprobante = '';
    this.neto = 0;
    this.noGravado = 0;
    Object.keys(this.impuestosValores).forEach(id => (this.impuestosValores[Number(id)] = 0));
  }

  // ---------- Cuenta Corriente ----------

  async onClienteCCSeleccionado(c: Cliente | null): Promise<void> {
    if (!c) {
      this.limpiarFormularioCC();
      return;
    }
    this.clienteCC = c;
    this.cargandoCC = true;
    this.historialCC = [];
    try {
      this.historialCC = await this.ventasService.cuentaCorriente(c.id);
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo obtener el estado de cuenta: ' + (e as Error).message);
    } finally {
      this.cargandoCC = false;
    }
  }

  get saldoAnteriorCC(): number {
    return this.historialCC.length ? this.historialCC[this.historialCC.length - 1].saldoAcumulado : 0;
  }

  get saldoPosteriorCC(): number {
    return this.saldoAnteriorCC - (this.montoCobro ?? 0);
  }

  async confirmarCobroCC(): Promise<void> {
    if (!this.clienteCC || !this.montoCobro || !this.formaPagoCobro) return;
    this.guardandoCobro = true;
    try {
      this.historialCC = await this.ventasService.registrarCobro({
        clienteId: this.clienteCC.id,
        monto: this.montoCobro,
        formaPago: this.formaPagoCobro,
        observaciones: this.obsCobro || undefined,
      });
      this.mostrarMensaje('ok', 'Cobro registrado en la cuenta corriente.');

      this.montoCobro = null;
      this.formaPagoCobro = '';
      this.obsCobro = '';
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo registrar el cobro: ' + (e as Error).message);
    } finally {
      this.guardandoCobro = false;
    }
  }

  limpiarFormularioCC(): void {
    this.clienteCC = null;
    this.historialCC = [];
    this.montoCobro = null;
    this.formaPagoCobro = '';
    this.obsCobro = '';
  }

  // ---------- Modal de alta rápida de cliente ----------

  abrirModalCliente(origen: OrigenModalCliente): void {
    this.origenModalCliente = origen;
    this.cargarCamposCliente();
    this.modalClienteVisible = true;
  }

  cerrarModalCliente(): void {
    this.modalClienteVisible = false;
  }

  async guardarCliente(valores: Record<string, string>): Promise<void> {
    this.guardandoCliente = true;
    try {
      const nuevoCliente = await this.clientesService.crear({
        nombre: valores['nombre'],
        dniCuit: valores['dniCuit'] || undefined,
        categoriaId: Number(valores['categoriaId']),
      });

      const cat = this.categoriasCliente.find(c => c.id === nuevoCliente.categoriaId);
      if (cat) {
        nuevoCliente.categoriaNombre = cat.nombre;
      }

      this.clientes = [...this.clientes, nuevoCliente];
      if (this.origenModalCliente === 'venta') {
        this.compradorSeleccionado = nuevoCliente;
      } else {
        await this.onClienteCCSeleccionado(nuevoCliente);
      }
      this.modalClienteVisible = false;
      this.mostrarMensaje('ok', 'Cliente creado correctamente.');
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo crear el cliente: ' + (e as Error).message);
    } finally {
      this.guardandoCliente = false;
    }
  }
}
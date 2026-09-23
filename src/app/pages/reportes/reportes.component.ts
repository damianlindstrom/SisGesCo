import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImpuestosService } from '../../core/impuestos.service';
import { ReportesService } from '../../core/reportes.service';
import { ParametrosService } from '../../core/parametros.service';
import { ProveedoresService } from '../../core/proveedores.service';
import { ClientesService } from '../../core/clientes.service';
import { AltaRapidaModalComponent } from '../../shared/alta-rapida-modal/alta-rapida-modal.component';
import { CampoFormulario } from '../../shared/models/campo-formulario.model';
import { Impuesto } from '../../core/models/impuesto.model';
import { 
  MovimientoGeneral, 
  ReporteImpositivo, 
  ResultadoPeriodo, 
  Proveedor, 
  Cliente 
} from '../../core/models/reportes.model';

type Pestana = 'impuestos' | 'operativos' | 'movimientos' | 'formas-pago' | 'clientes-proveedores' | 'personalizados';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, AltaRapidaModalComponent],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {
  pestana: Pestana = 'impuestos';
  cargando = true;
  mensaje: { tipo: 'ok' | 'error'; texto: string } | null = null;

  // ---------- Impuestos ----------
  impuestos: Impuesto[] = [];
  impuestoSeleccionadoId: number | null = null;
  desdeImpuestos = this.hoyISO();
  hastaImpuestos = this.hoyISO();
  consultandoImpuesto = false;
  reporteImpositivo: ReporteImpositivo | null = null;

  // ---------- Reportes Operativos ----------
  desdeOperativo = this.primerDiaDelMesISO();
  hastaOperativo = this.hoyISO();
  consultandoOperativo = false;
  resultado: ResultadoPeriodo | null = null;

  // ---------- Movimientos Generales ----------
  desdeMovimientos = this.primerDiaDelMesISO();
  hastaMovimientos = this.hoyISO();
  moduloMovimientos = 'TODOS';
  consultandoMovimientos = false;
  listaMovimientos: MovimientoGeneral[] = [];

  // ---------- Resumen Formas de Pago ----------
  formasPago: Array<{ id?: string | number; nombre: string; activa: boolean }> = [];
  formaPagoSeleccionadaId: number | string | null = null;
  desdeFormaPago = this.hoyISO();
  hastaFormaPago = this.hoyISO();
  consultandoFormaPago = false;
  resumenFormaPago: any = null;

  // ---------- Clientes / Proveedores ----------
  tipoEntidad: 'PROVEEDORES' | 'CLIENTES' = 'PROVEEDORES';
  filtroSoloActivosEntidad = false;
  consultandoEntidades = false;
  listaProveedores: Proveedor[] = [];
  listaClientes: Cliente[] = [];
  categoriasCliente: Array<{ id: number; nombre: string }> = [];

  // Modal Alta Rápida Entidad
  modalEntidadVisible = false;
  tituloModalEntidad = '';
  camposModalEntidad: CampoFormulario[] = [];
  guardandoEntidad = false;

  constructor(
    private impuestosService: ImpuestosService,
    private reportesService: ReportesService,
    private parametrosService: ParametrosService,
    private proveedoresService: ProveedoresService,
    private clientesService: ClientesService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const [listaImpuestos, listaFormasPago] = await Promise.all([
        this.impuestosService.listar(),
        this.parametrosService.getFormasPago(),
      ]);
      this.impuestos = listaImpuestos;
      this.impuestoSeleccionadoId = this.impuestos[0]?.id ?? null;

      this.formasPago = listaFormasPago;
      if (this.formasPago.length > 0) {
        this.formaPagoSeleccionadaId = this.formasPago[0].id ?? null;
      }

      try {
        this.categoriasCliente = await this.clientesService.listarCategorias();
      } catch {
        this.categoriasCliente = [];
      }
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudieron cargar los datos iniciales: ' + (e as Error).message);
    } finally {
      this.cargando = false;
    }
  }

  cambiarPestana(p: Pestana): void {
    this.pestana = p;
    if (p === 'clientes-proveedores' && !this.listaProveedores.length && !this.listaClientes.length) {
      this.consultarEntidades();
    }
  }

  private hoyISO(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private primerDiaDelMesISO(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  }

  private mostrarMensaje(tipo: 'ok' | 'error', texto: string): void {
    this.mensaje = { tipo, texto };
    setTimeout(() => (this.mensaje = null), 4000);
  }

  // ---------- Impuestos ----------

  async consultarReporte(): Promise<void> {
    if (!this.impuestoSeleccionadoId) return;
    this.consultandoImpuesto = true;
    this.reporteImpositivo = null;
    try {
      this.reporteImpositivo = await this.reportesService.reporteImpositivo(this.impuestoSeleccionadoId, this.desdeImpuestos, this.hastaImpuestos);
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo generar el reporte: ' + (e as Error).message);
    } finally {
      this.consultandoImpuesto = false;
    }
  }

  get totalNetoCalculado(): number {
    if (!this.reporteImpositivo) return 0;
    return this.reporteImpositivo.movimientos.reduce((acc, m) => {
      const esCompra = m.origen === 'COMPRA';
      return acc + (esCompra ? -m.neto : m.neto);
    }, 0);
  }

  get totalImpuestoCalculado(): number {
    if (!this.reporteImpositivo) return 0;
    return this.reporteImpositivo.movimientos.reduce((acc, m) => {
      const esCompra = m.origen === 'COMPRA';
      return acc + (esCompra ? -m.montoImpuesto : m.montoImpuesto);
    }, 0);
  }

  exportarCSVImpositivo(): void {
    if (!this.reporteImpositivo) return;
    const encabezado = ['Fecha', 'Origen', 'Concepto', 'CUIT/CUIL', 'Comprobante', 'Contraparte', 'Neto', 'Impuesto'];
    const filas = this.reporteImpositivo.movimientos.map((m) => {
      const esGastoOCompra = m.origen === 'COMPRA' || m.origen === 'GASTO';
      const signo = esGastoOCompra ? -1 : 1;
      const fechaFormateada = new Date(m.fecha).toLocaleDateString('es-AR');
      return [
        fechaFormateada,
        m.origen,
        m.concepto,
        m.cuit || '',
        m.comprobante || '',
        m.contraparte,
        (m.neto * signo).toFixed(2),
        (m.montoImpuesto * signo).toFixed(2),
      ];
    });
    this.descargarCSV(`reporte-${this.reporteImpositivo.impuesto}-${this.desdeImpuestos}-a-${this.hastaImpuestos}.csv`, encabezado, filas);
  }

  // ---------- Reportes Operativos ----------

  async consultarResultado(): Promise<void> {
    this.consultandoOperativo = true;
    this.resultado = null;
    try {
      this.resultado = await this.reportesService.resultadoPeriodo(this.desdeOperativo, this.hastaOperativo);
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo generar el resultado del período: ' + (e as Error).message);
    } finally {
      this.consultandoOperativo = false;
    }
  }

  exportarCSVResultado(): void {
    if (!this.resultado) return;
    const encabezado = ['Concepto', 'Detalle', 'Monto'];
    const filas: string[][] = [
      ['Ingresos por ventas', '', this.resultado.ventas.total.toFixed(2)],
      ...this.resultado.compras.detalle.map((c) => ['Compra', `${c.tipo} — ${c.proveedor} (${c.nroComprobante ?? ''})`, c.monto.toFixed(2)]),
      ...this.resultado.gastos.detalle.map((g) => ['Gasto vario', `${g.nombreCorto} — ${g.tipo}`, (-g.importe).toFixed(2)]),
      ['Resultado bruto', '', this.resultado.resultadoBruto.toFixed(2)],
      ['CMV', '', (-this.resultado.cmv).toFixed(2)],
      ['Resultado neto', '', this.resultado.resultadoNeto.toFixed(2)],
    ];
    this.descargarCSV(`resultado-periodo-${this.desdeOperativo}-a-${this.hastaOperativo}.csv`, encabezado, filas);
  }

  get cmvAjustado(): number {
    if (!this.resultado) return 0;
    const totalImpuestosPeriodo = this.resultado.totalImpuestosPeriodo ?? 0; 
    const cmvFinal = this.resultado.cmv - totalImpuestosPeriodo;
    return cmvFinal >= 0 ? cmvFinal : 0;
  }

  // ---------- Movimientos Generales ----------

  async consultarMovimientos(): Promise<void> {
    this.consultandoMovimientos = true;
    this.listaMovimientos = [];
    try {
      this.listaMovimientos = await this.reportesService.movimientos(
        this.desdeMovimientos,
        this.hastaMovimientos,
        this.moduloMovimientos
      );
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudieron consultar los movimientos: ' + (e as Error).message);
    } finally {
      this.consultandoMovimientos = false;
    }
  }

  exportarCSVMovimientos(): void {
    if (!this.listaMovimientos.length) return;
    const encabezado = [
      'Fecha',
      'Módulo',
      'Concepto',
      'Contraparte',
      'Comprobante',
      'Forma de Pago',
      'Neto',
      'IVA',
      'IIBB',
      'Monto Total'
    ];
    const filas = this.listaMovimientos.map((m) => {
      const fechaFormateada = new Date(m.fecha).toLocaleDateString('es-AR');
      const neto = m.neto ?? 0;
      const iva = m.iva ?? 0;
      const iibb = m.iibb ?? 0;
      return [
        fechaFormateada,
        m.modulo,
        m.concepto || '',
        m.contraparte || '',
        m.comprobante || '',
        m.formaPago || '',
        neto.toFixed(2),
        iva.toFixed(2),
        iibb.toFixed(2),
        m.monto.toFixed(2),
      ];
    });
    this.descargarCSV(`movimientos-${this.moduloMovimientos.toLowerCase()}-${this.desdeMovimientos}-a-${this.hastaMovimientos}.csv`, encabezado, filas);
  }

  // ---------- Resumen Formas de Pago ----------

  async consultarResumenFormaPago(): Promise<void> {
    if (this.formaPagoSeleccionadaId === null || this.formaPagoSeleccionadaId === undefined) return;
    this.consultandoFormaPago = true;
    this.resumenFormaPago = null;
    try {
      this.resumenFormaPago = await this.reportesService.resumenFormaPago(this.formaPagoSeleccionadaId, this.desdeFormaPago, this.hastaFormaPago);
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo consultar el resumen de forma de pago: ' + (e as Error).message);
    } finally {
      this.consultandoFormaPago = false;
    }
  }

  // ---------- Clientes / Proveedores ----------

  alCambiarTipoEntidad(): void {
    this.consultarEntidades();
  }

  async consultarEntidades(): Promise<void> {
    this.consultandoEntidades = true;
    try {
      if (this.tipoEntidad === 'PROVEEDORES') {
        this.listaProveedores = await this.proveedoresService.listar(this.filtroSoloActivosEntidad);
      } else {
        this.listaClientes = await this.clientesService.listar(this.filtroSoloActivosEntidad);
      }
    } catch (e) {
      this.mostrarMensaje('error', `No se pudo obtener la lista de ${this.tipoEntidad.toLowerCase()}: ` + (e as Error).message);
    } finally {
      this.consultandoEntidades = false;
    }
  }

  async toggleEstadoProveedor(p: Proveedor): Promise<void> {
    try {
      const nuevoEstado = !p.activo;
      await this.proveedoresService.actualizar(p.id, { activo: nuevoEstado });
      p.activo = nuevoEstado;
      this.mostrarMensaje('ok', `Proveedor "${p.nombre}" ${nuevoEstado ? 'activado' : 'desactivado'} con éxito.`);
      if (this.filtroSoloActivosEntidad) {
        this.consultarEntidades();
      }
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo cambiar el estado: ' + (e as Error).message);
    }
  }

  async toggleEstadoCliente(c: Cliente): Promise<void> {
    try {
      const nuevoEstado = !c.activo;
      await this.clientesService.actualizar(c.id, { activo: nuevoEstado });
      c.activo = nuevoEstado;
      this.mostrarMensaje('ok', `Cliente "${c.nombre}" ${nuevoEstado ? 'activado' : 'desactivado'} con éxito.`);
      if (this.filtroSoloActivosEntidad) {
        this.consultarEntidades();
      }
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo cambiar el estado: ' + (e as Error).message);
    }
  }

  abrirModalAltaEntidad(): void {
    if (this.tipoEntidad === 'PROVEEDORES') {
      this.tituloModalEntidad = 'Nuevo Proveedor';
      this.camposModalEntidad = [
        { key: 'nombre', label: 'Nombre / Razón Social', tipo: 'text', requerido: true, placeholder: 'Ej: Distribuidora S.A.' },
        { key: 'cuit', label: 'CUIT', tipo: 'text', requerido: false, placeholder: 'Ej: 30-12345678-9' },
        { key: 'categoria', label: 'Categoría', tipo: 'text', requerido: false, placeholder: 'Ej: Materias Primas' },
        { key: 'activo', label: '¿Activo?', tipo: 'checkbox', requerido: false }
      ];
    } else {
      this.tituloModalEntidad = 'Nuevo Cliente';
      this.camposModalEntidad = [
        { key: 'nombre', label: 'Nombre / Razón Social', tipo: 'text', requerido: true, placeholder: 'Ej: Juan Pérez' },
        { key: 'dniCuit', label: 'DNI / CUIT', tipo: 'text', requerido: false, placeholder: 'Ej: 20-33445566-7' },
        { 
          key: 'categoriaId', 
          label: 'Categoría', 
          tipo: 'select', 
          requerido: true, 
          opciones: this.categoriasCliente.map(c => ({ value: c.id, label: c.nombre })) 
        },
        { key: 'cuentaCorriente', label: 'Habilitar Cuenta Corriente', tipo: 'checkbox', requerido: false },
        { key: 'activo', label: '¿Activo?', tipo: 'checkbox', requerido: false }
      ];
    }
    this.modalEntidadVisible = true;
  }

  cerrarModalEntidad(): void {
    this.modalEntidadVisible = false;
  }

  async guardarNuevaEntidad(valores: Record<string, any>): Promise<void> {
    this.guardandoEntidad = true;
    try {
      if (this.tipoEntidad === 'PROVEEDORES') {
        await this.proveedoresService.crear({
          nombre: String(valores['nombre']).trim(),
          cuit: valores['cuit'] ? String(valores['cuit']).trim() : undefined,
          categoria: valores['categoria'] ? String(valores['categoria']).trim() : undefined,
          activo: valores['activo'] ?? true
        });
        this.mostrarMensaje('ok', 'Proveedor creado correctamente.');
      } else {
        await this.clientesService.crear({
          nombre: String(valores['nombre']).trim(),
          dniCuit: valores['dniCuit'] ? String(valores['dniCuit']).trim() : undefined,
          categoriaId: Number(valores['categoriaId']),
          cuentaCorriente: !!valores['cuentaCorriente'],
          activo: valores['activo'] ?? true
        });
        this.mostrarMensaje('ok', 'Cliente creado correctamente.');
      }
      this.cerrarModalEntidad();
      await this.consultarEntidades();
    } catch (e) {
      this.mostrarMensaje('error', 'Error al guardar registro: ' + (e as Error).message);
    } finally {
      this.guardandoEntidad = false;
    }
  }

  private descargarCSV(nombreArchivo: string, encabezado: string[], filas: string[][]): void {
    const separador = ';';
    const csv = '\uFEFF' + [encabezado, ...filas].map((f) => f.map((v) => `"${v}"`).join(separador)).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    URL.revokeObjectURL(url);
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AltaRapidaModalComponent } from '../../shared/alta-rapida-modal/alta-rapida-modal.component';
import { CampoFormulario } from '../../shared/models/campo-formulario.model';
import { ProductosService } from '../../core/productos.service';
import { Producto } from '../../core/models/producto.model';

const CAMPOS_PRODUCTO: CampoFormulario[] = [
  { key: 'nombre', label: 'Nombre del producto', tipo: 'text', placeholder: 'Ej: Viga 1.2m', requerido: true },
  { key: 'rubro', label: 'Rubro', tipo: 'text', placeholder: 'Ej: Materiales' },
  { key: 'tipo', label: 'Tipo', tipo: 'text', placeholder: 'Ej: Vigas' },
  { key: 'costo', label: 'Costo ($)', tipo: 'number', placeholder: '0.00', requerido: true },
  { key: 'stock', label: 'Stock inicial', tipo: 'number', placeholder: '0', requerido: true },
  { key: 'pctRespInsc', label: 'Multiplicador Resp. Inscripto (ej: 1.40 = costo +40%)', tipo: 'number', placeholder: '1.40', requerido: true },
  { key: 'pctConsFinal', label: 'Multiplicador Consumidor Final (ej: 1.64)', tipo: 'number', placeholder: '1.64', requerido: true },
  { key: 'pctCtaCte', label: 'Multiplicador Cliente c/cta. cte. (ej: 1.68)', tipo: 'number', placeholder: '1.68', requerido: true },
];

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, AltaRapidaModalComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  cargando = true;
  mensaje: { tipo: 'ok' | 'error'; texto: string } | null = null;

  productos: Producto[] = [];
  filtro = '';

  campos = CAMPOS_PRODUCTO;
  modalVisible = false;
  guardando = false;
  productoEditando: Producto | null = null; // null = alta nueva; con valor = edición

  constructor(private productosService: ProductosService) {}

  async ngOnInit(): Promise<void> {
    await this.cargarProductos();
  }

  private async cargarProductos(): Promise<void> {
    this.cargando = true;
    try {
      this.productos = await this.productosService.listar();
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudieron cargar los productos: ' + (e as Error).message);
    } finally {
      this.cargando = false;
    }
  }

  private mostrarMensaje(tipo: 'ok' | 'error', texto: string): void {
    this.mensaje = { tipo, texto };
    setTimeout(() => (this.mensaje = null), 4000);
  }

  // Búsqueda de variantes: alcanza con un filtro simple por texto contra
  // nombre/rubro/tipo (ej: escribir "Viga" muestra todas las medidas).
  get productosFiltrados(): Producto[] {
    const q = this.filtro.trim().toLowerCase();
    if (!q) return this.productos;
    return this.productos.filter((p) =>
      p.nombre.toLowerCase().includes(q) ||
      (p.rubro ?? '').toLowerCase().includes(q) ||
      (p.tipo ?? '').toLowerCase().includes(q)
    );
  }

  abrirAlta(): void {
    this.productoEditando = null;
    this.modalVisible = true;
  }

  abrirEdicion(p: Producto): void {
    this.productoEditando = p;
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
  }

  get valoresIniciales(): Record<string, string | number> | null {
    if (!this.productoEditando) return null;
    const p = this.productoEditando;
    // Reconstruye los multiplicadores a partir de precio/costo, ya que el
    // back solo expone precios calculados, no los % crudos que los originan.
    const mult = (precio: number) => (p.costo ? Math.round((precio / p.costo) * 10000) / 10000 : 0);
    return {
      nombre: p.nombre, rubro: p.rubro ?? '', tipo: p.tipo ?? '',
      costo: p.costo, stock: p.stock,
      pctRespInsc: mult(p.precioRespInsc), pctConsFinal: mult(p.precioConsFinal), pctCtaCte: mult(p.precioCtaCte),
    };
  }

  get tituloModal(): string {
    return this.productoEditando ? `Editar: ${this.productoEditando.nombre}` : 'Nuevo producto';
  }

  async guardarProducto(valores: Record<string, string>): Promise<void> {
    this.guardando = true;
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
      if (this.productoEditando) {
        const actualizado = await this.productosService.actualizar(this.productoEditando.id, datos);
        this.productos = this.productos.map((p) => (p.id === actualizado.id ? actualizado : p));
        this.mostrarMensaje('ok', 'Producto actualizado.');
      } else {
        const creado = await this.productosService.crear(datos);
        this.productos = [...this.productos, creado];
        this.mostrarMensaje('ok', 'Producto creado.');
      }
      this.modalVisible = false;
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo guardar el producto: ' + (e as Error).message);
    } finally {
      this.guardando = false;
    }
  }
}

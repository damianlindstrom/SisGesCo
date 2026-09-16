import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface ModuloHome {
  ruta: string;
  clase: string;
  icono: string;
  titulo: string;
  desc: string;
}

const MODULOS: ModuloHome[] = [
  { ruta: '/ventas', clase: 'ventas', icono: '🛒', titulo: 'Ventas', desc: 'Registrá ventas, consultá stock y precios por tipo de cliente.' },
  { ruta: '/compras', clase: 'compras', icono: '📋', titulo: 'Compras', desc: 'Ingresá comprobantes, registrá pagos y gestioná proveedores.' },
  { ruta: '/gastos-varios', clase: 'gastos-varios', icono: '🏢', titulo: 'Gastos Varios', desc: 'Registrá sueldos, gastos de oficina y otros gastos poco recurrentes.' },
  { ruta: '/reportes', clase: 'reportes', icono: '📊', titulo: 'Reportes', desc: 'Dashboard de KPIs y exportador de movimientos de IVA e IIBB.' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  modulos = MODULOS;
}

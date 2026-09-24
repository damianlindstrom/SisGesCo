import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service'; 

interface ModuloHome {
  ruta: string;
  clase: string;
  icono: string;
  titulo: string;
  desc: string;
  roles: string[];
}

const MODULOS: ModuloHome[] = [
  { 
    ruta: '/ventas', 
    clase: 'ventas', 
    icono: '🛒', 
    titulo: 'Ventas', 
    desc: 'Registrá ventas, consultá stock y precios por tipo de cliente.',
    roles: ['vendedor']
  },
  { 
    ruta: '/compras', 
    clase: 'compras', 
    icono: '📋', 
    titulo: 'Compras', 
    desc: 'Ingresá comprobantes, registrá pagos y gestioná proveedores.',
    roles: ['administrador']
  },
  { 
    ruta: '/gastos-varios', 
    clase: 'gastos-varios', 
    icono: '🏢', 
    titulo: 'Gastos Varios', 
    desc: 'Registrá sueldos, gastos de oficina y otros gastos poco recurrentes.',
    roles: ['administrador']
  },
  { 
    ruta: '/reportes', 
    clase: 'reportes', 
    icono: '📊', 
    titulo: 'Reportes', 
    desc: 'Dashboard de KPIs y exportador de movimientos de IVA e IIBB.',
    roles: ['vendedor', 'administrador']
  },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private authService: AuthService) {}

  get modulos(): ModuloHome[] {
    return MODULOS.filter(m => this.authService.tienePermiso(m.roles));
  }
}
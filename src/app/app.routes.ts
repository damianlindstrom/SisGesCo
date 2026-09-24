import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { VentasComponent } from './pages/ventas/ventas.component';
import { ComprasComponent } from './pages/compras/compras.component';
import { GastosVariosComponent } from './pages/gastos-varios/gastos-varios.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { ParametrosComponent } from './pages/parametros/parametros.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  
  { 
    path: '', 
    component: HomeComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['dueño', 'vendedor', 'administrador'] } 
  },
  { 
    path: 'ventas', 
    component: VentasComponent, 
    canActivate: [AuthGuard], 
    data: { roles: ['vendedor'] } 
  },
  { 
    path: 'compras', 
    component: ComprasComponent, 
    canActivate: [AuthGuard], 
    data: { roles: ['administrador'] } 
  },
  { 
    path: 'gastos-varios', 
    component: GastosVariosComponent, 
    canActivate: [AuthGuard], 
    data: { roles: ['administrador'] } 
  },
  { 
    path: 'reportes', 
    component: ReportesComponent, 
    canActivate: [AuthGuard], 
    data: { roles: ['vendedor', 'administrador'] } 
  },
  { 
    path: 'productos', 
    component: ProductosComponent, 
    canActivate: [AuthGuard], 
    data: { roles: ['vendedor', 'administrador'] } 
  },
  { 
    path: 'parametros', 
    component: ParametrosComponent, 
    canActivate: [AuthGuard], 
    data: { roles: ['dueño'] } 
  },
  { path: '**', redirectTo: '' },
];
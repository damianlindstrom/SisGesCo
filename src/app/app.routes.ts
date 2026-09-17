import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { VentasComponent } from './pages/ventas/ventas.component';
import { ComprasComponent } from './pages/compras/compras.component';
import { GastosVariosComponent } from './pages/gastos-varios/gastos-varios.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { ParametrosComponent } from './pages/parametros/parametros.component';

// Rutas equivalentes a los "form=" de doGet en Codigo.gs:
// index -> home, ventas, compras, gastos_varios -> gastos-varios, reportes
export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'ventas', component: VentasComponent },
  { path: 'compras', component: ComprasComponent },
  { path: 'gastos-varios', component: GastosVariosComponent },
  { path: 'reportes', component: ReportesComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'parametros', component: ParametrosComponent },
  { path: '**', redirectTo: '' },
];

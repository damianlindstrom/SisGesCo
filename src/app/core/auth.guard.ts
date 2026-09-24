import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const usuarioActual = this.authService.obtenerUsuarioActual();
    
    // Si no está logueado, lo mandamos al login
    if (!usuarioActual) {
      this.router.navigate(['/login']);
      return false;
    }

    // Verificamos si la ruta exige roles específicos
    const rolesPermitidos = route.data['roles'] as Array<string>;
    if (rolesPermitidos && !this.authService.tienePermiso(rolesPermitidos)) {
      // Si no tiene el rol, lo mandamos a una pantalla por defecto (ej. home o ventas)
      this.router.navigate(['/']);
      return false;
    }

    return true; // Pasa la validación
  }
}
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Base de datos simulada
  private usuarios = [
    { usuario: 'super', password: 'superusuario1', rol: 'dueño', organizacion: 'Mi Empresa' },
    { usuario: 'vendedor', password: 'vendedor1', rol: 'vendedor', organizacion: 'Mi Empresa' },
    { usuario: 'administrador', password: 'administrador1', rol: 'administrador', organizacion: 'Mi Empresa' }
  ];

  constructor(private router: Router) {}

  login(usuario: string, password: string, organizacion: string): boolean {
  const user = this.usuarios.find(u => u.usuario === usuario && u.password === password);
  if (user) {
    const usuarioConOrganizacion = { ...user, organizacion };
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioConOrganizacion));
    return true;
  }
  return false;
}

  logout(): void {
    localStorage.removeItem('usuarioActual');
    this.router.navigate(['/login']);
  }

  obtenerUsuarioActual(): any {
    const userStr = localStorage.getItem('usuarioActual');
    return userStr ? JSON.parse(userStr) : null;
  }

  tienePermiso(rolesPermitidos: string[]): boolean {
    const user = this.obtenerUsuarioActual();
    if (!user) return false;
    // El dueño siempre tiene acceso a todo, atajo conveniente
    if (user.rol === 'dueño') return true;
    return rolesPermitidos.includes(user.rol);
  }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  organizacion = 'Mi Empresa';
  usuario = '';
  password = '';
  mostrarPassword = false;
  errorMensaje = '';

  constructor(private authService: AuthService, private router: Router) {}

  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  onSubmit(): void {
    this.errorMensaje = '';
    
    if (!this.usuario || !this.password || !this.organizacion) {
      this.errorMensaje = 'Por favor complete todos los campos';
      return;
    }

    const exito = this.authService.login(this.usuario, this.password, this.organizacion);
    if (exito) {
      this.router.navigate(['/']);
    } else {
      this.errorMensaje = 'Usuario o contraseña incorrectos';
    }
  }
}
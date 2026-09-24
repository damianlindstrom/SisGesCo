import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service'; 

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  menuVisible = false;

  constructor(public authService: AuthService) {}

  toggleMenuMobile(): void {
    this.menuVisible = !this.menuVisible;
  }

  logout(): void {
    this.menuVisible = false;
    this.authService.logout();
  }
}
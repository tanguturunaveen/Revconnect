import { Component, OnInit, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {
  protected readonly title = signal('revconnect-ui');
  isNavigating = false;
  navBarWidth = 0;
  private navTimer: any;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isNavigating = true;
        this.navBarWidth = 20;
        this.cdr.markForCheck();
        // Simulate progress fill
        clearTimeout(this.navTimer);
        this.navTimer = setTimeout(() => {
          this.navBarWidth = 70;
          this.cdr.markForCheck();
        }, 80);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        clearTimeout(this.navTimer);
        this.navBarWidth = 100;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.isNavigating = false;
          this.navBarWidth = 0;
          this.cdr.markForCheck();
        }, 250);
      }
    });
  }
}


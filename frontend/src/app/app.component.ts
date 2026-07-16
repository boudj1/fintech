import { Component } from '@angular/core';

/**
 * Root component — renders only one <router-outlet>.
 * Authenticated layout (sidebar + header + footer) is handled by AppShellComponent
 * which is used as the parent route component for all protected routes.
 */
@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {}

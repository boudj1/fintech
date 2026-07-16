import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminService } from './services/admin.service';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { UsersManagementComponent } from './components/users-management/users-management.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LogsComponent } from './components/logs/logs.component';
import { ProductsManagementComponent } from './components/products-management/products-management.component';
import { ChatService } from '../chatbot/services/chat.service';
import { FintechService } from '../fintech/services/fintech.service';

@NgModule({
  declarations: [
    AnalyticsComponent,
    UsersManagementComponent,
    SettingsComponent,
    LogsComponent,
    ProductsManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule
  ],
  providers: [AdminService, ChatService, FintechService]
})
export class AdminModule {}

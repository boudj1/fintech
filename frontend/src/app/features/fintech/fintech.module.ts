import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FintechRoutingModule } from './fintech-routing.module';
import { FintechService } from './services/fintech.service';
import { FintechDashboardComponent } from './components/dashboard/fintech-dashboard.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { WalletComponent } from './components/wallet/wallet.component';
import { BeneficiariesComponent } from './components/beneficiaries/beneficiaries.component';
import { ProductsComponent } from './components/products/products.component';

@NgModule({
  declarations: [
    FintechDashboardComponent,
    AccountsComponent,
    TransactionsComponent,
    WalletComponent,
    BeneficiariesComponent,
    ProductsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    FintechRoutingModule
  ],
  providers: [FintechService]
})
export class FintechModule {}

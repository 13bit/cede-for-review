import {Component, OnDestroy, OnInit} from '@angular/core';
import {WalletService} from '@app/core/wallet.service';
import {UserWallet} from '@app/shared/model/user-wallet';
import {DashboardService} from '@app/dashboard/dashboard.service';
import {Constants} from '@app/shared';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-dashboard-wallets-management',
  templateUrl: './wallets-management.component.html',
  styleUrls: ['./wallets-management.component.css']
})

export class WalletsManagementComponent implements OnInit, OnDestroy {
  selectedWallets: UserWallet[];
  wallets: UserWallet[];
  stocks: string[];
  private walletBalancesSubscription$: Subscription;

  constructor(private walletService: WalletService, private dashboardService: DashboardService) {
  }

  ngOnInit() {
    this.stocks = [];
    this.selectedWallets = this.dashboardService.selectedWallets$.value;
    this.loadWallets();
  }


  ngOnDestroy(): void {
    this.walletBalancesSubscription$.unsubscribe();
  }

  loadWallets(): void {
    this.walletService.getUserWallets()
    .subscribe((wallets: UserWallet[]) => {
      this.stocks = this.getUniqueStocksFromWallets(wallets);
      this.wallets = this.setSelectedWallets(wallets);
      this.subscribeToBalances();
    });
  }

  private subscribeToBalances(): void {
    this.walletBalancesSubscription$ = this.dashboardService.walletsBalances$.subscribe(walletsBalances => {
      this.wallets = this.setSelectedWallets(walletsBalances);
    }, (error => {
      console.log(error);
    }));
  }

  private setSelectedWallets(wallets: UserWallet[]): UserWallet[] {
    const filteredSelectedWallets = this.selectedWallets.filter
          (value => wallets.find(({id}) => value.id === id));
    this.updateSelectedWallets(filteredSelectedWallets);
    wallets.forEach(wallet => {
      if (filteredSelectedWallets.find(({id}) => wallet.id === id)) {
        wallet.isSelected = true;
      }
    });
    return wallets;
  }

  private updateSelectedWallets(selectedWallets: UserWallet[]): void {
    this.dashboardService.selectedWallets$.next(selectedWallets);
    this.dashboardService.refreshStoredSelectedWallets(Constants.selected_wallets_storage_key,
      selectedWallets);
  }

  toggleWallet(wallet: UserWallet): void {
    if (!this.selectedWallets.find(({id}) => wallet.id === id)) {
      this.selectedWallets.push(wallet);
    } else {
      this.selectedWallets = this.selectedWallets.filter(({id}) => wallet.id !== id);
    }

    this.updateSelectedWallets(this.selectedWallets);
  }

  toggleAllWallets() {
    if (this.selectedWallets.length !== this.wallets.length) {
      this.selectedWallets = this.wallets.map((wallet) => this.selectWallet(wallet));
    } else {
      this.wallets.map((wallet) => this.unSelectWallet(wallet));
      this.selectedWallets = [];
    }
   this.updateSelectedWallets(this.selectedWallets);
  }

  private selectWallet(wallet: UserWallet) {
    wallet.isSelected = true;
    return wallet;
  }

  private unSelectWallet(wallet: UserWallet) {
    wallet.isSelected = false;
    return wallet;
  }

  private getUniqueStocksFromWallets(wallets: UserWallet[]): string[] {
    return wallets.reduce((acc, {exchangePlatform}) => {
      if (!acc.find((stock) => stock.toLowerCase() === exchangePlatform.toLowerCase())) {
        acc.push(exchangePlatform.toLowerCase());
      }
      return acc;
    }, []);
  }

}

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UserWallet} from '@app/shared/model/user-wallet';
import {WalletService} from '@app/core';
import {BalanceMap} from '@app/shared/model/balance';

@Component({
  selector: 'app-wallet-balance',
  templateUrl: './wallet-balance.component.html',
  styleUrls: ['./wallet-balance.component.css']
})
export class WalletBalanceComponent implements OnInit {
  @Input() wallet: UserWallet;
  @Input() stock: string;

  @Output() walletAction: EventEmitter<UserWallet> = new EventEmitter();

  keys: string[];
  balances: BalanceMap;
  balanceRequestIsSuccessful: boolean;

  constructor() {
  }

  ngOnInit() {
  }

  toggleWallet(): void {
    this.wallet.isSelected = !this.wallet.isSelected;
    this.walletAction.emit(this.wallet);
  }

  onMouseEnter(wallet): void {
    if (wallet.balances) {
      this.balanceRequestIsSuccessful = true;
      this.keys = Object.keys(wallet.balances);
      this.balances = wallet.balances;
    } else {
      this.balanceRequestIsSuccessful = false;
    }
  }

  onMouseLeave($event): void {
    this.keys = [];
    this.balances = {};
  }
}

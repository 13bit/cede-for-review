import {OrderPlacingStatus} from '@app/shared/model/order/order-placing-status';
import {Balance} from '@app/shared/model/balance';
import {UserWallet} from '@app/shared/model/user-wallet';

export class OrderWallet {
  id: number;
  name: string;
  exchangePlatform: string;
  selectedCurrencyBalance?: Balance;
  status?: string;
  orderPlacingStatus?: OrderPlacingStatus;


  constructor(id: number, name: string, exchangePlatform: string, selectedCurrencyBalance: Balance) {
    this.id = id;
    this.name = name;
    this.exchangePlatform = exchangePlatform;
    this.selectedCurrencyBalance = selectedCurrencyBalance;
  }

  public static fromUserWallet(wallet: UserWallet, selectedCurrency: string): OrderWallet {
    const order = new OrderWallet(wallet.id, wallet.name, wallet.exchangePlatform,
      wallet.balances != null ? wallet.balances[selectedCurrency] : new Balance(0, 0, 0));
    return order;
  }
}

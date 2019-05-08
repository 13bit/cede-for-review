import {BalanceMap} from '@app/shared/model/balance';

export class UserWallet {
  id: number;
  name: string;
  exchangePlatform: string;
  isSelected?: boolean;
  balances?: BalanceMap;
}

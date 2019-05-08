import {OrderStatus} from '@app/shared/model/order/order-status';
import {OrderWallet} from '@app/shared/model/order/order-wallet';

export interface PlatformOrder {
  id: string;
  wallet: OrderWallet;
  orderStatus: OrderStatus;
  isCancelled: boolean;
  isClosed: boolean;
  amount: number;
  cancelDialog?: boolean;
}

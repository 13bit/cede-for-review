import {Balance} from '@app/shared/model/balance';
import {BasicUser} from '@app/shared/model/basic-user';

export class Wallet {
  id?: number;
  name?: string;
  btc?: number;
  usd?: number;
  publicKey?: string;
  privateKey?: string;
  trader?: BasicUser;
  exchangePlatform?: string;
  traderId?: number;
  balance?: Balance;
  status?: string;
  platformUsername?: string;
}


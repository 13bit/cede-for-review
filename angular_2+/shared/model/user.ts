import {Wallet} from '@app/shared';
import {BasicUser} from '@app/shared/model/basic-user';

export class User extends BasicUser {
  password?: string;
  role?: string;
  lastLogin?: Date;
  wallets?: Wallet[];
}

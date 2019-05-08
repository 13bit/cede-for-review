import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Constants} from '@app/shared/constants';
import {UserWallet} from '@app/shared/model/user-wallet';
import {Wallet, WalletBalanceEstimation} from '@app/shared';

@Injectable()
export class WalletService {
  private readonly REST_SERVICE_URL = Constants.rest_url + 'wallets';

  constructor(private http: HttpClient) {
  }

  findAll(): Observable<Wallet[]> {
    return this.http.get<Wallet[]>(this.REST_SERVICE_URL);
  }

  save(wallet: Wallet): Observable<Wallet[]> {
    return this.http.post<Wallet[]>(this.REST_SERVICE_URL, wallet);
  }

  update(wallet: Wallet): Observable<Wallet[]> {
    return this.http.put<Wallet[]>(this.REST_SERVICE_URL, wallet);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(this.REST_SERVICE_URL,
      {params: new HttpParams().set('id', id.toString())});
  }

  getUserWallets(): Observable<UserWallet[]> {
    return this.http.get<UserWallet[]>(`${this.REST_SERVICE_URL}/user`);
  }

  getUserWalletsBalances(): Observable<UserWallet[]> {
    return this.http.get<UserWallet[]>(`${this.REST_SERVICE_URL}/user/balances`);
  }

  getWalletsEstimation(): Observable<WalletBalanceEstimation[]> {
    return this.http.get<WalletBalanceEstimation[]>(`${this.REST_SERVICE_URL}/estimates`);
  }

  getUnassignedWallets(): Observable<Wallet[]> {
    return this.http.get<Wallet[]>(`${this.REST_SERVICE_URL}/unassigned`);
  }

  getUnassignedWalletsEstimation(): Observable<WalletBalanceEstimation[]> {
    return this.http.get<WalletBalanceEstimation[]>(`${this.REST_SERVICE_URL}/unassigned/estimates`);
  }

}

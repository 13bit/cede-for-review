import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from 'app/shared/model/user';
import {Constants} from 'app/shared/constants';
import {WalletBalanceEstimation} from '@app/shared';
import {BasicUser} from '@app/shared/model/basic-user';

@Injectable()
export class UserService {
  private readonly REST_SERVICE_URL = Constants.rest_url + 'users';

  constructor(private http: HttpClient) {
  }

  findAll(): Observable<User[]> {
    return this.http.get<User[]>(this.REST_SERVICE_URL);
  }

  getUsernames(): Observable<BasicUser[]> {
    return this.http.get<User[]>(this.REST_SERVICE_URL + '/names');
  }

  getEstimates(traderId: number): Observable<WalletBalanceEstimation[]> {
    return this.http.get<WalletBalanceEstimation[]>(this.REST_SERVICE_URL + '/' + traderId + '/wallets/estimates');
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(this.REST_SERVICE_URL, user);
  }

  update(user: User): Observable<User> {
    return this.http.put<User>(this.REST_SERVICE_URL, user);
  }

  delete(user: User): Observable<void> {
    return this.http.delete<void>(this.REST_SERVICE_URL + '/' + user.id);
  }
}

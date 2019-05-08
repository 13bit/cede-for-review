import {Injectable, Injector, OnDestroy} from '@angular/core';
import {BehaviorSubject, Subscription, Subject} from 'rxjs';
import {LastTrade} from '@app/shared/model/last-trade';
import {DataProvider} from '@app/core/data-providers/DataProvider';
import {BinanceDataProvider} from '@app/core/data-providers/binance.data-provider';
import {BitStampDataProvider} from '@app/core/data-providers/bitstamp.data-provider';
import {BittrexDataProvider} from '@app/core/data-providers/bittrex.data-provider';
import {BitfinexDataProvider} from '@app/core/data-providers/bitfinex.data-provider';
import {STOCKS} from '@app/shared/stocks';
import {UserWallet} from '@app/shared/model/user-wallet';
import {CurrencyPairService} from '@app/core/currency-pair.service';
import {Exchanger} from '@app/shared/model/exchanger';
import {CurrencyPair} from '@app/shared/model/order/currency-pair';
import {OrderBookService} from '@app/dashboard/order-book/order-book.service';
import {OrderBook} from '@app/shared/model/order-book';
import {LocalStorageService} from '@app/core/local-storage.service';
import {Constants} from '@app/shared';
import {WalletService} from '@app/core';

@Injectable()
export class DashboardService implements OnDestroy {
  currentExchanger$: BehaviorSubject<Exchanger>;
  defaultStock: string;

  lastTrades$: BehaviorSubject<LastTrade>;
  lastTradesFailed$: BehaviorSubject<boolean>;

  orderBook$: BehaviorSubject<OrderBook>;
  orderBookIsLoaded$: Subject<void>;

  lastTradesSubscription$: Subscription;
  orderBookSubscription$: Subscription;
  exchangerSubscription$: Subscription;

  selectedWallets$: BehaviorSubject<UserWallet[]>;

  walletsBalances$: BehaviorSubject<UserWallet[]>;
  walletBalancesSubscription$: Subscription;
  private refreshBalancesTask: any;

  constructor(private injector: Injector,
              private currencyPairService: CurrencyPairService,
              private orderBookService: OrderBookService,
              private localStorageService: LocalStorageService,
              private walletService: WalletService) {
    this.defaultStock = STOCKS[2];

    this.currentExchanger$ = new BehaviorSubject<Exchanger>(new Exchanger(
      this.defaultStock,
      this.currencyPairService.getDefaultCurrencyPairByStock(this.defaultStock)
    ));

    this.lastTrades$ = new BehaviorSubject<LastTrade>(null);
    this.lastTradesFailed$ = new BehaviorSubject<boolean>(false);
    this.orderBook$ = new BehaviorSubject<OrderBook>({bid: [], ask: []});
    this.orderBookIsLoaded$ = new Subject<void>();

    this.selectedWallets$ = this.localStorageService.get(Constants.selected_wallets_storage_key) === null ?
      new BehaviorSubject<UserWallet[]>([]) :
      new BehaviorSubject<UserWallet[]>(JSON.parse(this.localStorageService.get(Constants.selected_wallets_storage_key)));

    this.exchangerSubscription$ = this.currentExchanger$.subscribe(({stock, currencyPair}) => {
      const dataProvider = this.getDataProvider(stock, currencyPair);

      this.subscribeToLastTrades(dataProvider)
        .then(() => this.subscribeToOrderBook(dataProvider))
        .then(() => this.orderBookIsLoaded$.next());
    });

    this.walletsBalances$ = new BehaviorSubject<UserWallet[]>([]);
    this.walletBalancesSubscription$ = this.walletService.getUserWalletsBalances().subscribe(wallets => {
      this.walletsBalances$.next(wallets);
    });
    this.refreshBalancesTask = setInterval(() => {
      this.walletBalancesSubscription$ = this.walletService.getUserWalletsBalances().subscribe(wallets => {
        this.walletsBalances$.next(wallets);
      });
    }, Constants.balances_refresh_interval);
  }


  refreshStoredSelectedWallets(key: string, wallets: UserWallet[]): void {
    this.localStorageService.refreshData(key, JSON.stringify(wallets));
  }

  ngOnDestroy(): void {
    this.lastTradesSubscription$.unsubscribe();
    this.lastTrades$.unsubscribe();

    this.exchangerSubscription$.unsubscribe();
    this.currentExchanger$.unsubscribe();

    this.orderBookSubscription$.unsubscribe();
    this.orderBook$.unsubscribe();

    this.walletBalancesSubscription$.unsubscribe();
    clearInterval(this.refreshBalancesTask);
  }

  subscribeToLastTrades(dataProvider: DataProvider): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.lastTradesSubscription$) {
        this.lastTrades$.next(null);
        this.lastTradesSubscription$.unsubscribe();
      }

      this.lastTradesSubscription$ = dataProvider.lastTrades$
        .subscribe(
          (lastTrade: LastTrade) => {
            if (lastTrade) {
              this.lastTrades$.next(lastTrade);
              this.lastTradesFailed$.next(false);
              resolve();
            }
          },
          (error) => {
            this.lastTradesFailed$.next(true);
            reject(error);
          }
        );
    });
  }

  subscribeToOrderBook(dataProvider: DataProvider): void {
    if (this.orderBookSubscription$) {
      this.orderBookSubscription$.unsubscribe();
    }

    this.orderBookSubscription$ = this.orderBookService.subscribeToOrderBook(dataProvider, this.lastTrades$)
      .subscribe(({bid, ask}) => this.orderBook$.next({bid, ask}));
  }

  getDataProvider(stock: string, currencyPair: CurrencyPair): DataProvider {
    switch (stock) {
      case 'binance':
        return new BinanceDataProvider(this.injector, currencyPair);
      case 'bitstamp':
        return new BitStampDataProvider(this.injector, currencyPair);
      case 'bittrex':
        return new BittrexDataProvider(this.injector, currencyPair);
      case 'demo_exchange':
        return new BittrexDataProvider(this.injector, currencyPair);
      case 'bitfinex':
        return new BitfinexDataProvider(this.injector, currencyPair);
      default:
        throw new Error(`${stock} is unknown`);
    }
  }

  onChangeExchanger(exchanger: Exchanger): void {
    this.currentExchanger$.next(exchanger);
    this.lastTrades$.next(null);
    this.lastTradesFailed$.next(false);
    this.orderBook$.next({bid: [], ask: []});
    this.orderBookService.exchangerChanged();
  }

}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { PhantomProvider } from 'src/app/interfaces';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  title = 'solana-app';
  provider: PhantomProvider | undefined = undefined;
  walletKey: string = '';
  loading = false;
  subscription!: Subscription;

  private _provider$ = new BehaviorSubject<PhantomProvider | undefined>(
    this.getProvider()
  );

  public readonly provider$ = this._provider$.asObservable();

  constructor() {
    this.subscription = this.provider$.subscribe((value) => {
      this.provider = value;
      this.reconnect();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async reconnect() {
    this.loading = true;
    try {
      const response = await this.provider?.connect({ onlyIfTrusted: true });
      this.walletKey = response ? response.publicKey.toString() : '';
      this.loading = false;
    } catch (err) {}
    this.loading = false;
  }

  private getProvider(): PhantomProvider | undefined {
    if ('solana' in window) {
      const provider = window?.solana;
      if (provider?.isPhantom) return provider as PhantomProvider;
    }
    return undefined;
  }

  async connectWallet() {
    const { solana } = window;
    if (solana) {
      try {
        const response = await solana.connect();
        const publicKey = response.publicKey.toString();
        console.log('wallet account', publicKey);
        this.walletKey = publicKey;
      } catch (err) {
        console.log(err);
      }
    }
  }
}

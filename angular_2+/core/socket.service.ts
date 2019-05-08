import {Observable} from 'rxjs';
import {QueueingSubject} from 'queueing-subject';
import websocketConnect from 'rxjs-websockets';
import {share} from 'rxjs/operators';

export class SocketService {
  private inputStream: QueueingSubject<string>;
  public messages: Observable<string>;

  constructor(url: string) {
    this.inputStream = new QueueingSubject<string>();
    this.connect(url);
  }

  connect(url: string): void {
    this.messages = websocketConnect(url, this.inputStream)
      .messages
      .pipe(share());
  }

  send(message: any): void {
    this.inputStream.next(JSON.stringify(message));
  }

}

import { Injectable } from '@angular/core';
import { WSServerStatus } from "../../shared/config/global-constants";
import {BehaviorSubject, distinctUntilChanged, filter, tap} from 'rxjs';
import {map} from 'rxjs/operators';
import {QueryEventCategory} from '../../../../openapi/dres';
import {VBSServerConnectionService} from './vbsserver-connection.service';
import {ConfigService} from '../../shared/config/services/config.service';


let statusConnected = {'wsstatus':'connected'};

export interface Message {
    source: string;
    content: any;
}

@Injectable({
  providedIn: 'root'
})
export class PythonServerService {

  private socket: WebSocket | undefined;
  private connectedSocketUrl: string | undefined;
  public receivedMessages: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public receivedMetadata = this.receivedMessages.pipe(
    tap((msg: any) => console.log('receivedMetadata', msg)),
    filter((msg: any) => msg && msg.type === "metadata" && msg.results),
    map((msg: any) => msg.results[0]),
  );

  public connectionState: WSServerStatus = WSServerStatus.UNSET;

  constructor(
    private vbsServer: VBSServerConnectionService,
    private configService: ConfigService
  ) {
    this.initializeWebSocket();
    this.configService.config$.pipe(
      map(() => this.configService.getNodeServerURL()),
      distinctUntilChanged(),
      filter((socketUrl) => socketUrl !== this.connectedSocketUrl),
    ).subscribe((socketUrl) => this.reconnectWebSocket(socketUrl));
  }

  private initializeWebSocket(socketUrl = this.configService.getNodeServerURL()): void {
    this.connectedSocketUrl = socketUrl;
    console.log(`will connect to python server: ${socketUrl}`)

    this.socket = new WebSocket(socketUrl);

    console.log(`socket created: ${socketUrl}`)

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.connectionState = WSServerStatus.CONNECTED;
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.receivedMessages.next(message);
      if (message && message.results) {
        this.vbsServer.submitQueryResultLogDirectly('response', message.results.map((result: any, index: number) => {
          return {
            answer: {
              mediaItemName: result.filepath
            },
            rank: index + 1
          };
        }), []);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.connectionState = WSServerStatus.DISCONNECTED;
      this.connectedSocketUrl = undefined;
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  sendMessage(message: any,  source: string = 'appcomponent', logType: string = 'search'): void {
    const content = {
      ...message,
      username: message?.username ?? this.configService.getConfiguration().config_USER
    };
    let request = {
      source: source,
      content
    };
    console.log('server message:', request);
    this.socket?.send(JSON.stringify(request));

    this.vbsServer.submitQueryResultLogDirectly('interaction', [], [
      {
        timestamp: Date.now(),
        category: QueryEventCategory.BROWSING,
        type: logType,
        value: JSON.stringify(content)
      }
    ]);
  }

  private reconnectWebSocket(socketUrl: string): void {
    console.log(`backend URL changed, reconnecting to python server: ${socketUrl}`);

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.close();
    }

    this.connectionState = WSServerStatus.UNSET;
    this.initializeWebSocket(socketUrl);
  }
}

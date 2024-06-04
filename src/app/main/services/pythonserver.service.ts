import { Injectable } from '@angular/core';
import { WSServerStatus,GlobalConstants } from "../../shared/config/global-constants";
import {BehaviorSubject, filter, tap} from 'rxjs';
import {map} from 'rxjs/operators';


const URL = GlobalConstants.nodeServerURL;
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
  public receivedMessages: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public receivedMetadata = this.receivedMessages.pipe(
    tap((msg: any) => console.log('receivedMetadata', msg)),
    filter((msg: any) => msg && msg.type === "metadata" && msg.results),
    map((msg: any) => msg.results[0]),
  );

  public connectionState: WSServerStatus = WSServerStatus.UNSET;

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket(): void {
    const socketUrl = GlobalConstants.nodeServerURL;
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
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.connectionState = WSServerStatus.DISCONNECTED;
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  sendMessage(message: any,  source: string = 'appcomponent'): void {
    let request = {
      source: source,
      content: message
    };
    this.socket?.send(JSON.stringify(request));
  }
}

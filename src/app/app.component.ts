import { ViewChild,ElementRef,Component, AfterViewInit } from '@angular/core';
import { HostListener } from '@angular/core';
import { GlobalConstants, WSServerStatus, WebSocketEvent } from './global-constants';
import { VBSServerConnectionService } from './main/services/vbsserver-connection.service';
import { NodeServerConnectionService } from './main/services/nodeserver-connection.service';
import { ClipServerConnectionService } from './main/services/clipserver-connection.service';
import { Router } from '@angular/router';
import {filter, tap} from 'rxjs';
import {map} from 'rxjs/operators';
import URLUtil from './main/utils/url-util';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent implements AfterViewInit {

  constructor(
    public vbsService: VBSServerConnectionService,
    public nodeService: NodeServerConnectionService,
    public clipService: ClipServerConnectionService,
    private router: Router) {
      this.nodeService.messages.subscribe(msg => {
        if ('wsstatus' in msg) {
          console.log('node-notification: connected');
        } else {
          let result = msg.content;
          console.log("Response from node-server: " + result[0]);
          console.log(result[0]['shots']);
        }
      });
  }


  ngOnInit() {
  }

  ngAfterViewInit(): void {
  }

   /****************************************************************************
   * Queries
   ****************************************************************************/

  sendToNodeServer(msg:any) {
    let message = {
      source: 'appcomponent',
      content: msg
    };
    this.nodeService.messages.next(message);
  }


  /****************************************************************************
   * WebSockets (CLIP and Node.js)
   ****************************************************************************/

  handleNodeMessage(msg:any) {

  }

  connectToVBSServer() {
    this.vbsService.connect();
  }

  disconnectFromVBSServer() {
    this.vbsService.logout(this);
  }

  checkNodeConnection() {
    if (this.nodeService.connectionState !== WSServerStatus.CONNECTED) {
      this.nodeService.connectToServer();
    }
  }

  checkCLIPConnection() {
    if (this.clipService.connectionState !== WSServerStatus.CONNECTED) {
      this.clipService.connectToServer();
    }
  }

  checkVBSServerConnection() {
    if (this.vbsService.vbsServerState == WSServerStatus.UNSET || this.vbsService.vbsServerState == WSServerStatus.DISCONNECTED) {
      this.connectToVBSServer();
    } else if (this.vbsService.vbsServerState == WSServerStatus.CONNECTED) {
      this.disconnectFromVBSServer();
    }
  }

  /****************************************************************************
   * Submission to VBS Server
   ****************************************************************************/

}


import { Component } from '@angular/core';
import { NodeServerConnectionService } from '../../services/nodeserver-connection.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalConstants, WSServerStatus } from '../../../shared/config/global-constants';

export interface EntityInfo {
  name: string;
  count: number;
  examples: Array<string>;
}

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent {

  entity: string = ''
  entities:Array<EntityInfo> = []

  constructor(
    public nodeService: NodeServerConnectionService,
    private route: ActivatedRoute,
    private router: Router) {
  }

  ngOnInit() {
    console.log('info component (qc) initated');

    //read parameters
    this.route.params.subscribe(params => {
      if ('entity' in params) {
        this.entity = params['entity'];
        setTimeout(() => {
          if (this.entity === 'objects') {
            this.performObjectsQuery();
          } else if (this.entity === 'concepts') {
            this.performConceptsQuery();
          } else if (this.entity === 'places') {
            this.performPlacesQuery();
          } else if (this.entity === 'texts') {
            this.performTextsQuery();
          }
        }, 250);
      }
    });

    //already connected?
    if (this.nodeService.connectionState == WSServerStatus.CONNECTED) {
      console.log('qc: node-service already connected');
    } else {
      console.log('qc: node-service not connected yet');
    }

    this.nodeService.messages.subscribe(msg => {

      if ('wsstatus' in msg) {
        console.log('qc: node-notification: connected');
      } else {
        //let result = msg.content;
        console.log("qc: response from node-server: " + msg);

        if ("type" in msg) {
          let m = JSON.parse(JSON.stringify(msg));
          if (m.type === 'objects' || m.type === 'places' || m.type === 'concepts' || m.type === 'texts') {
            this.handleQueryResponseMessage(m);
          }
        } else {
          //this.handleNodeMessage(msg);
          this.handleQueryResponseMessage(msg);
        }
      }
    });

  }

  getBaseURL() {
    return GlobalConstants.keyframeBaseURL;
  }

  getBackLink(entityName: string) {
    const params: any = {};
    params[this.entity] = entityName;
    return ['/query', params];
  }

  handleQueryResponseMessage(qresults:any) {
    console.log(qresults);

    //let keyframeBase = this.getBaseURL();

    for (var e of qresults.results) {
      this.entities.push(e)
    }
  }

  sendToNodeServer(msg:any) {
    let message = {
      source: 'appcomponent',
      content: msg
    };
    this.nodeService.messages.next(message);
  }

  performObjectsQuery() {
    if (this.nodeService.connectionState === WSServerStatus.CONNECTED) {

      console.log('qc: query objects');
      let msg = {
        type: "objects"
      };

      this.sendToNodeServer(msg);

    } else {
      console.log("nodeService not running");
    }
  }

  performConceptsQuery() {
    if (this.nodeService.connectionState === WSServerStatus.CONNECTED) {

      console.log('qc: query concepts');
      let msg = {
        type: "concepts"
      };

      this.sendToNodeServer(msg);

    } else {
      console.log("nodeService not running");
    }
  }

  performPlacesQuery() {
    if (this.nodeService.connectionState === WSServerStatus.CONNECTED) {

      console.log('qc: query places');
      let msg = {
        type: "places"
      };

      this.sendToNodeServer(msg);

    } else {
      console.log("nodeService not running");
    }
  }

  performTextsQuery() {
    if (this.nodeService.connectionState === WSServerStatus.CONNECTED) {

      console.log('qc: query texts');
      let msg = {
        type: "texts"
      };

      this.sendToNodeServer(msg);

    } else {
      console.log("nodeService not running");
    }
  }

}

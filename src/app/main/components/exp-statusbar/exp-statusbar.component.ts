import { Component } from '@angular/core';
import {WSServerStatus} from '../../../shared/config/global-constants';
import {PythonServerService} from '../../services/pythonserver.service';
import {VBSServerConnectionService} from '../../services/vbsserver-connection.service';

@Component({
  selector: 'exp-statusbar',
  templateUrl: './exp-statusbar.component.html',
  styleUrls: ['./exp-statusbar.component.scss']
})
export class ExpStatusbarComponent {

    protected readonly WSServerStatus = WSServerStatus;

    constructor(
      public pythonServerService: PythonServerService,
      public vbsServerConnectionService: VBSServerConnectionService
    ) { }

  changeEvaluation(event: any) {
      console.log("changeEvaluation:", event, event.target.selectedIndex, event.target.value);
      this.vbsServerConnectionService.selectedEvaluation = event.target.value;
  }

  submitTopic(topicInput:any ) {
      const inputVal = topicInput.value;
      this.vbsServerConnectionService.submitText(inputVal);
      // this.vbsServerConnectionService.submitTopic(topicInput);
  }
}

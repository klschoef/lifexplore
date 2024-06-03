import { Component } from '@angular/core';
import {WSServerStatus} from '../../../shared/config/global-constants';
import {PythonServerService} from '../../services/pythonserver.service';
import {VBSServerConnectionService} from '../../services/vbsserver-connection.service';
import {SubmissionLogService} from '../../services/submission-log.service';
import {map} from 'rxjs/operators';
import {filter, switchMap} from 'rxjs';

@Component({
  selector: 'exp-statusbar',
  templateUrl: './exp-statusbar.component.html',
  styleUrls: ['./exp-statusbar.component.scss']
})
export class ExpStatusbarComponent {

    protected readonly WSServerStatus = WSServerStatus;

    submissionLog$ = this.submissionLogService.logOrModeChange$.pipe(
      switchMap(_ => this.submissionLogService.submissionLog$),
      filter(log => !!this.vbsServerConnectionService.selectedEvaluation),
      map(log => log[this.vbsServerConnectionService.selectedEvaluation!]),
      filter(log => log));

    submissionLogSuccessCount$ = this.submissionLog$.pipe(
      map(log => log.filter((entry: any) => entry.success).length)
    );

    submissionLogWrongCount$ = this.submissionLog$.pipe(
      map(log => log.filter((entry: any) => entry.success === false && !entry.indeterminate && !entry.undecidable && !entry.requestError).length)
    );

    submissionLogPendingCount$ = this.submissionLog$.pipe(
      map(log => log.filter((entry: any) => entry.indeterminate || entry.undecidable).length)
    );

  submissionLogRequestFailureCount$ = this.submissionLog$.pipe(
    map(log => log.filter((entry: any) => entry.requestError).length)
  );

    constructor(
      public pythonServerService: PythonServerService,
      public vbsServerConnectionService: VBSServerConnectionService,
      private submissionLogService: SubmissionLogService
    ) { }

  changeEvaluation(event: any) {
      console.log("changeEvaluation:", event, event.target.selectedIndex, event.target.value);
      this.vbsServerConnectionService.selectedEvaluation = event.target.value;
    this.submissionLogService.logOrModeChange$.next(null);
  }

  submitTopic(topicInput:any ) {
      const inputVal = topicInput.value;
      this.vbsServerConnectionService.submitText(inputVal);
      // this.vbsServerConnectionService.submitTopic(topicInput);
  }
}

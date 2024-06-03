import { Pipe, PipeTransform } from '@angular/core';
import {SubmissionLogService} from '../services/submission-log.service';
import {VBSServerConnectionService} from '../services/vbsserver-connection.service';

@Pipe({
  name: 'submissionPending'
})
export class SubmissionPendingPipe implements PipeTransform {

  transform(value: any, filename: string, mode: number): boolean {
    value = this.submissionLogService.submissionLog$.value;
    console.log("submissionPendingPipe transform");
    if (this.vbsServerConnection.selectedEvaluation) {
      const log = value[this.vbsServerConnection.selectedEvaluation];
      if (log && log.some) {
        if (mode == 2) {
          return log.some((entry: any) => entry.image === filename && entry.success === true);
        } else if (mode == 3) {
          return log.some((entry: any) => entry.image === filename && entry.success === false);
        }
        return log.some((entry: any) => entry.image === filename);
      }
    }
    return false
  }

  constructor(
    public submissionLogService: SubmissionLogService,
    public vbsServerConnection: VBSServerConnectionService
  ) {
    console.log("submissionPendingPipe construct");
  }
}

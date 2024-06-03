import {Component, HostListener, Input, OnInit} from '@angular/core';
import {ResultPresenterService} from '../../../../../services/result-presenter.service';
import {map} from 'rxjs/operators';
import {BehaviorSubject, filter} from 'rxjs';
import {ShortcutService} from '../../../../../services/shortcut.service';
import {SubmissionLogService} from '../../../../../services/submission-log.service';

@Component({
  selector: 'app-minimal-result-container',
  templateUrl: './minimal-result-container.component.html',
  styleUrls: ['./minimal-result-container.component.scss']
})
export class MinimalResultContainerComponent implements OnInit {
  @Input() results: any[] = [];
  @Input() localMode = false;
  localResult?: any;
  openNewResultTrigger$ = new BehaviorSubject(undefined);
  selectedResult$ = this.resultPresenterService.currentResultIndex$.pipe(
    map(index => index !== undefined ? this.results[index] : undefined),
  );

  constructor(
    private resultPresenterService: ResultPresenterService,
    public shortcutService: ShortcutService,
    public submissionLogService: SubmissionLogService
  ) {
  }

  ngOnInit() {
    this.submissionLogService.logOrModeChange$.subscribe(() => {
      console.log("logOrModeChange$");
    });
  }

  clickResult(result: any) {
    console.log("result", result);
    this.openNewResultTrigger$.next(result);
    if (this.localMode) {
      this.localResult = result;
      return;
    }
    this.resultPresenterService.currentResultIndex$.next(this.results.indexOf(result));
  }
}

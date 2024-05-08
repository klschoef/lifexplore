import {Component, HostListener, Input} from '@angular/core';
import {ResultPresenterService} from '../../../../../services/result-presenter.service';
import {map} from 'rxjs/operators';
import {filter} from 'rxjs';

@Component({
  selector: 'app-minimal-result-container',
  templateUrl: './minimal-result-container.component.html',
  styleUrls: ['./minimal-result-container.component.scss']
})
export class MinimalResultContainerComponent {
  @Input() results: any[] = [];
  selectedResult$ = this.resultPresenterService.currentResultIndex$.pipe(
    map(index => index !== undefined ? this.results[index] : undefined),
  );

  constructor(
    private resultPresenterService: ResultPresenterService
  ) {
  }

  clickResult(result: any) {
    console.log("result", result);
    this.resultPresenterService.currentResultIndex$.next(this.results.indexOf(result));
  }
}

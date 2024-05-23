import {Component, Input} from '@angular/core';
import {map} from 'rxjs/operators';
import {ResultPresenterService} from '../../../../../services/result-presenter.service';

@Component({
  selector: 'app-default-result-container',
  templateUrl: './default-result-container.component.html',
  styleUrls: ['./default-result-container.component.scss']
})
export class DefaultResultContainerComponent {
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

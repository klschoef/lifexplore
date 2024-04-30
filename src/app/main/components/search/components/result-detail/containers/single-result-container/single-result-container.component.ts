import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-single-result-container',
  templateUrl: './single-result-container.component.html',
  styleUrls: ['./single-result-container.component.scss']
})
export class SingleResultContainerComponent {
  @Input() result: any;
}

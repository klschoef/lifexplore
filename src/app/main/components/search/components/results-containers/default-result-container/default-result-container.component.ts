import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-default-result-container',
  templateUrl: './default-result-container.component.html',
  styleUrls: ['./default-result-container.component.scss']
})
export class DefaultResultContainerComponent {
  @Input() results: any[] = [];
}

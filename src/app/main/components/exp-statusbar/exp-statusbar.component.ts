import { Component } from '@angular/core';
import {WSServerStatus} from '../../../global-constants';
import {PythonServerService} from '../../services/pythonserver.service';

@Component({
  selector: 'exp-statusbar',
  templateUrl: './exp-statusbar.component.html',
  styleUrls: ['./exp-statusbar.component.scss']
})
export class ExpStatusbarComponent {

    protected readonly WSServerStatus = WSServerStatus;

    constructor(
      public pythonServerService: PythonServerService,
    ) { }
}

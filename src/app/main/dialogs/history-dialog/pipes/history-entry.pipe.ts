import { Pipe, PipeTransform } from '@angular/core';
import {HistoryEntryToText} from '../../../utils/transformers/history-entry-to-text';

@Pipe({
  name: 'historyEntry'
})
export class HistoryEntryPipe implements PipeTransform {

  transform(value: any): string {
    return HistoryEntryToText.transform(value);
  }

}

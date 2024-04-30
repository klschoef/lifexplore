import { Pipe, PipeTransform } from '@angular/core';
import URLUtil from '../utils/url-util';

@Pipe({
  name: 'expImageUrl'
})
export class ExpImageUrlPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    return URLUtil.getKeyframeBaseUrl()+value;
  }

}

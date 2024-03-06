import {GlobalConstants} from '../../global-constants';

export default class URLUtil {
  static removeBaseURL(val:string):string {
    if (val.startsWith(GlobalConstants.keyframeBaseURL)) {
      val = val.substring(GlobalConstants.keyframeBaseURL.length);
    }
    return val;
  }

  getBaseURL() {
    return GlobalConstants.keyframeBaseURL;
  }
}

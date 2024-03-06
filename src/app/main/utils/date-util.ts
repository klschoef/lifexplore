export default class DateUtil {
  static filenameToDate(fn:string):string {
    let yyyy = fn.substring(0,4);
    let MM = fn.substring(4,6);
    let dd = fn.substring(6,8);
    let hh = fn.substring(9,11);
    let mm = fn.substring(11,13);
    let ss = fn.substring(13,15);

    return dd + '.' + MM + '.' + yyyy + ' ' + hh + ':' + mm + ':' + ss;
  }
}

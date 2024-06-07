import {RangeValueUtil} from '../range-value-util';

export class HistoryEntryToText {
  static transformSubqueries(obj: any): string {
    if (obj.subqueries && Object.keys(obj.subqueries).length > 0) {
      return Object.keys(obj.subqueries).map((key: any) => {
        let subquery = obj.subqueries[key];
        let query = subquery.query ?? subquery;
        if (subquery.min || subquery.max) {
          query = RangeValueUtil.stringifyRangeValues({min: subquery.min, max: subquery.max});
        }
        return `|${key}:${query}`;
      }).join("");
    }
    return ""
  }

  static isGraphical(value: any): boolean {
    return value.query_dicts && value.query_dicts.length > 0;
  }

  static transform(value: any): string {
    console.log("value", value);
    let query = value.query;

    if (HistoryEntryToText.isGraphical(value)) {
      query = value.query_dicts.map((dict: any) => {
        let result = "";
        if (dict.clip && dict.clip.query) {
          result += ` ${dict.clip.query+HistoryEntryToText.transformSubqueries(dict.clip)}`;
        }
        if (dict.objects && dict.objects.length > 0) {
          result += ` /o ${dict.objects.map((obj: any) => obj.query+HistoryEntryToText.transformSubqueries(obj)).join(" ")}`;
        }
        if (dict.concepts && dict.concepts.length > 0) {
          result += ` /c ${dict.concepts.map((obj: any) => obj.query+HistoryEntryToText.transformSubqueries(obj)).join(" ")}`;
        }
        if (dict.locations && dict.locations.length > 0) {
          result += ` /l ${dict.locations.map((obj: any) => obj.query+HistoryEntryToText.transformSubqueries(obj)).join(" ")}`;
        }
        if (dict.places && dict.places.length > 0) {
          result += ` /p ${dict.places.map((obj: any) => obj.query+HistoryEntryToText.transformSubqueries(obj)).join(" ")}`;
        }
        if (dict.texts && dict.texts.length > 0) {
          result += ` /t ${dict.texts.map((obj: any) => obj.query+HistoryEntryToText.transformSubqueries(obj)).join(" ")}`;
        }
        if (dict.heart_rate && (dict.heart_rate.min || dict.heart_rate.max)) {
          result += ` /h ${dict.heart_rate.min || ""}:${dict.heart_rate.max || ""}`+HistoryEntryToText.transformSubqueries(dict.heart_rate);
        }
        if (dict.hour && (dict.hour.min || dict.hour.max)) {
          result += ` /hr ${dict.hour.min || ""}:${dict.hour.max || ""}`+HistoryEntryToText.transformSubqueries(dict.hour);
        }
        if (dict.filename) {
          result += ` /fn ${dict.filename}`;
        }
        if (dict.year) {
          result += ` /y ${dict.year.min || ""}:${dict.year.max || ""}`+HistoryEntryToText.transformSubqueries(dict.year);
        }
        if (dict.month) {
          result += ` /m ${dict.month.min || ""}:${dict.month.max || ""}`+HistoryEntryToText.transformSubqueries(dict.month);
        }
        if (dict.day) {
          result += ` /d ${dict.day.min || ""}:${dict.day.max || ""}`+HistoryEntryToText.transformSubqueries(dict.day);
        }
        if (dict.weekday) {
          result += ` /wd ${dict.weekday}`;
        }
        if (dict.address) {
          result += ` /a ${dict.address}`;
        }
        if (dict.country) {
          result += ` /co ${dict.country}`;
        }
        if (dict.gptr) {
          result += ` /gptr ${dict.gptr}`;
        }
        if (dict.gptra) {
          result += ` /gptra ${dict.gptra}`;
        }
        if (dict.gpt) {
          result += ` /gpt ${dict.gpt}`;
        }
        return result;
      }).join(" < ");

      return `${query}`;
    }

    return `${query}`;
  }
}

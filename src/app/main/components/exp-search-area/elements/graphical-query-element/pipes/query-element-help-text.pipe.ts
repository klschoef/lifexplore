import { Pipe, PipeTransform } from '@angular/core';
import {QueryPartInputProperties} from '../../query-part-presenter-element/query-part-presenter-element.component';
import {QueryPartType} from '../../../models/query-part';

@Pipe({
  name: 'queryElementHelpText'
})
export class QueryElementHelpTextPipe implements PipeTransform {

  transform(value: string): QueryPartInputProperties {
    console.log("helpTextvalue", value);
    switch (value) {
      case QueryPartType.clip:
        return {
          helpText: 'Text Search',
          placeholder: 'I saw a golden buddha ...'
        };
      case QueryPartType.month:
        return {
          helpText: 'Month (1-12)',
          placeholder: '1',
          type: 'number',
          min: 1,
          max: 12,
        };
      case QueryPartType.day:
        return {
          helpText: 'Day (1-31)',
          placeholder: '1',
          type: 'number',
          min: 1,
          max: 31,
        };
      case QueryPartType.weekday:
        return {
          helpText: 'Weekday (lower cased names)',
          placeholder: 'tuesday',
          type: 'text'
        };
      case QueryPartType.heart_rate:
        return {
          helpText: '60+ means 60 or more, 60-5 means 60 or less, 60+-5 means 60 plus or minus 5',
          placeholder: '60,60+,60+10,60+-5',
          type: 'text'
        };
      case QueryPartType.texts:
        return {
          helpText: 'appearing texts in image',
          placeholder: 'coffee, tea, ...'
        };
      case QueryPartType.objects:
        return {
          helpText: 'objects in image',
          placeholder: 'person, car, ...'
        };
      case QueryPartType.concepts:
        return {
          helpText: 'concepts in image',
          placeholder: 'shoe_shop, ...'
        };
      case QueryPartType.places:
        return {
          helpText: 'places in image',
          placeholder: 'office, ...'
        };
      case QueryPartType.location:
        return {
          helpText: 'detected locations in image',
          placeholder: 'office, ...'
        };
      case QueryPartType.filename:
        return {
          helpText: 'filename (without path)',
          placeholder: '20190529_190724_000.jpg'
        };
      case QueryPartType.year:
        return {
          helpText: 'Year (4 digits)',
          placeholder: '2019',
          type: 'number',
          min: 0,
          max: 9999,
        };
      case QueryPartType.city:
        return {
          helpText: 'City',
          placeholder: 'New York',
          type: 'text'
        };
      case QueryPartType.country:
        return {
          helpText: 'Country',
          placeholder: 'USA',
          type: 'text'
        };
      case QueryPartType.continent:
        return {
          helpText: 'Continent',
          placeholder: 'North America',
          type: 'text'
        };
      case QueryPartType.address:
        return {
          helpText: 'Any information of an address (Regex)',
          placeholder: 'Dublin, Grafton Street 1, 12345, Ireland ...',
          type: 'text'
        };
      case QueryPartType.gptr:
        return {
          helpText: 'GPT Description Regex',
          placeholder: 'yellow hat',
          type: 'text'
        };
      case QueryPartType.gptra:
        return {
          helpText: 'GPT Description Regex (AND) seperated with ,',
          placeholder: 'yellow,hat,person,water',
          type: 'text'
        };
      case QueryPartType.gpt:
        return {
          helpText: 'GPT Description',
          placeholder: 'a yellow hat on a person ...',
          type: 'text'
        };
    }
    return {};
  }

}

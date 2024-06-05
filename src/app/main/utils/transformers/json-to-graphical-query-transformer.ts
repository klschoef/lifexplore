import { GraphicalContentPart } from '../../models/graphical-content-part';
import {QueryPart, QueryPartType, Subquery, SubqueryType} from '../../components/exp-search-area/models/query-part';
import ObjectQuery, { ObjectQueryPart, ObjectQuerySubquery } from '../../models/object-query';
import { RangeValueUtil } from '../range-value-util';

export default class JsonToGraphicalQueryTransformer {

  static transformJsonArrayToGraphical(graphicalContent: ObjectQuery[]): GraphicalContentPart[] {
    if (graphicalContent.length > 0) {
      return graphicalContent.map((objectQuery) => {
        return JsonToGraphicalQueryTransformer.transformObjectQueryToGraphicalContentPart(objectQuery);
      });
    }
    return [];
  }

  static getSubqueries(item: ObjectQueryPart): Subquery[] {
    if (item && item.subqueries && Object.keys(item.subqueries).length > 0) {
      return Object.keys(item.subqueries).map((subqueryKey) => {
        const sub: any = item.subqueries[subqueryKey];
        const rval: Subquery = {
          query_type: (SubqueryType as any)[subqueryKey],
          query: (sub.min || sub.max) ? RangeValueUtil.stringifyRangeValues(sub): (sub.query ?? sub),
          min: sub.min,
          max: sub.max
        }
        return rval;
      });
    }
    return [];
  }

  static transformObjectQueryToGraphicalContentPart(queryObject: ObjectQuery): GraphicalContentPart {
    const graphicalContentPart: GraphicalContentPart = {
      queryParts: []
    };

    Object.keys(queryObject).forEach(key => {
      const value = (queryObject as any)[key];
      switch (key) {
        case 'objects':
        case 'texts':
        case 'concepts':
        case 'places':
        case 'locations':
          value.forEach((item: ObjectQueryPart) => {
            const queryType = (QueryPartType as any)[key];
            const queryPart: QueryPart = {
              query_type: queryType,
              query: item.query,
              subqueries: JsonToGraphicalQueryTransformer.getSubqueries(item)
            };

            graphicalContentPart.queryParts.push(queryPart);
          });
          break;
        case 'clip':
          const clipQueryPart: QueryPart = {
            query_type: QueryPartType.clip,
            query: value?.query,
            subqueries: JsonToGraphicalQueryTransformer.getSubqueries(value)
          };
          graphicalContentPart.queryParts.push(clipQueryPart);
          break;
        case 'filename':
          const filenameQueryPart: QueryPart = {
            query_type: QueryPartType.filename,
            query: value,
            subqueries: []
          };
          graphicalContentPart.queryParts.push(filenameQueryPart);
          break;
        case 'year':
        case 'month':
        case 'day':
        case 'address':
        case 'city':
        case 'country':
        case 'gptr':
        case 'gptra':
        case 'gpt':
        case 'weekday':
          const temporalQueryPart: QueryPart = {
            query_type: QueryPartType[key],
            query: value,
            subqueries: []
          };
          graphicalContentPart.queryParts.push(temporalQueryPart);
          break;
        case 'heart_rate':
          const heartRateQueryPart: QueryPart = {
            query_type: QueryPartType.heart_rate,
            query: RangeValueUtil.stringifyRangeValues(value),
            subqueries: []
          };
          graphicalContentPart.queryParts.push(heartRateQueryPart);
          break;
        case 'hour':
          const hourQueryPart: QueryPart = {
            query_type: QueryPartType.hour,
            query: RangeValueUtil.stringifyRangeValues(value),
            subqueries: []
          };
          graphicalContentPart.queryParts.push(hourQueryPart);
          break;
      }
    });

    return graphicalContentPart;
  }
}

import {GraphicalContentPart} from '../../models/graphical-content-part';
import {QueryPart, QueryPartType} from '../../components/exp-search-area/models/query-part';
import ObjectQuery, {ObjectQueryPart, ObjectQuerySubquery} from '../../models/object-query';
import {RangeValueUtil} from '../range-value-util';


export default class GraphicalToJsonQueryTransformer {

  static transformGraphicalArrayToJson(graphicalContent: GraphicalContentPart[]): ObjectQuery[] {
    if (graphicalContent.length > 0) {
      return graphicalContent.map((graphicalContentPart) => {
        return GraphicalToJsonQueryTransformer.transformGraphicalContentPartToJson(graphicalContentPart);
      });
    }
    return []
  }

  static transformGraphicalContentPartToJson(graphicalContentPart: GraphicalContentPart): ObjectQuery {
    const queryObject: ObjectQuery = {
      objects: [],
      texts: [],
      concepts: [],
      places: [],
      locations: [] // TODO: replace with cityname and countryname
    }


    graphicalContentPart.queryParts.map((queryPart) => {
      const objectQueryPart = GraphicalToJsonQueryTransformer.queryPartToObjectQueryPart(queryPart);
      switch (queryPart.query_type) {
        case QueryPartType.objects:
          if (objectQueryPart) {
            queryObject.objects.push(objectQueryPart);
          }
          break;
        case QueryPartType.texts:
          if (objectQueryPart) {
            queryObject.texts.push(objectQueryPart);
          }
          break;
        case QueryPartType.concepts:
          if (objectQueryPart) {
            queryObject.concepts.push(objectQueryPart);
          }
          break;
        case QueryPartType.places:
          if (objectQueryPart) {
            queryObject.places.push(objectQueryPart);
          }
          break;
        case QueryPartType.location: // TODO: cityname and countryname instead of location
          if (objectQueryPart) {
            queryObject.locations.push(objectQueryPart);
          }
          break;
        case QueryPartType.clip:
          queryObject.clip = GraphicalToJsonQueryTransformer.queryPartToObjectQueryPart(queryPart, false);
          break;
        case QueryPartType.filename:
          queryObject.filename = queryPart.query ?? "";
          break;
        case QueryPartType.year:
          queryObject.year = queryPart.query ?? "";
          break;
        case QueryPartType.month:
          queryObject.month = queryPart.query ?? "";
          break;
        case QueryPartType.day:
          queryObject.day = queryPart.query ?? "";
          break;
        case QueryPartType.weekday:
          queryObject.weekday = queryPart.query ?? "";
          break;
        case QueryPartType.address:
          queryObject.address = queryPart.query ?? "";
          break;
        case QueryPartType.country:
          queryObject.country = queryPart.query ?? "";
          break;
        case QueryPartType.gptr:
          queryObject.gptr = queryPart.query ?? "";
          break;
        case QueryPartType.gptra:
          queryObject.gptra = queryPart.query ?? "";
          break;
        case QueryPartType.gpt:
          queryObject.gpt = queryPart.query ?? "";
          break;
        case QueryPartType.heart_rate:
          // TODO: add graphical interface for heart rate
          if (queryPart.query) {
            queryObject.heart_rate = RangeValueUtil.parseRangeValues(queryPart.query)
          }
          break;
        case QueryPartType.hour:
          // TODO: add graphical interface for hour
          if (queryPart.query) {
            queryObject.hour = RangeValueUtil.parseRangeValues(queryPart.query)
          }
          break;
      }
    });

    return queryObject;
  }

  static queryPartToObjectQueryPart(queryPart: QueryPart, allowEmptyQuery: boolean = false): ObjectQueryPart | undefined {
    if (!queryPart.query && !allowEmptyQuery) {
      return undefined;
    }

    let subqueries: {[key: string]: string | ObjectQuerySubquery} = {};

    queryPart.subqueries?.forEach((subquery) => {
      switch (subquery.query_type) {
        case "variants":
          subqueries["variants"] = subquery.query ?? "";
          break;
        case "score":
          const min_max = RangeValueUtil.parseRangeValues(subquery.query ?? "")
          subqueries["score"] = {
            min: min_max?.min,
            max: min_max?.max
          };
          break;
        case "position":
          subqueries["position"] = subquery.query ?? "";
          break;
      }
    });

    return {
      query: queryPart.query ?? "",
      subqueries
    }
  }
}

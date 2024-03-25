import {GraphicalContentPart} from '../../models/graphical-content-part';
import {QueryPart, QueryPartType} from '../../components/exp-search-area/models/query-part';
import ObjectQuery, {ObjectQueryPart} from '../../models/object-query';


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
      locations: []
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
        case QueryPartType.location:
          if (objectQueryPart) {
            queryObject.locations.push(objectQueryPart);
          }
          break;
        case QueryPartType.clip:
          queryObject.clip = queryPart.query ?? "";
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
        case QueryPartType.heart_rate:
          // TODO: add heart_rate min and max
          break;
      }
    });

    return queryObject;
  }

  static queryPartToObjectQueryPart(queryPart: QueryPart, allowEmptyQuery: boolean = false): ObjectQueryPart | null {
    if (!queryPart.query && !allowEmptyQuery) {
      return null;
    }

    return {
      query: queryPart.query ?? "",
      subqueries: {} // TODO: add subqueries
    }
  }
}

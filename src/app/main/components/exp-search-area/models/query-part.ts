export enum SubqueryType {
  score = "score",
  position = "position"
}

export interface Subquery {
  query_type: SubqueryType;
  query?: string;
  min?: number;
  max?: number;
}

export enum QueryPartType {
  objects = "objects",
  texts = "texts",
}

export interface QueryPart {
  query_type: QueryPartType;
  query?: string;
  subqueries?: Subquery[];
}

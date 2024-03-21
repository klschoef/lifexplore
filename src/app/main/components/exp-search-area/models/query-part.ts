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
  objects = "Objects",
  texts = "Texts",
}

export interface QueryPart {
  query_type: QueryPartType;
  query?: string;
  subqueries?: Subquery[];
}

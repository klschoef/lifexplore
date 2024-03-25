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
  concepts = "Concepts",
  places = "Places",
  location = "Locations",
  clip = "Clip",
  filename = "Filename",
  year = "Year",
  month = "Month",
  day = "Day",
  weekday = "Weekday",
  heart_rate = "Heart Rate"
}

export interface QueryPart {
  query_type: QueryPartType;
  query?: string;
  subqueries?: Subquery[];
}

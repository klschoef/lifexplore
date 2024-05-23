export enum SubqueryType {
  score = "score",
  position = "position",
  variants = "variants"
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
  clip = "CLIP",
  filename = "Filename",
  year = "Year",
  month = "Month",
  day = "Day",
  weekday = "Weekday",
  heart_rate = "Heart Rate",
  city = "City",
  country = "Country",
  continent = "Continent",
  address = "Address",
  gptr = "GPT Reg.",
  gptra = "GPT Reg. And",
  gpt = "GPT"
}

export enum QueryPartOperator {
  plus = "+",
  minus = "-",
  equal = "=",
}

export interface QueryPart {
  queryOperator?: QueryPartOperator;
  query_type: QueryPartType;
  query?: string;
  subqueries?: Subquery[];
}

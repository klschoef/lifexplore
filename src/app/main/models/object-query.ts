export interface ObjectQuerySubquery {
  min?: number,
  max?: number,
  value?: string
}

export interface ObjectQueryPart {
  query: string,
  subqueries: {[key: string]: ObjectQuerySubquery | string}
}

export default interface ObjectQuery {
  objects: ObjectQueryPart[],
  texts: ObjectQueryPart[],
  concepts: ObjectQueryPart[],
  places: ObjectQueryPart[],
  locations: ObjectQueryPart[],
  clip?: ObjectQueryPart,
  filename?: string,
  year?: string,
  month?: string,
  day?: string,
  weekday?: string,
  heart_rate?: {
    min?: number,
    max?: number
  }
}

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
  year?: {
    min?: number,
    max?: number
  },
  month?: {
    min?: number,
    max?: number
  },
  day?: {
    min?: number,
    max?: number
  },
  weekday?: string,
  heart_rate?: {
    min?: number,
    max?: number
  },
  hour?: {
    min?: number,
    max?: number
  },
  address?: string,
  country?: string,
  gptr?: string,
  gptra?: string,
  gpt?: string,
}

export interface Post {
  ID: number
  TITLE: string
  ASSIGNED_BY_ID: string | number
  DATE_CREATE: string
  CREATED_BY_ID: string | number
  CATEGORY_ID: string
  CURRENCY_ID: string
  OPPORTUNITY: string
  CLOSEDATE: string
  STAGE_SEMANTIC_ID: string
  STAGE_ID: string
  SOURCE_ID: string
  UTM_SOURCE: string
  LEAD_ID: string

  [key: string]: string | number
}

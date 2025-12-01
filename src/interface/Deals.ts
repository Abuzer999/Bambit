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

export interface User {
  ID: number
  NAME: string
  LAST_NAME: string
}

export interface ColumnConfig {
  key: SortKey
  label: string
  width: string
}

export interface FieldInfo {
  type: string
  title: string
}

export type DealStatusItem = {
  ENTITY_ID: string
  STATUS_ID: string
  NAME: string
}

export type SortOrder = 'asc' | 'desc'

export type SortKey =
  | 'ID'
  | 'TITLE'
  | 'STAGE_SEMANTIC_ID'
  | 'STAGE_ID'
  | 'ASSIGNED_BY_ID'
  | 'DATE_CREATE'
  | 'CREATED_BY_ID'
  | 'CREATED_BY_ID'
  | 'CATEGORY_ID'
  | 'CURRENCY_ID'
  | 'OPPORTUNITY'
  | 'CLOSEDATE'
  | 'SOURCE_ID'
  | 'UTM_SOURCE'
  | 'LEAD_ID'

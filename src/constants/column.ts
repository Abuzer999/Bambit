import type { SortKey } from '../interface/SortKey'

export interface ColumnConfig {
  key: SortKey
  label: string
  width: string
}

export const createColumnsConfig = (info: Record<string, { title?: string }>): ColumnConfig[] => [
  { key: 'ID', label: info['ID']?.title ?? 'ID', width: '60px' },
  { key: 'TITLE', label: info['TITLE']?.title ?? 'TITLE', width: '200px' },
  {
    key: 'STAGE_SEMANTIC_ID',
    label: info['STAGE_SEMANTIC_ID']?.title ?? 'STAGE_SEMANTIC_ID',
    width: '150px',
  },
  { key: 'STAGE_ID', label: info['STAGE_ID']?.title ?? 'STAGE_ID', width: '150px' },
  {
    key: 'ASSIGNED_BY_ID',
    label: info['ASSIGNED_BY_ID']?.title ?? 'ASSIGNED_BY_ID',
    width: '150px',
  },
  { key: 'DATE_CREATE', label: info['DATE_CREATE']?.title ?? 'DATE_CREATE', width: '150px' },
  { key: 'CREATED_BY_ID', label: info['CREATED_BY_ID']?.title ?? 'CREATED_BY_ID', width: '140px' },
  { key: 'CATEGORY_ID', label: info['CATEGORY_ID']?.title ?? 'CATEGORY_ID', width: '100px' },
  { key: 'CURRENCY_ID', label: info['CURRENCY_ID']?.title ?? 'CURRENCY_ID', width: '90px' },
  { key: 'OPPORTUNITY', label: info['OPPORTUNITY']?.title ?? 'OPPORTUNITY', width: '100px' },
  { key: 'CLOSEDATE', label: info['CLOSEDATE']?.title ?? 'CLOSEDATE', width: '170px' },
  { key: 'SOURCE_ID', label: info['SOURCE_ID']?.title ?? 'SOURCE_ID', width: '100px' },
  { key: 'UTM_SOURCE', label: info['UTM_SOURCE']?.title ?? 'UTM_SOURCE', width: '180px' },
  { key: 'LEAD_ID', label: info['LEAD_ID']?.title ?? 'LEAD_ID', width: '70px' },
]

import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import type { User, Post, SortKey, FieldInfo, DealStatusItem, SortOrder } from '../interface/Deals'

export const usePostsStore = defineStore('posts', () => {
  const allPosts = ref<Post[]>([])
  const posts = ref<Post[]>([])
  const users = ref<User[]>([])
  const info = ref<Record<string, FieldInfo>>({})
  const loading = ref(false)
  const start = ref(0)
  const limit = 30

  const dealStatusesRef = ref<DealStatusItem[]>([])
  const stageMapRef = ref<Record<string, string>>({})
  const sourceMapRef = ref<Record<string, string>>({})
  const usersObj = ref<Record<number, { fullName: string }>>({})
  const filterIdFrom = ref<number>(2)
  const filterIdTo = ref<number>(23560)
  const sortKey = ref<SortKey>('ID')
  const sortOrder = ref<SortOrder>('asc')
  const isSorting = ref(false)

  const fetchUsers = async (): Promise<User[]> => {
    const res = await axios.get(
      'https://dveri-bambit.bitrix24.ru/rest/254/v2piz26ia0p3jner/user.get.json',
    )
    const usersData: User[] = res.data.result
    users.value = usersData
    usersObj.value = prepareUsersMap(usersData)
    return usersData
  }

  const fetchDealFields = async (): Promise<Record<string, FieldInfo>> => {
    const res = await axios.get(
      'https://dveri-bambit.bitrix24.ru/rest/254/rwqlpaqzd9vh1a1s/crm.deal.fields.json',
    )
    const fields: Record<string, FieldInfo> = res.data.result
    info.value = { ...fields }
    return fields
  }

  const fetchDealStatuses = async (): Promise<DealStatusItem[]> => {
    const res = await axios.get(
      'https://dveri-bambit.bitrix24.ru/rest/254/qefzrc7xpwl0av5v/crm.status.list.json',
    )
    const statuses: DealStatusItem[] = res.data.result
    dealStatusesRef.value = statuses
    stageMapRef.value = createStageMap(statuses)
    sourceMapRef.value = createSourceMap(statuses)
    return statuses
  }

  const fetchDeals = async (filterIdFrom?: number, filterIdTo?: number): Promise<Post[]> => {
    const filter: Record<string, number> = {}
    if (typeof filterIdFrom === 'number' && !Number.isNaN(filterIdFrom)){
      filter['>=ID'] = filterIdFrom
    }
    if (typeof filterIdTo === 'number' && !Number.isNaN(filterIdTo)) {
      filter['<=ID'] = filterIdTo
    }

    const data = {
      filter,
      select: [
        'ID',
        'TITLE',
        'STAGE_SEMANTIC_ID',
        'STAGE_ID',
        'ASSIGNED_BY_ID',
        'DATE_CREATE',
        'CREATED_BY_ID',
        'CATEGORY_ID',
        'CURRENCY_ID',
        'OPPORTUNITY',
        'CLOSEDATE',
        'SOURCE_ID',
        'UTM_SOURCE',
        'LEAD_ID',
      ],
    }

    const res = await axios.post(
      'https://dveri-bambit.bitrix24.ru/rest/254/lssx884kjza7kygu/crm.deal.list.json',
      data,
    )
    const deals: Post[] = res.data.result || []
    const formatted = formatDeals(deals, usersObj.value, stageMapRef.value, sourceMapRef.value)

    allPosts.value = formatted
    posts.value = formatted.slice(0, limit)
    start.value = limit

    return formatted
  }

  //словари
  const createStageMap = (statuses: DealStatusItem[]): Record<string, string> =>
    Object.fromEntries(
      statuses.filter((s) => s.ENTITY_ID === 'DEAL_STAGE').map((s) => [s.STATUS_ID, s.NAME]),
    )

  const createSourceMap = (statuses: DealStatusItem[]): Record<string, string> =>
    Object.fromEntries(
      statuses.filter((s) => s.ENTITY_ID === 'SOURCE').map((s) => [s.STATUS_ID, s.NAME]),
    )

  const prepareUsersMap = (usersArray: User[]): Record<number, { fullName: string }> =>
    Object.fromEntries(usersArray.map((u) => [u.ID, { fullName: `${u.NAME} ${u.LAST_NAME}` }]))

  const formatDeals = (
    deals: Post[],
    usersMap: Record<number, { fullName: string }>,
    stageMap: Record<string, string>,
    sourceMap: Record<string, string>,
  ) =>
    deals.map((deal) => ({
      ...deal,
      STAGE_ID: stageMap[deal.STAGE_ID] ?? '',
      SOURCE_ID: sourceMap[deal.SOURCE_ID] ?? '',
      ASSIGNED_BY_ID: usersMap[Number(deal.ASSIGNED_BY_ID)]?.fullName ?? '',
      CREATED_BY_ID: usersMap[Number(deal.CREATED_BY_ID)]?.fullName ?? '',
      DATE_CREATE: deal.DATE_CREATE ? new Date(deal.DATE_CREATE).toLocaleDateString('ru-RU') : '',
      CLOSEDATE: deal.CLOSEDATE ? new Date(deal.CLOSEDATE).toLocaleDateString('ru-RU') : '',
    }))

  const loadApi = async () => {
    if (loading.value) return
    loading.value = true

    try {
      await Promise.allSettled([
        fetchUsers(),
        fetchDealStatuses(),
        fetchDealFields(),
        fetchDeals(filterIdFrom.value, filterIdTo.value),
      ])
    } catch (error) {
      console.error(error)
      alert('Произошла ошибка при загрузке данных.')
    } finally {
      loading.value = false
    }
  }

  const loadMorePosts = () => {
    if (start.value >= allPosts.value.length) return
    const nextPosts = allPosts.value.slice(start.value, start.value + limit)
    posts.value = [...posts.value, ...nextPosts]
    start.value += limit
  }

  const normalizeValue = (value: unknown, key: SortKey) => {
    const fieldInfo = info.value[key]
    if (!fieldInfo || value == null || value === '') return ''

    switch (fieldInfo.type) {
      case 'integer':
      case 'double':
      case 'number':
        return Number(value)
      case 'date':
      case 'datetime':
        if (typeof value === 'string') {
          const [day, month, year] = value.split('.')
          return new Date(`${year}-${month}-${day}`).getTime()
        }
        return new Date(value as string).getTime()
      case 'boolean':
        return value ? 1 : 0
      case 'string':
      default:
        return String(value).toLowerCase()
    }
  }

  const sortAllPosts = () => {
    allPosts.value.sort((a, b) => {
      const valA = normalizeValue(a[sortKey.value], sortKey.value)
      const valB = normalizeValue(b[sortKey.value], sortKey.value)
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  const searchById = async () => {
    if (loading.value) return
    loading.value = true
    try {
      await fetchDeals(filterIdFrom.value, filterIdTo.value)
    } catch (error) {
      console.error(error)
      alert('Ошибка при поиске по ID.')
    } finally {
      loading.value = false
    }
  }

  const sortPosts = (key: SortKey) => {
    isSorting.value = true
    if (sortKey.value === key) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    else {
      sortKey.value = key
      sortOrder.value = 'desc'
    }

    sortAllPosts()
    posts.value = allPosts.value.slice(0, limit)
    start.value = limit
    isSorting.value = false
  }

  return {
    allPosts,
    posts,
    users,
    info,
    loading,
    isSorting,
    start,
    limit,
    filterIdFrom,
    filterIdTo,
    sortKey,
    sortOrder,
    loadApi,
    loadMorePosts,
    searchById,
    sortPosts,
  }
})

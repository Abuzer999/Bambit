import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import type { User } from '../interface/User'
import type { Post } from '../interface/Post'
import type { SortKey } from '../interface/SortKey'

type SortOrder = 'asc' | 'desc'

interface FieldInfo {
  type: string
  title: string
}

type DealStatusItem = {
  ENTITY_ID: string
  STATUS_ID: string
  NAME: string
}

export const usePostsStore = defineStore('posts', () => {
  const allPosts = ref<Post[]>([])
  const posts = ref<Post[]>([])
  const users = ref<User[]>([])
  const info = ref<Record<string, FieldInfo>>({})
  const loading = ref(false)
  const start = ref(0)
  const limit = 30

  const usersObj = ref<Record<number, { fullName: string }>>({})
  const filterIdFrom = ref<number>(2)
  const filterIdTo = ref<number>(23560)
  const sortKey = ref<SortKey>('ID')
  const sortOrder = ref<SortOrder>('asc')
  const isSorting = ref(false)

  //api
  const fetchUsers = () =>
    axios
      .get('https://dveri-bambit.bitrix24.ru/rest/254/v2piz26ia0p3jner/user.get.json')
      .then((res) => res.data.result)

  const fetchDealFields = () =>
    axios
      .get('https://dveri-bambit.bitrix24.ru/rest/254/rwqlpaqzd9vh1a1s/crm.deal.fields.json')
      .then((res) => res.data.result)

  const fetchDeals = (filterIdFrom?: number, filterIdTo?: number) => {
    if (!filterIdFrom) return Promise.resolve([])

    const data = {
      filter: {
        '>=ID': filterIdFrom,
        '<=ID': filterIdTo,
      },
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

    return axios
      .post('https://dveri-bambit.bitrix24.ru/rest/254/lssx884kjza7kygu/crm.deal.list.json', data)
      .then((res) => res.data.result || [])
  }

  const fetchDealStatuses = () =>
    axios
      .get('https://dveri-bambit.bitrix24.ru/rest/254/qefzrc7xpwl0av5v/crm.status.list.json')
      .then((res) => res.data.result)

  //словари
  const createStageMap = (statuses: DealStatusItem[]): Record<string, string> =>
    Object.fromEntries(
      statuses.filter((s) => s.ENTITY_ID === 'DEAL_STAGE').map((s) => [s.STATUS_ID, s.NAME]),
    )

  const createSourceMap = (statuses: DealStatusItem[]): Record<string, string> =>
    Object.fromEntries(
      statuses.filter((s) => s.ENTITY_ID === 'SOURCE').map((s) => [s.STATUS_ID, s.NAME]),
    )

  const prepareUsersMap = (usersArray: User[]) => {
    usersObj.value = Object.fromEntries(
      usersArray.map((u) => [u.ID, { fullName: `${u.NAME} ${u.LAST_NAME}` }]),
    )
  }

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
      const [usersData, dealStatuses, dealFields, deals] = await Promise.all([
        fetchUsers(),
        fetchDealStatuses(),
        fetchDealFields(),
        fetchDeals(filterIdFrom.value, filterIdTo.value),
      ])

      users.value = usersData
      prepareUsersMap(usersData)
      info.value = dealFields

      const stageMap = createStageMap(dealStatuses)
      const sourceMap = createSourceMap(dealStatuses)

      allPosts.value = formatDeals(deals, usersObj.value, stageMap, sourceMap)

      posts.value = allPosts.value.slice(0, limit)
      start.value = limit
    } catch (error) {
      console.error(error)
      alert('Сервис временно недоступен. Пожалуйста, попробуйте позже.')
    } finally {
      loading.value = false
    }
  }

  const loadMorePosts = () => {
    if (start.value >= allPosts.value.length) return
    const nextPosts = allPosts.value.slice(start.value, start.value + limit)
    console.log('Loading API finished')
    posts.value.push(...nextPosts)
    start.value += limit
  }

  const searchById = async () => {
    if (loading.value) return
    loading.value = true

    try {
      const deals = await fetchDeals(filterIdFrom.value, filterIdTo.value)

      const dealStatuses = await fetchDealStatuses()
      const stageMap = createStageMap(dealStatuses)
      const sourceMap = createSourceMap(dealStatuses)

      allPosts.value = formatDeals(deals, usersObj.value, stageMap, sourceMap)

      posts.value = allPosts.value.slice(0, limit)
      start.value = limit
    } catch (error) {
      console.error(error)
      alert('Ошибка при получении данных с сервера.')
    } finally {
      loading.value = false
    }
  }

  const normalizeValue = (value: unknown, key: SortKey) => {
    const fieldInfo = info.value[key]

    if (!fieldInfo) return value ?? ''

    const type = fieldInfo.type

    if (value === null || value === undefined || value === '') return ''

    switch (type) {
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

  const sortPosts = async (key: SortKey) => {
    isSorting.value = true

    if (sortKey.value === key) {
      // если кликнули по тому же столбцу инвертируем порядок
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      //сразу сортируем по убыванию
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
    loadApi,
    posts,
    users,
    info,
    loading,
    isSorting,
    start,
    limit,
    loadMorePosts,
    filterIdFrom,
    filterIdTo,
    searchById,
    sortKey,
    sortOrder,
    sortPosts,
  }
})

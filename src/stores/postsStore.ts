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
  const isSorting = ref(false)
  const start = ref(0)
  const limit = 30
  const searchQuery = ref('')
  const sortKey = ref<SortKey>('ID')
  const sortOrder = ref<SortOrder>('asc')

  const loadApi = async () => {
    if (loading.value) return
    loading.value = true

    try {
      const userPromise = axios.get(
        'https://dveri-bambit.bitrix24.ru/rest/254/v2piz26ia0p3jner/user.get.json',
      )
      const infoPromise = axios.get(
        'https://dveri-bambit.bitrix24.ru/rest/254/rwqlpaqzd9vh1a1s/crm.deal.fields.json',
      )
      const listDealPromise = axios.get(
        'https://dveri-bambit.bitrix24.ru/rest/254/lssx884kjza7kygu/crm.deal.list.json?filter[>ID]=2&filter[<ID]=23560&select[0]=ID&select[1]=TITLE&select[2]=STAGE_SEMANTIC_ID&select[3]=STAGE_ID&select[4]=ASSIGNED_BY_ID&select[5]=DATE_CREATE&select[6]=CREATED_BY_ID&select[7]=CATEGORY_ID&select[8]=CURRENCY_ID&select[9]=OPPORTUNITY&select[10]=CLOSEDATE&select[11]=SOURCE_ID&select[12]=UTM_SOURCE&select[13]=LEAD_ID',
      )
      const valueDealPromise = axios.get(
        'https://dveri-bambit.bitrix24.ru/rest/254/qefzrc7xpwl0av5v/crm.status.list.json',
      )

      const [usersRes, valueDealRes, infoRes, listDealRes] = await Promise.all([
        userPromise,
        valueDealPromise,
        infoPromise,
        listDealPromise,
      ])

      users.value = usersRes.data.result
      info.value = infoRes.data.result

      //словарь
      const stageMap: Record<string, string> = {}
      valueDealRes.data.result
        .filter((item: DealStatusItem) => item.ENTITY_ID === 'DEAL_STAGE')
        .forEach((item: DealStatusItem) => {
          stageMap[item.STATUS_ID] = item.NAME
        })

      const sourceMap: Record<string, string> = {}
      valueDealRes.data.result
        .filter((item: DealStatusItem) => item.ENTITY_ID === 'SOURCE')
        .forEach((item: DealStatusItem) => {
          sourceMap[item.STATUS_ID] = item.NAME
        })

      allPosts.value = listDealRes.data.result.map((deal: Post) => {
        const assignedUser = users.value.find((u) => u.ID === deal.ASSIGNED_BY_ID)
        const createdUser = users.value.find((u) => u.ID === deal.CREATED_BY_ID)

        return {
          ...deal,
          stageName: stageMap[deal.STAGE_ID] || '',
          sourceName: sourceMap[deal.SOURCE_ID] || '',
          assignedBy: assignedUser ? `${assignedUser.NAME} ${assignedUser.LAST_NAME}` : '',
          createdBy: createdUser ? `${createdUser.NAME} ${createdUser.LAST_NAME}` : '',
          DATE_CREATE: deal.DATE_CREATE
            ? new Date(deal.DATE_CREATE).toLocaleDateString('ru-RU')
            : '',
          CLOSEDATE: deal.CLOSEDATE ? new Date(deal.CLOSEDATE).toLocaleDateString('ru-RU') : '',
        }
      })

      console.log(info.value)

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
    posts.value.push(...nextPosts)
    start.value += limit
  }

  const search = async (query: string, idFrom?: number, idTo?: number) => {
    isSorting.value = true
    searchQuery.value = query.trim().toLowerCase()
    start.value = 0

    //фильтрация id
    const filtered = allPosts.value.filter((post) => {
      const postId = Number(post.ID)

      const matchesTitle =
        searchQuery.value === '' ||
        post.TITLE?.toLowerCase().includes(searchQuery.value.toLowerCase())

      // если верхняя граница — 0, то ничего не должно находиться
      if (idTo === 0) return false

      const matchesId = (!idFrom || postId >= idFrom) && (!idTo || postId <= idTo)

      return matchesTitle && matchesId
    })

    posts.value = filtered.slice(0, limit)
    start.value = limit
    isSorting.value = false
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
    search,
    sortKey,
    sortOrder,
    sortPosts,
  }
})

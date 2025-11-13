import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import type { User } from '../interface/User'
import type { Post } from '../interface/Post'

type SortKey = 'id' | 'title' | 'body' | 'email'
type SortOrder = 'asc' | 'desc'

export const usePostsStore = defineStore('posts', () => {
  const allPosts = ref<Post[]>([])
  const posts = ref<Post[]>([])
  const users = ref<User[]>([])
  const loading = ref(false)
  const start = ref(0)
  const limit = 30
  const searchQuery = ref('')

  const searchLoading = ref(false)
  const isSorting = ref(false)
  const viewedPosts = ref<number[]>(JSON.parse(localStorage.getItem('viewedPosts') || '[]'))
  const sortKey = ref<SortKey>('id')
  const sortOrder = ref<SortOrder>('asc')

  const markPostAsViewed = (postId: number) => {
    if (!viewedPosts.value.includes(postId)) {
      viewedPosts.value.push(postId)
      localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts.value))
    }
  }

  const getUsers = async () => {
    try {
      const res = await axios.get('https://jsonplaceholder.typicode.com/users')
      users.value = res.data
    } catch (error) {
      console.error(error)
      alert('Сервис временно недоступен. Пожалуйста, попробуйте позже.')
    }
  }

  const loadPosts = async () => {
    if (loading.value) return
    loading.value = true
    try {
      const res = await axios.get('https://jsonplaceholder.typicode.com/posts', {
        params: {
          title_like: searchQuery.value,
        },
      })

      allPosts.value = res.data.map((post: Post) => {
        const user = users.value.find((u) => u.id === post.userId)
        return { ...post, email: user?.email || '', userId: post.userId }
      })

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

  const search = async(query: string) => {
    isSorting.value = true
    searchQuery.value = query.trim().toLowerCase()
    start.value = 0

    const filtered = allPosts.value.filter((post) =>
      post.title.toLowerCase().includes(searchQuery.value),
    )

    await new Promise((resolve) => setTimeout(resolve, 100))

    posts.value = filtered.slice(0, limit)
    start.value = limit
    isSorting.value = false
  }

  const sortAllPosts = () => {
    allPosts.value.sort((a, b) => {
      let valA: string | number = a[sortKey.value] ?? ''
      let valB: string | number = b[sortKey.value] ?? ''

      if (sortKey.value === 'email') {
        valA = (valA as string).toLowerCase()
        valB = (valB as string).toLowerCase()
      }

      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  const sortPosts = async (key: SortKey) => {
    isSorting.value = true

    await new Promise((resolve) => setTimeout(resolve, 100))

    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortOrder.value = 'asc'
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
    loading,
    searchLoading,
    start,
    limit,
    loadPosts,
    loadMorePosts,
    getUsers,
    search,
    markPostAsViewed,
    viewedPosts,
    sortKey,
    sortOrder,
    sortPosts,
    isSorting,
  }
})

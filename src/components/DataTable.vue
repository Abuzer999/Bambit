<script setup lang="ts">
import { onMounted, useTemplateRef, ref, watch, nextTick } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import { usePostsStore } from '../stores/postsStore'
import type { SortKey } from '../interface/SortKey'
import Loader from './Loader.vue'

const postsStore = usePostsStore()
const el = useTemplateRef<HTMLDivElement>('el')
const tableHeaders = ref<{ key: SortKey; label: string }[]>([])
const loading = ref(true)

watch(
  () => postsStore.posts,
  async () => {
    await nextTick() //обновление DOM
    if (el.value) el.value.scrollTop = 0
  },
)

const columns = [
  { key: 'ID', width: '60px' },
  { key: 'TITLE', width: '200px' },
  { key: 'STAGE_SEMANTIC_ID', width: '150px' },
  { key: 'stageName', width: '150px' },
  { key: 'assignedBy', width: '150px' },
  { key: 'DATE_CREATE', width: '150px' },
  { key: 'createdBy', width: '100px' },
  { key: 'CATEGORY_ID', width: '100px' },
  { key: 'CURRENCY_ID', width: '90px' },
  { key: 'OPPORTUNITY', width: '100px' },
  { key: 'CLOSEDATE', width: '170px' },
  { key: 'sourceName', width: '100px' },
  { key: 'UTM_SOURCE', width: '180px' },
  { key: 'LEAD_ID', width: '70px' },
]

useInfiniteScroll(el, postsStore.loadMorePosts, {
  distance: 200,
  canLoadMore: () => postsStore.start < postsStore.allPosts.length,
})

onMounted(async () => {
  loading.value = true
  await postsStore.loadApi()

  //нужные заголовки
  const neededKeys = [
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
  ]

  tableHeaders.value = neededKeys.map((key) => ({
    key: key as SortKey,
    label: postsStore.info[key]?.title ?? key,
  }))

  loading.value = false
})
</script>

<template>
  <div class="lg:h-[600px] w-screen h-[350px] bg-primary mt-7 rounded-xl p-4 overflow-hidden">
    <div ref="el" class="overflow-y-auto h-[580px]">
      <div v-if="loading" class="flex items-center justify-center h-full">
        <Loader />
      </div>

      <table
        v-else-if="postsStore.posts.length"
        class="w-full table-auto border-collapse border border-gray-300"
      >
        <thead class="sticky top-0 z-10 bg-black border dark:bg-white text-[15px]">
          <tr class="text-white dark:text-black">
            <th
              v-for="tableHeader in tableHeaders"
              class="border p-1 cursor-pointer"
              :style="{ width: columns.find((c) => c.key === tableHeader.key)?.width }"
              @click="postsStore.sortPosts(tableHeader.key)"
              :key="tableHeader.key"
            >
              {{ tableHeader.label }}
              <span class="ml-1 text-gray-400">
                <span
                  :class="
                    postsStore.sortKey === tableHeader.key && postsStore.sortOrder === 'asc'
                      ? 'text-green-400'
                      : ''
                  "
                  >↑</span
                >
                <span
                  :class="
                    postsStore.sortKey === tableHeader.key && postsStore.sortOrder === 'desc'
                      ? 'text-green-400'
                      : ''
                  "
                  >↓</span
                >
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="text-white dark:text-black" v-for="post in postsStore.posts" :key="post.ID">
            <td
              v-for="col in columns"
              :key="col.key"
              class="border p-2 max-w-[100px] truncate whitespace-nowrap overflow-hidden"
              :title="String(post[col.key])"
            >
              {{ post[col.key] }}
            </td>
          </tr>
        </tbody>
      </table>

      <span
        class="text-white dark:text-black flex items-center justify-center h-full"
        v-else-if="!postsStore.posts.length"
      >
        Ничего не найдено
      </span>
    </div>
  </div>
</template>

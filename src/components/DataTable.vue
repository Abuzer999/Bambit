<script setup lang="ts">
import { onMounted, useTemplateRef, ref, watch, nextTick, computed } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import { usePostsStore } from '../stores/bitrixStore'
import { Icon } from '@iconify/vue'
import Loader from './Loader.vue'
import { createColumnsConfig } from '../constants/column'

const postsStore = usePostsStore()
const el = useTemplateRef<HTMLDivElement>('el')
const loading = ref(true)

const tableHeaders = computed(() => createColumnsConfig(postsStore.info))

watch(
  () => postsStore.posts,
  async () => {
    await nextTick() //обновление DOM
    if (el.value) el.value.scrollTop = 0
  },
)

useInfiniteScroll(el, postsStore.loadMorePosts, {
  distance: 200,
  canLoadMore: () => postsStore.start < postsStore.allPosts.length,
})

onMounted(async () => {
  loading.value = true
  await postsStore.loadApi()
  loading.value = false
})
</script>

<template>
  <div class="lg:h-[600px] w-screen h-[350px] mt-7 rounded-xl p-4 overflow-hidden">
    <div ref="el" class="overflow-y-auto h-[580px]">
      <div v-if="loading" class="flex items-center justify-center h-full">
        <Loader />
      </div>

      <table
        v-else-if="postsStore.posts.length"
        class="w-full table-auto border-collapse border border-gray-200 dark:border-[#4b4b4b] text-[15px]"
      >
        <thead
          class="sticky top-0 z-10 bg-[#d5d5d5] dark:bg-[#2c2c2c] text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-[#474747]"
        >
          <tr>
            <th
              v-for="tableHeader in tableHeaders"
              :key="tableHeader.key"
              class="border border-black dark:border-[#474747] p-2 cursor-pointer select-none hover:bg-[#c8c8c8] dark:hover:bg-[#3a3a3a] transition-colors font-medium"
              :style="{ width: tableHeaders.find((c) => c.key === tableHeader.key)?.width }"
              @click="postsStore.sortPosts(tableHeader.key)"
            >
              <div class="flex items-center justify-between">
                <span>{{ tableHeader.label }}</span>
                <Icon icon="mdi:sort" class="text-gray-600 dark:text-gray-400" />
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="post in postsStore.posts"
            :key="post.ID"
            class="bg-[#e7e7e7] dark:bg-[#5f5e5e] text-gray-700 dark:text-gray-200 transition-colors"
          >
            <td
              v-for="col in tableHeaders"
              :key="col.key"
              class="border border-black dark:border-[#464646] p-2 max-w-[100px] truncate whitespace-nowrap overflow-hidden"
              :title="String(post[col.key])"
            >
              {{ post[col.key] }}
            </td>
          </tr>
        </tbody>
      </table>

      <span class="text-gray-600 dark:text-gray-300 flex items-center justify-center h-full" v-else>
        Ничего не найдено
      </span>
    </div>
  </div>
</template>

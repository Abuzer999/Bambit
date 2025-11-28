<script setup lang="ts">
import { onMounted, useTemplateRef, ref, watch, nextTick, computed } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import { usePostsStore } from '../stores/postsStore'
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
        class="w-full table-auto border-collapse border border-gray-300"
      >
        <thead class="sticky top-0 z-10 bg-muted border text-[15px]">
          <tr class="text-black dark:text-white">
            <th
              v-for="tableHeader in tableHeaders"
              class="border p-1 cursor-pointer"
              :style="{ width: tableHeaders.find((c) => c.key === tableHeader.key)?.width }"
              @click="postsStore.sortPosts(tableHeader.key)"
              :key="tableHeader.key"
            >
              <div class="flex items-center justify-between">
                <span>{{ tableHeader.label }}</span>
                <span class="text-gray-400">
                  <Icon icon="mdi:sort" />
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="bg-primary text-white dark:text-black"
            v-for="post in postsStore.posts"
            :key="post.ID"
          >
            <td
              v-for="col in tableHeaders"
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
        class="text-black dark:text-white flex items-center justify-center h-full"
        v-else-if="!postsStore.posts.length"
      >
        Ничего не найдено
      </span>
    </div>
  </div>
</template>

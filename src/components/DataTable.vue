<script setup lang="ts">
import { onMounted, useTemplateRef, ref } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import { usePostsStore } from '../stores/postsStore'
import type { User } from '../interface/User'
import Loader from './Loader.vue'
import ModalInfo from './ModalInfo.vue'

const postsStore = usePostsStore()
const el = useTemplateRef<HTMLDivElement>('el')
const open = ref(false)
const selectedUser = ref<User | null>(null)
const loading = ref(true)

const openModal = (userId: number, postId: number) => {
  const user = postsStore.users.find((u: User) => u.id === userId)
  selectedUser.value = user || null
  open.value = true

  // отмечаю как просмотренного
  postsStore.markPostAsViewed(postId)
}

const closeModal = () => {
  open.value = false
  selectedUser.value = null
}

useInfiniteScroll(el, postsStore.loadMorePosts, {
  distance: 200,
   canLoadMore: () => postsStore.start < postsStore.allPosts.length,
})

onMounted(async () => {
  loading.value = true
  await postsStore.getUsers()
  await postsStore.loadPosts()
  loading.value = false
})
</script>

<template>
  <div
    class="lg:w-[600px] lg:h-[600px] w-[350px] h-[350px] bg-primary mt-7 rounded-xl p-4 overflow-hidden"
  >
    <div ref="el" class="overflow-y-auto h-[580px]">
      <div
        v-if="loading || postsStore.searchLoading || postsStore.isSorting"
        class="flex items-center justify-center h-full"
      >
        <Loader />
      </div>

      <table
        v-else-if="postsStore.posts.length"
        class="w-full table-auto border-collapse border border-gray-300"
      >
        <thead class="sticky top-0 z-10 bg-black border dark:bg-white">
          <tr class="text-white dark:text-black">
            <th class="border p-1 cursor-pointer" @click="postsStore.sortPosts('id')">
              ID
              <span class="ml-1 text-gray-400">
                <span
                  :class="
                    postsStore.sortKey === 'id' && postsStore.sortOrder === 'asc'
                      ? 'text-green-400'
                      : ''
                  "
                  >↑</span
                >
                <span
                  :class="
                    postsStore.sortKey === 'id' && postsStore.sortOrder === 'desc'
                      ? 'text-green-400'
                      : ''
                  "
                  >↓</span
                >
              </span>
            </th>

            <th class="border p-1 cursor-pointer" @click="postsStore.sortPosts('title')">
              Title
              <span class="ml-1 text-gray-400">
                <span
                  :class="
                    postsStore.sortKey === 'title' && postsStore.sortOrder === 'asc'
                      ? 'text-green-400'
                      : ''
                  "
                  >↑</span
                >
                <span
                  :class="
                    postsStore.sortKey === 'title' && postsStore.sortOrder === 'desc'
                      ? 'text-green-400'
                      : ''
                  "
                  >↓</span
                >
              </span>
            </th>

            <th class="border p-1 cursor-pointer" @click="postsStore.sortPosts('body')">
              Body
              <span class="ml-1 text-gray-400">
                <span
                  :class="
                    postsStore.sortKey === 'body' && postsStore.sortOrder === 'asc'
                      ? 'text-green-400'
                      : ''
                  "
                  >↑</span
                >
                <span
                  :class="
                    postsStore.sortKey === 'body' && postsStore.sortOrder === 'desc'
                      ? 'text-green-400'
                      : ''
                  "
                  >↓</span
                >
              </span>
            </th>

            <th class="border p-1 cursor-pointer" @click="postsStore.sortPosts('email')">
              Email
              <span class="ml-1 text-gray-400">
                <span
                  :class="
                    postsStore.sortKey === 'email' && postsStore.sortOrder === 'asc'
                      ? 'text-green-400'
                      : ''
                  "
                  >↑</span
                >
                <span
                  :class="
                    postsStore.sortKey === 'email' && postsStore.sortOrder === 'desc'
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
          <tr class="text-white dark:text-black" v-for="post in postsStore.posts" :key="post.id">
            <td class="border p-2">{{ post.id }}</td>
            <td
              :title="post.title.length > 12 ? post.title : ''"
              class="border p-2 max-w-[100px] truncate whitespace-nowrap overflow-hidden"
            >
              {{ post.title }}
            </td>
            <td
              :title="post.body.length > 25 ? post.body : ''"
              class="border p-2 max-w-[180px] truncate whitespace-nowrap overflow-hidden"
            >
              {{ post.body }}
            </td>

            <td
              @click="openModal(post.userId, post.id)"
              class="border p-2 w-50 cursor-pointer hover:underline"
              :class="
                postsStore.viewedPosts.includes(post.id)
                  ? 'text-[#08ff31]'
                  : 'text-white dark:text-black'
              "
            >
              {{ post.email }}
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

      <Teleport to="body">
        <ModalInfo v-show="open" @close="closeModal" v-bind="selectedUser" />
      </Teleport>
    </div>
  </div>
</template>

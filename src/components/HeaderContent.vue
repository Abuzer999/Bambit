<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Icon } from "@iconify/vue";
import { useDark, useToggle } from '@vueuse/core'
import { ref } from "vue";
import { usePostsStore } from '../stores/postsStore'

//темная тема
const isDark = useDark()
const toggleDark = useToggle(isDark)

const searchQuery = ref('')
const postsStore = usePostsStore()

const findPost = async () => {
  await postsStore.search(searchQuery.value)
}
</script>

<template>
<div class="container">
  <div class="flex items-center lg:gap-50 gap-10">
    <form class="flex items-center gap-4" @submit.prevent="findPost">
      <Input v-model="searchQuery" class="lg:w-60 w-47 text-sm" placeholder="Поиск по заголовку (title)" />
      <Button>
        <Icon icon="mdi:search" />
        Поиск
      </Button>
    </form>

    <Button @click="toggleDark()">
      <Icon icon="radix-icons:moon" class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Icon icon="radix-icons:sun" class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  </div>
</div>
</template>

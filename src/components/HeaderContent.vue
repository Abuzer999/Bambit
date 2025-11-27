<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icon } from '@iconify/vue'
import { useDark, useToggle } from '@vueuse/core'
import { ref } from 'vue'
import { usePostsStore } from '../stores/postsStore'

//темная тема
const isDark = useDark()
const toggleDark = useToggle(isDark)

const searchQuery = ref('')
const filterIdFrom = ref<number | undefined>(2)
const filterIdTo = ref<number | undefined>(23560)
const postsStore = usePostsStore()

const findPost = async () => {
  await postsStore.search(searchQuery.value, filterIdFrom.value, filterIdTo.value)
}
</script>

<template>
  <div class="container">
    <h1 class="font-extrabold text-[40px] mb-2.5">Отчет по сделкам</h1>
    <div class="flex items-end lg:gap-50 gap-10">
      <form class="flex items-end gap-4 flex-wrap" @submit.prevent="findPost">
        <p>Фильтр</p>

        <div class="flex flex-col">
          <label class="text-white text-sm mb-1">ID от</label>
          <Input v-model="filterIdFrom" type="number" class="w-32 text-sm" />
        </div>

        <div class="flex flex-col">
          <label class="text-white text-sm mb-1">ID до</label>
          <Input v-model="filterIdTo" type="number" class="w-32 text-sm" />
        </div>

        <Input
          v-model="searchQuery"
          class="lg:w-60 w-47 text-sm"
          placeholder="Поиск по заголовку (title)"
        />

        <Button>
          <Icon icon="mdi:search" />
          Поиск
        </Button>
      </form>

      <Button @click="toggleDark()">
        <Icon
          icon="radix-icons:moon"
          class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <Icon
          icon="radix-icons:sun"
          class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
      </Button>
    </div>
  </div>
</template>

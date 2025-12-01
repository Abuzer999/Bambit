<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icon } from '@iconify/vue'
import { useDark, useToggle } from '@vueuse/core'
import { usePostsStore } from '../stores/bitrixStore'

//темная тема
const isDark = useDark()
const toggleDark = useToggle(isDark)

const postsStore = usePostsStore()

const findPost = async () => {
  await postsStore.searchById()
}
</script>

<template>
  <div class="container">
    <div class="flex items-end justify-between lg:gap-50 gap-10 mb-4">
      <h1 class="font-extrabold text-[40px]">Отчет по сделкам</h1>

      <div class="flex items-end gap-4 flex-wrap">
        <form class="flex items-center gap-4 flex-wrap" @submit.prevent="findPost">
          <div class="flex items-center gap-2">
            <p class="text-black dark:text-white">Фильтр</p>
          </div>

          <div class="relative flex flex-col">
            <label class="absolute -top-7 left-0 text-black dark:text-white text-sm mb-1"
              >ID от</label
            >
            <Input v-model="postsStore.filterIdFrom" type="number" class="w-32 text-sm" />
          </div>

          <div class="relative flex flex-col">
            <label class="absolute -top-7 left-0 text-black text-sm mb-1 dark:text-white"
              >ID до</label
            >
            <Input v-model="postsStore.filterIdTo" type="number" class="w-32 text-sm" />
          </div>

          <Button class="bg-black dark:bg-[#000000ec] dark:text-white border border-solid dark:border-white dark:hover:bg-[#353535ec]">
            <Icon icon="mdi:search" />
            Поиск
          </Button>
        </form>

        <Button @click="toggleDark()" class="bg-black dark:bg-[#000000e8] dark:text-white border border-solid dark:border-white dark:hover:bg-[#353535ec]">
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
  </div>
</template>

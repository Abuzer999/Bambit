<script setup lang="ts">
import type { User } from '@/interface/User'
import { onClickOutside } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const props = defineProps<Partial<User>>()

const emit = defineEmits<{ (e: 'close'): void }>()

const target = useTemplateRef<HTMLElement>('target')

onClickOutside(target, () => {
  emit('close')
})

</script>

<template>
  <div class="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-1000">
    <div
      ref="target"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary max-w-[400px] w-full text-white dark:text-black p-5 rounded-2xl"
    >
      <div class="flex items-center justify-between mb-5">
        <h1 class="font-extrabold">Карточка пользователя</h1>
        <button @click="emit('close')">✕</button>
      </div>

      <article class="user-profile">
        <h2><strong>Name:</strong> {{ props.name }}</h2>
        <p><strong>Username:</strong> {{ props.username }}</p>
        <p>
          <strong>Email:</strong> <a :href="`mailto:${email}`">{{ props.email }}</a>
        </p>
        <p>
          <strong>Phone:</strong> <a :href="`tel:${phone}`">{{ props.phone }}</a>
        </p>
        <p>
          <strong>Website:</strong> <a :href="website" target="_blank">{{ props.website }}</a>
        </p>
        <p><strong>Company:</strong> {{ props.company?.name }}</p>
        <p>
          <strong>Address:</strong>
          {{ props.address?.street + ', ' + props.address?.suite + ', ' + props.address?.city }}
        </p>
      </article>
    </div>
  </div>
</template>

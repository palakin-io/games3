<template>
  <div class="max-w-6xl mx-auto my-4">
    <div class="transition-all duration-200 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl hover:border-slate-700 overflow-hidden">
      <button
        type="button"
        class="flex items-center justify-between w-full px-5 py-4 min-h-[44px] cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded-2xl"
        @click="toggleAnswer()"
      >
        <span class="text-lg font-bold text-slate-100 flex items-center gap-2">
          <span>{{ props.title }}</span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="w-5 h-5 text-orange-400 transition-transform duration-300"
          :class="{ 'rotate-180': isOpen }"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div v-if="isOpen" class="px-5 pb-6 pt-2 border-t border-slate-800/80 text-slate-300">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isOpen = ref(false);

const props = defineProps({
  title: String,
});

function toggleAnswer() {
  isOpen.value = !isOpen.value;
}
</script>
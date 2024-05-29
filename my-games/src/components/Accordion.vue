<template>
<div class="max-w-6xl mx-auto mt-8 space-y-4 md:mt-16">
    <div class="transition-all duration-200 bg-white border border-gray-200 shadow-lg cursor-pointer hover:bg-gray-50">
        <button type="button" class="flex items-center justify-between w-full px-4 py-5 sm:p-6" @click="toggleAnswer()">
            <span class="flex text-lg font-semibold text-black">{{ props.title }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                class="w-6 h-6 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': isOpen }">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        </button>
        <div v-if="isOpen" class="px-4 pb-5 sm:px-6 sm:pb-6">
            <slot></slot>
        </div>
    </div>
</div>
</template>

<style scoped>

</style>

<script setup>
import { ref } from 'vue';

const isOpen = ref(false)

const props = defineProps({
    title: String,
})

function toggleAnswer() {
  isOpen.value = !isOpen.value;
}
</script>
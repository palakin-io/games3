<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        class="fixed inset-0 bg-gray-500 opacity-75"
        @click="closeModal"
      ></div>
      <div class="bg-white rounded-lg shadow-lg p-6 relative z-10">
        <button 
          @click="closeModal" 
          class="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
        >
          <XMarkIcon class="h-6 w-6 text-gray-500" />
        </button>
  
        <slot></slot>
      </div>
    </div>
</template>

<style scoped>

</style>

<script setup>
import { ref } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/solid';

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};
</script>
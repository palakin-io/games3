<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div 
        class="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        @click="closeModal"
      ></div>
      <div :class="['bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 p-4 sm:p-6 relative z-10 w-full max-h-[95vh] overflow-y-auto', maxWidthClass]">
        <button 
          @click="closeModal" 
          type="button"
          class="absolute top-4 right-4 z-20 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 bg-slate-900/80 transition-colors shadow-md"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
  
        <slot></slot>
      </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/solid';

const props = defineProps({
  maxWidth: {
    type: String,
    default: '6xl'
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

const maxWidthClass = computed(() => {
  const map = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };
  return map[props.maxWidth] || props.maxWidth || 'max-w-6xl';
});
</script>

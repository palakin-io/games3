<template>
  <div class="relative w-full aspect-[3/4] rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg group hover:border-orange-500/50 hover:shadow-orange-500/10 transition-all duration-300">
    <img
      :src="props.img"
      :alt="props.title + ' image'"
      loading="lazy"
      decoding="async"
      class="w-full h-full object-fill transition-transform duration-500 group-hover:scale-105"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
    
    <div class="absolute inset-x-3 bottom-3 text-slate-100 flex flex-col gap-1">
      <h4 class="text-sm font-bold truncate text-slate-100 group-hover:text-orange-400 transition-colors">
        {{ props.title }}
      </h4>
      <button
        @click="showModal = true"
        class="mt-1 w-full py-1.5 px-3 min-h-[36px] rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-orange-500 hover:text-slate-950 text-slate-200 border border-slate-700 hover:border-orange-400 transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
      >
        <span>Full Image</span>
      </button>
    </div>

    <modal v-if="showModal" @close="handleClose">
      <div class="max-w-4xl max-h-[85vh] p-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center">
        <img :src="props.img" class="max-w-full max-h-[80vh] object-contain rounded-xl" :alt="props.title">
      </div>
    </modal>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Modal from '@/components/Modal.vue';

const showModal = ref(false);
const handleClose = () => {
  showModal.value = false;
};

const props = defineProps({
  title: String,
  img: String
});
</script>
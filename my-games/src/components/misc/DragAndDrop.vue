<template>
  <div class="w-full relative border-2 border-dashed rounded-xl p-6 transition-colors duration-200" id="dropzone"
    :class="[
      draggingOver ? 'border-indigo-500 bg-slate-800/80' : 'border-slate-700 bg-slate-900/60 hover:border-slate-600'
    ]"
    @dragover.prevent="draggingOver = true" @dragleave.prevent="draggingOver = false" @drop.prevent="handleDragDrop">
    <input v-if="!imagePreview" type="file" class="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" @change="handleFileUpload" accept="image/*" />
    <div v-if="!imagePreview" class="text-center pointer-events-none">
      <PhotoIcon class="mx-auto h-12 w-12 text-slate-400" aria-hidden="true" />
      <h3 class="mt-2 text-sm font-medium text-slate-200">
        <span class="font-semibold text-indigo-400">Click to browse</span> or drag & drop cover image
      </h3>
      <p class="mt-1 text-xs text-slate-400">
        PNG, JPG, WEBP, GIF up to 10MB
      </p>
    </div>

    <div v-else class="relative z-20 flex flex-col items-center">
      <img :src="imagePreview" class="max-h-48 rounded-lg shadow-md object-contain border border-slate-700" alt="Cover Image Preview">
      <button type="button" @click.stop="clearImage" class="mt-3 px-3 py-1 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-md border border-red-500/30 transition-colors">
        ✕ Remove Image
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue';
import { PhotoIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  label: String,
  modelValue: [String, Object],
});

const emit = defineEmits(['update:modelValue']);

const imagePreview = ref(null);
const draggingOver = ref(false);

watch(() => props.modelValue, (newVal) => {
  if (typeof newVal === 'string') {
    imagePreview.value = newVal;
  } else if (!newVal) {
    imagePreview.value = null;
  }
}, { immediate: true });

const handleFileUpload = (event) => {
  if (event.target.files && event.target.files[0]) {
    processFile(event.target.files[0]);
  }
};

const handleDragDrop = (event) => {
  draggingOver.value = false;
  if (event.dataTransfer.files && event.dataTransfer.files[0]) {
    processFile(event.dataTransfer.files[0]);
  }
};

const processFile = (file) => {
  if (file.type.startsWith('image/')) {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size exceeds the 10MB limit. Please upload a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
      const fileData = {
        name: file.name,
        type: file.type,
        data: e.target.result,
        size: file.size
      };
      emit('update:modelValue', fileData);
    };
    reader.readAsDataURL(file);
  } else {
    alert('Invalid file type. Please upload an image.');
  }
};

const clearImage = () => {
  imagePreview.value = null;
  emit('update:modelValue', null);
};
</script>
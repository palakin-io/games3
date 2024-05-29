<template>
    <div class="w-full relative border-2 border-dashed rounded-lg p-6" 
         id="dropzone"
         :class="{'border-gray-300': !imagePreview, 'border-indigo-600': draggingOver}" 
         @dragover.prevent="draggingOver = true" 
         @dragleave.prevent="draggingOver = false"
         @drop.prevent="handleDragDrop"
    >
      <input type="file" class="absolute inset-0 w-full h-full opacity-0 z-50" @change="handleFileUpload" />
      <div class="text-center">
        <PhotoIcon class="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">
          <label for="file-upload" class="relative cursor-pointer">
            <span>Drag and drop</span>
            <span class="text-indigo-600 cursor-pointer"> or browse</span>
            <span>to upload</span>
          </label>
        </h3>
        <p class="mt-1 text-xs text-gray-500">
          PNG, JPG, GIF up to 10MB
        </p>
      </div>
  
      <img v-if="imagePreview" :src="imagePreview" class="mt-4 mx-auto max-h-40" alt="Uploaded Image">
    </div>
</template>
  
<script setup>
  import { defineProps, ref } from 'vue';
  import { PhotoIcon } from '@heroicons/vue/24/outline';
  
  defineProps({
    label: String,
    modelValue: String,
  });
  
  const imagePreview = ref(null);
  const draggingOver = ref(false); 
  
  const emit = defineEmits(['update:modelValue']);
  
  const handleFileUpload = (event) => {
    processFile(event.target.files[0]);
  };
  
  const handleDragDrop = (event) => {
    draggingOver.value = false; // Reset dragging state
    processFile(event.dataTransfer.files[0]);
  };
  
  const processFile = (file) => {
    // Only process images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.value = e.target.result;
        const fileData = {
          name: file.name,
          type: file.type,
          data: e.target.result 
        };
        emit('update:modelValue', fileData);
      };
      reader.readAsDataURL(file);
    } else {
      // Handle invalid file type (error message)
    }
  };
</script>
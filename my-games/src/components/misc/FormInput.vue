<template>
    <div>
        <label :for="name" class="block text-gray-700 font-medium mb-2">{{ label }}:</label>
        <input :type="type" 
                :name="name" 
                :placeholder="placeholder" 
                :required="required" 
                :min="min" 
                :max="max" 
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
                class="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <!-- <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p> -->
    </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';

defineProps({
    name: String,
    type: String,
    label: String,
    placeholder: String,
    required: String,
    min: String,
    max: String,
    modelValue: String,
});

// const value = ref(modelValue);


</script>
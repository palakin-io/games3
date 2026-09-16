<template>
    <div>
        <label v-if="label" :for="name" class="block text-slate-300 font-medium mb-1.5 text-sm">{{ label }}:</label>
        <input :type="type" 
                :name="name" 
                :id="name"
                :placeholder="placeholder" 
                :required="required" 
                :min="min" 
                :max="max" 
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
                class="bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 w-full text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors">
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
    name: String,
    type: String,
    label: String,
    placeholder: String,
    required: [Boolean, String],
    min: String,
    max: String,
    modelValue: [String, Number],
});
defineEmits(['update:modelValue']);
</script>
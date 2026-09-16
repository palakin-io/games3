<template>
    <div class="mb-3">
      <label v-if="label" :for="name" class="block text-slate-300 font-medium mb-1.5 text-sm">{{ label }}:</label>
      <select 
        :name="name" 
        :id="name" 
        :required="required" 
        class="bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 w-full text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option value="" disabled :selected="!modelValue">Select {{ label || name }}</option>
        <option 
          v-for="option in props.items" 
          :value="option" 
          :key="option" 
          :selected="String(option) === String(modelValue)"
          class="bg-slate-800 text-slate-100"
        >
          {{ option }}
        </option>
      </select>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue"

const props = defineProps({
    name : String,
    items : Array,
    label : String,
    required : [Boolean, String],
    modelValue: [String, Number],
});
defineEmits(['update:modelValue'])
</script>
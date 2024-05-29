<template>
    <div class="mb-3">
      <label :for="name" class="block text-gray-700 font-medium mb-2">{{ label }}:</label>
      <select 
        :name="name" 
        :id="name" 
        required="required" 
        class="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        @input="$emit('update:modelValue', $event.target.value)"
      >
        <option 
          v-for="option in props.items" 
          :value="option" 
          :key="option" 
          :selected="option === modelValue"
        >
          {{ option }}
        </option>
      </select>
    </div>
</template>

<script setup>
import {} from "vue"


const props = defineProps({
    name : String,
    items : Array,
    label : String,
    required : String,
    modelValue: [String, Number],
});
defineEmits(['update:modelValue'])
</script>
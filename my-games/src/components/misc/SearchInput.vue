<template>
    <div class="relative">
        <label :for="name" class="block text-gray-700 font-medium mb-2">{{ label }}:</label>
        <input :type="type" 
                :name="name" 
                :placeholder="placeholder" 
                :required="required" 
                :min="min" 
                :max="max" 
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value), debounceSearch($event.target.value)"
                class="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <ul v-if="suggestions.length > 0" class="absolute z-10 top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-md">
            <li v-for="(suggestion, index) in suggestions" :key="index" class="px-4 py-2 cursor-pointer hover:bg-gray-100" @click="selectSuggestion(suggestion)">
                {{ suggestion.name }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import axios from 'axios';
import { debounce } from 'lodash';


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

const emit = defineEmits(['update:modelValue']); 

const suggestions = ref([]);

const debounceSearch = debounce((searchQuery) => searchGames(searchQuery), 700);

async function searchGames(searchQuery) {
    debugger
    if (searchQuery < 3) {
        suggestions.value = [];
        return;
    }

    try {
        const response = await axios.get(`https://api.rawg.io/api/games?`, {
            params: {
                    key: '7a718cd5ee034802a7429999d09618f9',
                    search: searchQuery,
                }
        });
        suggestions.value = response.data.results;
        console.log(suggestions.value);
        
    } catch (error) {
        console.error('Error fetching games:', error);
    }
}

const selectSuggestion = (suggestion) => {
  emit('update:modelValue', suggestion.name);
  suggestions.value = []; 
};

</script>
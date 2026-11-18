<template>
    <div class="relative">
        <label v-if="label" :for="name" class="block text-slate-300 font-medium mb-1.5 text-sm">{{ label }}:</label>
        <input :type="type" 
                :name="name" 
                :id="name"
                :placeholder="placeholder" 
                :required="required" 
                :min="min" 
                :max="max" 
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value), debounceSearch($event.target.value)"
                class="bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 w-full text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors">
        <ul v-if="suggestions.length > 0" class="absolute z-30 top-full left-0 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
            <li v-for="(suggestion, index) in suggestions" :key="suggestion.steamAppId || index" class="px-4 py-2.5 cursor-pointer text-slate-200 hover:bg-slate-700/80 transition-colors flex items-center gap-3" @click="selectSuggestion(suggestion)">
                <img v-if="suggestion.tinyImage || suggestion.headerImage" :src="suggestion.tinyImage || suggestion.headerImage" class="w-10 h-6 object-cover rounded border border-slate-700 shrink-0" alt="" />
                <span class="truncate">{{ suggestion.title || suggestion.name }}</span>
            </li>
        </ul>
    </div>
</template>


<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import axios from 'axios';
import { debounce } from 'lodash';
import { buildApiUrl } from '@/config/api';


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

const debounceSearch = debounce((searchQuery) => searchGames(searchQuery), 500);

async function searchGames(searchQuery) {
    if (!searchQuery || searchQuery.trim().length < 2) {
        suggestions.value = [];
        return;
    }

    try {
        const response = await axios.get(buildApiUrl('/api/backlog/steam/search'), {
            params: {
                q: searchQuery.trim(),
            }
        });
        suggestions.value = response.data || [];
    } catch (error) {
        console.error('Error fetching games:', error);
    }
}

const selectSuggestion = (suggestion) => {
  emit('update:modelValue', suggestion.title || suggestion.name);
  suggestions.value = []; 
};

</script>
<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-150"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-100"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-slate-950/80 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <TransitionChild
          as="template"
          enter="ease-out duration-150"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="ease-in duration-100"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel class="w-full max-w-4xl bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 p-5 sm:p-6 flex flex-col max-h-[90vh]">
            <!-- Header -->
            <div class="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <DialogTitle class="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>🖼️</span> Find Character Image
                </DialogTitle>
                <p class="text-xs sm:text-sm text-slate-400 mt-1">
                  Click any image below to use it for
                  <span class="text-indigo-400 font-semibold">{{ characterName || 'this character' }}</span>
                  <span v-if="gameTitle"> in <span class="text-slate-200 font-medium">{{ gameTitle }}</span></span>.
                </p>
              </div>
              <button
                type="button"
                @click="emit('close')"
                class="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Search Bar -->
            <form @submit.prevent="handleNewSearch" class="mt-4 flex flex-col sm:flex-row gap-2.5">
              <div class="relative flex-1">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search character image (e.g. Cloud Strife Final Fantasy VII)..."
                  class="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 w-full text-sm text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                :disabled="isLoading || !searchQuery.trim()"
                class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-md flex items-center justify-center gap-2 shrink-0"
              >
                <svg v-if="isLoading && images.length === 0" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>🔍 Search</span>
              </button>
            </form>

            <!-- Results Area -->
            <div class="mt-4 flex-1 overflow-y-auto pr-1 min-h-[300px]">
              <!-- Initial Loading Skeleton -->
              <div v-if="isLoading && images.length === 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-2">
                <div
                  v-for="n in 8"
                  :key="n"
                  class="aspect-[3/4] rounded-2xl bg-slate-800/70 border border-slate-700/60 animate-pulse"
                ></div>
              </div>

              <!-- Error Banner -->
              <div v-else-if="errorMessage && images.length === 0" class="py-12 px-4 text-center">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 mb-3 text-xl">
                  ⚠️
                </div>
                <p class="text-slate-200 font-semibold text-sm">{{ errorMessage }}</p>
                <p class="text-slate-400 text-xs mt-1">Try adjusting your search keywords above and searching again.</p>
              </div>

              <!-- Empty State -->
              <div v-else-if="!isLoading && hasSearched && images.length === 0" class="py-14 px-4 text-center">
                <p class="text-slate-300 font-semibold text-sm">No character images found for "{{ searchQuery }}".</p>
                <p class="text-slate-400 text-xs mt-1">Try searching just the character name or adjusting the game title.</p>
              </div>

              <!-- Image Grid -->
              <div v-else-if="images.length > 0" class="space-y-5 pb-2">
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <button
                    v-for="(img, idx) in images"
                    :key="`${img.url}-${idx}`"
                    type="button"
                    @click.stop="selectImage(img)"
                    class="group relative aspect-[3/4] rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500 overflow-hidden shadow-md hover:shadow-xl hover:shadow-indigo-500/15 transition-all text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <img
                      :src="img.displayUrl"
                      :alt="img.title || characterName"
                      loading="lazy"
                      decoding="async"
                      @error="handleCandidateError(img)"
                      class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <span class="text-xs font-semibold text-white line-clamp-2 leading-snug mb-1.5">
                        {{ img.title || characterName }}
                      </span>
                      <div class="flex items-center justify-between gap-2">
                        <span v-if="img.width && img.height" class="text-[10px] text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700">
                          {{ img.width }}×{{ img.height }}
                        </span>
                        <span class="ml-auto text-xs font-bold text-white bg-indigo-600 px-2.5 py-1 rounded-lg shadow">
                          Use Image
                        </span>
                      </div>
                    </div>
                  </button>
                </div>

                <!-- Load More Button -->
                <div v-if="nextStartIndex" class="flex justify-center pt-2">
                  <button
                    type="button"
                    @click="loadMoreImages"
                    :disabled="isLoading"
                    class="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <svg v-if="isLoading" class="animate-spin h-4 w-4 text-indigo-400" viewBox="0 0 24 24" fill="none">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{{ isLoading ? 'Loading more...' : '+ Load More Results' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import axios from 'axios';
import { buildApiUrl } from '@/config/api';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  characterName: {
    type: String,
    default: ''
  },
  gameTitle: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'select']);

const searchQuery = ref('');
const images = ref([]);
const nextStartIndex = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');
const hasSearched = ref(false);

function buildDefaultQuery() {
  const charPart = (props.characterName || '').trim();
  const gamePart = (props.gameTitle || '').trim();
  if (charPart && gamePart) {
    return `${charPart} ${gamePart}`;
  }
  return charPart || gamePart;
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      searchQuery.value = buildDefaultQuery();
      images.value = [];
      nextStartIndex.value = null;
      errorMessage.value = '';
      hasSearched.value = false;
      if (searchQuery.value) {
        fetchImages(1, false);
      }
    }
  }
);

async function fetchImages(start = 1, append = false) {
  const q = searchQuery.value.trim();
  if (!q) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await axios.get(buildApiUrl('/api/games/characters/images'), {
      params: {
        q,
        character: (props.characterName || '').trim(),
        start
      }
    });

    const fetched = Array.isArray(response.data?.items) ? response.data.items : [];
    const normalized = fetched.map(item => ({
      ...item,
      // Load fast CDN thumbnails in the picker grid; full-res URL is used on selection
      displayUrl: item.thumbnailUrl || item.url,
      triedFallback: false
    }));

    if (append) {
      images.value.push(...normalized);
    } else {
      images.value = normalized;
    }

    nextStartIndex.value = response.data?.nextStartIndex || null;
    hasSearched.value = true;
  } catch (error) {
    console.error('Error searching character images:', error);
    errorMessage.value =
      error.response?.data?.message || 'Failed to fetch character images. Please try again.';
  } finally {
    isLoading.value = false;
  }
}

function handleNewSearch() {
  nextStartIndex.value = null;
  fetchImages(1, false);
}

function loadMoreImages() {
  if (!nextStartIndex.value || isLoading.value) return;
  fetchImages(nextStartIndex.value, true);
}

function handleCandidateError(img) {
  if (!img.triedFallback && img.url && img.displayUrl !== img.url) {
    img.triedFallback = true;
    img.displayUrl = img.url;
  }
}

function selectImage(img) {
  emit('select', img.url || img.thumbnailUrl || img.displayUrl);
  emit('close');
}
</script>

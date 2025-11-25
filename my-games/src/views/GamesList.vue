<template>
  <div>
    <div
      class="mx-auto mb-10 mt-28 flex h-10 items-center justify-start border-b-2 bg-gray-100 leading-4 ring-blue-600 min-w-sm max-w-2xl rounded-md focus-within:ring focus-within:ring-offset-2 focus-within:border-none">
      <input placeholder="Search" class="peer ml-2 flex-grow bg-transparent text-gray-500 outline-none"
        v-model="searchGame" />
      <button type="button"
        class="peer-focus:mr-2 z-20 cursor-pointer text-blue-600 outline-none duration-150 hover:scale-125">
        <svg class="h-6 w-6 stroke-2" viewBox="0 0 32 32" fill="none">
          <circle cx="15" cy="14" r="8" stroke="currentColor" fill="transparent"></circle>
          <line x1="21.1514" y1="19.7929" x2="26.707" y2="25.3484" stroke="currentColor" fill="transparent"></line>
        </svg>
      </button>
      <label class="flex-shrink-0 focus-within:ring h-full rounded-md bg-gray-200 ring-emerald-200 ml-2" for="category">
        <div class="relative">
          <select
            class="flex items-center justify-center bg-transparent px-6 pt-3 pb-4 outline-none w-full appearance-none"
            name="category" id="category" v-model="selectedGenre">
            <option class="peer ml-2 flex-grow bg-transparent text-gray-500 outline-none" v-for="genre in genres"
              :value="genre">{{ genre }}</option>
          </select>
        </div>
      </label>

      <!-- Sort Controls -->
      <label class="flex-shrink-0 focus-within:ring h-full rounded-md bg-gray-200 ring-emerald-200 ml-2" for="sort">
        <div class="relative">
          <select
            class="flex items-center justify-center bg-transparent px-6 pt-3 pb-4 outline-none w-full appearance-none"
            name="sort" id="sort" v-model="sortOption">
            <option value="dateStart">Date Start</option>
            <option value="ratings.main">Full Score</option>
            <option value="ratings.story">Story Score</option>
            <option value="ratings.ost">OST Score</option>
            <option value="ratings.art">Art Score</option>
            <option value="ratings.gameplay">Gameplay Score</option>
          </select>
        </div>
      </label>

      <button type="button" @click="toggleSortDirection"
        class="ml-2 p-1.5 rounded-md bg-gray-200 hover:bg-gray-300 focus:outline-none flex items-center justify-center w-10">
        <span v-if="sortDirection === 'asc'" class="text-lg font-bold">↑</span>
        <span v-else class="text-lg font-bold">↓</span>
      </button>

    </div>

  </div>



  <div class="list-view container mx-auto" id="scrollbar-content">
    <TransitionGroup ref="listContainerRef" name="list" tag="ul" :css="false" @before-enter="onBeforeEnter"
      @enter="onEnter" @leave="onLeave">
      <li v-for="(game, index) in filteredGameList" :key="game.title" :data-index="index">
        <router-link :to="`/game-view/${game._id}`" class="link-class">
          <div class="actual-list">
            <figure class="score-img">
              <img :src="game.characters[0].picture_url" alt="cover" loading="lazy">
              <figcaption>{{ getDisplayRating(game) }}</figcaption>
            </figure>
            <h3 class="list-title">{{ game.title }}</h3>
            <div class="list-description">
              <p class="list-description-text">
                {{ game.description }}
              </p>
            </div>
          </div>
        </router-link>
      </li>
    </TransitionGroup>
  </div>
  <div v-if="authStore.isLoggedIn" class="fixed top-4 left-4">
    <router-link :to="{ name: 'upload-game' }"
      class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
      Upload Game
    </router-link>
  </div>
</template>

<style scoped>
@import 'gamesList.css';
</style>

<script setup>

import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import gsap from 'gsap';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { buildApiUrl } from '@/config/api';

const authStore = useAuthStore();

const games = ref([]);
const displayedCount = ref(10); // Number of games to display

async function fetchGames() {
  try {
    const response = await axios.get(buildApiUrl('/api/games/user/games')); // Fetch all games by user
    games.value = response.data;
  } catch (error) {
    console.error('Error fetching games:', error.response ? error.response.data : error.message);
  }
}

onMounted(fetchGames); // Call fetchGames when the component mounts

const searchGame = ref('');
const listContainerRef = ref(null);

const genres = ["All Genres", "JRPG", "RPG", "Roguelite", "RTS", "MOBA", "FPS", "Action Adventure", "CRPG", "SoulsLike"]
const selectedGenre = ref('All Genres'); // Stores the selected genre

const sortOption = ref('ratings.main');
const sortDirection = ref('desc');

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
};

const getDisplayRating = (game) => {
  if (sortOption.value === 'dateStart') {
    return game.ratings.main;
  }
  if (sortOption.value.startsWith('ratings.')) {
    const key = sortOption.value.split('.')[1];
    return game.ratings[key];
  }
  return game.ratings.main;
};

// This computed property filters the entire list of games.
const fullyFilteredList = computed(() => {
  const searchTerm = searchGame.value.toLowerCase();
  let filtered = games.value.filter(game => {
    // Filter by genre only if selectedGenre is not 'All Genres'
    if (selectedGenre.value !== 'All Genres') {
      return game.genre === selectedGenre.value;
    } else {
      return true; // If 'All Genres' is selected, show all games
    }
  });

  filtered = filtered.filter(game =>
    game.title.toLowerCase().includes(searchTerm)
  );

  // Sorting Logic
  return filtered.sort((a, b) => {
    let valueA, valueB;

    if (sortOption.value.includes('.')) {
      const parts = sortOption.value.split('.');
      valueA = a[parts[0]] ? a[parts[0]][parts[1]] : 0;
      valueB = b[parts[0]] ? b[parts[0]][parts[1]] : 0;
    } else {
      valueA = a[sortOption.value];
      valueB = b[sortOption.value];
    }

    // Handle Date objects if sorting by dateStart
    if (sortOption.value === 'dateStart') {
      valueA = valueA ? new Date(valueA).getTime() : 0;
      valueB = valueB ? new Date(valueB).getTime() : 0;
    }

    if (valueA < valueB) return sortDirection.value === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });
});

// This computed property creates the paginated list for rendering.
const filteredGameList = computed(() => {
  return fullyFilteredList.value.slice(0, displayedCount.value);
});

// When filters change, reset the displayed count to the initial page size.
watch([searchGame, selectedGenre, sortOption, sortDirection], () => {
  displayedCount.value = 10;
});

const handleScroll = () => {
  // Add a buffer to trigger loading before reaching the absolute bottom
  const buffer = 100;
  const atBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - buffer;

  if (atBottom) {
    // Check if there are more games to load from the filtered list
    if (displayedCount.value < fullyFilteredList.value.length) {
      displayedCount.value += 10; // Load 10 more games
    }
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

function onBeforeEnter(el) {
  el.style.opacity = 0;
  el.style.height = 0;
}

function onEnter(el, done) {
  gsap.set(el, { height: 0, opacity: 0 }); // Set initial state for smooth GSAP animation
  gsap.to(el, {
    opacity: 1,
    height: "auto", // Use 'auto' to let the content determine the height
    duration: 0.3,  // Add duration for smooth transition
    onComplete: () => {
      updateContainerHeight();
      done();
    }
  });
}

function onLeave(el, done) {
  gsap.to(el, {
    opacity: 0,
    height: 0,
    duration: 0.3,
    onComplete: () => {
      updateContainerHeight();
      done();
    }
  });
}

function updateContainerHeight() {
  if (listContainerRef.value) {
    gsap.to(listContainerRef.value, {
      height: listContainerRef.value.scrollHeight, // Update the container height
      duration: 0.3
    });
  }
}

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

</script>

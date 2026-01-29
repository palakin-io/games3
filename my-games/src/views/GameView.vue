<template>
    <div v-if="gameData">
        <div class="relative w-full h-svh" id="home">
            <div class="absolute inset-0 opacity-70">
                <img :src="wallpaperImg" alt="Background Image" class="object-cover object-center w-full h-full" />

            </div>
            <div class="absolute inset-9 flex flex-col md:flex-row items-center justify-between">
                <div class="md:w-1/2 mb-4 md:mb-0">
                    <div class=" text-white md:text-5xl py-4 font-bold">{{ gameData.ratings.main }} </div>
                    <div class="bg-white text-7xl font-bold text-black mix-blend-screen px-10 py-5 inline-block">
                        <h1>{{ gameData.title }}</h1>
                    </div>
                    <p class="font-regular text-xl my-4 font-semibold">
                        <span class="bg-white px-2 py-1">
                            {{ gameData.description }}
                        </span>
                    </p>
                    <router-link v-if="authStore.isLoggedIn" :to="{ name: 'edit-game', params: { id: gameId } }"
                        class="px-6 py-3 bg-[#c8a876] text-white font-medium rounded-full hover:bg-[#c09858]  transition duration-200 bottom-4 right-4 absolute">
                        EditGame
                    </router-link>
                </div>
            </div>
        </div>
        <section class="text-gray-700 body-font mt-10">
            <div class="flex justify-center text-3xl font-bold text-gray-300 text-center">
                Scores
            </div>
            <div class="container px-5 py-12 mx-auto">
                <div class="flex flex-wrap text-center justify-center">
                    <div class="p-4 md:w-1/4 sm:w-1/2">
                        <div class="px-4 py-6 transform transition duration-500 hover:scale-110">
                            <div class="flex justify-center">
                                <div :class="classes.scoreNumber">{{ gameData.ratings.story }}</div>
                            </div>
                            <h2 :class="classes.scoreTitle">STORY</h2>
                        </div>
                    </div>

                    <div class="p-4 md:w-1/4 sm:w-1/2">
                        <div class="px-4 py-6 transform transition duration-500 hover:scale-110">
                            <div class="flex justify-center">
                                <div :class="classes.scoreNumber">{{ gameData.ratings.ost }}</div>
                            </div>
                            <h2 :class="classes.scoreTitle">OST</h2>
                        </div>
                    </div>

                    <div class="p-4 md:w-1/4 sm:w-1/2">
                        <div class="px-4 py-6 transform transition duration-500 hover:scale-110">
                            <div class="flex justify-center">
                                <div :class="classes.scoreNumber">{{ gameData.ratings.art }}</div>
                            </div>
                            <h2 :class="classes.scoreTitle">ART</h2>
                        </div>
                    </div>

                    <div class="p-4 md:w-1/4 sm:w-1/2">
                        <div class="px-4 py-6 transform transition duration-500 hover:scale-110">
                            <div class="flex justify-center">
                                <!-- <img src="https://image3.jdomni.in/banner/13062021/EB/99/EE/8B46027500E987A5142ECC1CE1_1623567959360.png?output-format=webp" class="w-32 mb-3"> -->
                                <div :class="classes.scoreNumber">{{ gameData.ratings.gameplay }}</div>
                            </div>
                            <h2 :class="classes.scoreTitle">GAMEPLAY</h2>
                        </div>
                    </div>

                </div>
            </div>
        </section>

        <hr class="separation">

        <section class="text-gray-700 body-font mt-10 mb-10">
            <div class="flex justify-center text-3xl font-bold text-gray-300 text-center">
                Characters
            </div>
            <div class="flex flex-wrap justify-center gap-4 p-4">
                <div class="flex flex-wrap -m-2 w-full">
                    <div class="w-1/2 md:w-1/4 p-2" v-for="chars of gameData.characters">
                        <cards :title="chars.name" :img="chars.picture_url"></cards>
                    </div>
                </div>
            </div>
        </section>

        <hr class="separation">

        <section class="text-gray-700 body-font mt-10 mb-10">
            <div class="flex justify-center text-3xl font-bold text-gray-300 text-center">
                Soundtracks
            </div>
            <div class="container mx-auto border border-dotted rounded mt-8 mb-8">
                <div class="min-w-xl mx-auto md:max-w-lg p-10">
                    <ul class="flex flex-col gap-5 text-xl text-gray-300">
                        <li v-for="osts of gameData.soundtracks"
                            class="border-b border-black rounded-sm cursor-pointer hover:text-white hover:bg-orange-600">
                            <a href="#" @click.prevent="openModal(osts.video_url)">{{ osts.title }}</a>
                        </li>
                    </ul>
                </div>
            </div>
            <modal v-if="showModal" @close="handleClose">
                <iframe width="880" height="650" :src="modalUrl" title="YouTube video player" frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            </modal>
        </section>

        <hr class="separation">

        <section class="text-gray-700 body-font mt-10 mb-10">
            <div class="flex justify-center text-3xl font-bold text-gray-300 text-center">
                Extra Info
            </div>
            <accordion title="Dates">
                <div class="flex flex-col md:flex-row items-center justify-around py-6 text-gray-700">
                    <div class="flex flex-col items-center">
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Start Date</span>
                        <span class="text-2xl font-bold text-gray-800">{{ formatDate(gameData.dateStart) }}</span>
                    </div>

                    <div v-if="durationDays !== null"
                        class="flex flex-col items-center mx-8 my-6 md:my-0 flex-grow w-full md:w-auto">
                        <span class="text-sm font-bold text-[#c8a876] mb-2">{{ durationDays }} Days</span>
                        <div class="w-full md:w-48 h-1 bg-gray-200 rounded-full relative overflow-hidden">
                            <div class="absolute top-0 left-0 h-full bg-[#c8a876] rounded-full w-full"></div>
                        </div>
                    </div>

                    <div class="flex flex-col items-center">
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">End Date</span>
                        <span class="text-2xl font-bold text-gray-800">{{ formatDate(gameData.dateEnd) }}</span>
                    </div>
                </div>
            </accordion>
            <accordion title="Trailer">
                <iframe width="100%" height="650" :src="trailerURL" title="YouTube video player" frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            </accordion>
            <accordion title="Wiki"></accordion>
        </section>
    </div>
    <div v-else>
        <div aria-label="Loading..." role="status" class="flex items-center space-x-2">
            <svg class="h-20 w-20 animate-spin stroke-gray-500" viewBox="0 0 256 256">
                <line x1="128" y1="32" x2="128" y2="64" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="24"></line>
                <line x1="195.9" y1="60.1" x2="173.3" y2="82.7" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="24"></line>
                <line x1="224" y1="128" x2="192" y2="128" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="24">
                </line>
                <line x1="195.9" y1="195.9" x2="173.3" y2="173.3" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="24"></line>
                <line x1="128" y1="224" x2="128" y2="192" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="24">
                </line>
                <line x1="60.1" y1="195.9" x2="82.7" y2="173.3" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="24"></line>
                <line x1="32" y1="128" x2="64" y2="128" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="24"></line>
                <line x1="60.1" y1="60.1" x2="82.7" y2="82.7" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="24">
                </line>
            </svg>
            <span class="text-4xl font-medium text-gray-500">Loading...</span>
        </div>
    </div>

</template>

<style scoped>
.separation {
    width: 100%;
    height: 0.5rem;
    margin: 1rem 0;
    background-color: #ff8c00;
    border-radius: 1rem;
}

.bg-white {
    opacity: 0.8;
    /* Adjust this value between 0 (transparent) and 1 (opaque) */
}
</style>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios'
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { buildApiUrl } from '@/config/api';

import Cards from '@/components/CardView.vue'
import Modal from '@/components/Modal.vue';
import Accordion from '@/components/Accordion.vue'

const classes = ref({
    scoreTitle: 'title-font font-regular text-2xl text-gray-200 mt-6',
    scoreNumber: 'rounded-full w-24 h-24 border-4 border-[#c8a876] text-[#c8a876] flex items-center justify-center  text-3xl font-semibold'
})

const authStore = useAuthStore();

const route = useRoute();
const gameId = route.params.gameID;
const gameData = ref(null);

const trailerURL = ref('');
const wallpaperImg = ref("");
async function fetchGameData() {
    try {
        const response = await axios.get(buildApiUrl(`/api/games/${gameId}`), {
            headers: {
                'Access-Control-Allow-Origin': '*' // Allows requests from any origin (adjust in production)
            }
        });
        gameData.value = response.data;
        trailerURL.value = embedVideoUrl(gameData.value.trailer_url)
        wallpaperImg.value = `${buildApiUrl('')}${gameData.value.wallpaper}`;
        console.log(gameData.value);
        console.log("gameID: " + gameId);
    } catch (error) {
        console.error('Error fetching game data:', error);
        // Handle error (e.g., set an error state for display)
    }
}

onMounted(fetchGameData)

const embedVideoUrl = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    let embededURL = '';
    if (match && match[1]) {
        const videoId = match[1];
        embededURL = `https://www.youtube.com/embed/${videoId}`;
        return embededURL;
    } else {
        console.error('Invalid YouTube URL');
    }
}

const showModal = ref(false);
const modalUrl = ref('')
const openModal = (videoUrl) => {
    showModal.value = true;
    modalUrl.value = embedVideoUrl(videoUrl);
}
const handleClose = () => {
    showModal.value = false;
}

const router = useRouter();

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const durationDays = computed(() => {
    if (!gameData.value || !gameData.value.dateStart || !gameData.value.dateEnd) return null;
    const start = new Date(gameData.value.dateStart);
    const end = new Date(gameData.value.dateEnd);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

</script>
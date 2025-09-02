<template>
    <side-slide :is-open="isOpen" :panel-title="panelTitle" @close="isOpen = false">
        <div v-if="panelTitle === 'Characters'">
            <div class="container">
                <div class="mb-4">
                    <form-input v-model="newCharacter.name" label="Name" type="text" name="name" required="true" :value="newCharacter.name"></form-input>
                    <form-input v-model="newCharacter.picture_url" label="Img URL" type="text" name="URL" required="true" :value="newCharacter.picture_url"></form-input>
                    <button @click="addCharacter()" class="mt-2 bg-indigo-500 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700">
                        {{ isEditing ? 'Save Changes' : 'Add' }}
                    </button>
                </div>
            </div>
            <div v-if="game.characters.length > 0" class="container mx-auto px-4 border-dashed border-2 border-sky-500 min-h-10 rounded-md flex flex-row flex-wrap justify-around">
                <div v-for="g in game.characters" class="w-2/5 rounded overflow-hidden shadow-lg bg-gray-100 my-2 basis-1/3">
                    <img class="w-full aspect-w-4 aspect-h-3" :src="g.picture_url" alt="Image Description">
                    <div class="px-3 py-1 flex justify-between">
                        <button @click="eraseChar(g.name)" class="text-red-600 inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                                <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
                            </svg>
                        </button> 
                        <button @click="editChar(g)" class="text-indigo-400 inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <div class="container">
                <div class="mb-4">
                    <form-input v-model="newSoundtrack.title" label="Title" type="text" name="title" required="true" :value="newSoundtrack.title"></form-input>
                    <form-input v-model="newSoundtrack.video_url" label="Video URL" type="text" name="URL" required="true" :value="newSoundtrack.video_url"></form-input>
                    <button @click="addSoundtrack()" class="mt-2 bg-indigo-500 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700">
                        Add
                    </button>
                </div>
            </div>
            <div v-if="game.soundtracks.length > 0" class="container mx-auto px-4 border-dashed border-2 border-sky-500 min-h-10 rounded-md flex flex-row flex-wrap justify-around">
                <div v-for="ost in game.soundtracks" class="w-2/5 rounded overflow-hidden shadow-lg bg-gray-100 my-2 basis-1/3">
                    <div class="aspect-w-4 aspect-h-4"> 
                        <iframe width="100%" height="100%" :src="ost.video_url" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                    <div class="px-3 py-1 flex justify-between">
                        <button @click="eraseOst(ost.title)" class="text-red-600 inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                                <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
                            </svg>
                        </button> 
                        <button @click="editOst(ost)" class="text-indigo-400 inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </side-slide>
    <form @submit.prevent="submitForm" class="container mx-auto mt-8 mb-8 p-6 bg-gray-100 rounded-lg shadow-md">
        <div class="mb-4">
            <!-- <form-input v-model="game.title" label="Game Title" type="text" name="title" required="true" :value="game.title"></form-input> -->
             <SearchInput v-model="game.title" label="Game Title" type="text" name="title" required="true" :value="game.title"></SearchInput>
        </div>

        <div class="mb-4">
            <label for="description" class="block text-gray-700 font-medium mb-2">Description:</label>
            <textarea
                v-model="game.description" 
                id="description" 
                required="true"
                class="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="4" 
            ></textarea>
        </div>

        <div class="mb-4">
            <drag-and-drop label="Cover Image" @update:modelValue="updateImage"></drag-and-drop>
        </div>

        <div class="mb-4">
            <select-input name="genre" v-model="game.genre" :items="genres" required="required" label="Genre" :value="game.genre"></select-input>
        </div>

        <!-- Subgenres Section -->
        <div class="mb-4">
            <label class="block text-gray-700 font-medium mb-2">Subgenres:</label>
            <div class="flex flex-wrap gap-2">
                <span v-for="sub in subgenresList" :key="sub" @click="toggleSubgenre(sub)"
                    :class="['cursor-pointer px-3 py-1 rounded-full border', game.subgenres.includes(sub) ? 'bg-indigo-500 text-white border-indigo-700' : 'bg-gray-200 text-gray-700 border-gray-400', 'transition-colors duration-200']">
                    {{ sub }}
                </span>
            </div>
        </div>


        <div class="mb-4">
            <label for="description" class="block text-gray-700 font-medium mb-2">Scores:</label>
            <p v-if="game.ratings.main != 1 && game.ratings.main" class="block text-gray-700 font-medium mb-2">main: </p>
            <div class="columns-4">
                <SelectInput name="story" v-model="game.ratings.story" :items="scores" required="required" label="Story" :value="game.ratings.story"></SelectInput>
                <SelectInput name="ost" v-model="game.ratings.ost" :items="scores" required="required" label="Ost" :value="game.ratings.ost"></SelectInput>
                <SelectInput name="art" v-model="game.ratings.art" :items="scores" required="required" label="Art" :value="game.ratings.art"></SelectInput>
                <SelectInput name="gameplay" v-model="game.ratings.gameplay" :items="scores" required="required" label="Gameplay" :value="game.ratings.gameplay"></SelectInput>
            </div>
        </div>

        <div class="mb-4 columns-2">
            <div> 
                <label class="block text-gray-700 font-medium mb-2">Start Date</label>
                <flat-pickr
                    v-model="game.dateStart"
                    :config="config"
                    class="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Select date"
                    name="date"
                />
            </div>
            <div> 
                <label class="block text-gray-700 font-medium mb-2">End Date</label>
                <flat-pickr
                    v-model="game.dateEnd"
                    :config="config"
                    class="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Select date"
                    name="date"
                />
            </div>
        </div>

        <div class="mb-4 columns-2">
            <div>
                <button @click="openSideSlide('Characters')" type="button" class="bg-indigo-700 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Characters
                </button>
            </div>
            <div>
                <button @click="openSideSlide('Soundtracks')" type="button" class="bg-indigo-700 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Soundtracks
                </button>
            </div>
        </div>

        <div class="mb-4 columns-2">
            <form-input v-model="game.trailer_url" label="Game Trailer" type="text" name="trailer" required="true" :value="game.trailer_url"></form-input>
            <form-input v-model="game.wiki_url" label="Game Wiki" type="text" name="wiki" required="true" :value="game.wiki_url"></form-input>
        </div>

        <button type="submit" class="bg-indigo-500 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700">
            Upload
        </button>
        <div v-if="isLoading">
            <div aria-label="Loading..." role="status" class="flex items-center space-x-2">
                <svg class="h-20 w-20 animate-spin stroke-gray-500" viewBox="0 0 256 256">
                    <line x1="128" y1="32" x2="128" y2="64" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
                    <line x1="195.9" y1="60.1" x2="173.3" y2="82.7" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="24"></line>
                    <line x1="224" y1="128" x2="192" y2="128" stroke-linecap="round" stroke-linejoin="round" stroke-width="24">
                    </line>
                    <line x1="195.9" y1="195.9" x2="173.3" y2="173.3" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="24"></line>
                    <line x1="128" y1="224" x2="128" y2="192" stroke-linecap="round" stroke-linejoin="round" stroke-width="24">
                    </line>
                    <line x1="60.1" y1="195.9" x2="82.7" y2="173.3" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="24"></line>
                    <line x1="32" y1="128" x2="64" y2="128" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
                    <line x1="60.1" y1="60.1" x2="82.7" y2="82.7" stroke-linecap="round" stroke-linejoin="round" stroke-width="24">
                    </line>
                </svg>
                <span class="text-4xl font-medium text-gray-500">Updating...</span>
            </div>
        </div>
    </form>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import 'flatpickr/dist/themes/dark.css';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { buildApiUrl } from '@/config/api';


import FormInput from '@/components/misc/FormInput.vue';
import DragAndDrop from '@/components/misc/DragAndDrop.vue';
import SelectInput from '@/components/misc/SelectInput.vue';
import SideSlide from '@/components/SideSlide.vue'
import SearchInput from '@/components/misc/SearchInput.vue';


const genres = ["JRPG", "RPG", "Roguelite", "RTS", "MOBA", "FPS", "Action Adventure", "CRPG", "SoulsLike"]
const subgenresList = [
    "Open World", "Turn-Based", "Tactical", "Platformer", "Metroidvania", "Puzzle", "Stealth", "Sandbox", "Survival", "Horror", "Shooter", "Fighting", "Simulation", "Strategy", "Card Game", "Party", "Sports", "Rhythm", "Adventure", "Narrative", "Indie", "MMO", "Co-op", "Singleplayer", "Multiplayer"
]
const scores = [1, 2, 3, 4, 5,6,7,8,9,10]

const game = ref({
    title: '',
    wallpaper: null,
    description: '',
    genre: '',
    subgenres: [],
    characters: [],
    ratings: {
        main: null,
        story: null,
        ost: null,
        art: null,
        gameplay: null
    },
    dateStart: null,
    dateEnd: null,
    soundtracks: [],
    trailer_url: '',
    wiki_url: ''
});
// Subgenre badge toggle logic
function toggleSubgenre(sub) {
    const idx = game.value.subgenres.indexOf(sub);
    if (idx === -1) {
        game.value.subgenres.push(sub);
    } else {
        game.value.subgenres.splice(idx, 1);
    }
}

const config = ref({
    wrap: false, // set wrap to true only when using 'input-group'
    altFormat: 'M j, Y',
    altInput: true,
    dateFormat: 'Y-m-d', // Output format for backend        
});

const isOpen = ref(false);
const panelTitle = ref();
function openSideSlide(slideName){
    console.log(slideName);
    panelTitle.value = slideName;
    isOpen.value = true;
}

const newCharacter = ref({
    name: '',
    picture_url: ''
})
const isEditing = ref(false);
const characterBeingEdited = ref(null);
function addCharacter() {
    if (isEditing.value) {
        const index = game.value.characters.findIndex(c => c === characterBeingEdited.value);
        if (index !== -1) {
            game.value.characters[index] = { ...newCharacter.value };
            isEditing.value = false;
            characterBeingEdited.value = null;
        }
    } else {
        game.value.characters.push({ ...newCharacter.value });
    }
    newCharacter.value.name = '';
    newCharacter.value.picture_url = '';
}
function eraseChar(name) {
    game.value.characters = game.value.characters.filter(char => char.name !== name);
}
function editChar(character) {
  newCharacter.value.name = character.name;
  newCharacter.value.picture_url = character.picture_url;
  isEditing.value = true;
  characterBeingEdited.value = character;
}

const ostBeingEdited = ref(null);
function eraseOst(title) {
    game.value.soundtracks = game.value.soundtracks.filter(ost => ost.title !== title);
}
function editOst(ost) {
    newSoundtrack.value.title = ost.title;
    newSoundtrack.value.video_url = ost.video_url;
    isEditing.value = true;
    ostBeingEdited.value = ost;
}
const newSoundtrack = ref({
    title: '',
    video_url: ''
})
function addSoundtrack() {
    if (isEditing.value) {
        const index = game.value.soundtracks.findIndex(s => s === ostBeingEdited.value);
        if (index !== -1) {
            game.value.soundtracks[index] = { ...newSoundtrack.value };
            isEditing.value = false;
            ostBeingEdited.value = null;
        }
    } else {
        game.value.soundtracks.push({ ...newSoundtrack.value });
    }
    newSoundtrack.value.title = '';
    newSoundtrack.value.video_url = '';
}

const coverImg = ref(null)
function updateImage(fileData) {
    coverImg.value = fileData;
    console.log(coverImg.value);
}

// Watch for changes in the coverImg
watch(coverImg, (newFile) => {
  game.value.wallpaper = newFile;
});

const isLoading = ref(false);
const router = useRouter();
const submitForm = async () => {
    try {
        isLoading.value = true;
        const formData = new FormData();

        // 1. Calculate Average Rating (Allowing Decimals)
        const validRatings = Object.values(game.value.ratings).filter(rating => !isNaN(parseFloat(rating))); // Parse as floats
        const totalRating = validRatings.reduce((sum, rating) => sum + parseFloat(rating), 0);
        const averageRating = validRatings.length > 0 ? (totalRating / validRatings.length).toFixed(1) : 0; // Calculate average with 1 decimal place

        // Assign the average to the 'main' rating
        game.value.ratings.main = parseFloat(averageRating); // Store as float

        // 2. Append Form Fields (Including Correctly Formatted characters, soundtracks, and subgenres)
        for (const key in game.value) {
            if (key !== 'wallpaper') {  
                if (Array.isArray(game.value[key]) && key !== 'subgenres') {
                    if (key === 'characters' || key === 'soundtracks') {
                        // Correctly format characters and soundtracks as arrays of objects
                        formData.append(key, JSON.stringify(game.value[key]));
                    } else {
                        // Other arrays (if any)
                        game.value[key].forEach((item, index) => {
                            formData.append(`${key}[${index}]`, JSON.stringify(item));
                        });
                    }
                } else if (key === 'subgenres') {
                    // Send subgenres as an array
                    game.value.subgenres.forEach((sub, idx) => {
                        formData.append(`subgenres[${idx}]`, sub);
                    });
                } else if (key === 'ratings') {
                    // Append rating fields with dot notation
                    for (const ratingKey in game.value.ratings) {
                        formData.append(`ratings.${ratingKey}`, game.value.ratings[ratingKey]);
                    }
                } else {
                    formData.append(key, game.value[key]);
                }
            }
        }

        // 3. Append Wallpaper (if available)
        if (coverImg.value) {
            const fileData = coverImg.value;
            // Extract data and type from Proxy
            const base64Data = fileData.data;
            const fileType = fileData.type;
            const fileName = fileData.name;

            // Convert Base64 to Blob
            const byteCharacters = atob(base64Data.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: fileType });

            // Create File object from Blob
            const file = new File([blob], fileName, { type: fileType });

            // Append File object to FormData
            formData.append("wallpaper", file, fileName);
        }

        
        console.log('FormData:', formData);  // Log the FormData object before sending


        const response = await axios.post(buildApiUrl('/api/games/upload'), formData, { 
            headers: {
                'Content-Type': 'multipart/form-data' // Important for file uploads
            }
        });

        console.log('Game uploaded successfully:', response.data);
        isLoading.value = false;
        router.push('/games-list')
        // Clear the form, redirect, or show a success message
    } catch (error) {
        console.error('Error uploading game:', error.response ? error.response.data : error.message);
        // Handle the error appropriately
    }
};
</script>

<style>

</style>
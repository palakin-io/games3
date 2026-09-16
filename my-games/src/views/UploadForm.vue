<template>
    <div class="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        
        <!-- Side Slide for Characters and Soundtracks -->
        <side-slide :is-open="isOpen" :panel-title="panelTitle" @close="isOpen = false">
            <div v-if="panelTitle === 'Characters'">
                <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 mb-6">
                    <h4 class="text-sm font-bold text-slate-200 mb-3">{{ isEditingChar ? 'Edit Character' : 'Add New Character' }}</h4>
                    <div class="space-y-3">
                        <form-input v-model="newCharacter.name" label="Character Name" type="text" name="char_name" placeholder="e.g. Cloud Strife"></form-input>
                        <form-input v-model="newCharacter.picture_url" label="Image URL" type="text" name="char_url" placeholder="https://..."></form-input>
                        <button type="button" @click="addCharacter()" class="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md">
                            {{ isEditingChar ? 'Save Changes' : '+ Add Character' }}
                        </button>
                    </div>
                </div>

                <div v-if="game.characters.length > 0" class="space-y-3">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Added Characters ({{ game.characters.length }})</h4>
                    <div class="grid grid-cols-2 gap-3">
                        <div v-for="c in game.characters" :key="c.name" class="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-md flex flex-col justify-between">
                            <img v-if="c.picture_url" :src="c.picture_url" class="w-full h-32 object-cover" alt="Character">
                            <div class="p-2.5">
                                <span class="text-xs font-bold text-slate-100 block truncate">{{ c.name }}</span>
                                <div class="flex justify-between mt-2 pt-2 border-t border-slate-700/60">
                                    <button type="button" @click="editChar(c)" class="text-xs text-indigo-400 hover:text-indigo-300 font-medium">Edit</button>
                                    <button type="button" @click="eraseChar(c.name)" class="text-xs text-red-400 hover:text-red-300 font-medium">Remove</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="panelTitle === 'Soundtracks'">
                <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 mb-6">
                    <h4 class="text-sm font-bold text-slate-200 mb-3">{{ isEditingOst ? 'Edit Soundtrack' : 'Add New Soundtrack' }}</h4>
                    <div class="space-y-3">
                        <form-input v-model="newSoundtrack.title" label="Track Title" type="text" name="ost_title" placeholder="e.g. One-Winged Angel"></form-input>
                        <form-input v-model="newSoundtrack.video_url" label="YouTube or Audio/Video URL" type="text" name="ost_url" placeholder="https://www.youtube.com/watch?v=..."></form-input>
                        <button type="button" @click="addSoundtrack()" class="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md">
                            {{ isEditingOst ? 'Save Changes' : '+ Add Soundtrack' }}
                        </button>
                    </div>
                </div>

                <div v-if="game.soundtracks.length > 0" class="space-y-4">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Added Soundtracks ({{ game.soundtracks.length }})</h4>
                    <div v-for="ost in game.soundtracks" :key="ost.title" class="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-md">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-semibold text-amber-400 truncate">♪ {{ ost.title }}</span>
                            <div class="flex items-center gap-2">
                                <button type="button" @click="editOst(ost)" class="text-xs text-indigo-400 hover:text-indigo-300 font-medium">Edit</button>
                                <button type="button" @click="eraseOst(ost.title)" class="text-xs text-red-400 hover:text-red-300 font-medium">Remove</button>
                            </div>
                        </div>

                        <!-- Live Soundtrack Player Preview -->
                        <div v-if="getParsedMedia(ost.video_url).type === 'youtube'" class="aspect-video w-full rounded-lg overflow-hidden border border-slate-700">
                            <iframe class="w-full h-full" :src="getParsedMedia(ost.video_url).embedUrl" title="Soundtrack player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                        <div v-else-if="getParsedMedia(ost.video_url).type === 'video'" class="w-full">
                            <video controls class="w-full rounded-lg max-h-40 border border-slate-700" :src="getParsedMedia(ost.video_url).embedUrl"></video>
                        </div>
                        <div v-else-if="getParsedMedia(ost.video_url).type === 'audio'" class="w-full">
                            <audio controls class="w-full mt-1" :src="getParsedMedia(ost.video_url).embedUrl"></audio>
                        </div>
                        <div v-else class="text-xs text-slate-400 truncate">
                            <a :href="ost.video_url" target="_blank" rel="noopener" class="text-indigo-400 hover:underline">{{ ost.video_url }}</a>
                        </div>
                    </div>
                </div>
            </div>
        </side-slide>

        <!-- Main Form Card -->
        <div class="max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
            <div class="border-b border-slate-800 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-white tracking-tight uppercase">Upload New Game</h1>
                    <p class="text-slate-400 text-sm mt-1">Add a new game entry to your personal showcase collection.</p>
                </div>
                <router-link to="/games-list" class="self-start sm:self-auto text-xs font-semibold text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 transition-colors">
                    ← Back to Games List
                </router-link>
            </div>

            <form @submit.prevent="submitForm" class="space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <!-- Left Column -->
                    <div class="space-y-6">
                        <!-- Title -->
                        <SearchInput v-model="game.title" label="Game Title" type="text" name="title" required="true"></SearchInput>

                        <!-- Description -->
                        <div>
                            <label for="description" class="block text-slate-300 font-medium mb-1.5 text-sm">Description:</label>
                            <textarea
                                v-model="game.description" 
                                id="description" 
                                required
                                rows="5" 
                                placeholder="Enter game synopsis or overall impressions..."
                                class="bg-slate-800 border border-slate-700 rounded-lg p-3.5 w-full text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
                            ></textarea>
                        </div>

                        <!-- Main Genre -->
                        <SelectInput name="genre" v-model="game.genre" :items="genres" required="true" label="Main Genre"></SelectInput>

                        <!-- Subgenres Badges -->
                        <div>
                            <label class="block text-slate-300 font-medium mb-2 text-sm">Subgenres:</label>
                            <div class="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-2 bg-slate-950/40 border border-slate-800 rounded-xl">
                                <span v-for="sub in subgenresList" :key="sub" @click="toggleSubgenre(sub)"
                                    :class="[
                                        'cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 select-none',
                                        game.subgenres.includes(sub) 
                                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20' 
                                            : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:bg-slate-700/60 hover:text-slate-200'
                                    ]">
                                    {{ sub }}
                                </span>
                            </div>
                        </div>

                        <!-- Ratings Breakdown -->
                        <div class="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3">
                            <label class="block text-slate-200 font-bold text-sm">Category Scores (1 - 10):</label>
                            <div class="grid grid-cols-2 gap-3">
                                <SelectInput name="story" v-model="game.ratings.story" :items="scores" required="true" label="Story"></SelectInput>
                                <SelectInput name="ost" v-model="game.ratings.ost" :items="scores" required="true" label="OST"></SelectInput>
                                <SelectInput name="art" v-model="game.ratings.art" :items="scores" required="true" label="Art"></SelectInput>
                                <SelectInput name="gameplay" v-model="game.ratings.gameplay" :items="scores" required="true" label="Gameplay"></SelectInput>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column -->
                    <div class="space-y-6">
                        <!-- Cover Image Dropzone with Instant Preview -->
                        <div>
                            <label class="block text-slate-300 font-medium mb-1.5 text-sm">Cover Image / Wallpaper:</label>
                            <drag-and-drop label="Cover Image" v-model="coverImg"></drag-and-drop>
                        </div>

                        <!-- Dates -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div> 
                                <label class="block text-slate-300 font-medium mb-1.5 text-sm">Start Date</label>
                                <flat-pickr
                                    v-model="game.dateStart"
                                    :config="config"
                                    class="bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 w-full text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                                    placeholder="Select date"
                                    name="dateStart"
                                />
                            </div>
                            <div> 
                                <label class="block text-slate-300 font-medium mb-1.5 text-sm">End Date</label>
                                <flat-pickr
                                    v-model="game.dateEnd"
                                    :config="config"
                                    class="bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 w-full text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                                    placeholder="Select date"
                                    name="dateEnd"
                                />
                            </div>
                        </div>

                        <!-- Media Actions (Add Characters / Add Soundtracks) -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button @click="openSideSlide('Characters')" type="button" class="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-400 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md">
                                <span>👥</span> Manage Characters ({{ game.characters.length }})
                            </button>
                            <button @click="openSideSlide('Soundtracks')" type="button" class="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md">
                                <span>♪</span> Manage Soundtracks ({{ game.soundtracks.length }})
                            </button>
                        </div>

                        <!-- Trailer & Wiki URLs -->
                        <div class="space-y-4">
                            <form-input v-model="game.trailer_url" label="Game Trailer URL" type="text" name="trailer" placeholder="https://www.youtube.com/..."></form-input>
                            <form-input v-model="game.wiki_url" label="Game Wiki URL" type="text" name="wiki" placeholder="https://wikipedia.org/..."></form-input>
                        </div>
                    </div>
                </div>

                <!-- Submit Button & Loading State -->
                <div class="pt-6 border-t border-slate-800 flex flex-col items-center">
                    <button 
                        type="submit" 
                        :disabled="isLoading"
                        class="w-full max-w-md py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-indigo-500 to-indigo-400 hover:from-indigo-400 hover:to-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 text-base"
                    >
                        <svg v-if="isLoading" class="animate-spin h-5 w-5 text-slate-950" viewBox="0 0 24 24" fill="none">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{{ isLoading ? 'Uploading Game...' : '🚀 Upload Game' }}</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import 'flatpickr/dist/themes/dark.css';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { buildApiUrl } from '@/config/api';
import { parseMediaUrl } from '@/utils/media';

import FormInput from '@/components/misc/FormInput.vue';
import DragAndDrop from '@/components/misc/DragAndDrop.vue';
import SelectInput from '@/components/misc/SelectInput.vue';
import SideSlide from '@/components/SideSlide.vue';
import SearchInput from '@/components/misc/SearchInput.vue';

const router = useRouter();

const genres = ["JRPG", "RPG", "Roguelite", "RTS", "MOBA", "FPS", "Action Adventure", "CRPG", "SoulsLike", "Visual Novel"];
const subgenresList = [
    "Open World", "Turn-Based", "Tactical", "Platformer", "Metroidvania", "Puzzle", "Stealth", "Sandbox", "Survival", "Horror", "Shooter", "Fighting", "Simulation", "Strategy", "Card Game", "Party", "Sports", "Rhythm", "Adventure", "Narrative", "Indie", "MMO", "Co-op", "Singleplayer", "Multiplayer"
];
const scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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

function toggleSubgenre(sub) {
    const idx = game.value.subgenres.indexOf(sub);
    if (idx === -1) {
        game.value.subgenres.push(sub);
    } else {
        game.value.subgenres.splice(idx, 1);
    }
}

const config = ref({
    wrap: false,
    altFormat: 'M j, Y',
    altInput: true,
    dateFormat: 'Y-m-d',
});

const isOpen = ref(false);
const panelTitle = ref('');
function openSideSlide(slideName) {
    panelTitle.value = slideName;
    isOpen.value = true;
}

// Characters handling
const newCharacter = ref({ name: '', picture_url: '' });
const isEditingChar = ref(false);
const charBeingEdited = ref(null);

function addCharacter() {
    if (!newCharacter.value.name) return;
    if (isEditingChar.value && charBeingEdited.value) {
        const index = game.value.characters.findIndex(c => c === charBeingEdited.value);
        if (index !== -1) {
            game.value.characters[index] = { ...newCharacter.value };
        }
        isEditingChar.value = false;
        charBeingEdited.value = null;
    } else {
        game.value.characters.push({ ...newCharacter.value });
    }
    newCharacter.value = { name: '', picture_url: '' };
}

function eraseChar(name) {
    game.value.characters = game.value.characters.filter(char => char.name !== name);
}

function editChar(character) {
    newCharacter.value = { ...character };
    isEditingChar.value = true;
    charBeingEdited.value = character;
}

// Soundtracks handling
const newSoundtrack = ref({ title: '', video_url: '' });
const isEditingOst = ref(false);
const ostBeingEdited = ref(null);

function addSoundtrack() {
    if (!newSoundtrack.value.title || !newSoundtrack.value.video_url) return;
    if (isEditingOst.value && ostBeingEdited.value) {
        const index = game.value.soundtracks.findIndex(s => s === ostBeingEdited.value);
        if (index !== -1) {
            game.value.soundtracks[index] = { ...newSoundtrack.value };
        }
        isEditingOst.value = false;
        ostBeingEdited.value = null;
    } else {
        game.value.soundtracks.push({ ...newSoundtrack.value });
    }
    newSoundtrack.value = { title: '', video_url: '' };
}

function eraseOst(title) {
    game.value.soundtracks = game.value.soundtracks.filter(ost => ost.title !== title);
}

function editOst(ost) {
    newSoundtrack.value = { ...ost };
    isEditingOst.value = true;
    ostBeingEdited.value = ost;
}

function getParsedMedia(url) {
    return parseMediaUrl(url);
}

const coverImg = ref(null);
watch(coverImg, (newFile) => {
    game.value.wallpaper = newFile;
});

const isLoading = ref(false);

const submitForm = async () => {
    try {
        isLoading.value = true;
        const formData = new FormData();

        // 1. Calculate Average Rating
        const validRatings = Object.values(game.value.ratings).filter(rating => rating !== null && !isNaN(parseFloat(rating)));
        const totalRating = validRatings.reduce((sum, rating) => sum + parseFloat(rating), 0);
        const averageRating = validRatings.length > 0 ? (totalRating / validRatings.length).toFixed(1) : 0;
        game.value.ratings.main = parseFloat(averageRating);

        // 2. Append Form Fields
        for (const key in game.value) {
            if (key !== 'wallpaper') {  
                if (Array.isArray(game.value[key]) && key !== 'subgenres') {
                    if (key === 'characters' || key === 'soundtracks') {
                        formData.append(key, JSON.stringify(game.value[key]));
                    } else {
                        game.value[key].forEach((item, index) => {
                            formData.append(`${key}[${index}]`, JSON.stringify(item));
                        });
                    }
                } else if (key === 'subgenres') {
                    game.value.subgenres.forEach((sub, idx) => {
                        formData.append(`subgenres[${idx}]`, sub);
                    });
                } else if (key === 'ratings') {
                    for (const ratingKey in game.value.ratings) {
                        if (game.value.ratings[ratingKey] !== null) {
                            formData.append(`ratings.${ratingKey}`, game.value.ratings[ratingKey]);
                        }
                    }
                } else if (game.value[key] !== null && game.value[key] !== undefined) {
                    formData.append(key, game.value[key]);
                }
            }
        }

        // 3. Append Wallpaper File
        if (coverImg.value && coverImg.value.data) {
            const fileData = coverImg.value;
            const base64Data = fileData.data;
            const fileType = fileData.type;
            const fileName = fileData.name;

            const byteCharacters = atob(base64Data.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: fileType });
            const file = new File([blob], fileName, { type: fileType });

            formData.append("wallpaper", file, fileName);
        }

        const response = await axios.post(buildApiUrl('/api/games/upload'), formData, { 
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('Game uploaded successfully:', response.data);
        isLoading.value = false;
        router.push('/games-list');
    } catch (error) {
        console.error('Error uploading game:', error.response ? error.response.data : error.message);
        isLoading.value = false;
        alert('Failed to upload game. ' + (error.response?.data?.message || 'Please check your input values.'));
    }
};
</script>
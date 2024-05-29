<template>
    <div class="relative h-48 w-full mx-auto mt-12 px-5 py-8 group rounded-3xl bg-gray-200 overflow-hidden shadow-xl">
        <img :src="props.img" :alt="props.title + ' image'" class="absolute w-full h-full inset-0 object-cover">
        <div
            class="absolute inset-0 w-full h-full rounded-3xl bg-black bg-opacity-0 transition duration-500 backdrop-filter group-hover:bg-opacity-20 group-hover:backdrop-blur">
        </div>
        <div class="absolute inset-x-5 text-white">
            <h2 class="text-4xl font-semibold mb-2">{{ props.title }}</h2>
            <p class="hidden group-hover:block"></p>
        </div>
        <button @click="showModal = true" class="absolute inset-x-5 bottom-8 py-3 rounded-2xl font-semibold bg-white shadow-lg hidden transition duration-200 hover:bg-gray-300 group-hover:block">Full Image</button>
    </div>
    <modal v-if="showModal" @close="handleClose">
        <div class="h-full w-full">
            <img :src="props.img" class="w-full h-full" alt="">
        </div>
    </modal>
</template>

<style scoped>

</style>

<script setup>
import { ref } from 'vue';
import Modal from '@/components/Modal.vue'

const showModal = ref(false);
const handleClose = () => {
    showModal.value = false;
}

const props = defineProps({
    title: String,
    img: String
});
</script>
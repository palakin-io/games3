<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue';
import Chatbot from './components/Chatbot.vue';

</script>

<template>
  <Navbar></Navbar>
  <RouterView />
  <Chatbot />
</template>

<style scoped>

</style>

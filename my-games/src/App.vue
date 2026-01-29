<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue';
import Chatbot from './components/Chatbot.vue';
import Footer from './components/Footer.vue';

</script>

<template>
  <Navbar></Navbar>
  <RouterView />
  <Footer />
  <Chatbot />
</template>

<style scoped></style>

<template>
    <div class="navigation">
        <input type="checkbox" class="navigation-checkbox" id="navi-toggle" ref="navToggle"> 
        <label for="navi-toggle" class="navigation-button">
          <span class="navigation-icon"></span>
        </label>
        <div class="navigation-background">&nbsp;</div>

        <nav class="navigation-nav">
            <ul class="navigation-list">
                <!-- <li class="navigation-item"><router-link to="/list-page" class="navigation-link">Anime List</router-link></li> -->
                <li class="navigation-item"><a href="#" class="navigation-link">Tiers</a></li>
                <li class="navigation-item">
                  <router-link to="/games-list" class="navigation-link" @click="closeNavigation">Games List</router-link>
                </li>
                <li class="navigation-item"><a href="#" class="navigation-link">Movies</a></li>
                <!-- <li v-if="token !=''" class="navigation-item"><a href="javascript:void(0)" class="navigation-link" @click="closeNav">Log Out</a></li>
                <li v-else class="navigation-item"><router-link to="/sign-in" class="navigation-link">Sign In</router-link></li> -->
            </ul>
        </nav>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const navToggle = ref(null);

const closeNavigation = () => {
  if (navToggle.value) {
    navToggle.value.checked = false; 
  }
};
</script>

<style scoped>
/* Add your Tailwind CSS classes here */
.navigation-checkbox {
    display: none;
}

.navigation-button {
    background-color: #777;
    height: 5rem;
    width: 5rem;
    position: fixed;
    top: 2.5rem;
    right: 2.5rem;
    border-radius: 50%;
    z-index: 1500;
    box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.1);
    text-align: center;
    cursor: pointer;
}
.navigation-background {
    height: 5rem;
    width: 5rem;
    border-radius: 50%;
    position: fixed;
    top: 2.5rem;
    right: 2.5rem;
    background-image: linear-gradient(#ff8c00, rgb(17, 17, 17));
    z-index: 1000;
    transition: transform 0.8s;
}
.navigation-nav {
    height: 100vh;
    position: fixed;
    top: 0;
    right: 0;
    z-index: 1001;
    opacity: 0;
    width: 0;
    transition: all 0.8s;
}

.navigation-list {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    list-style: none;
    text-align: center;
}

.navigation-item {
    margin: 1rem;
}

.navigation-link:link, .navigation-link:visited {
    display: inline-block;
    font-size: 3rem;
    font-weight: 300;
    color: white;
    text-decoration: none;
    text-transform: uppercase;
    padding: 1rem 2rem;
    background-image: linear-gradient(120deg, transparent 0%, transparent 50%, white 0%);
    background-size: 240%;
    transition: all 0.4s;
}

.navigation-link:hover, .navigation-link:active {
    background-position: 100%;
    color: #ff8c00;
}

.navigation-checkbox:checked ~ .navigation-background {
    transform: scale(80);
}
  .navigation-checkbox:checked ~ .navigation-nav {
    opacity: 1;
    width: 100%;
}

.navigation-icon {
    position: relative;
    margin-top: 2.5rem;
}

.navigation-icon, .navigation-icon::before, .navigation-icon::after {
    width: 2.5rem;
    height: 2px;
    background-color: white;
    display: inline-block;
}

.navigation-icon::before, .navigation-icon::after {
    content: "";
    position: absolute;
    left: 0;
    transition: all 0.2s;
}

.navigation-icon::before {
    top: -1rem;
}

.navigation-icon::after {
    top: 1rem;
}

.navigation-button:hover .navigation-icon::before {
    top: -1.2rem;
}

.navigation-button:hover .navigation-icon::after {
    top: 1.2rem;
}

.navigation-checkbox:checked + .navigation-button .navigation-icon {
    background-color: transparent;
}

.navigation-checkbox:checked + .navigation-button .navigation-icon::before {
    top: 0;
    transform: rotate(45deg);
}

.navigation-checkbox:checked + .navigation-button .navigation-icon::after {
    top: 0;
    transform: rotate(-45deg);
}
</style>
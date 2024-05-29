import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue'
import UploadForm from '@/views/UploadForm.vue'
import GameView from '@/views/GameView.vue'
import GamesList from '@/views/GamesList.vue'
import EditForm from '@/views/EditForm.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: Landing
    },
    {
      path: '/upload-game',
      name: 'upload-game',
      component: UploadForm
    },
    {
      path: '/edit-game/:gameID',
      name: 'edit-game',
      component: EditForm
    },
    {
      path: '/game-view/:gameID',
      name: 'gameView',
      component: GameView
    },
    {
      path: '/games-list',
      name: 'gamesList',
      component: GamesList
    }
  ]
})

export default router

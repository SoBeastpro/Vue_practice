import { createRouter, createWebHistory } from 'vue-router'
import PaletteGenerator from '../views/PaletteGenerator.vue'
import PaletteLibrary from '../views/PaletteLibrary.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Generator',
    component: PaletteGenerator
  },
  {
    path: '/library',
    name: 'Library',
    component: PaletteLibrary
  },
  {
    // Обработка 404
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router


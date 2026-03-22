import { createRouter, createWebHashHistory } from 'vue-router'
import Library from '@/views/Library.vue'
import Favorites from '@/views/Favorites.vue'
import Collections from '@/views/Collections.vue'
import CollectionDetail from '@/views/CollectionDetail.vue'
import Recent from '@/views/Recent.vue'
import Settings from '@/views/Settings.vue'
import PromptDetail from '@/views/PromptDetail.vue'
import CreatePrompt from '@/views/CreatePrompt.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'library', component: Library },
    { path: '/favorites', name: 'favorites', component: Favorites },
    { path: '/collections', name: 'collections', component: Collections },
    { path: '/collection/:id', name: 'collection-detail', component: CollectionDetail },
    { path: '/recent', name: 'recent', component: Recent },
    { path: '/settings', name: 'settings', component: Settings },
    { path: '/prompt/:id', name: 'prompt-detail', component: PromptDetail },
    { path: '/create', name: 'create', component: CreatePrompt },
    { path: '/edit/:id', name: 'edit', component: CreatePrompt }
  ]
})

export default router

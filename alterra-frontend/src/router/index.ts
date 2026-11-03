import { createRouter, createWebHistory } from 'vue-router'
import CadastroView from '../views/CadastroView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue' // Importámos o Dashboard



const router = createRouter({
  
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'cadastro', component: CadastroView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView } ,
    {path: '/criar',name: 'criacao',component: () => import('../views/CriacaoView.vue')}// Rota nova!
  ]
  
  
})


export default router
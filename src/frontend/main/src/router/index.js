import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Signin from '../views/Signin.vue'
import Register from '../views/Register.vue'
import MyTags from '../views/MyTags.vue'
import Profile from '../views/Profile.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    alias:['/Home'],
    name: 'Home',
    component: Home
  },
  {
    path: '/mytags',
    alias:['/mytags'],
    name: 'MyTags',
    component: MyTags
  },
  {
    path: '/profile',
    alias:['/profile'],
    name: 'Profi;e',
    component: Profile
  },
  {
    path: '/signin',
    name: 'Signin',
    component: Signin
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

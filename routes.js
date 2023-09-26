import { createWebHistory, createRouter } from 'vue-router'
import Home from './Home.vue'
import Login from './Login.vue'
import Profile from './Profile.vue'
import NotFound from './NotFound.vue'
import ComponentA from './ComponentA.vue'
import ComponentB from './ComponentB.vue'
import ComputedA from './ComputedA.vue'
import ParentC from './ParentC.vue'
import IncrementT from './IncrementT.vue'
import EmployeeList from './EmployeeList.vue'
import UserData from './UserData.vue'
const routes = [
  {
    name: 'Home',
    path: '/',
    component: Home
  },
  {
    name: 'Login',
    path: '/login',
    component: Login
  },
  {
    name: 'Profile',
    path: '/profile',
    component: Profile
  },
  {
    path: '/:catchAll(.*)',
    component: NotFound,
    meta: { title: 'Not Found' } // Optionally set a title for the 404 page
  },
  {
    path: '/component-a',
    component: ComponentA
  },
  {
    path: '/component-b',
    component: ComponentB
  },
  {
    path: '/computed-a',
    component: ComputedA
  },
  {
    path: '/parent-c',
    component: ParentC
  },
  {
    path: '/increment-t',
    component: IncrementT
  },
  {
    path: '/employee-list',
    component: EmployeeList
  },
  {
    path: '/user-data',
    component: UserData
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
export default router

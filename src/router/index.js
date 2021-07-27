// import Vue from 'vue'
import { createRouter, createWebHashHistory } from "vue-router"
// import Login from '@/pages/Login'
const Login = () => import('../pages/Login')
const Layout = () => import('@/pages/Layout')
const Dashboard = () => import('@/pages/routes/Dashboard')
const Shopping = () => import('@/pages/routes/shopping/Shopping')
const Music = () => import('@/pages/routes/music/Music')
const MusicList = () => import('@/pages/routes/music/MusicList')
const MusicLyric = () => import('@/pages/routes/music/MusicLyric')
const Game = () => import('@/pages/routes/game/Game')
const ErrorPage = () => import('@/pages/ErrorPage')
// import accountService from "@/service/account.service";
// import VueRouter from 'vue-router'

// Vue.use(Router)

// 新版vue-router避免重复点击路由时报错
// const originalPush = VueRouter.prototype.push
// VueRouter.prototype.push = function push(location) {
//   return originalPush.call(this, location).catch(err => err)
// }

// function isLoggedIn() {
//   //   return localStorage.getItem('username') !== null;
//   return accountService.getToken();
// }


const routes = [
	{
		path: '/',
		redirect: 'login',
	},
	{
		path: '/login',
		name: 'login',
		component: Login
	},
	{
		path: '/home', name: 'home', component: Layout,
		children: [
			{ path: '', redirect: { name: 'dashboard' } },
			{ path: 'dashboard', name: 'dashboard', component: Dashboard },
			{ path: 'shopping', name: 'shopping', component: Shopping },
			{
				path: 'music', name: 'music', component: Music,
				children: [
					{ path: '', redirect: { name: 'musiclist' } },
					{ path: 'musiclist', name: 'musiclist', component: MusicList },
					{ path: 'musiclyric', name: 'musiclyric', component: MusicLyric },
				]
			},
			{ path: 'game', name: 'game', component: Game }
		]
	},
	{
		path: '/errorpage',
		name: 'errorpage',
		component: ErrorPage
	}
]

// router.beforeEach(async (to, from, next) => {
//   if (!isLoggedIn() && to.name !== 'login' && to.name !== 'errorpage') {
//     next({ name: 'errorpage' })
//   }
//   else next()
// })

const router = createRouter({
	history: createWebHashHistory(),
	routes: routes
})
export default router;
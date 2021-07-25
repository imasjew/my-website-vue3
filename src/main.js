import { createApp } from 'vue'
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// import Vue from 'vue'
import App from './App'
import router from './router'
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css'

// Vue.config.productionTip = false

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')

app.config.globalProperties.$filters = {
  formatDate(value) {
		let minutes = Math.floor((value % (60 * 60)) / 60);
		if (minutes < 10) {
			minutes = "0" + minutes;
		}
		let seconds = Math.round(value % 60);
		if (seconds < 10) {
			seconds = "0" + seconds;
		}
		return minutes + ":" + seconds;
	},
}
import { createApp } from 'vue'
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css'

// Vue.config.productionTip = false

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')

app.config.globalProperties.$filters = {
	formatDate(value: number) {
		const minutes = Math.floor((value % (60 * 60)) / 60);
		let formedMinutes: string;
		if (minutes < 10) {
			formedMinutes = "0" + minutes;
		} else {
			formedMinutes = minutes.toString();
		}
		const seconds = Math.round(value % 60);
		let formedSeconds: string;
		if (seconds < 10) {
			formedSeconds = "0" + seconds;
		} else {
			formedSeconds = seconds.toString();
		}
		return minutes + ":" + seconds;
	},
}
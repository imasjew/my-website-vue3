import { createApp } from 'vue'
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import App from './App.vue'
import router from './router'
import { formatDate } from './utils/commonUtils'
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css'

// Vue.config.productionTip = false

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')

app.config.globalProperties.$filters = { formatDate }
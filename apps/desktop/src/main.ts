import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia } from '@project/store'
import { useThemeStore } from '@project/store'
import UI from '@project/ui'
import 'virtual:svg-icons-register'
import { setupInterceptors } from '@project/api/interceptor'
import '@project/assets/styles/index.scss'
import '@project/assets/styles/main.scss'

const app = createApp(App)

setupInterceptors(router)

app.use(router)
app.use(pinia)

const themeStore = useThemeStore()
themeStore.initTheme()

app.use(UI)
app.mount('#app')

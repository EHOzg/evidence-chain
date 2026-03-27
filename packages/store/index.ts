import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export { pinia }

export { useUserStore } from './user'
export { useThemeStore } from './theme'

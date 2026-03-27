export { sharedRoutesConfig } from './routes'

export function setupCommonGuards(router: any) {
  router.beforeEach((to: any, from: any, next: any) => {
    const token = localStorage.getItem('token')
    if (to.name !== 'login' && !token) {
      next({ name: 'login' })
    } else {
      next()
    }
  })
}

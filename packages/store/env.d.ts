import 'pinia'
declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    // 允许使用 persist 属性
    persist?:
      | boolean
      | import('pinia-plugin-persistedstate').PersistedStateOptions
  }
}

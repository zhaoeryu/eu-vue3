// src/types/vue-shim.d.ts
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<NonNullable<unknown>, NonNullable<unknown>, never>;
  export default component;
}

// TypeScript declarations for Vue components
declare module 'src/components/PageTitle.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'src/components/PageLayout.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'src/components/base/BaseDialog.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'src/components/base/BaseCard.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Auto-generated component declarations
export {};

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    BarcodeScanner: typeof import('./BarcodeScanner.vue')['default']
    BaseCard: typeof import('./base/BaseCard.vue')['default']
    BaseDialog: typeof import('./base/BaseDialog.vue')['default']
    PageLayout: typeof import('./PageLayout.vue')['default']
    PageTitle: typeof import('./PageTitle.vue')['default']
  }
} 
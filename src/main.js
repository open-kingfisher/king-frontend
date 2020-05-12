// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import iView from 'view-design'
import i18n from '@/locale'
import config from '@/config'
import 'view-design/dist/styles/iview.css'
import './index.less'
import '@/assets/icons/iconfont.css'
import { hasPermission } from './router/permission'
// 使用highlight
import VueHighlightJS from 'vue-highlight.js/'
import 'highlight.js/styles/agate.css'
Vue.use(VueHighlightJS)

Vue.use(iView, {
  i18n: (key, value) => i18n.t(key, value)
})

Vue.config.productionTip = false
/**
 * @description 全局注册应用配置
 */
Vue.prototype.$config = config
/* 按钮权限 */
Vue.prototype.hasPerm = hasPermission
/**
 * 注册指令
 */

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  i18n,
  store,
  render: h => h(App)
})

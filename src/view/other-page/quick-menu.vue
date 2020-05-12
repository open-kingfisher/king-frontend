<style>
  .quick-menu .sub-menu {
    font-size: 2px !important;
    /*width: 60px !important;*/
    /*height: 60px !important;*/
  }
  .quick-menu .sub-menu a i {
    margin-top: 0px !important;
  }
</style>
<template>
  <quick-menu v-if="$store.getters.quickMenu"
                :menu-count=count
                :icon-class=icons
                :menu-url-list=list
                position="bottom-right"
                @process=print
                backgroundColor="#19be6b">
    </quick-menu>
</template>

<script>
import quickMenu from 'vue-quick-menu'
import { List } from '@/api/cluster-plugin'

export default {
  components: {
    quickMenu
  },
  data () {
    return {
      count: 3,
      icons: ['ivu-icon ivu-icon-ios-home',
        'ivu-icon ivu-icon-ios-chatbubbles',
        'ivu-icon ivu-icon-ios-search'],
      list: [
        { isLink: true, url: '/home' },
        { isLink: false },
        { isLink: true, url: '/search' }],
      selectValue: []
    }
  },
  mounted () {
  },
  methods: {
    print (key) {
      if (key === 1) {
        window.open('https://github.com/open-kingfisher/king-frontend/issues')
      }
    },
    plugin () {
      List({ // 获取集群是否开启了debug插件
        productId: 100,
        cluster: this.$store.getters.currentClusterId
      }).then(res => {
        for (let i = 0; i < res.data.length; i++) {
          let kubectl = this.$store.state.user.access.indexOf('kubectl') > -1
          if (res.data[i].name === 'Kubectl' && res.data[i].status === 1 && kubectl) {
            this.$store.commit('setQuickMenu', true)
            this.count = 4
            this.icons.push('ivu-icon ivu-icon-ios-desktop')
            this.list.push({ isLink: true, url: '/workload/kubectl/king-kubectl-pod/king-kubectl' })
            break
          } else {
            this.count = 3
            this.icons = ['ivu-icon ivu-icon-ios-home', 'ivu-icon ivu-icon-ios-chatbubbles', 'ivu-icon ivu-icon-ios-search']
            this.list = [{ isLink: true, url: '/home' }, { isLink: false }, { isLink: true, url: '/search' }]
            this.$store.commit('setQuickMenu', true)
          }
        }
      })
    }
  }
}
</script>

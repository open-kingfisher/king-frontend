<style lang="less">
  .full-screen-btn-con .ivu-cascader-rel {
    height: 67px;
    line-height: 65px;
    i {
      cursor: pointer;
    }
    width: 400px;
  }
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
  <div class="full-screen-btn-con">
    <quick-menu v-if="$store.getters.quickMenu"
                :menu-count=count
                :icon-class=icons
                :menu-url-list=list
                position="bottom-right"
                @process=print
                backgroundColor="#19be6b">
    </quick-menu>
    <Cascader
      :data="cascaderData"
      trigger="hover"
      v-model="selectValue"
      @on-change="change"
      :disabled="$store.getters.clusterSelect"
      size="small"
      :clearable=false>
    </Cascader>
  </div>
</template>
<script>
import { List } from '@/api/cluster-plugin'
// import store from '@/store'
// import route from '../../../../router'
// import { hasPermission } from '@/router/permission'
import { forEach } from '@/libs/tools'
import { setSessionStorage, getSessionStorage } from '@/libs/util'
import quickMenu from 'vue-quick-menu'

export default {
  inject: ['reload'],
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
  computed: {
    cascaderData () {
      return this.$store.getters.getSelectObj
    }
  },
  created () {
    this.$store.dispatch('flushSelectObj')
  },
  mounted () {
    // 保持刷新后，选择栏依然会填充
    let selectValue = getSessionStorage('selectValue')
    let selectedData = getSessionStorage('selectedData')
    if (selectedData && selectValue) {
      this.change(selectValue, selectedData)
      this.selectValue = selectValue
    } else {
      this.$watch('cascaderData', newVal => {
        let selectedData = []
        let selectValue = []
        forEach(newVal, item => {
          selectedData.push({ value: item.value, label: item.label })
          selectValue.push(item.value)
          forEach(item.children, item => {
            selectedData.push({ value: item.value, label: item.label })
            selectValue.push(item.value)
            forEach(item.children, item => {
              selectedData.push({ value: item.value, label: item.label })
              selectValue.push(item.value)
            })
          })
        })
        selectedData =
          selectedData.length >= 3
            ? selectedData.slice(0, 3)
            : selectedData.concat(['', '', '']).slice(0, 3)
        selectValue =
          selectValue.length >= 3
            ? selectValue.slice(0, 3)
            : selectValue.concat(['', '', '']).slice(0, 3)
        this.change(selectValue, selectedData)
        this.selectValue = selectValue
      })
    }
  },
  methods: {
    print (key) {
      if (key === 1) {
        window.open('https://github.com/open-kingfisher/king-frontend/issues')
      }
    },
    change (selectValue, selectedData) {
      /*
      selectValue如下：
      ["2012110217554623", "c_9941048464f", "n_35107271308q", __ob__: Observer]
      selectedData如下:
      0: {value: "2012110217554623", label: "门户广告"}
      1: {value: "c_9941048464f", label: "测试集群"}
      2: {value: "n_35107271308q", label: "testtest", __label: "门户广告 / 测试集群 / testtest",
      */
      setSessionStorage('selectValue', selectValue)
      setSessionStorage('selectedData', selectedData)
      let data = {
        selectedData: selectValue,
        productId: selectedData[0],
        clusterId: selectedData[1],
        namespaceId: selectedData[2]
      }
      this.$store.dispatch('changeAjaxOpt', data)
      this.plugin()
      this.reload()
      // 集群改动后对应的要重新获取菜单列表
      this.$store.dispatch('getMenuData', this.$store.getters.currentClusterId).then(res => {})
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
      // route.afterEach(to => {
      //   console.log('ddddddd')
      //
      // })
      // route.options.routes[6].meta.hideInMenu = true
      // route.
      // console.log(route)
      // route.addRoutes([{
      //     path: '/awards',
      //     name: 'Awards',
      //     component: () => import('@/view/cluster/node/node.vue')
      //   },
      //   {
      //     path: '/page',
      //     name: 'Page',
      //     component: () => import('@/view/cluster/node/node.vue')
      //   }
      // ])
      // route.push('/page')
    }
  }
}
</script>

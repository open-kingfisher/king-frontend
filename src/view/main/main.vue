<template>
  <Layout style="height: 100%" class="main">
    <Header class="header-con">
      <div class="logo-con">
        <img :src="maxLogo" key="max-logo"/>
      </div>
      <header-bar :collapsed="collapsed" @on-coll-change="handleCollapsedChange">
        <user :user-avator="userAvator"/>
        <language v-if="$config.useI18n" @on-lang-change="setLocal" style="margin-right: 10px;" :lang="local"/>
<!--        <message style="margin-right: 10px; margin-top: 4px;" />-->
        <version style="margin-right: 10px; margin-top: 4px;"/>
        <fullscreen v-model="isFullscreen" style="margin-right: 10px; margin-top: 4px"/>
        <cluster-select style="margin-right: 10px"/>
      </header-bar>
    </Header>
    <Layout style="height: 100%">
      <Sider hide-trigger collapsible :width="200" :collapsed-width="64" v-model="collapsed" class="left-sider" :style="{overflow: 'hidden'}">
        <side-menu accordion :active-name="$route.name" :collapsed="collapsed" @on-select="turnToPage" :menu-list="menuList">
        </side-menu>
      </Sider>
      <Content class="main-content-con">
        <Layout class="main-layout-con">
          <div class="tag-nav-wrapper">
            <tags-nav :value="$route" @input="handleClick" :list="tagNavList" @on-close="handleCloseTag"/>
          </div>
          <Content class="content-wrapper">
            <keep-alive>
              <router-view v-if="isRouteActive && $route.meta.cache"></router-view>
            </keep-alive>
            <router-view v-if="isRouteActive && (!$route.meta.cache)"></router-view>
          </Content>
        </Layout>
      </Content>
    </Layout>
  </Layout>
</template>
<script>
import SideMenu from './components/side-menu'
import HeaderBar from './components/header-bar'
import TagsNav from './components/tags-nav'
import User from './components/user'
import Language from './components/language'
import Fullscreen from './components/fullscreen'
import ClusterSelect from './components/cluster-select'
import UpdateLog from './components/update-log'
import Message from './components/message'
import Version from './components/version'
import { mapMutations, mapActions } from 'vuex'
import { getNewTagList, getNextName } from '../../libs/util'
import minLogo from '../../assets/images/kingfisher_min.png'
import maxLogo from '../../assets/images/kingfisher.png'
import './main.less'
export default {
  name: 'Main',
  components: {
    SideMenu,
    HeaderBar,
    Language,
    TagsNav,
    UpdateLog,
    User,
    ClusterSelect,
    Fullscreen,
    Message,
    Version
  },
  provide () {
    return {
      reload: this.reload
    }
  },
  data () {
    return {
      collapsed: false,
      minLogo,
      maxLogo,
      isRouteActive: true,
      isFullscreen: false
    }
  },
  computed: {
    tagNavList () {
      return this.$store.state.app.tagNavList
    },
    tagRouter () {
      return this.$store.state.app.tagRouter
    },
    userAvator () {
      // return this.$store.state.user.avatorImgPath
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAACXBIWXMAAAsTAAALEwEAmpwYAAAGw2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOS0wNy0yN1QxODozMzo1OCswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTktMDctMjhUMTI6Mzc6MzMrMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTktMDctMjhUMTI6Mzc6MzMrMDg6MDAiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OWNkZTliYjYtMTcyYS1hMjRkLTg3ZGEtMzZkZjNhYWIwNzJlIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6ZWQ4NjE3NDctZWEyMi01MjQyLTg4MDgtOWU3MTU5ZmIyZWE4IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6QUQxOTM2RkVBODdEMTFFOTlCNEE5QjUxMTY5NkJBRDciIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBRDE5MzZGQkE4N0QxMUU5OUI0QTlCNTExNjk2QkFENyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBRDE5MzZGQ0E4N0QxMUU5OUI0QTlCNTExNjk2QkFENyIvPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo1NmUwMWY0OC1mZmNlLTFhNDktODJiNC1lODU5MDZjMTc2ZWUiIHN0RXZ0OndoZW49IjIwMTktMDctMjhUMTI6Mzc6MzMrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjljZGU5YmI2LTE3MmEtYTI0ZC04N2RhLTM2ZGYzYWFiMDcyZSIgc3RFdnQ6d2hlbj0iMjAxOS0wNy0yOFQxMjozNzozMyswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6uKCZCAAAm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'
    },
    cacheList () {
    // this.tagNavList.length ? this.tagNavList.map(item => console.log(item.name + ':' + item.meta.notCache)) : []
      return this.tagNavList.length ? this.tagNavList.filter(item => !(item.meta && item.meta.notCache)).map(item => item.name) : []
    },
    menuList () {
      return this.$store.getters.menuList
    },
    local () {
      return this.$store.state.app.local
    }
  },
  methods: {
    ...mapMutations(['setBreadCrumb', 'setTagNavList', 'addTag', 'setLocal']),
    ...mapActions(['handleLogin']),
    turnToPage (name) {
      if (name.indexOf('isTurnByHref_') > -1) {
        window.open(name.split('_')[1])
        return
      }
      this.$router.push({
        name: name
      })
    },
    turnToPagePath (path) {
      if (name.indexOf('isTurnByHref_') > -1) {
        window.open(name.split('_')[1])
        return
      }
      this.$router.push({
        path: path
      })
    },
    reload () {
      this.isRouteActive = false
      this.$nextTick(() => {
        this.isRouteActive = true
      })
    },
    handleCollapsedChange (state) {
      this.collapsed = state
    },
    handleCloseTag (res, type, name) {
      const nextName = getNextName(this.tagNavList, name)
      this.setTagNavList(res)
      if (type === 'all') this.turnToPage('home')
      else if (this.$route.name === name) this.$router.push({ name: nextName })
    },
    handleClick (item) {
      // this.turnToPage(item.name)
      this.turnToPagePath(item.path)
    }
  },
  watch: {
    $route (newRoute) {
      this.setBreadCrumb(newRoute.matched)
      this.setTagNavList(getNewTagList(this.tagNavList, newRoute))
    }
  },
  mounted () {
    /**
     * @description 初始化设置面包屑导航和标签导航
     */
    this.setTagNavList()
    this.addTag(this.$store.state.app.homeRoute)
    this.setBreadCrumb(this.$route.matched)
    // 设置初始语言
    this.setLocal(this.$i18n.locale)
    // 文档提示
    /*  this.$Notice.info({
      title: '想快速上手，去看文档吧',
      duration: 0,
      render: (h) => {
        return h('p', {
          style: {
            fontSize: '13px'
          }
        }, [
          '点击',
          h('a', {
            attrs: {
              href: 'https://lison16.github.io/iview-admin-doc/#/',
              target: '_blank'
            }
          }, 'iview-admin2.0文档'),
          '快速查看'
        ])
      }
    }) */
  }
}
</script>

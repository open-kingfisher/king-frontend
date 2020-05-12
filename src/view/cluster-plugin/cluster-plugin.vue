<template>
  <div>
    <information info="插件管理：通过添加不同的插件可以扩展原有kubernetes功能，包括各种Operator及其他插件的管理。"></information>
    <Row :gutter=10>
      <Col span="3" v-for="(v, k) in clusterPlugin" :key="k" :value="v" style="margin-bottom: 10px">
        <Card>
          <div style="text-align:right; margin-top: 3px; margin-right: 3px">
            <!--              <Button type="primary" shape="circle" icon="ios-search"></Button>-->
            <!--              <Button size="small" type="success" ghost shape="circle" icon="ios-add-circle-outline" @click="installBtnClick()"></Button>-->
          </div>
          <div v-if="v.name == 'Pod Debug'" style="text-align:center; margin-top: 10px"
               @click="btnClick(v.id, v.name, v.status)">
            <img v-show="v.status == 0" :src=PodDebugDark style="width: 50px; height: 50px">
            <img v-show="v.status == 1" :src=PodDebug style="width: 50px; height: 50px">
            <h3>{{v.name}}</h3>
          </div>
          <div v-else-if="v.name == 'Kubectl'" style="text-align:center; margin-top: 10px"
               @click="btnClick(v.id, v.name, v.status)">
            <img v-show="v.status == 0" :src=TerminalDark style="width: 50px; height: 50px">
            <img v-show="v.status == 1" :src=Terminal style="width: 50px; height: 50px">
            <h3>{{v.name}}</h3>
          </div>
          <div v-else-if="v.name == 'Istio'" style="text-align:center; margin-top: 10px"
               @click="btnClick(v.id, v.name, v.status)">
            <img v-show="v.status == 0" :src=IstioDark style="width: 50px; height: 50px">
            <img v-show="v.status == 1" :src=Istio style="width: 50px; height: 50px">
            <h3>{{v.name}}</h3>
          </div>
          <div v-else-if="v.name == 'Inspect'" style="text-align:center; margin-top: 10px"
               @click="btnClick(v.id, v.name, v.status)">
            <img v-show="v.status == 0" :src=InspectDark style="width: 50px; height: 50px">
            <img v-show="v.status == 1" :src=Inspect style="width: 50px; height: 50px">
            <h3>{{v.name}}</h3>
          </div>
          <div v-else-if="v.name == 'Daemon'" style="text-align:center; margin-top: 10px"
               @click="btnClick(v.id, v.name, v.status)">
            <img v-show="v.status == 0" :src=DaemonDark style="width: 50px; height: 50px">
            <img v-show="v.status == 1" :src=Daemon style="width: 50px; height: 50px">
            <h3>{{v.name}}</h3>
          </div>
          <div v-else style="text-align:center; margin-top: 10px">
            <img src="../../assets/images/default_dark.png" style="width: 50px; height: 50px">
            <h3>{{v.name}}</h3>
          </div>
          <div style="text-align: left; margin: 2px 10px 10px 10px">
            <p>{{v.describe}}</p>
          </div>
        </Card>
      </Col>
    </Row>
    <Modal v-model="installPodDebugModel" width="420">
      <p slot="header" style="text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span> 开启 Pod Debug</span>
      </p>
      <div style="text-align:center; margin-bottom: 10px">
        <p>开启 Pod Debug 后Pod管理页面会出现Debug按钮，根据不同的Pod的进行Debug</p>
      </div>
      <div slot="footer">
        <Button :disabled="!hasPerm('install_cluster_plugin')" type="success" size="large" long
                @click="installPodDebugPlug()">开启
        </Button>
      </div>
    </Modal>
    <Modal v-model="uninstallPodDebugModel" width="420">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span> 关闭 Pod Debug</span>
      </p>
      <div style="text-align:center">
        <p>关闭 Pod Debug 后将无法再使用 Pod Debug 工具</p>
        <p style="line-height: 35px">确认关闭 Pod Debug 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long @click="unInstallPodDebugPlug()">关闭</Button>
      </div>
    </Modal>
    <Modal slot="option" v-model="installKubectlModel" title="安装 Kubectl 选项" width="420">
<!--      <Form ref="createForm" :model="formItem" :rules="ruleValidate" :label-width="90">-->
<!--        <FormItem label="Kubectl版本" prop="kubectlVersion">-->
<!--          <Input v-model="formItem.kubectlVersion" placeholder="kubectl版本，例如：v1.15.1"></Input>-->
<!--        </FormItem>-->
<!--      </Form>-->
      <p slot="header" style="text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span> 安装 Kubectl </span>
      </p>
      <div style="text-align:center; margin-bottom: 10px">
        <p>系统将根据当前 <span style="color: #19be6b; font-weight:bold">{{$store.getters.currentClusterName}}</span>
          集群版本安装对应版本的 Kubectl</p>
      </div>
      <div slot="footer">
        <!--        <Button type="text" @click="cancel()">{{this.$t('cancel')}}</Button>-->
        <!--        <Button :disabled="!hasPerm('install_cluster_plugin')" type="primary" @click="installKubectl()"-->
        <!--                v-if="!enterShow" :loading="loading">-->
        <!--          <span v-if="!loading">安装</span>-->
        <!--          <span v-else>安装中</span>-->
        <!--        </Button>-->
        <Button :disabled="!hasPerm('install_cluster_plugin')" type="success" size="large" long
                @click="installKubectl()" v-if="!enterShow" :loading="loading">
          <span v-if="!loading">安装</span>
          <span v-else>安装中</span>
        </Button>
      </div>
    </Modal>
    <Modal v-model="uninstallKubectlModel" width="420" title="卸载 Kubectl">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span> 卸载 Kubectl</span>
      </p>
      <div style="text-align:center">
        <p>卸载 Kubectl 后将无法再使用 Kubectl 命令行工具</p>
        <p style="line-height: 35px">确认卸载 Kubectl 吗？</p>
      </div>
      <div slot="footer">
        <Button :disabled="!hasPerm('uninstall_cluster_plugin')" type="error" size="large" long
                @click="uninstallKubectl()">卸载
        </Button>
      </div>
    </Modal>
    <Modal v-model="installIstioModel" width="420">
      <p slot="header" style="text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span> 开启 Istio 插件</span>
      </p>
      <div style="text-align:center; margin-bottom: 10px">
        <p>请确保当前 <span style="color: #19be6b; font-weight:bold">{{$store.getters.currentClusterName}}</span>
          集群已经安装Istio，通过此插件可以开启Istio相关服务的管理</p>
      </div>
      <div slot="footer">
        <Button :disabled="!hasPerm('install_cluster_plugin')" type="success" size="large" long
                @click="installIstioPlug()">开启
        </Button>
      </div>
    </Modal>
    <Modal v-model="uninstallIstioModel" width="420" title="关闭 Istio 服务治理功能">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span> 关闭 Istio 服务治理功能</span>
      </p>
      <div style="text-align:center">
        <p>关闭 Istio 服务治理功能后 <span style="color: #19be6b; font-weight:bold">{{$store.getters.currentClusterName}}</span>
          集群将无法使用此平台进行服务治理的管理</p>
        <p style="line-height: 35px">确认关闭 Istio 服务治理功能吗？</p>
      </div>
      <div slot="footer">
        <Button :disabled="!hasPerm('uninstall_cluster_plugin')" type="error" size="large" long
                @click="unInstallIstioPlug()">关闭
        </Button>
      </div>
    </Modal>
    <Modal v-model="installInspectModel" width="420">
      <p slot="header" style="text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span> 开启集群检查 </span>
      </p>
      <div style="text-align:center; margin-bottom: 10px">
        <p>请确保 <span style="color: #19be6b; font-weight:bold">king-inspect</span>
          微服务已经部署，开启集群检查后可以对集群进行最佳实践、安全性、状态、无用资源等检查</p>
      </div>
      <div slot="footer">
        <Button :disabled="!hasPerm('install_cluster_plugin')" type="success" size="large" long
                @click="installInspectPlug()">开启
        </Button>
      </div>
    </Modal>
    <Modal v-model="uninstallInspectModel" width="420">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span> 关闭集群检查 </span>
      </p>
      <div style="text-align:center">
        <p>关闭集群检查不会删除已经检查过得的报表，只是不能在进行检查</p>
        <p style="line-height: 35px">确认关闭集群检查吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long @click="unInstallInspectPlug()">关闭</Button>
      </div>
    </Modal>
    <Modal v-model="installDaemonModel" width="420">
      <p slot="header" style="text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span> 安装 Daemon </span>
      </p>
      <div style="text-align:center; margin-bottom: 10px">
        <p>系统将根据当前 <span style="color: #19be6b; font-weight:bold">{{$store.getters.currentClusterName}}</span>
          集群安装一个名为king-daemon的DaemonSet</p>
      </div>
      <div slot="footer">
        <Button :disabled="!hasPerm('install_cluster_plugin')" type="success" size="large" long
                @click="installDaemonPlug()">安装
        </Button>
      </div>
    </Modal>
    <Modal v-model="uninstallDaemonModel" width="420">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span> 卸载 Daemon </span>
      </p>
      <div style="text-align:center">
        <p>卸载Daemon后，集群上名为king-daemon的DaemonSet将被删除</p>
        <p style="line-height: 35px">确认卸载Daemon吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long @click="unInstallDaemonPlug()">卸载</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import {
  InstallInspect,
  InstallIstio,
  InstallPodDebug,
  InstallDaemon,
  List,
  UninstallInspect,
  UninstallIstio,
  UninstallPodDebug,
  UninstallDaemon
} from '@/api/cluster-plugin'
import { kubectlPod, unkubectlPod } from '@/api/workload'
import { hasPermission } from '@/router/permission'
import SearchTable from '@/view/other-page/search-table.vue'
import Information from '../other-page/information.vue'
import Terminal from '../../assets/images/terminal.png'
import TerminalDark from '../../assets/images/terminal_dark.png'
import PodDebug from '../../assets/images/debug.png'
import PodDebugDark from '../../assets/images/debug_dark.png'
import IstioDark from '../../assets/images/istio_dark.png'
import Istio from '../../assets/images/istio.png'
import InspectDark from '../../assets/images/inspect_dark.png'
import Inspect from '../../assets/images/inspet.png'
import DaemonDark from '../../assets/images/daemon_dark.png'
import Daemon from '../../assets/images/daemon.png'
import store from '@/store'

export default {
  components: {
    SearchTable,
    Information
  },
  data () {
    return {
      TerminalDark,
      Terminal,
      PodDebugDark,
      PodDebug,
      IstioDark,
      Istio,
      InspectDark,
      Inspect,
      DaemonDark,
      Daemon,
      clusterPlugin: '',
      plugin: '',
      title: '',
      installKubectlModel: false,
      uninstallKubectlModel: false,
      uninstallPodDebugModel: false,
      installPodDebugModel: false,
      installIstioModel: false,
      uninstallIstioModel: false,
      installInspectModel: false,
      uninstallInspectModel: false,
      installDaemonModel: false,
      uninstallDaemonModel: false,
      enterShow: false,
      loading: false,
      modalShow: false,
      formItem: {
        kubectlVersion: ''
      },
      ruleValidate: {
        kubectlVersion: [
          { required: true, message: 'Kubectl 版本不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    console.log(this.$store.getters.currentClusterName)
    this.$store.commit('setClusterSelect', false)
    // this.$store.commit('setQuickMenu', true)
    this.formatTableData()
  },
  // watch: {
  //   kubectlStatus: {
  //     handler (newValue, oldValue) {
  //       // this.$router.go(0)
  //     }
  //   }
  // },
  methods: {
    btnClick (id, name, status) {
      if (name === 'Kubectl') {
        if (status === 1) {
          this.uninstallKubectlModel = true
          this.deleteLoading = false
        } else {
          this.installKubectlModel = true
        }
      }
      if (name === 'Pod Debug') {
        if (status === 1) {
          this.uninstallPodDebugModel = true
          this.deleteLoading = false
        } else {
          this.installPodDebugModel = true
        }
      }
      if (name === 'Istio') {
        if (status === 1) {
          this.uninstallIstioModel = true
          this.deleteLoading = false
        } else {
          this.installIstioModel = true
        }
      }
      if (name === 'Inspect') {
        if (status === 1) {
          this.uninstallInspectModel = true
          this.deleteLoading = false
        } else {
          this.installInspectModel = true
        }
      }
      if (name === 'Daemon') {
        if (status === 1) {
          this.uninstallDaemonModel = true
          this.deleteLoading = false
        } else {
          this.installDaemonModel = true
        }
      }
      this.plugin = id
    },
    cancel () {
      this.installKubectlModel = false
      this.modalShow = false
      this.deleteModel = false
    },
    installPodDebugPlug () {
      this.loading = true
      InstallPodDebug({
        productId: 100,
        plugin: this.plugin,
        cluster: this.$store.getters.currentClusterId
      }).then(res => {
        if (res.code === 200) {
          this.installPodDebugModel = false
          this.loading = false
          this.$Message.success({
            content: this.$t('action_success')
          })
        } else {
          this.loading = false
        }
        this.formatTableData()
      })
    },
    unInstallPodDebugPlug () {
      this.loading = true
      UninstallPodDebug({
        productId: 100,
        plugin: this.plugin,
        cluster: this.$store.getters.currentClusterId
      }).then(res => {
        if (res.code === 200) {
          this.uninstallPodDebugModel = false
          this.loading = false
          this.$Message.success({
            content: this.$t('action_success')
          })
        } else {
          this.loading = false
        }
        this.formatTableData()
      })
    },
    installIstioPlug () {
      this.loading = true
      InstallIstio({
        productId: 100,
        plugin: this.plugin,
        cluster: this.$store.getters.currentClusterId
      }).then(res => {
        if (res.code === 200) {
          this.installIstioModel = false
          this.loading = false
          // 重新拉取菜单列表，获取相关服务的菜单
          store.dispatch('getMenuData', this.$store.getters.currentClusterId).then(res => {
          })
          this.$Message.success({
            content: this.$t('action_success')
          })
        } else {
          this.loading = false
        }
        this.formatTableData()
      })
    },
    unInstallIstioPlug () {
      this.loading = true
      UninstallIstio({
        productId: 100,
        plugin: this.plugin,
        cluster: this.$store.getters.currentClusterId
      }).then(res => {
        if (res.code === 200) {
          this.uninstallIstioModel = false
          this.loading = false
          this.$Message.success({
            content: this.$t('action_success')
          })
          // 重新拉取菜单列表，获取相关服务的菜单
          store.dispatch('getMenuData', this.$store.getters.currentClusterId).then(res => {
          })
        } else {
          this.loading = false
        }
        this.formatTableData()
      })
    },
    installKubectl () {
      // this.$refs['createForm'].validate((valid) => {
      //   if (valid) {
      //
      //   }
      // })
      this.loading = true
      kubectlPod({
        productId: 100,
        // kubectlVersion: this.formItem.kubectlVersion,
        plugin: this.plugin
      }).then(res => {
        if (res.code === 200) {
          this.installKubectlModel = false
          this.loading = false
          this.$Message.success({
            content: this.$t('action_success')
          })
          if (hasPermission('kubectl')) {
            this.$store.commit('setQuickMenu', true)
          }
        } else {
          this.loading = false
        }
        this.formatTableData()
      })
    },
    uninstallKubectl () {
      this.deleteModel = false
      unkubectlPod({
        productId: 100,
        plugin: this.plugin,
        kubectlVersion: this.formItem.kubectlVersion
      }).then(res => {
        if (res.code === 200) {
          this.uninstallKubectlModel = false
          this.$Message.success({
            content: this.$t('action_success')
          })
          // this.$store.commit('setQuickMenu', false)
        }
        this.formatTableData()
      })
    },
    installInspectPlug () {
      this.loading = true
      InstallInspect({
        productId: 100,
        plugin: this.plugin,
        cluster: this.$store.getters.currentClusterId
      }).then(res => {
        if (res.code === 200) {
          this.installInspectModel = false
          this.loading = false
          // 重新拉取菜单列表，获取相关服务的菜单
          store.dispatch('getMenuData', this.$store.getters.currentClusterId).then(res => {
          })
          this.$Message.success({
            content: this.$t('action_success')
          })
        } else {
          this.loading = false
        }
        this.formatTableData()
      })
    },
    unInstallInspectPlug () {
      this.loading = true
      UninstallInspect({
        productId: 100,
        plugin: this.plugin,
        cluster: this.$store.getters.currentClusterId
      }).then(res => {
        if (res.code === 200) {
          this.uninstallInspectModel = false
          this.loading = false
          // 重新拉取菜单列表，获取相关服务的菜单
          store.dispatch('getMenuData', this.$store.getters.currentClusterId).then(res => {
          })
          this.$Message.success({
            content: this.$t('action_success')
          })
        } else {
          this.loading = false
        }
        this.formatTableData()
      })
    },
    installDaemonPlug () {
      this.loading = true
      InstallDaemon({
        productId: 100,
        plugin: this.plugin,
        cluster: this.$store.getters.currentClusterId
      }).then(res => {
        if (res.code === 200) {
          this.installDaemonModel = false
          this.loading = false
          // 重新拉取菜单列表，获取相关服务的菜单
          store.dispatch('getMenuData', this.$store.getters.currentClusterId).then(res => {
          })
          this.$Message.success({
            content: this.$t('action_success')
          })
        } else {
          this.loading = false
        }
        this.formatTableData()
      })
    },
    unInstallDaemonPlug () {
      this.loading = true
      UninstallDaemon({
        productId: 100,
        plugin: this.plugin,
        cluster: this.$store.getters.currentClusterId
      }).then(res => {
        if (res.code === 200) {
          this.uninstallInspectModel = false
          this.loading = false
          // 重新拉取菜单列表，获取相关服务的菜单
          store.dispatch('getMenuData', this.$store.getters.currentClusterId).then(res => {
          })
          this.$Message.success({
            content: this.$t('action_success')
          })
        } else {
          this.loading = false
        }
        this.formatTableData()
      })
    },
    formatTableData () {
      List({
        productId: 100,
        cluster: this.$store.getters.currentClusterId
      }).then(res => {
        this.clusterPlugin = res.data
      })
    },
    refresh () {
      this.formatTableData()
      this.$Message.success(this.$t('refresh_success'))
    },
    reload () {
      this.isRouterAlive = false
      this.$nextTick(function () {
        this.isRouterAlive = true
      })
    }
  }
}
</script>

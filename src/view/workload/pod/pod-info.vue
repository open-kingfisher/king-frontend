<template>
  <div>
    <Row type="flex" justify="center" class="row" :gutter=10>
      <Col span="7">
        <Card shadow>
          <p slot="title">{{podName}}</p>
          <Table border stripe :columns="podColumns" :data="podData" :show-header=false></Table>
        </Card>
      </Col>
      <Col span="17">
        <Card shadow>
          <Tabs value="status">
            <TabPane label="容器" name="status">
              <Card shadow :title="v.name" v-for="(v, k) in containers" :key="k" :value="v">
                <Row>
                  <Col span="12">
<!--                    https://github.com/kubernetes/kubernetes/blob/8fd414537b5143ab039cb910590237cabf4af783/pkg/api/resource/suffix.go#L108-->
<!--                    name="单位（n）(n, u, m 10**3)"-->
                    <charts :data="setChart(v.name, 'cpu')" title="CPU" name="单位（m）"></charts>
                  </Col>
                  <Col span="12">
<!--                    name="单位（Ki）(Ki, Mi, Gi 2**10)"-->
                    <charts :data="setChart(v.name, 'mem')" title="内存" name="单位（Ki）"></charts>
                  </Col>
                </Row>
              </Card>
              <Card shadow>
                <SearchTable :columns="containerColumns" :data="containerData"></SearchTable>
              </Card>
              <Card shadow>
                <Table border stripe :columns="statusColumns" :data="statusData"></Table>
              </Card>
            </TabPane>
            <TabPane label="事件" name="event">
              <SearchTable :columns="eventColumns" :data="eventData"></SearchTable>
            </TabPane>
            <div href="#" slot="extra">
              <ButtonGroup>
                <Button @click="edit()" type="info" size="small" style="margin-right: 3px" ghost>{{this.$t('show')}}</Button>
                <Button v-if="hasPerm('pod_log')" @click="log()" type="info" size="small" style="margin-right: 3px" ghost>{{this.$t('log')}}</Button>
                <Button v-if="hasPerm('pod_terminal')" @click="terminal()" type="success" size="small" style="margin-right: 3px" ghost>{{this.$t('terminal')}}</Button>
                <Button v-if="hasPerm('debug_pod') && debugOn" @click="debugButton()" type="info" size="small" style="margin-right: 3px" ghost>{{this.$t('debug')}}</Button>
                <Button v-if="hasPerm('rescue_pod')" @click="rescueButton()" type="success" size="small" style="margin-right: 3px" ghost>{{this.$t('rescue')}}</Button>
                <Button @click="refresh()" type="success" size="small" ghost>{{ this.$t('refresh') }}</Button>
              </ButtonGroup>
            </div>
          </Tabs>
        </Card>
      </Col>
    </Row>
    <Drawer
      :draggable=true
      :closable=false
      v-model="editShow"
      :scrollable=true
      width="50">
      <div slot="header">
        <span>{{optionTitle}} {{podName}}</span>
        <ButtonGroup style="float: right; margin-top: -5px">
        <Button @click="yaml()" size="small" :type="yamlType">Yaml</Button>
        <Button @click="json()" size="small" :type="jsonType">Json</Button>
      </ButtonGroup>
      </div>
      <YamlModal :editorContent="editorContent" @change="change" :editorLang="editorLang"></YamlModal>
      <div class="drawer-footer" style="margin-bottom: 1px">
        <Button type="primary" style="margin-right: 5px" @click="editShow = false">{{this.$t('cancel')}}</Button>
<!--        <Button type="primary" @click="update(option)">{{this.$t('commit')}}</Button>-->
      </div>
    </Drawer>
    <Drawer
      :draggable=true
      :closable=false
      v-model="logShow"
      :scrollable=true
      width="50">
      <div slot="header">
        <span>{{optionTitle}} {{container}}</span>
        <ButtonGroup style="float: right; margin-top: -5px">
          <Button @click="logRefresh()" size="small" type="success">刷新</Button>
        </ButtonGroup>
        <Dropdown trigger="click" style="margin-right: 5px; margin-top: -5px;float: right" @on-click="getLog">
          <Button type="default" size="small"  v-html='this.menuText'>
              最近1分钟
              <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
              <DropdownItem name="60">最近1分钟</DropdownItem>
              <DropdownItem name="600">最近10分钟</DropdownItem>
              <DropdownItem name="1800">最近30分钟</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown trigger="click" style="margin-right: 5px; margin-top: -5px;float: right" @on-click="changeContainer">
          <Button type="default" size="small">
            {{container}}
              <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list" v-for="(v, k) in containers" :key="k" :value="v">
              <DropdownItem :name="v.name">{{v.name}}</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div v-html="logContent" style="background-color: #1e1e1e;padding: 5px; margin: -15px; color: white"></div>
    </Drawer>
    <Modal slot="option" v-model="modalShow" title="Pod 调试选项">
      <Form ref="createForm" :model="formItem" :label-width="60">
        <FormItem label="容器">
          <Select v-model="formItem.containers">
            <Option v-for="item in containers" :value="item.name" :key="item.name" >{{ item.name }}</Option>
          </Select>
        </FormItem>
        <FormItem label="镜像地址">
          <Input v-model="formItem.debugImage"  placeholder="携带各种工具的镜像地址；默认：registry.kingfisher.com.cn/kingfisher/netshoot"></Input>
        </FormItem>
        <FormItem label="EntryPoint">
          <Input v-model="formItem.entryPoint" placeholder="启动工具镜像时，可以指定容器EntryPoint；默认：不启用此参数"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancel()">{{this.$t('cancel')}}</Button>
        <Button type="default" @click="enter()" v-if="enterShow">进入</Button>
        <Button type="error" @click="destroy(debugPrefix)" v-if="enterShow" :loading="deleteLoading">{{this.$t('delete')}}</Button>
        <Button type="primary" @click="debug()" v-if="!enterShow" :loading="loading">
          <span v-if="!loading">{{this.$t('debug')}}</span>
          <span v-else>等待进入终端</span>
        </Button>
      </div>
    </Modal>
    <Modal slot="option" v-model="modalRescueShow" title="Pod 救援选项">
        <Form ref="createForm" :model="formItem" :label-width="40">
          <FormItem label="容器">
            <Select v-model="formItem.containers">
              <Option v-for="item in containers" :value="item.name" :key="item.name" >{{ item.name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="条件" prop="condition">
            <CheckboxGroup v-model="formItem.rescueCondition">
              <Checkbox label="volume">不挂载卷</Checkbox>
              <Checkbox label="env">不加载环境变量</Checkbox>
              <Checkbox label="initContainers">不加载初始容器</Checkbox>
              <Checkbox label="istioInject">不进行Istio注入</Checkbox>
            </CheckboxGroup>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" @click="cancel()">{{this.$t('cancel')}}</Button>
          <Button type="default" @click="enterRescue()" v-if="enterShow">进入</Button>
          <Button type="error" @click="destroy(rescuePrefix)" v-if="enterShow" :loading="deleteLoading">{{this.$t('delete')}}</Button>
          <Button type="primary" @click="rescue()" v-if="!enterShow" :loading="loading">
            <span v-if="!loading">{{this.$t('rescue')}}</span>
            <span v-else>等待进入终端</span>
          </Button>
        </div>
      </Modal>
  </div>
</template>
<script>
import { getAllPodData, getPodInfo, metricsPod, getPodLog, deleteOnePod, debugPod, rescuePod, getDebugPodIPByPod } from '@/api/workload'
import { formatDate } from '@/api/tools'
import { List } from '@/api/cluster-plugin'
// import { formatDateTime } from '@/api/tools'
import YamlModal from '@/view/other-page/yaml-editor.vue'
import SearchTable from '../../other-page/search-table.vue'
import { getEvent } from '../../../api/common'
import Charts from './charts.vue'
const json2yaml = require('json2yaml')
const yaml2json = require('js-yaml')

export default {
  components: {
    SearchTable,
    Charts,
    YamlModal
  },
  data () {
    return {
      modalRescueShow: false,
      debugPrefix: 'debug-pod-',
      rescuePrefix: 'rescue-pod-',
      debugOn: false,
      deleteModel: false,
      deleteLoading: false,
      yamlType: 'success',
      jsonType: 'default',
      JsonFormat: false,
      YamlFormat: true,
      editorLang: '',
      editorContent: 'yaml',
      editShow: false,
      createModalShow: false,
      updateYaml: '',
      originYaml: '',
      searchVal: '',
      enterShow: false,
      loading: false,
      modalShow: false,
      formItem: {
        containers: '',
        debugImage: '',
        entryPoint: '',
        rescueCondition: []
      },
      menuContainer: '',
      container: '',
      containers: [],
      menuText: '最近1分钟',
      logShow: false,
      logContent: '',
      option: '',
      optionTitle: '',
      cpuChartData: [],
      memChartData: [0, 0, 0, 0, 0, 0, 0],
      timestamp: [0, 0, 0, 0, 0, 0, 0],
      item: '',
      podData: [],
      podColumns: [
        {
          title: '指标',
          key: 'key',
          width: 90
        },
        {
          title: this.$t('describe'),
          key: 'val',
          render: (h, params) => {
            if (
              params.row.key === '标签'
            ) {
              return h(
                'div',
                {
                  style: {
                    listStyle: 'none'
                  }
                },
                Object.keys(params.row.val).map(item => {
                  return h(
                    'Tag',
                    {
                      props: {
                        color: 'success'
                      }
                    },
                    item + ' | ' + params.row.val[item]
                  )
                })
              )
            } else {
              let val = params.row.val
              return h(
                'span',
                typeof val === 'object' ? JSON.stringify(params.row.val) : val
              )
            }
          }
        }
      ],
      eventColumns: [
        {
          title: '消息',
          key: 'message'
        },
        {
          title: '类型',
          key: 'type'
        },
        {
          title: '原因',
          key: 'reason'
        },
        {
          title: '次数',
          key: 'count',
          width: '80px'
        },
        // {
        //   title: '第一次时间',
        //   key: 'firstTimestamp'
        // },
        {
          title: '时间',
          key: 'lastTimestamp',
          sortable: true,
          sortType: 'desc'
        }
      ],
      eventData: [],
      labels: null,
      statusColumns: [
        {
          title: '类型',
          key: 'type'
        },
        {
          title: this.$t('status'),
          key: 'status'
        },
        {
          title: '最近心跳',
          key: 'heartBeat'
        },
        {
          title: '最近更改',
          key: 'lastTransitionTime'
        },
        {
          title: '原因',
          key: 'reason'
        },
        {
          title: '消息',
          key: 'message'
        }
      ],
      statusData: [],
      containerColumns: [
        {
          title: '名称',
          key: 'name'
        },
        {
          title: this.$t('image'),
          key: 'image'
        },
        {
          title: '端口',
          key: 'ports',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.keys(params.row.ports).map(item => {
                return h('li', params.row.ports[item]['containerPort'] + ' ' + params.row.ports[item]['protocol'])
              })
            )
          }
        }
        // {
        //   title: '环境变量',
        //   key: 'env',
        //   // width: 300,
        //   render: (h, params) => {
        //     return h(
        //       'ul',
        //       {
        //         style: {
        //           listStyle: 'none'
        //         }
        //       },
        //       Object.keys(params.row.env).map(item => {
        //         if (params.row.env[item]['value']) {
        //           return h(
        //             'Tag',
        //             {
        //               props: {
        //                 color: 'success'
        //               }
        //             },
        //             params.row.env[item]['name'] + ' | ' + params.row.env[item]['value']
        //           )
        //         }
        //       })
        //     )
        //   }
        // },
        // {
        //   title: '资源',
        //   key: 'resources'
        // },
        // {
        //   title: '挂载卷',
        //   key: 'volumeMounts'
        // },
        // {
        //   title: '存活探针',
        //   key: 'livenessProbe'
        // },
        // {
        //   title: '就绪探针',
        //   key: 'readinessProbe'
        // }
        // {
        //   title: '镜像拉取策略',
        //   key: 'imagePullPolicy'
        // }
      ],
      containerData: [],
      uid: '',
      podName: '',
      podIP: ''
    }
  },
  mounted () {
    this.$store.commit('setClusterSelect', true)
    if (this.$route.params.podName) {
      this.podName = this.$route.params.podName
      localStorage.setItem('podName', this.podName)
    } else {
      this.podName = localStorage.getItem('podName')
    }
    this.formatTableData()
    this.getChartData()
    // 刷新图表
    if (this.timer) {
      clearInterval(this.timer)
    } else {
      this.timer = setInterval(() => {
        this.getChartData()
      }, 10 * 1000)
    }
  },
  // 关闭页面后停止刷新
  destroyed () {
    clearInterval(this.timer)
  },
  methods: {
    // yaml转json
    json () {
      this.yamlType = 'default'
      this.jsonType = 'success'
      this.editorLang = 'json'
      this.editorContent = yaml2json.load(this.updateYaml)
    },
    // json转yaml
    yaml () {
      // 如果已经是yaml文件不在执行格式化
      if (this.yamlType !== 'success') {
        this.yamlType = 'success'
        this.jsonType = 'default'
        this.editorLang = 'yaml'
        this.editorContent = json2yaml.stringify(JSON.parse(this.updateYaml))
      }
    },
    edit () {
      this.yamlType = 'success'
      this.jsonType = 'default'
      this.updateYaml = ''
      this.originYaml = ''
      this.editShow = true
      this.optionTitle = '查看'
      this.option = 'edit'
      getPodInfo({
        productId: 100,
        name: this.podName
      }).then(res => {
        this.type = 'success'
        this.originYaml = res.data
        this.editorLang = 'yaml'
        this.editorContent = json2yaml.stringify(this.originYaml)
      })
    },
    // 监听子组件的change事件
    change (content) {
      this.updateYaml = content
    },
    cancel () {
      this.modalShow = false
      this.modalRescueShow = false
    },
    debugButton () {
      this.formatTableData()
      this.formItem.containers = this.containers[0].name
      this.modalShow = true
      this.enterShow = false
      getAllPodData({
        productId: 100
      }).then(res => {
        res.data.forEach((item, index) => {
          if (this.debugPrefix + this.podName === item.metadata.name) {
            this.enterShow = true
          }
        })
      })
    },
    rescueButton () {
      this.formatTableData()
      this.formItem.containers = this.containers[0].name
      this.modalRescueShow = true
      this.enterShow = false
      getAllPodData({
        productId: 100
      }).then(res => {
        res.data.forEach((item, index) => {
          if (this.rescuePrefix + this.podName === item.metadata.name) {
            this.enterShow = true
          }
        })
      })
    },
    terminal () {
      this.$router.push({
        name: 'podexec',
        params: {
          podName: this.podName,
          containerName: this.containers[0].name,
          cluster: this.$store.getters.currentClusterId,
          namespace: this.$store.getters.currentNamespaceName,
          containers: this.containers
        }
      })
    },
    logRefresh () {
      this.getLog(60)
      this.$Message.success(this.$t('refresh_success'))
    },
    log () {
      this.logShow = true
      this.optionTitle = '日志'
      this.option = 'edit'
      this.container = this.containers[0].name
      this.getLog(60)
    },
    debug () {
      this.loading = true
      debugPod({
        productId: 100,
        name: this.podName,
        container: this.formItem.containers,
        debugImage: this.formItem.debugImage,
        entryPoint: this.formItem.entryPoint
      }).then(res => {
        if (res.msg === '') {
          this.loading = false
          this.modalShow = false
          this.enter()
        }
      }).catch(() => {
        this.loading = false
      })
    },
    enter (value) {
      getDebugPodIPByPod({
        productId: 100,
        name: this.podName
      }).then(res => {
        if (res.data === '') {
          this.$Notice.error({
            title: '无法获取调试Pod的IP'
          })
        } else {
          this.$router.push({
            name: 'poddebug',
            params: {
              podIP: res.data,
              podName: this.podName,
              containerName: this.formItem.containers,
              cluster: this.$store.getters.currentClusterId,
              namespace: this.$store.getters.currentNamespaceName,
              containers: this.formItem.containers
            }
          })
        }
      }).catch(() => {
        this.loading = false
      })
    },
    destroy (value) {
      this.deleteLoading = true
      let data = {
        namespace: this.$store.getters.currentNamespaceName,
        name: value + this.podName
      }
      deleteOnePod(data).then(x => {
        if (x.code === 200) {
          this.enterShow = false
        } else {
          this.$Message.error('操作失败')
        }
        this.deleteLoading = false
        this.formatTableData()
      }).catch(() => {
        this.deleteLoading = false
      })
    },
    rescue () {
      this.loading = true
      rescuePod({
        productId: 100,
        name: this.podName,
        container: this.formItem.containers,
        entryPoint: this.formItem.entryPoint,
        rescueCondition: this.formItem.rescueCondition
      }).then(res => {
        if (res.msg === '') {
          this.loading = false
          this.modalShow = false
          this.enterRescue()
        }
      }).catch(() => {
        this.loading = false
      })
    },
    enterRescue () {
      this.$router.push({
        name: 'podexec',
        params: {
          podName: 'rescue-pod-' + this.podName,
          containerName: 'rescue-' + this.formItem.containers,
          cluster: this.$store.getters.currentClusterId,
          namespace: this.$store.getters.currentNamespaceName,
          containers: this.formItem.containers
        }
      })
    },
    changeContainer (name) {
      this.container = name
      this.getLog(60)
    },
    getLog (name) {
      if (name === '600') {
        this.menuText = '最近10分钟'
      } else if (name === '1800') {
        this.menuText = '最近30分钟'
      } else {
        this.menuText = '最近1分钟'
      }
      getPodLog({
        productId: 100,
        name: this.podName,
        sinceSeconds: name === '' ? 60 : name,
        container: this.container
      }).then(res => {
        this.logContent = res.data.replace(/\n/g, '<br>')
      })
    },
    setChart (name, type) {
      let data = []
      this.cpuChartData.forEach((item, index) => {
        item.forEach((value, i) => {
          if (name === value.name && type === 'cpu') {
            let cpu = value.usage.cpu.replace('n', '') / 1000 / 1000
            data.push(cpu.toFixed(2))
          }
          if (name === value.name && type === 'mem') {
            data.push(value.usage.memory.replace('Ki', ''))
          }
        })
      })
      return data
    },
    getChartData () {
      let params = {
        productId: 100,
        name: this.podName
      }
      metricsPod(params).then(res => {
        let cpuChartData = []
        if (this.cpuChartData.length > 5) {
          cpuChartData = this.cpuChartData.slice(1, 6)
        } else {
          cpuChartData = this.cpuChartData
        }
        cpuChartData.push(res.data.containers)
        this.cpuChartData = cpuChartData
        // 时间轴
        // let timestamp = this.timestamp.slice(1, 6)
        // timestamp.push(formatDateTime(res.data.timestamp))
        // this.timestamp = timestamp
      })
    },
    getEvents () {
      this.eventData = []
      let params = {
        productId: 100,
        cluster: this.$store.getters.currentClusterId,
        uid: this.uid
      }
      getEvent(params).then(res => {
        if (res.data) {
          res.data.forEach((item, index) => {
            this.eventData.push({
              message: item.message,
              type: item.type,
              count: item.count,
              // firstTimestamp: formatDate(item.firstTimestamp),
              lastTimestamp: formatDate(item.lastTimestamp),
              reason: item.reason
            })
          })
        }
      })
    },
    formatTableData () {
      this.podData = []
      getPodInfo({
        productId: 100,
        name: this.podName
      }).then(res => {
        let item = res.data
        this.uid = item.metadata.uid
        this.labels = item.metadata.labels
        this.podIP = item.status.podIP
        let details = {
          '名称': item.metadata.name,
          '命名空间': item.metadata.namespace,
          '创建时间': formatDate(
            item.metadata.creationTimestamp
          ),
          '标签': item.metadata.labels || '',
          '节点': item.spec.nodeName,
          '状态': item.status.phase,
          'PodIP': item.status.podIP,
          '节点IP': item.status.hostIP,
          'QoS等级': item.status.qosClass,
          '重启策略': item.spec.restartPolicy,
          'DNS策略': item.spec.dnsPolicy,
          '优雅终止周期': item.spec.terminationGracePeriodSeconds + 's',
          '调度器': item.spec.schedulerName,
          '服务账户': item.spec.serviceAccount
        }
        this.podData = []
        for (let i = 0; i < Object.keys(details).length; i++) {
          this.podData.push({
            key: Object.keys(details)[i],
            val: Object.values(details)[i]
          })
        }
        this.statusData = []
        let lastTransitionTime = null
        let obj = item.status.conditions
        for (let i = 0; i < Object.keys(obj).length; i++) {
          lastTransitionTime = obj[i].lastTransitionTime && formatDate(obj[i].lastTransitionTime)
          this.statusData.push({
            type: obj[i].type,
            status: obj[i].status,
            lastTransitionTime: lastTransitionTime,
            heartBeat: obj[i].heartBeat,
            reason: obj[i].reason,
            message: obj[i].message
          })
        }
        this.containerData = []
        this.containers = item.spec.containers
        let containers = item.spec.containers
        for (let i = 0; i < Object.keys(containers).length; i++) {
          lastTransitionTime = containers[i].lastTransitionTime && formatDate(containers[i].lastTransitionTime)
          this.containerData.push({
            name: containers[i].name,
            image: containers[i].image,
            ports: containers[i].ports || '',
            env: containers[i].env || '',
            resources: containers[i].resources || '',
            volumeMounts: containers[i].volumeMounts || '',
            livenessProbe: containers[i].livenessProbe || '',
            readinessProbe: containers[i].readinessProbe || '',
            imagePullPolicy: containers[i].imagePullPolicy || ''
          })
        }
        this.getEvents()
        this.plugin()
      })
    },
    plugin () {
      List({ // 获取集群是否开启了debug插件
        productId: 100,
        cluster: this.$store.getters.currentClusterId
      }).then(res => {
        res.data.forEach((item, index) => {
          if (item.name === 'Pod Debug' && item.status === 1) {
            this.debugOn = true
          }
        })
      })
    },
    refresh () {
      this.formatTableData()
      this.$Message.success(this.$t('refresh_success'))
    }
  }
}
</script>

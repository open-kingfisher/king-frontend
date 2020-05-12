<template>
  <div>
    <Row type="flex" justify="center" class="row" :gutter=10>
      <Col span="7">
        <Card shadow bordered>
          <p slot="title">{{hostName}}</p>
          <Table border stripe :columns="columns1" :data="nodeData" :show-header=false></Table>
        </Card>
      </Col>
      <Col span="17">
        <Card shadow>
          <Tabs value="status">
            <TabPane label="运行状态" name="status">
              <Card shadow style="margin-bottom: 15px">
                <p slot="title">资源状态</p>
                <Row type="flex" justify="center" class="row">
                  <Col span="12">
                    <charts :title="cpuTitle" v-if="flag" :data="cpuChartData"/>
                  </Col>
                  <Col span="12">
                    <charts :title="memTitle" v-if="flag" :data="memChartData"/>
                  </Col>
<!--                  <Col span="12">-->
<!--                    <charts title="存储使用" v-if="flag" :data="storageChartData"/>-->
<!--                  </Col>-->
                  <Col span="24">
                    <charts :title="podTitle" v-if="flag" :data="podChartData"/>
                  </Col>
                </Row>
              </Card>
              <Card shadow>
                <p slot="title">压力状态</p>
                <Table border stripe :columns="columns2" :data="conditionsData"></Table>
              </Card>
            </TabPane>
            <TabPane label="容器组" name="pod">
              <SearchTable :columns="columns3" :data="podData">
<!--                <ButtonGroup>-->
<!--                  <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>-->
<!--                </ButtonGroup>-->
              </SearchTable>
            </TabPane>
<!--            <TabPane label="监控" name="monitor">监控</TabPane>-->
            <TabPane label="污点" name="taints">
              <div style="margin:10px">
                <information info="Taint（污点）作用于 node 上，其目的是优化 pod 在集群间的调度，具有 taint 的 node 和 pod 是互斥关系，可与 pod Toleration（容忍）相互配合使用。Taint策略：不允许调度（NoSchedule）、尽量不调度（PreferNoSchedule）、不允许并驱逐已有容器组（NoExecute）">
                </information>
                <div v-for="(v, k) in taints" :key="k" :value="v" class="containers">
                  <span class="expand-value">{{ v.key}}</span>
                  <div class="separator"></div>
                  <span class="expand-value">{{ v.value }}</span>
                  <div class="separator"></div>
                  <span class="expand-value">{{ v.effect }}</span>
                </div>
              </div>
            </TabPane>
            <TabPane label="注释" name="annotations">
              <div style="margin:10px">
                <div v-for="(v, k) in annotations" :key="k" :value="v" class="containers">
                  <span class="expand-value">{{ k }}</span>
                  <div class="separator"></div>
                  <span class="expand-value">{{ v }}</span>
                </div>
              </div>
            </TabPane>
            <TabPane label="标签" name="labels">
              <div style="margin:10px">
                <div v-for="(v, k) in labels" :key="k" :value="v" class="containers">
                  <span class="expand-value">{{ k }}</span>
                  <div class="separator"></div>
                  <span class="expand-value">{{ v }}</span>
                </div>
              </div>
            </TabPane>
            <TabPane label="事件" name="event">
              <SearchTable :columns="columns4" :data="eventData">
              </SearchTable>
            </TabPane>
            <TabPane label="镜像" name="image">
              <SearchTable :columns="columns5" :data="imagesData">
              </SearchTable>
            </TabPane>
            <div href="#" slot="extra">
              <ButtonGroup>
<!--                 <Poptip-->
<!--                  confirm-->
<!--                  :title=titleButton-->
<!--                  @on-ok="noSchedulable(schedule)"-->
<!--                  placement="bottom-end">-->
<!--                  -->
<!--                </Poptip>-->
                <!--
                <Poptip
                  confirm
                  title="确定驱除调度吗？"
                  @on-ok="ok"
                  @on-cancel="cancel"
                  placement="bottom-end">
                  <Button style="margin-right: 2px" type="error" size="small">驱除调度</Button>
                </Poptip>
                -->
                <Button v-if="hasPerm('edit_node')" @click="edit()" type="success" size="small" ghost>{{ this.$t('edit') }}</Button>
                <Button v-if="hasPerm('schedule_node')" @click="schedulable()" type="info" size="small" ghost>{{scheduleButton}}</Button>
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
        <span>{{optionTitle}} {{nodename}}</span>
        <ButtonGroup style="float: right; margin-top: -5px">
        <Button @click="yaml()" size="small" :type="yamlType">Yaml</Button>
        <Button @click="json()" size="small" :type="jsonType">Json</Button>
      </ButtonGroup>
      </div>
      <YamlModal :editorContent="editorContent" @change="change" :editorLang="editorLang"></YamlModal>
      <div class="drawer-footer" style="margin-bottom: 1px">
        <Button type="text" style="margin-right: 5px" @click="editShow = false">{{this.$t('cancel')}}</Button>
        <Button type="primary" @click="update(option)">{{this.$t('commit')}}</Button>
      </div>
    </Drawer>
    <Modal v-model="deleteModel" width="360">
      <p slot="header" title="删除">
          <span>{{this.$t('delete')}}</span>
      </p>
      <div style="text-align:center">
        <p style="line-height: 35px; margin-bottom: 10px">确认删除  <strong style="color:#f60;text-align:center">{{podName}}</strong> 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long  @click="del()" :loading="deleteLoading">{{this.$t('delete')}}</Button>
      </div>
    </Modal>
    <Modal v-model="noSchedulableModel" width="360">
      <p slot="header" title="禁止调度">
          <span>{{scheduleButton}}</span>
      </p>
      <div style="text-align:center">
        <p style="line-height: 35px; margin-bottom: 10px">确认{{scheduleButton}}  <strong style="color:#f60;text-align:center">{{nodename}}</strong> 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long  @click="noSchedulable(schedule)" :loading="deleteLoading">{{scheduleButton}}</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { formatDate } from '@/api/tools'
import {
  getOneNodeData,
  listPodByNode,
  delPod,
  schedulable,
  getNodeMetric,
  updateNodes,
  getNodeMetricOther
} from '../../../api/cluster'
import { getEvent } from '../../../api/common'
import SearchTable from '../../other-page/search-table.vue'
import ExpandTable from '../../other-page/expand-table.vue'
import { forEach } from '../../../libs/tools'
import Charts from './charts.vue'
import YamlModal from '../../other-page/yaml-editor.vue'
import Information from '../../other-page/information.vue'
import { hasPermission } from '@/router/permission'
const json2yaml = require('json2yaml')
const yaml2json = require('js-yaml')

export default {
  components: {
    SearchTable,
    ExpandTable,
    Charts,
    YamlModal,
    Information
  },
  data () {
    return {
      noSchedulableModel: false,
      optionTitle: '',
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
      podName: '',
      deleteModel: false,
      deleteLoading: false,
      flag: false,
      item: '',
      hostName: '',
      nodename: '',
      cpuChartData: [],
      memChartData: [],
      storageChartData: [],
      podChartData: [],
      memTotal: '',
      cpuTotal: '',
      podTotal: '',
      podTitle: '',
      memTitle: '',
      cpuTitle: '',
      columns1: [
        {
          title: '名称',
          key: 'key',
          width: 130
        },
        {
          title: '值',
          key: 'val'
        }
      ],
      columns2: [
        {
          title: '类型',
          key: 'type'
        },
        {
          title: this.$t('status'),
          key: 'status',
          width: 130,
          render: (h, params) => {
            let color = ''
            let text = ''
            if (params.row.status === 'False') {
              text = '无压力'
              color = 'success'
            } else if (params.row.status === 'True') {
              text = '有压力'
              color = 'error'
            } else {
              text = '未知'
              color = 'warning'
            }
            if (params.row.type === 'Ready') {
              if (params.row.status === 'True') {
                text = '正常'
                color = 'success'
              } else if (params.row.status === 'False') {
                text = '失败'
                color = 'error'
              } else {
                text = '未知'
                color = 'warning'
              }
            }
            return h(
              'Tag',
              {
                props: {
                  color: color
                }
              },
              text
            )
          }
        },
        {
          title: this.$t('update_time'),
          key: 'lastHeartbeatTime'
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
      columns3: [
        {
          title: '容器',
          type: 'expand',
          width: 60,
          render: (h, params) => {
            return h(ExpandTable, {
              props: {
                row: params.row
              }
            })
          }
        },
        {
          title: '名称',
          key: 'name',
          render: (h, params) => {
            return h(
              'router-link',
              {
                props: {
                  to: {
                    name: 'podinfo',
                    params: {
                      podName: params.row.name
                    }
                  }
                }
              },
              params.row.name
            )
          }
        },
        {
          title: 'IP',
          key: 'ip'
        },
        {
          title: this.$t('status'),
          key: 'status'
        },
        {
          title: '命名空间',
          key: 'namespace'
        },
        {
          title: '启动时间',
          key: 'startTime'
        },
        {
          title: this.$t('option'),
          key: 'action',
          width: 70,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small',
                    disabled: !hasPermission('del_node_pod')
                  },
                  on: {
                    click: () => {
                      this.deleteModel = true
                      this.deleteLoading = false
                      this.podName = params.row.name
                    }
                  }
                },
                this.$t('delete')
              )
            ])
          }
        }
      ],
      columns4: [
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
          key: 'lastTimestamp'
        }
      ],
      columns5: [
        {
          title: '名称',
          key: 'name'
        },
        {
          title: '大小（KB）',
          width: 130,
          sortable: true,
          sortType: 'desc',
          key: 'sizeBytes'
        }
      ],
      nodeData: [],
      conditionsData: [],
      podData: [],
      eventData: [],
      imagesData: [],
      annotations: null,
      images: null,
      labels: null,
      taints: null,
      uid: '',
      schedule: null,
      scheduleButton: '禁止调度',
      unschedulable: '',
      titleButton: ''
    }
  },
  mounted () {
    this.$store.commit('setClusterSelect', true)
    if (this.$route.params.nodename) {
      this.nodename = this.$route.params.nodename
      localStorage.setItem('nodename', this.nodename)
    } else {
      this.nodename = localStorage.getItem('nodename')
    }
    this.formatTableData()
    this.getPodData()
    this.getNodeMetricData()
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
  watch: {
    editShow (curval, oldval) {
      if (curval) {
        let params = {
          productId: 100,
          nodename: this.nodename
        }
        getOneNodeData(params).then(res => {
          this.item = res.data
        })
      }
    }
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
      this.editorContent = this.updateYaml
      this.yamlType = 'success'
      this.jsonType = 'default'
      this.updateYaml = ''
      this.originYaml = ''
      this.editShow = true
      this.optionTitle = '查看'
      this.option = 'edit'
      getOneNodeData({
        productId: 100,
        nodename: this.nodename
      }).then(res => {
        this.type = 'success'
        this.originYaml = res.data
        this.editorLang = 'yaml'
        this.editorContent = json2yaml.stringify(this.originYaml)
      })
    },
    schedulable () {
      this.noSchedulableModel = true
    },
    // 监听子组件的change事件
    change (content) {
      this.updateYaml = content
    },
    update () {
      let updateJson = ''
      if (this.option === 'edit') {
        try {
          // updateJson = JSON.parse(this.updateYaml)
          updateJson = yaml2json.load(this.updateYaml)
        } catch (e) {
          this.$Message.error({
            content: '格式不对'
          })
          return
        }
        this.editorContent = this.updateYaml
        updateNodes({
          productId: 100,
          updateJson: updateJson,
          nodename: this.nodename,
          cluster: this.$store.getters.currentClusterId
        }).then(res => {
          if (res.code === 200 && res.msg === '') {
            this.formatTableData()
            this.$Message.success({
              content: this.$t('edit_success')
            })
            this.editShow = false
          } else {
            this.$Message.error({
              content: this.$t('edit_failure')
            })
          }
        })
      }
    },
    cancel () {
      this.modalShow = false
    },
    getChartData () {
      let params = {
        productId: 100,
        cluster: this.$store.getters.currentClusterId,
        nodename: this.nodename
      }
      getNodeMetric(params).then(res => {
        // 内存
        let memChartData = []
        if (this.memChartData.length > 5) {
          memChartData = this.memChartData.slice(1, 6)
        } else {
          memChartData = this.memChartData
        }
        let mem = res.data.usage.memory.replace('Ki', '') / this.memTotal.replace('Ki', '') * 100
        memChartData.push(mem.toFixed(2))
        this.memChartData = memChartData
        // CPU
        let cpuChartData = []
        if (this.cpuChartData.length > 5) {
          cpuChartData = this.cpuChartData.slice(1, 6)
        } else {
          cpuChartData = this.cpuChartData
        }
        let cpu = res.data.usage.cpu.replace('n', '') / (this.cpuTotal * 10 ** 9) * 100
        cpuChartData.push(cpu.toFixed(2))
        this.cpuChartData = cpuChartData
        this.flag = true
      })
      getNodeMetricOther(params).then(res => {
        // Pod
        let podChartData = []
        if (this.podChartData.length > 5) {
          podChartData = this.podChartData.slice(1, 6)
        } else {
          podChartData = this.podChartData
        }
        let pod = res.data.pod.used / this.podTotal * 100
        podChartData.push(pod.toFixed(2))
        this.podChartData = podChartData
        this.podTitle = '容器组　总数: ' + res.data.pod.total
        // storage
        let storageChartData = []
        if (this.storageChartData.length > 5) {
          storageChartData = this.storageChartData.slice(1, 6)
        } else {
          storageChartData = this.storageChartData
        }
        storageChartData.push(res.data.storage.used)
        this.storageChartData = storageChartData
        this.flag = true
      })
    },
    updateNode () {
      let params = {
        productId: 100,
        nodename: this.nodename,
        cluster: this.$store.getters.currentClusterId,
        updateJson: JSON.parse(this.updateYaml)
      }
      updateNodes(params).then(res => {
        if (res.code === 200 && res.msg === '') {
          this.formatTableData()
          this.$Notice.info({
            title: this.$t('edit_success'),
            duration: 4
          })
        } else {
          this.$Notice.info({
            title: this.$t('edit_failure'),
            duration: 4
          })
        }
      })
    },
    noSchedulable (schedule) {
      this.noSchedulableModel = true
      let params = {
        productId: 100,
        cluster: this.$store.getters.currentClusterId,
        nodename: this.nodename,
        val: schedule
      }
      schedulable(params).then(res => {
        if (res.code === 200 && res.msg === '') {
          this.createModalMsg(2)
          this.$Message.success({
            content: this.$t('action_success')
          })
        } else {
          this.$Message.error('操作失败')
        }
        this.noSchedulableModel = false
      })
    },
    createModalMsg (val) {
      if (val === true) {
        this.modalShow = val
      } else if (val === false) {
        this.modalShow = val
      } else if (val === 2) {
        this.modalShow = false
        this.formatTableData()
        this.getPodData()
      }
    },
    getNodeMetricData () {
      let params = {
        productId: 100,
        cluster: this.$store.getters.currentClusterId,
        nodename: this.nodename
      }
      getNodeMetric(params).then(res => {
        this.CPUChartData = res.data.cpu
        this.MemChartData = res.data.memory
        this.StorageChartData = res.data.storage
        this.PodChartData = res.data.pod
        this.flag = true
      })
    },
    getPodData () {
      this.podData = []
      let params = {
        productId: 100,
        nodename: this.nodename
      }
      listPodByNode(params).then(res => {
        forEach(res.data, (item, index) => {
          this.podData.push({
            name: item.metadata.name,
            ip: item.status.podIP,
            status: item.status.phase,
            namespace: item.metadata.namespace,
            startTime: formatDate(item.status.startTime),
            container: item.spec.containers
          })
        })
      })
    },
    getImages () {
      this.imagesData = []
      forEach(this.item.status.images, (item, index) => {
        this.imagesData.push({
          name: item.names[1],
          sizeBytes: Math.round(item.sizeBytes / 1000)
        })
      })
    },
    getClusterEvent () {
      this.eventData = []
      let params = {
        kind: 'Node',
        productId: 100,
        cluster: this.$store.getters.currentClusterId,
        uid: this.uid
      }
      getEvent(params).then(res => {
        if (res.data) {
          forEach(res.data, (item, index) => {
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
    del () {
      this.deleteLoading = true
      delPod({
        podName: this.podName,
        cluster: this.$store.getters.currentClusterId,
        namespaceName: this.$store.getters.currentNamespaceName
      }).then(res => {
        if (res.code === 200) {
          this.$Message.success({
            content: this.$t('action_success')
          })
          this.getPodData()
          this.getClusterEvent()
          this.deleteLoading = false
          this.deleteModel = false
        } else {
          this.deleteLoading = false
        }
      })
    },
    formatTableData () {
      this.nodeData = []
      let params = {
        productId: 100,
        nodename: this.nodename
      }
      getOneNodeData(params).then(res => {
        this.item = res.data
        this.annotations = this.item.metadata.annotations
        this.images = this.item.status.images
        this.labels = this.item.metadata.labels
        this.taints = this.item.spec.taints
        this.hostName = this.item.status.addresses[1].address
        this.CPUUsable = this.item.status.capacity.cpu
        this.cpuTotal = this.item.status.allocatable.cpu
        this.memTotal = this.item.status.capacity.memory
        this.memTitle = '内存　总数: ' + this.memTotal
        this.cpuTitle = 'CPU　总数: ' + this.cpuTotal + '核'
        this.podTotal = this.item.status.allocatable.pods

        this.item.status.conditions.forEach(element => {
          element['lastHeartbeatTime'] = formatDate(element.lastHeartbeatTime)
          element['lastTransitionTime'] = formatDate(element.lastTransitionTime)
        })
        this.conditionsData = this.item.status.conditions
        this.uid = this.item.metadata.name
        this.unschedulable = 'false'
        if (this.item.spec.unschedulable) {
          this.unschedulable = this.item.spec.unschedulable
        }
        if (this.unschedulable === true) {
          this.scheduleButton = '开启调度'
          this.titleButton = '确定开启调度吗？'
          this.schedule = false
        } else {
          this.scheduleButton = '禁止调度'
          this.titleButton = '确定禁止调度吗？'
          this.schedule = true
        }
        let detail = {
          '主机名': this.item.status.addresses[1].address,
          // 'UID': this.item.metadata.uid,
          '不可调度': this.unschedulable,
          'IP地址': this.item.status.addresses[0].address,
          '容器组CIDR': this.item.spec.podCIDR,
          '操作系统': this.item.status.nodeInfo.osImage,
          '内核版本': this.item.status.nodeInfo.kernelVersion,
          '容器版本': this.item.status.nodeInfo.containerRuntimeVersion,
          'Kubelet版本': this.item.status.nodeInfo.kubeletVersion,
          'Kube-Proxy版本': this.item.status.nodeInfo.kubeProxyVersion,
          '创建时间': formatDate(this.item.metadata.creationTimestamp)
        }
        for (let i = 0; i < Object.keys(detail).length; i++) {
          this.nodeData.push({
            key: Object.keys(detail)[i],
            val: Object.values(detail)[i] || '无'
          })
        }
        this.getClusterEvent()
        this.getImages()
      })
    },
    refresh () {
      this.formatTableData()
      this.getPodData()
      this.getNodeMetricData()
      this.deleteLoading = false
      this.$Message.success(this.$t('refresh_success'))
    }
  }
}
</script>

<template>
  <div>
    <Row type="flex" justify="center" class="row" :gutter=10>
      <Col span="7">
        <Card shadow>
          <p slot="title">{{servicename}}</p>
          <Table border stripe :columns="serviceColumns" :data="serviceData" :show-header=false></Table>
        </Card>
      </Col>
      <Col span="17">
        <Card shadow>
          <Tabs value="status">
            <TabPane label="运行状态" name="status">
              <Card shadow>
                <charts :data="chartData"></charts>
              </Card>
              <Card shadow>
                <SearchTable :columns="podColumns" :data="podData"></SearchTable>
              </Card>
            </TabPane>
            <TabPane label="事件" name="event">
              <SearchTable :columns="eventColumns" :data="eventData"></SearchTable>
            </TabPane>
            <div href="#" slot="extra">
              <Button @click="refresh()" type="success" size="small" ghost>{{ this.$t('refresh') }}</Button>
            </div>
          </Tabs>
        </Card>
      </Col>
    </Row>
    <Modal v-model="deleteModelPod" width="360">
      <p slot="header" title="删除">
          <span>{{this.$t('delete')}}</span>
      </p>
      <div style="text-align:center">
        <p style="line-height: 35px; margin-bottom: 10px">确认删除  <strong style="color:#f60;text-align:center">{{podName}}</strong> 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long  @click="delPod()" :loading="deleteLoading">{{this.$t('delete')}}</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { getOneService, listPodByService } from '@/api/discovery'
import { delPod } from '../../../api/cluster'
import { formatDate } from '@/api/tools'
import SearchTable from '../../other-page/search-table.vue'
import ExpandTable from '../../other-page/expand-table.vue'
import { forEach } from '../../../libs/tools'
import YamlModal from '../../other-page/yaml-editor.vue'
import Information from '../../other-page/information.vue'
import Charts from './charts.vue'
import { getEvent } from '../../../api/common'
import { hasPermission } from '@/router/permission'

export default {
  components: {
    SearchTable,
    ExpandTable,
    YamlModal,
    Information,
    Charts
  },
  data () {
    return {
      podName: '',
      deleteModelPod: false,
      deleteLoading: false,
      chartData: {
        port: [],
        line: [],
        protocol: ''
      },
      updateYaml: '',
      originYaml: '',
      editShow: false,
      item: '',
      serviceData: [],
      serviceColumns: [
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
              params.row.key === '标签' ||
              params.row.key === '选择标签'
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
            } else if (params.row.key === '端口') {
              return h(
                'ul',
                {
                  style: {
                    listStyle: 'none'
                  }
                },
                Object.keys(params.row.val).map(item => {
                  let info =
                    'nodePort=' +
                    params.row.val[item]['nodePort'] +
                    '，' +
                    'port=' +
                    params.row.val[item]['port'] +
                    '，' +
                    'targetPort=' +
                    params.row.val[item]['targetPort'] +
                    '，' +
                    'protocol=' +
                    params.row.val[item]['protocol']
                  return h('li', info)
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
      podColumns: [
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
          key: 'status',
          render: (h, params) => {
            let color = 'success'
            if (params.row.status === 'Running') {
              color = 'success'
            } else if (params.row.status === 'Pending') {
              color = 'warning'
            } else {
              color = 'error'
            }
            return h(
              'Tag',
              {
                props: {
                  color: color
                }
              },
              params.row.status
            )
          }
        },
        // {
        //   title: '命名空间',
        //   key: 'namespace'
        // },
        {
          title: this.$t('node'),
          key: 'node'
        },
        {
          title: '启动时间',
          key: 'startTime',
          sortable: true,
          sortType: 'desc'
        },
        {
          title: this.$t('option'),
          key: 'action',
          width: 75,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small',
                    disabled: !hasPermission('del_service_pod')
                  },
                  on: {
                    click: () => {
                      this.deleteModelPod = true
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
      podData: [],
      eventData: [],
      labels: null,
      uid: '',
      servicename: ''
    }
  },
  mounted () {
    this.$store.commit('setClusterSelect', true)
    if (this.$route.params.servicename) {
      this.servicename = this.$route.params.servicename
      localStorage.setItem('servicename', this.servicename)
    } else {
      this.servicename = localStorage.getItem('servicename')
    }
    this.formatTableData()
    this.getPodData()
  },
  methods: {
    delPod () {
      this.deleteLoading = true
      delPod({
        namespaceName: this.$store.getters.currentNamespaceName,
        podName: this.podName,
        cluster: this.$store.getters.currentClusterId
      }).then(res => {
        if (res.code === 200) {
          this.$Message.success({
            content: this.$t('action_success')
          })
          this.getPodData()
          this.getEvents()
          this.deleteLoading = false
          this.deleteModelPod = false
        } else {
          this.deleteLoading = false
        }
      })
    },
    getPodData () {
      this.podData = []
      let params = {
        productId: 100,
        name: this.servicename
      }
      listPodByService(params).then(res => {
        forEach(res.data.items, (item, index) => {
          this.podData.push({
            name: item.metadata.name,
            ip: item.status.podIP,
            status: item.status.phase,
            namespace: item.metadata.namespace,
            node: item.spec.nodeName,
            startTime: formatDate(item.status.startTime),
            container: item.spec.containers
          })
        })
      })
    },
    getEvents () {
      this.eventData = []
      let params2 = {
        productId: 100,
        cluster: this.$store.getters.currentClusterId,
        uid: this.uid
      }
      getEvent(params2).then(res => {
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
    formatTableData () {
      this.serviceData = []
      getOneService({
        productId: 100,
        serviceName: this.servicename
      }).then(res => {
        let item = res.data
        this.uid = item.metadata.uid
        this.labels = item.metadata.labels
        let details = {
          '名称': item.metadata.name,
          '命名空间': item.metadata.namespace,
          '选择标签': item.spec.selector || {},
          '标签': item.metadata.labels || {},
          '类型': item.spec.type,
          '会话保持': item.spec.sessionAffinity,
          'IP地址': item.spec.clusterIP,
          '创建时间': formatDate(
            item.metadata.creationTimestamp
          )
          // '端口': item.spec.ports
        }
        let data = []
        for (let i = 0; i < Object.keys(details).length; i++) {
          data.push({
            key: Object.keys(details)[i],
            val: Object.values(details)[i]
          })
        }
        this.serviceData = data
        this.getChartData(item.spec)
        this.getEvents()
      })
    },
    getChartData (spec) {
      this.chartData = {
        port: [],
        line: [],
        protocol: ''
      }
      if (spec.ports !== undefined) {
        forEach(spec.ports, (item, index) => {
          let nodePort = ''
          if (item.nodePort) {
            nodePort = '节点端口：' + item.nodePort
          } else {
            nodePort = spec.clusterIP
          }
          this.chartData.port.push(
            {
              name: nodePort,
              value: [100, 55 * (index + 1)],
              symbol: 'emptyRectangle',
              symbolSize: [100, 30],
              itemStyle: {
                normal: {
                  color: '#19be6b',
                  borderWidth: 1
                }
              }
            }
          )
          this.chartData.port.push(
            {
              name: '服务端口：' + item.port,
              value: [300, 55 * (index + 1)],
              symbol: 'emptyRectangle',
              symbolSize: [100, 30],
              itemStyle: {
                normal: {
                  color: '#19be6b',
                  borderWidth: 1
                }
              }
            }
          )
          this.chartData.port.push(
            {
              name: '容器端口：' + item.targetPort,
              value: [500, 55 * (index + 1)],
              symbol: 'emptyRectangle',
              symbolSize: [100, 30],
              itemStyle: {
                normal: {
                  color: '#19be6b',
                  borderWidth: 1
                }
              }
            }
          )
          this.chartData.line.push(
            {
              'name': item.protocol,
              'coords': [
                [150, 55 * (index + 1)],
                [250, 55 * (index + 1)]
              ]
            }
          )
          this.chartData.line.push(
            {
              'name': item.protocol,
              'coords': [
                [350, 55 * (index + 1)],
                [450, 55 * (index + 1)]
              ]
            }
          )
        })
      }
    },
    refresh () {
      this.formatTableData()
      this.getPodData()
      this.$Message.success(this.$t('refresh_success'))
    }
  }
}
</script>

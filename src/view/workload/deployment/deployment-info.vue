<style>
  .ivu-poptip-body {
    padding: 8px;
  }
  .ivu-poptip-body-content div {
    overflow: auto;
  }
  .ivu-poptip-body-content div table {
    border-collapse: collapse;
    border-spacing: 0;
    empty-cells: show;
    border: 1px solid #e9e9e9;
  }
  .ivu-poptip-body-content div table th, .ivu-poptip-body-content div table td {
    border: 1px solid #e9e9e9;
    padding: 8px 16px;
    text-align: left;
  }
</style>
<template>
  <div>
    <Row type="flex" justify="center" class="row" :gutter=10>
      <Col span="6">
        <Card dis-hover>
          <p slot="title">{{deploymentename}}</p>
          <Table border stripe :columns="deploymentColumns" :data="deploymentData" :show-header=false>
          </Table>
        </Card>
      </Col>
      <Col span="18">
        <Card shadow>
          <Tabs v-model="tab" @on-click="tabClick(tab)">
            <TabPane label="运行状态" name="status">
              <Card shadow>
                <Row type="flex" justify="center" class="row">
                  <Col span="24">
                    <charts :data="chartData"></charts>
                  </Col>
                </Row>
              </Card>
            </TabPane>
            <TabPane label="容器组" name="pod">
              <Card shadow>
                <SearchTable :columns="podColumns" :data="podData"></SearchTable>
              </Card>
            </TabPane>
            <TabPane label="水平伸缩" name="hpa">
              <SearchTable :columns="hpaColumns" :data="hpaData">
                <ButtonGroup>
                  <Button v-if="hasPerm('add_hpa')" @click="createBtnClick('CREATE')" style="margin-right: 3px" type="success" :disabled="addHPA">{{ this.$t('add') }}</Button>
                </ButtonGroup>
              </SearchTable>
            </TabPane>
            <TabPane label="副本集" name="replica">
              <SearchTable :columns="replicaColumns" :data="replicaData">
              </SearchTable>
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
            <TabPane label="事件" name="event">
              <SearchTable :columns="eventColumns" :data="eventData"></SearchTable>
            </TabPane>
            <div slot="extra">
              <Button @click="refresh()" type="success" size="small" ghost>{{ this.$t('refresh') }}</Button>
            </div>
          </Tabs>
        </Card>
      </Col>
    </Row>
    <Modal v-model="deleteModelHPA" width="360">
      <p slot="header" title="删除">
          <span>{{this.$t('delete')}}</span>
      </p>
      <div style="text-align:center">
        <p style="line-height: 35px; margin-bottom: 10px">确认删除  <strong style="color:#f60;text-align:center">{{hpaName}}</strong> 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long  @click="delHPA()" :loading="deleteLoading">{{this.$t('delete')}}</Button>
      </div>
    </Modal>
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
    <Modal v-model="deleteModel" width="360">
      <p slot="header" title="删除">
          <span>{{this.$t('delete')}}</span>
      </p>
      <div style="text-align:center">
        <p style="line-height: 35px; margin-bottom: 10px">确认删除  <strong style="color:#f60;text-align:center">{{replicasetName}}</strong> 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long  @click="delReplicaset()" :loading="deleteLoading">{{this.$t('delete')}}</Button>
      </div>
    </Modal>
    <Modal v-model="formAddModel" :title="optionTitle" width="600">
      <Form ref="createFormItem" v-show="current === 0" :model="formItem" :label-width="90" :rules="validate">
        <FormItem label="最小副本数" class="ivu-form-item ivu-form-item-required" prop="minReplicas">
          <Input v-model="formItem.minReplicas"></Input>
        </FormItem>
        <FormItem label="最大副本数" class="ivu-form-item ivu-form-item-required" prop="maxReplicas">
          <Input v-model="formItem.maxReplicas"></Input>
        </FormItem>
        <FormItem label="CPU百分比" class="ivu-form-item ivu-form-item-required" prop="targetCPUUtilizationPercentage">
          <Slider v-model="formItem.targetCPUUtilizationPercentage" :tip-format="format" show-input></Slider>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" v-if="current == 0 && option == 'add'" @click="formOption('CREATE')">{{this.$t('create')}}</Button>
        <Button type="primary" v-if="current == 0 && option == 'edit'" @click="formOption('EDIT')">{{this.$t('commit')}}</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  getOneControllerInfo,
  getReplicasetOfCtrl,
  getEventOfCtrl,
  getHpaByDeployment,
  deleteHPA,
  deleteReplicaset,
  listPodByController,
  getDeploymentChartData,
  formCreateHPA
} from '@/api/deployment'
import { formatDate } from '@/api/tools'
import SearchTable from '@/view/other-page/search-table.vue'
import { getEvent } from '../../../api/common'
import { delPod } from '../../../api/cluster'
import ExpandTable from '../../other-page/expand-table.vue'
import Charts from '../../discovery/ingress/charts.vue'
import { hasPermission } from '@/router/permission'
import { updateHPA } from '../../../api/deployment'

export default {
  components: {
    SearchTable,
    ExpandTable,
    Charts
  },
  data () {
    const validateNumber = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('not_null')))
      } else {
        let reg = /^[0-9]*$/
        if (!reg.test(value)) {
          callback(new Error(this.$t('number')))
        }
        if (rule.field === 'maxReplicas') {
          if (parseInt(this.formItem.minReplicas) > value) {
            callback(new Error('不能小于最小副本数'))
          }
        }
        callback()
      }
    }
    return {
      // From Add Model
      addHPA: true,
      current: 0,
      nameDisabled: false,
      option: '',
      optionTitle: '',
      formAddModel: false,
      formItem: {
        minReplicas: '',
        maxReplicas: '',
        targetCPUUtilizationPercentage: 0
      },
      validate: {
        minReplicas: [
          { validator: validateNumber, trigger: 'blur' }
        ],
        maxReplicas: [
          { validator: validateNumber, trigger: 'blur' }
        ],
        targetCPUUtilizationPercentage: [
          { validator: validateNumber, trigger: 'blur' }
        ]
      },
      tab: 'status',
      hpaName: '',
      podName: '',
      replicasetName: '',
      deleteModel: false,
      deleteModelHPA: false,
      deleteModelPod: false,
      deleteLoading: false,
      chartData: '',
      annotations: '',
      uidOfReplicaSets: [],
      uidOfHPAs: [],
      deploymentColumns: [
        {
          title: '指标',
          key: 'key',
          width: 110
        },
        {
          title: this.$t('describe'),
          key: 'val',
          render: (h, params) => {
            if (
              params.row.key === '标签' ||
              params.row.key === '选择器' ||
              params.row.key === '注释'
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
      replicaColumns: [
        {
          title: '名称',
          key: 'name'
        },
        {
          title: this.$t('label'),
          key: 'labels',
          render: (h, params) => {
            return h(
              'div',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.keys(params.row.labels).map(item => {
                return h(
                  'Tag',
                  {
                    props: {
                      color: 'success'
                    }
                  },
                  item + ' | ' + params.row.labels[item]
                )
              })
            )
          }
        },
        {
          title: this.$t('pod'),
          key: 'conPercent'
        },
        {
          title: this.$t('image'),
          key: 'image',
          minWidth: 100
        },
        {
          title: this.$t('create_time'),
          key: 'create_time',
          width: 150,
          align: 'center',
          sortable: true,
          sortType: 'desc',
          render: (h, params) => {
            return h('div', formatDate(params.row.create_time))
          }
        },
        {
          title: this.$t('action'),
          key: 'action',
          width: 80,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small',
                    disabled: !hasPermission('del_rep')
                  },
                  on: {
                    click: () => {
                      this.deleteModel = true
                      this.deleteLoading = false
                      this.replicasetName = params.row.name
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
      hpaColumns: [
        {
          title: '名称',
          key: 'name'
        },
        {
          title: '目标CPU使用率',
          key: 'targetCPU'
        },
        {
          title: '当前CPU使用率',
          key: 'currentCPU'
        },
        {
          title: '最小副本数',
          key: 'minReplicas'
        },
        {
          title: '最大副本数',
          key: 'maxReplicas'
        },
        {
          title: '当前副本数',
          key: 'currentReplicas'
        },
        {
          title: '最后缩放时间',
          key: 'last_time',
          width: 170,
          sortable: true,
          sortType: 'desc',
          render: (h, params) => {
            return h('div', params.row.last_time ? formatDate(params.row.last_time) : '未发生过缩放')
          }
        },
        {
          title: this.$t('action'),
          key: 'action',
          align: 'center',
          width: 120,
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'success',
                    size: 'small',
                    disabled: !hasPermission('edit_hpa')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.current = 0
                      this.optionTitle = this.$t('edit') + ' ' + params.row.name
                      this.option = 'edit'
                      this.formAddModel = true
                      this.formEdit()
                    }
                  }
                },
                this.$t('edit')
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small',
                    disabled: !hasPermission('del_hpa')
                  },
                  on: {
                    click: () => {
                      this.deleteModelHPA = true
                      this.deleteLoading = false
                      this.hpaName = params.row.name
                    }
                  }
                },
                this.$t('delete')
              )
            ])
          }
        }
      ],
      deploymentData: [],
      replicaData: [],
      eventData: [],
      hpaData: [],
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
          width: 120,
          render: (h, params) => {
            let text = params.row.status
            let tr = []
            params.row.message.forEach((item, index) => {
              tr.push(h(
                'tr',
                [
                  h(
                    'td',
                    item.name
                  ),
                  h(
                    'td',
                    item.status
                  ),
                  h(
                    'td',
                    item.reason
                  ),
                  h(
                    'td',
                    item.message
                  )
                ]
              ))
            })
            if (text === 'Running' && params.row.message.length === 0) {
              return h(
                'Tag',
                {
                  props: {
                    color: 'success'
                  }
                },
                text
              )
            } else {
              return h(
                'Poptip',
                {
                  props: {
                    placement: 'right',
                    width: 450,
                    trigger: 'hover',
                    transfer: true
                  }
                },
                [
                  h(
                    'Tag',
                    {
                      props: {
                        color: 'warning'
                      }
                    },
                    text
                  ),
                  h(
                    'div',
                    {
                      slot: 'content'
                    },
                    [
                      h(
                        'table',
                        [
                          h(
                            'thead',
                            [
                              h(
                                'tr',
                                [
                                  h(
                                    'th',
                                    '对象'
                                  ),
                                  h(
                                    'th',
                                    '状态'
                                  ),
                                  h(
                                    'th',
                                    '原因'
                                  ),
                                  h(
                                    'th',
                                    '信息'
                                  )
                                ]
                              )
                            ]
                          ),
                          h(
                            'tbody',
                            tr
                          )
                        ]
                      )
                    ]
                  )
                ]
              )
            }
          }
        },
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
                    disabled: !hasPermission('del_pod_dep')
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
      allData: [],
      podData: [],
      deploymentename: '',
      setName: '',
      uid: ''
    }
  },
  mounted () {
    this.$store.commit('setClusterSelect', true)
    if (this.$route.params.ctrl) {
      this.deploymentename = this.$route.params.ctrl
      localStorage.setItem('deploymentename', this.deploymentename)
    } else {
      this.deploymentename = localStorage.getItem('deploymentename')
    }
    if (this.$route.params.setName) {
      this.setName = this.$route.params.setName
      localStorage.setItem('setName', this.setName)
    } else {
      this.setName = localStorage.getItem('setName')
    }
    this.formatTableData()
    this.getChartData()
    // 刷新图表
    if (this.timer) {
      clearInterval(this.timer)
    } else {
      this.timer = setInterval(() => {
        this.getChartData()
      }, 5 * 1000)
    }
  },
  // 关闭页面后停止刷新
  destroyed () {
    clearInterval(this.timer)
  },
  methods: {
    getChartData () {
      getDeploymentChartData({
        productId: 100,
        setName: this.setName,
        ctrl: this.deploymentename
      }).then(res => {
        this.chartData = res.data
      })
    },
    getTableDataAPI (pageType, options) {
      if (pageType === '详情') {
        return getOneControllerInfo({
          setName: this.setName,
          ctrl: this.deploymentename
        })
      } else if (pageType === '副本集') {
        return getReplicasetOfCtrl({
          productId: 100,
          uid: this.uid
        })
      } else if (pageType === '事件') {
        return getEventOfCtrl({
          productId: 100,
          uid: options.uid
        })
      } else if (pageType === '容器水平伸缩') {
        return getHpaByDeployment({
          kind: this.setName,
          kindName: this.deploymentename,
          productId: 100
          // namespace: 'default'
        })
      }
    },
    getPodData () {
      this.podData = []
      let params = {
        productId: 100,
        setName: this.setName,
        ctrl: this.deploymentename
      }
      listPodByController(params).then(res => {
        res.data.items.forEach((item, index) => {
          let status = item.status.phase
          let message = []
          let containerStatuses = item.status.containerStatuses ? item.status.containerStatuses : []
          let initContainerStatuses = item.status.initContainerStatuses ? item.status.initContainerStatuses : []
          let allContainerStatuses = containerStatuses.concat(initContainerStatuses)
          // 条件
          if (item.status.conditions) {
            item.status.conditions.forEach((condition, index) => {
              if (condition.status === 'False') {
                message.push({
                  status: condition.status,
                  name: condition.type,
                  reason: condition.reason ? condition.reason : '',
                  message: condition.message ? condition.message : ''
                })
                status = 'NotReady'
              }
            })
          }
          // 容器状态
          for (let i = 0; i < allContainerStatuses.length; i++) {
            if (!allContainerStatuses[i].ready) {
              if (allContainerStatuses[i].state.waiting) {
                message.push({
                  status: 'Waiting',
                  name: allContainerStatuses[i].name,
                  reason: allContainerStatuses[i].state.waiting.reason,
                  message: allContainerStatuses[i].state.waiting.message
                })
                status = 'Waiting'
              }
              if (allContainerStatuses[i].state.terminated) {
                message.push({
                  status: 'Terminated',
                  name: allContainerStatuses[i].name,
                  reason: allContainerStatuses[i].state.terminated.reason,
                  message: allContainerStatuses[i].state.terminated.message
                })
                status = 'Terminated'
              }
            }
          }
          this.podData.push({
            name: item.metadata.name,
            ip: item.status.podIP,
            status: status,
            message: message,
            namespace: item.metadata.namespace,
            node: item.spec.nodeName,
            startTime: formatDate(item.status.startTime),
            container: item.spec.containers,
            initContainers: item.spec.initContainers ? item.spec.initContainers : [],
            initContainerStatuses: item.status.initContainerStatuses ? item.spec.initContainerStatuses : [],
            containerStatuses: item.status.containerStatuses
          })
        })
      })
    },
    delHPA () {
      this.deleteLoading = true
      deleteHPA({
        productId: 100,
        hpaName: this.hpaName
      }).then(res => {
        if (res.code === 200) {
          this.$Message.success({
            content: this.$t('action_success')
          })
          this.getHPA()
          this.deleteLoading = false
          this.deleteModelHPA = false
        } else {
          this.deleteLoading = false
        }
      })
    },
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
    delReplicaset () {
      this.deleteLoading = true
      deleteReplicaset({
        replicasetName: this.replicasetName
      }).then(res => {
        if (res.code === 200) {
          this.$Message.success({
            content: this.$t('action_success')
          })
          this.getReplica()
          this.getEvents()
          this.deleteLoading = false
          this.deleteModel = false
        } else {
          this.deleteLoading = false
        }
      })
    },
    formatTableData () {
      this.getTableDataAPI('详情').then(res => {
        let item = res.data
        this.annotations = item.metadata.annotations
        this.uid = item.metadata.uid
        let STRATEGY = item.spec.strategy || item.spec.updateStrategy
        let availableReplicas = 0
        if (item.status.availableReplicas) {
          availableReplicas = item.status.availableReplicas
        }
        if (item.status.readyReplicas) {
          availableReplicas = item.status.readyReplicas
        }
        let rollingUpdate = ''
        if (item.kind === 'Deployment') {
          rollingUpdate = '最大激增数：' +
            (STRATEGY.hasOwnProperty('rollingUpdate') ? STRATEGY.rollingUpdate.maxSurge : '-') +
            '，最大无效数：' +
            (STRATEGY.hasOwnProperty('rollingUpdate') ? STRATEGY.rollingUpdate.maxUnavailable : '-')
        }
        if (item.kind === 'StatefulSet') {
          for (let k in item.spec.updateStrategy.rollingUpdate) {
            rollingUpdate = k + ':' + item.spec.updateStrategy.rollingUpdate[k]
          }
        }
        let details = {
          '名称': item.metadata.name,
          '命名空间': item.metadata.namespace,
          '标签': item.metadata.labels || {},
          '状态':
            '共计：' +
            item.status.replicas +
            '个，已更新：' +
            item.status.updatedReplicas +
            '个，可用：' +
            availableReplicas +
            '个，不可用：' +
            (item.status.replicas - availableReplicas) +
            '个',
          '选择器': item.spec.selector.matchLabels || {},
          '策略': STRATEGY.type,
          '滚动更新策略': rollingUpdate,
          '历史版本数量': item.spec.revisionHistoryLimit,
          '最小就绪秒数': item.spec.progressDeadlineSeconds,
          '创建时间': formatDate(item.metadata.creationTimestamp)
        }
        let data = []
        for (let i = 0; i < Object.keys(details).length; i++) {
          data.push({
            key: Object.keys(details)[i],
            val: Object.values(details)[i]
          })
        }
        this.deploymentData = data
      })
    },
    tabClick (tab) {
      if (tab === 'pod') {
        this.getPodData()
      }
      if (tab === 'hpa') {
        this.getHPA()
      }
      if (tab === 'replica') {
        this.getReplica()
      }
      if (tab === 'events') {
        this.getEvents()
      }
    },
    getReplica () {
      this.getTableDataAPI('副本集').then(res => {
        let data = []
        let uids = []
        if (res.code === 200 && res.data !== null) {
          res.data.forEach((item, index) => {
            uids.push(item.metadata.uid)
            data.push({
              name: item.metadata.name,
              conPercent:
                (item.status.readyReplicas || '0') +
                ' / ' +
                (item.status.replicas || '0'),
              labels: item.metadata.labels,
              image: item.spec.template.spec.containers[0].image,
              create_time: item.metadata.creationTimestamp
            })
          })
        }
        this.replicaData = data
        this.uidOfReplicaSets = uids
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
        if (res.code === 200 && res.data !== null) {
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
    getHPA () {
      this.getTableDataAPI('容器水平伸缩').then(res => {
        let data = []
        let uids = []
        if (res.code === 200 && res.data !== null) {
          res.data.forEach((item, index) => {
            uids.push(item.metadata.uid)
            let currentCPU = 'unknown'
            if (item.status.currentCPUUtilizationPercentage !== undefined) {
              currentCPU = item.status.currentCPUUtilizationPercentage + '%'
            }
            data.push({
              name: item.metadata.name,
              last_time: item.status.lastScaleTime,
              targetCPU: item.spec.targetCPUUtilizationPercentage + '%',
              currentCPU: currentCPU,
              maxReplicas: item.spec.maxReplicas,
              minReplicas: item.spec.minReplicas,
              currentReplicas: item.status.currentReplicas
            })
          })
        }
        this.uidOfHPAs = uids
        this.hpaData = data
        if (data.length === 0) {
          this.addHPA = false
        } else {
          this.addHPA = true
        }
      })
    },
    refresh () {
      this.formatTableData()
      this.getPodData()
      this.getHPA()
      this.getReplica()
      this.getEvents()
      this.$Message.success(this.$t('refresh_success'))
    },
    // 表单添加
    format (val) {
      return val + '%'
    },
    createBtnClick () {
      this.handleReset()
      this.current = 0
      this.ingressName = ''
      this.optionTitle = this.$t('add')
      this.option = 'add'
      this.formAddModel = true
      this.nameDisabled = false
    },
    handleReset () {
      this.$refs['createFormItem'].resetFields()
    },
    formOption (value) {
      let json = {
        'metadata': {
          'name': this.deploymentename
        },
        'spec': {
          'scaleTargetRef': {
            'kind': 'Deployment',
            'name': this.deploymentename,
            'apiVersion': 'apps/v1'
          },
          'minReplicas': parseInt(this.formItem.minReplicas),
          'maxReplicas': parseInt(this.formItem.maxReplicas),
          'targetCPUUtilizationPercentage': parseInt(this.formItem.targetCPUUtilizationPercentage)
        }
      }
      this.$refs['createFormItem'].validate(valid => {
        if (valid) {
          if (value === 'CREATE') {
            formCreateHPA({
              productId: 100,
              yaml: JSON.stringify(json)
            }).then(res => {
              if (res.code === 200 && res.msg === '') {
                this.$Message.success({
                  content: this.$t('create_success')
                })
                this.formAddModel = false
              } else {
                this.$Message.error({
                  content: this.$t('create_failure')
                })
              }
              this.getHPA()
            })
          } else if (value === 'EDIT') {
            updateHPA({
              productId: 100,
              updateJson: JSON.stringify(json)
            }).then(res => {
              if (res.code === 200 && res.msg === '') {
                this.$Message.success({
                  content: this.$t('edit_success')
                })
                this.formAddModel = false
              } else {
                this.$Message.error({
                  content: this.$t('edit_failure')
                })
              }
              this.getHPA()
            })
          }
        }
      })
    },
    formEdit () {
      this.nameDisabled = true
      getHpaByDeployment({
        kind: 'deployment',
        kindName: this.deploymentename,
        productId: 100
      }).then(res => {
        res.data.forEach((item, index) => {
          this.formItem.minReplicas = item.spec.minReplicas
          this.formItem.maxReplicas = item.spec.maxReplicas
          this.formItem.targetCPUUtilizationPercentage = item.spec.targetCPUUtilizationPercentage
        })
      })
    }
  }
}
</script>

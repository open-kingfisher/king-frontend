<style>
  .ivu-poptip-body {
    padding: 8px;
  }
  .ivu-poptip-body-content div {
    overflow: auto;
  }
  .ivu-poptip-body-content div table {
    /*font-size: 12px;*/
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
    <information info="Pod：kubernetes中可以创建和部署的最小也是最简的单位，橙色Pod名代表此Pod处于调试中，红色Pod名代表此Pod处于救援中。"></information>
    <Card shadow>
      <SearchTable :searchVal="searchVal" :pageSize="10" :columns="columns" :data="tableData">
        <ButtonGroup>
<!--            <Button @click="createBtnClick('CREATE')" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>-->
            <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
          </ButtonGroup>
      </SearchTable>
    </Card>
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
              <Checkbox label="privileged">开启特权模式</Checkbox>
              <Checkbox label="affinity">不开启亲和性</Checkbox>
              <Checkbox label="toleration">不开启容忍性</Checkbox>
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
  </div>
</template>
<script>
import { getAllPodData, getPodInfo, deleteOnePod, getPodLog, debugPod, rescuePod, getDebugPodIPByPod } from '@/api/workload'
import { List } from '@/api/cluster-plugin'
import { formatDate } from '@/api/tools'
import SearchTable from '@/view/other-page/search-table.vue'
import Information from '../../other-page/information.vue'
import YamlModal from '@/view/other-page/yaml-editor.vue'
import { hasPermission } from '@/router/permission'
import Terminal from './podexec'
const json2yaml = require('json2yaml')
const yaml2json = require('js-yaml')

export default {
  components: {
    SearchTable,
    YamlModal,
    Information,
    Terminal
  },
  data () {
    return {
      debugOn: false,
      deleteModel: false,
      deleteLoading: false,
      debugPrefix: 'debug-pod-',
      rescuePrefix: 'rescue-pod-',
      enterShow: false,
      loading: false,
      modalShow: false,
      modalRescueShow: false,
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
      yamlType: 'success',
      jsonType: 'default',
      JsonFormat: false,
      YamlFormat: true,
      editorLang: 'yaml',
      editorContent: '',
      editShow: false,
      createModalShow: false,
      updateYaml: '',
      originYaml: '',
      searchVal: '',
      columns: [
        {
          title: this.$t('name'),
          key: 'name',
          width: 280,
          fixed: 'left',
          render: (h, params) => {
            let color = ''
            this.tableData.forEach((item, index) => {
              if (this.debugPrefix + params.row.name === item.name) {
                color = '#ff9900'
              }
              if (this.rescuePrefix + params.row.name === item.name) {
                color = '#ed4014'
              }
            })
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
              [
                h(
                  'Font',
                  {
                    style: {
                      color: color
                    }
                  },
                  params.row.name
                )
              ]
            )
          }
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
          key: 'nodeName',
          width: 300
        },
        {
          title: this.$t('restartCount'),
          key: 'restartCount',
          width: 120
        },
        {
          title: this.$t('podIP'),
          key: 'podIP',
          width: 120
        },
        {
          title: this.$t('image'),
          key: 'container',
          width: 320,
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              params.row.container.map(item => {
                return h(
                  'Tag',
                  {
                    style: {
                      textAlign: 'center'
                    },
                    props: {
                      color: 'success'
                    }
                  },
                  item.image
                )
              })
            )
          }
        },
        {
          title: this.$t('container'),
          key: 'container',
          width: 220,
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              params.row.container.map(item => {
                return h(
                  'Tag',
                  {
                    style: {
                      textAlign: 'center'
                    },
                    props: {
                      color: 'success'
                    }
                  },
                  item.name
                )
              })
            )
          }
        },
        {
          title: this.$t('create_time'),
          key: 'create_time',
          width: 150,
          sortable: true,
          sortType: 'desc',
          render: (h, params) => {
            return h('div', formatDate(params.row.create_time))
          }
        },
        {
          title: this.$t('action'),
          key: 'action',
          align: 'center',
          width: 200,
          fixed: 'right',
          render: (h, params) => {
            let debugDisabled = false
            let rescueDisabled = false
            if (params.row.name.indexOf(this.debugPrefix) === 0 || params.row.name.indexOf(this.rescuePrefix) === 0) {
              debugDisabled = true
              rescueDisabled = true
            }
            // 没有权限或者集群没有开启debug功能都不能操作debug按钮
            if (!hasPermission('debug_pod') || !this.debugOn) {
              debugDisabled = true
            }
            if (!hasPermission('rescue_pod')) {
              rescueDisabled = true
            }
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                    ghost: true,
                    disabled: !hasPermission('pod_terminal')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      let podName = params.row.name
                      this.$router.push({
                        name: 'podexec',
                        params: {
                          podName: podName,
                          containerName: params.row.container[0].name,
                          cluster: this.$store.getters.currentClusterId,
                          namespace: this.$store.getters.currentNamespaceName,
                          containers: params.row.container
                        }
                      })
                    }
                  }
                },
                this.$t('terminal')
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: !hasPermission('show_pod')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.yamlType = 'success'
                      this.jsonType = 'default'
                      this.updateYaml = ''
                      this.originYaml = ''
                      this.editShow = true
                      this.optionTitle = '查看'
                      this.option = 'edit'
                      this.podName = params.row.name
                      this.edit()
                    }
                  }
                },
                this.$t('show')
              ),
              h('Dropdown', {
                props: {
                  placement: 'bottom-end',
                  transfer: true
                }
              }, [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    ghost: true
                  }
                }, this.$t('more')),
                h('DropdownMenu', {
                  slot: 'list'
                }, [
                  h('DropdownItem', {
                    props: {
                      disabled: debugDisabled
                    },
                    nativeOn: {
                      click: () => {
                        if (!debugDisabled) {
                          this.formatTableData()
                          this.podName = params.row.name
                          this.containers = params.row.container
                          this.formItem.containers = this.containers[0].name
                          this.modalShow = true
                          this.enterShow = false
                          this.tableData.forEach((item, index) => {
                            if (this.debugPrefix + params.row.name === item.name) {
                              this.enterShow = true
                            }
                          })
                        }
                      }
                    }
                  }, this.$t('debug')),
                  h('DropdownItem', {
                    props: {
                      disabled: rescueDisabled
                    },
                    nativeOn: {
                      click: () => {
                        if (!rescueDisabled) {
                          this.formatTableData()
                          this.podName = params.row.name
                          this.containers = params.row.container
                          this.formItem.containers = this.containers[0].name
                          this.modalRescueShow = true
                          this.enterShow = false
                          this.tableData.forEach((item, index) => {
                            if (this.rescuePrefix + params.row.name === item.name) {
                              this.enterShow = true
                            }
                          })
                        }
                      }
                    }
                  }, this.$t('rescue')),
                  h('DropdownItem', {
                    props: {
                      disabled: !hasPermission('pod_log')
                    },
                    nativeOn: {
                      click: () => {
                        if (hasPermission('pod_log')) {
                          this.logShow = true
                          this.optionTitle = '日志'
                          this.option = 'edit'
                          this.podName = params.row.name
                          this.container = params.row.container[0].name
                          this.containers = params.row.container
                          this.getLog(60)
                        }
                      }
                    }
                  }, this.$t('log')),
                  h('DropdownItem', {
                    props: {
                      disabled: !hasPermission('del_pod'),
                      divided: true
                    },
                    nativeOn: {
                      click: () => {
                        if (hasPermission('del_pod')) {
                          this.deleteModel = true
                          this.deleteLoading = false
                          this.podName = params.row.name
                        }
                      }
                    }
                  }, this.$t('delete'))
                ])
              ])
            ])
          }
        }
      ],
      podName: '',
      tableData: []
    }
  },
  mounted () {
    this.$store.commit('setClusterSelect', false)
    this.formatTableData()
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
    del () {
      this.deleteLoading = true
      deleteOnePod({
        productId: 100,
        name: this.podName,
        namespace: this.$store.getters.currentNamespaceName
      }).then(res => {
        if (res.code === 200) {
          this.$Message.success({
            content: this.$t('action_success')
          })
          this.formatTableData()
          this.deleteLoading = false
          this.deleteModel = false
        } else {
          this.deleteLoading = false
        }
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
    formatTableData () {
      this.getTableData().then(res => {
        res = res.data
        let data = []
        res.forEach((item, index) => {
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
          data.push({
            name: item.metadata.name,
            status: status,
            message: message,
            nodeName: item.spec.nodeName,
            podIP: item.status.podIP || '',
            restartCount: item.status.containerStatuses ? item.status.containerStatuses[0].restartCount : '-',
            create_time: item.metadata.creationTimestamp,
            namespace: item.metadata.namespace,
            // containerStatuses: item.status.containerStatuses[0].state,
            container: item.spec.containers
          })
        })
        this.tableData = data
      })
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
    getTableData () {
      return getAllPodData({
        productId: 100
      })
    },
    refresh () {
      this.formatTableData()
      this.$Message.success(this.$t('refresh_success'))
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
    changeContainer (name) {
      this.container = name
      this.getLog(60)
    },
    logRefresh () {
      this.getLog(60)
      this.$Message.success(this.$t('refresh_success'))
    }
  }
}
</script>

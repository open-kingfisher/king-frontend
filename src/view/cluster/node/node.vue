<template>
  <div>
    <Card shadow>
      <SearchTable @on-selection-change="onSelect" :data="tableData1" :columns="tableColumns1">
        <ButtonGroup>
          <Button @click="createBtnClick('CREATE')" style="margin-right: 3px" disabled="disabled" type="success">{{this.$t('add') }}
          </Button>
          <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
        </ButtonGroup>
        <Button slot="selectAll" v-show="buttonShow" @click="multiModalShow = 1" style="margin-right: 3px">修改标签</Button>
        <Button slot="selectAll" v-show="buttonShow" @click="multiModalShow = 2" style="margin-right: 3px" type="success" ghost>添加标签</Button>
        <Button slot="selectAll" v-show="buttonShow" @click="multiModalShow = 3" style="margin-right: 3px" type="error" ghost>删除标签
        </Button>
      </SearchTable>
    </Card>
    <Modal
        :title="modalTitle"
        :value="modalShow"
        :mask-closable="false"
        slot="option">
        <Form ref="modalForm" :model="modalModel" :rules="modalRules">
          <FormItem prop="key">
            <Input type="text" v-model="modalModel.key" :disabled="!modalKeyEnable">
              <span slot="prepend">{{ this.$t('key') }}</span>
            </Input>
          </FormItem>
          <FormItem prop="val">
            <Input type="text" v-model="modalModel.val" :placeholder="modalPlaceHolder" :autofocus="true">
              <span slot="prepend">{{ this.$t('value') }}</span>
            </Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" @click="modalShow = false">{{this.$t('cancel')}}</Button>
          <Button type="primary" @click="modalClickOk()">{{this.$t('commit')}}</Button>
        </div>
      </Modal>
    <Modal
      :title="multiModalTitle"
      :value="multiModalShow > 0 ? true:false"
      :mask-closable="false"
      @on-visible-change="modalVisibleChange"
      slot="option">
      <Form ref="multiModalForm" :model="multiModal" :rules="multiModalRules">
        <FormItem prop="select" v-if="multiModalShow !== 2">
          <Select @on-change="hostValueChange" v-model="multiModal.select" placeholder="请选择标签" filterable>
            <Option v-for="item in hostList" :value="item.value" :key="item.value">{{ item.value }}</Option>
          </Select>
        </FormItem>
        <FormItem prop="key">
          <Input type="text" v-model="multiModal.key" :disabled="multiModalShow !== 2">
            <span slot="prepend">{{ this.$t('key') }}</span>
          </Input>
        </FormItem>
        <FormItem prop="val" v-if="multiModalShow !== 3">
          <Input type="text" v-model="multiModal.val" :placeholder="multiModalPlaceHolder" :autofocus="true">
            <span slot="prepend">{{ this.$t('value') }}</span>
          </Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="multiModalShow = false">{{this.$t('cancel')}}</Button>
        <Button type="primary" @click="multiModalClickOk()">{{this.$t('commit')}}</Button>
      </div>
    </Modal>
    <Modal
      :title="modalTitle"
      :value="modalDelete"
      :mask-closable="false"
      slot="option">
      <div style="margin-bottom: 16px; text-align: center">
        <span>{{deleteKey}}</span>：<span>{{deleteValue}}</span>
      </div>
      <div slot="footer">
        <Button type="text" @click="modalDelete = false">{{this.$t('cancel')}}</Button>
        <Button type="error" @click="deleteLabel()">{{this.$t('commit')}}</Button>
      </div>
    </Modal>
    <Modal v-model="deleteModel" width="360">
      <p slot="header" title="删除">
        <span>{{this.$t('delete')}}</span>
      </p>
      <div style="text-align:center">
        <p style="line-height: 25px; color: #f60; font-size: 12px; font-weight: bold">危险操作！！！删除后此节点下所有资源都将删除</p>
        <p style="line-height: 25px; font-size: 12px; margin-bottom: 10px">输入你要删除的节点名称 <strong style="color:#f60;text-align:center">{{nodeName}}</strong></p>
        <Form ref="deleteForm" :model="deleteFormItem" :label-width="0" :rules="deleteRuleValidate">
          <FormItem prop="node">
             <Input v-model="deleteFormItem.node"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long @click="del()" :loading="deleteLoading">{{this.$t('delete')}}</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { getAllNodeData, optNodeLabel, delNodeLabel, delNode } from '@/api/cluster'
import { formatDate } from '@/api/tools'
import { forEach } from '@/libs/tools'
import SearchTable from '@/view/other-page/search-table.vue'
import { hasPermission } from '@/router/permission'

export default {
  components: {
    SearchTable
  },
  data () {
    const validateName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('not_null')))
      } else {
        if (this.nodeName !== value) {
          callback(new Error('填写的节点名称与所选的节点名称不匹配'))
        }
        callback()
      }
    }
    return {
      deleteModel: false,
      deleteLoading: false,
      buttonShow: false,
      modalDelete: false,
      deleteKey: '',
      deleteValue: '',
      selectHost: [],
      hostList: [],
      modalModel: {
        key: '',
        val: ''
      },
      multiModal: {
        key: '',
        val: '',
        select: ''
      },
      deleteFormItem: {
        node: ''
      },
      deleteRuleValidate: {
        node: [
          { validator: validateName, trigger: 'blur' }
        ]
      },
      hasClick: false,
      modalPlaceHolder: '',
      modalKeyEnable: null,
      modalShow: false,
      modalTitle: '',
      multiModalPlaceHolder: '',
      multiModalKeyEnable: null,
      multiModalShow: false,
      multiModalTitle: '',
      nodeName: '',
      multiModalRules: {
        key: [
          {
            required: true,
            message: '键不能为空值',
            trigger: 'blur'
          }
        ],
        val: [
          {
            required: true,
            message: '值不能为空值',
            trigger: 'blur'
          },
          {
            required: true,
            message: '不能为空值',
            trigger: 'blur'
          }
        ]
      },
      modalRules: {
        key: [
          {
            required: true,
            message: '键不能为空值',
            trigger: 'blur'
          }
        ],
        val: [
          {
            required: true,
            message: '值不能为空值',
            trigger: 'blur'
          }
        ]
      },
      tableColumns1: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: this.$t('name'),
          key: 'name',
          minWidth: 28,
          render: (h, params) => {
            return h(
              'router-link',
              {
                props: {
                  to: {
                    name: 'nodedetail',
                    params: {
                      nodename: params.row.name
                    }
                  }
                }
              },
              params.row.name
            )
          }
        },
        {
          title: this.$t('status'),
          key: 'status',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.values(params.row.status).map(item => {
                let color = 'error'
                let text = ''
                if (item.type === 'MemoryPressure') {
                  text = '内存压力'
                }
                if (item.type === 'DiskPressure') {
                  text = '硬盘压力'
                }
                if (item.type === 'PIDPressure') {
                  text = 'PID压力'
                }
                if (item.type === 'MemoryPressure') {
                  text = '内存压力'
                }
                if (item.type === 'MemoryPressure' && item.status === 'False') {
                  return
                }
                if (item.type === 'DiskPressure' && item.status === 'False') {
                  return
                }
                if (item.type === 'PIDPressure' && item.status === 'False') {
                  return
                }
                if (item.type === 'Ready') {
                  if (item.status === 'True') {
                    text = '正常'
                    color = 'success'
                  } else if (item.status === 'False') {
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
                    style: {
                      textAlign: 'center'
                    },
                    props: {
                      color: color
                    }
                  },
                  text
                )
              })
            )
          }
        },
        {
          title: this.$t('label'),
          key: 'label',
          minWidth: 60,
          render: (h, params) => {
            return h(
              'div',
              Object.keys(params.row.label).map(item => {
                return h(
                  'Poptip',
                  {
                    props: {
                      trigger: 'hover',
                      transfer: true,
                      title:
                        item +
                        ': ' +
                        (params.row.label[item] === ''
                          ? '无'
                          : params.row.label[item]),
                      placement: 'right-end'
                    }
                  },
                  [
                    h(
                      'Tag',
                      {
                        style: {
                          textAlign: 'center'
                        },
                        props: {
                          color: 'success'
                        }
                      },
                      item
                    ),
                    h(
                      'div',
                      {
                        slot: 'content',
                        style: {
                          textAlign: 'center'
                        }
                      },
                      [
                        '',
                        h(
                          'Button',
                          {
                            props: {
                              type: 'info',
                              size: 'small'
                            },
                            style: {
                              marginLeft: '5px'
                            },
                            on: {
                              click: () => {
                                this.$refs['modalForm'].resetFields()
                                this.modalShow = true
                                this.modalKeyEnable = false
                                this.nodeName = params.row.name
                                this.modalTitle = this.nodeName + '修改标签'
                                this.modalModel.val = ''
                                this.modalModel.key = item
                                this.modalPlaceHolder =
                                  '原值：' + params.row.label[item]
                              }
                            }
                          },
                          '修改标签'
                        ),
                        h(
                          'Button',
                          {
                            props: {
                              type: 'primary',
                              size: 'small'
                            },
                            style: {
                              marginLeft: '5px'
                            },
                            on: {
                              click: () => {
                                this.$refs['modalForm'].resetFields()
                                this.modalShow = true
                                this.modalKeyEnable = true
                                this.nodeName = params.row.name
                                this.modalTitle = this.nodeName + '增加标签'
                                this.modalModel.val = ''
                                this.modalModel.key = ''
                                this.modalPlaceHolder = ''
                              }
                            }
                          },
                          '增加标签'
                        ),
                        h(
                          'Button',
                          {
                            props: {
                              type: 'error',
                              size: 'small'
                            },
                            style: {
                              marginLeft: '5px'
                            },
                            on: {
                              click: () => {
                                this.modalDelete = true
                                this.nodeName = params.row.name
                                this.modalTitle = this.nodeName + ' 删除标签'
                                this.deleteKey = item
                                this.deleteValue = params.row.label[item]
                              }
                            }
                          },
                          '删除标签'
                        )
                      ]
                    )
                  ]
                )
              })
            )
          }
        },
        {
          title: this.$t('kernel_version'),
          key: 'kernel_version',
          render: (h, params) => {
            return h('div', params.row.kernel_version)
          }
        },
        {
          title: this.$t('internal_ip'),
          key: 'internal_ip',
          render: (h, params) => {
            return h('div', params.row.internal_ip)
          }
        },
        {
          title: this.$t('create_time'),
          key: 'create_time',
          sortable: true,
          sortType: 'desc',
          render: (h, params) => {
            return h(
              'div',
              formatDate(this.tableData1[params.index].create_time)
            )
          }
        },
        {
          title: this.$t('action'),
          key: 'action',
          width: 80,
          align: 'center',
          render: (h, params) => {
            let disabled = !hasPermission('del_node')
            Object.keys(params.row.label).map(item => {
              if (item === 'node-role.kubernetes.io/master') {
                disabled = true
              }
            })
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small',
                    disabled: disabled
                  },
                  on: {
                    click: () => {
                      this.deleteModel = true
                      this.deleteLoading = false
                      this.deleteFormItem.node = ''
                      this.nodeName = params.row.name
                    }
                  }
                },
                this.$t('delete')
              )
            ])
          }
        }
      ]
    }
  },
  computed: {
    tableData1 () {
      return this.$store.getters.getNodeList
    }
  },
  watch: {
    multiModalShow (curVal, oldVal) {
      this.onloadKey(this.selectHost)
      if (curVal === 1) {
        this.multiModalTitle = '修改标签'
      } else if (curVal === 2) {
        this.multiModalTitle = '添加标签'
      } else {
        this.multiModalTitle = '删除标签'
      }
    }
  },
  mounted () {
    this.$store.commit('setClusterSelect', false)
    this.formatTableData()
  },
  methods: {
    modalVisibleChange (value) {
      // eslint-disable-next-line
      if (value == false) {
        this.$refs['multiModalForm'].resetFields()
        this.multiModalPlaceHolder = ''
        this.hostList = []
      }
    },
    hostValueChange (value) {
      if (value) {
        this.multiModal.key = value.split('：')[0]
        this.multiModalPlaceHolder = '原值:' + value.split('：')[1]
      }
    },
    onSelect (selection, row) {
      // this.buttonShow = true
      this.selectHost = selection
      this.buttonShow = this.selectHost.length > 0 ? 'true' : false
      this.onloadKey(selection)
    },
    onloadKey (selection) {
      let set = new Set()
      forEach(selection, (host, index) => {
        forEach(Object.keys(host.label), (key, index) => {
          set.add(key + '：' + host.label[key])
        })
      })
      let list = []
      forEach([...set], (label, index) => {
        list.push({
          value: label
        })
      })
      this.hostList = list
    },
    formatTableData () {
      this.buttonShow = false
      this.getTableData().then(res => {
        res = res.data
        let data = []
        res.forEach((item, index) => {
          data.push({
            name: item.metadata.name,
            status: item.status.conditions,
            label: item.metadata.labels || {},
            kernel_version: item.status.nodeInfo.kernelVersion,
            internal_ip: item.status.addresses[0].address,
            create_time: item.metadata.creationTimestamp
          })
        })
        this.$store.dispatch('initNodeList', data)
      })
    },
    getTableData () {
      return getAllNodeData({ productId: 100 })
    },
    deleteLabel () {
      let data = {
        nodeName: this.nodeName,
        nodeLabel: this.deleteKey
      }
      let ret = delNodeLabel(data)
      ret.then(x => {
        x.code === 200
          ? this.$Message.success({
            content: this.$t('action_success')
          }) && this.formatTableData()
          : this.$Message.info('操作失败')
      })
      this.modalDelete = false
    },
    modalClickOk () {
      this.$refs['modalForm'].validate(valid => {
        if (valid) {
          let data = {
            nodeName: this.nodeName,
            key: this.modalModel.key,
            val: this.modalModel.val,
            option: this.modalKeyEnable ? 'add' : 'replace'
          }
          let ret = optNodeLabel(data)
          ret.then(x => {
            if (x.code === 200) {
              this.$Message.success({
                content: this.$t('action_success')
              })
              this.formatTableData()
              this.modalShow = false
            } else {
              this.$Message.error('操作失败')
            }
          })
        } else {
          this.$Message.error('输入有误')
        }
      })
    },
    multiModalClickOk () {
      this.$refs['multiModalForm'].validate(valid => {
        if (valid) {
          // this.multiModalShow => 1:replace 2:add 3:delete
          if (this.multiModalShow !== 3) {
            let hostsInfo = []
            forEach(this.selectHost, (item, index) => {
              hostsInfo.push({
                nodeName: item.name,
                key: this.multiModal.key,
                val: this.multiModal.val,
                option: this.multiModalShow === 1 ? 'replace' : 'add'
              })
            })
            forEach(hostsInfo, (data, index) => {
              optNodeLabel(data).then(res => {
                if (res.code === 200) {
                  this.$Message.success({
                    content: data.nodeName + ' 操作成功'
                  })
                  this.formatTableData()
                  this.multiModalShow = false
                } else {
                  this.$Message.error('操作失败')
                }
              })
            })
          } else {
            // 删除
            let hostsInfo = []
            forEach(this.selectHost, (item, index) => {
              hostsInfo.push({
                nodeName: item.name,
                nodeLabel: this.multiModal.key
              })
            })
            forEach(hostsInfo, (data, index) => {
              delNodeLabel(data).then(res => {
                if (res.code === 200) {
                  this.$Message.success({
                    content: data.nodeName + ' 操作成功'
                  })
                  this.formatTableData()
                  this.multiModalShow = false
                } else {
                  this.$Message.error('操作失败')
                }
              })
            })
          }
        }
      })
    },
    del () {
      this.$refs['deleteForm'].validate(valid => {
        if (valid) {
          this.deleteLoading = true
          delNode({
            productId: 100,
            nodeName: this.deleteFormItem.node
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
          })
          this.deleteModel = false
        }
      })
    },
    refresh () {
      this.formatTableData()
      this.$Message.success(this.$t('refresh_success'))
    }
  }
}
</script>

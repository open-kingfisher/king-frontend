<template>
  <div>
    <information info="健康检查：通过扫描集群各种资源的使用情况，提供资源健康性、安全性、状态性等信息报表。"></information>
    <Card shadow>
      <SearchTable :data="tableData" :columns="columns" :loading="loading">
      <ButtonGroup>
        <Button v-if="hasPerm('add_plugin')" @click="createBtnClick()" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
        <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
      </ButtonGroup>
    </SearchTable>
    </Card>
    <Modal slot="option" v-model="modalShow" :title="title"  width="900">
      <Form ref="createForm" :model="formItem" :rules="ruleValidate" :label-width="60">
        <FormItem label="名称"  prop="name">
          <Input v-model="formItem.name"></Input>
        </FormItem>
        <FormItem label="描述"  prop="describe">
          <Input v-model="formItem.describe"></Input>
        </FormItem>
        <FormItem label="级别"  prop="level">
          <CheckboxGroup v-model="formItem.level">
            <Checkbox label="suggestion">建议</Checkbox>
            <Checkbox label="warning">警告</Checkbox>
            <Checkbox label="error">错误</Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem label="命名空间">
          <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
            <Checkbox
              :indeterminate="indeterminateNamespace"
              :value="checkAllNamespace"
              @click.prevent.native="handleCheckAllNamespace">全选
            </Checkbox>
          </div>
          <CheckboxGroup v-model="formItem.namespace" @on-change="checkAllGroupChangeNamespace">
            <Checkbox v-for="(item, index) in namespace" :label="item" :key="index">{{ item }}</Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem label="基本检查">
          <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
            <Checkbox
              :indeterminate="indeterminateBasic"
              :value="checkAllBasic"
              @click.prevent.native="handleCheckAllBasic">全选
            </Checkbox>
          </div>
          <CheckboxGroup v-model="formItem.basic" @on-change="checkAllGroupChangeBasic">
            <Checkbox label="bare-pod">裸Pod</Checkbox>
            <Checkbox label="fully-qualified-image">完全合格的镜像名(FQIN)</Checkbox>
            <Checkbox label="latest-tag">镜像Latest标签</Checkbox>
            <Checkbox label="resource-requirements">资源配额(资源要求检测大于5核5G)</Checkbox>
            <Checkbox label="liveness">存活探针</Checkbox>
            <Checkbox label="readiness">就绪探针</Checkbox>
            <Checkbox label="default-namespace">默认命名空间</Checkbox>
            <Checkbox label="hostpath-volume">卷挂载(主机路径)</Checkbox>
            <Checkbox label="admission-controller-webhook">准入控制Webhook(Validating Webhook 和 Mutating Webhook)</Checkbox>
            <Checkbox label="node-name-pod-selector">Pod节点选择标签(节点名作为节点选择标签)</Checkbox>
            <Checkbox label="node-labels">节点自定义标签</Checkbox>
            <Checkbox label="metric-server">Metric Server</Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem label="无用检查">
          <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
            <Checkbox
              :indeterminate="indeterminateUnused"
              :value="checkAllUnused"
              @click.prevent.native="handleCheckAllUnused">全选
            </Checkbox>
          </div>
          <CheckboxGroup v-model="formItem.unused" @on-change="checkAllGroupChangeUnused">
            <Checkbox label="unused-service-account">服务账户</Checkbox>
            <Checkbox label="unused-config-map">ConfigMap</Checkbox>
            <Checkbox label="unused-secret">Secret</Checkbox>
            <Checkbox label="unused-pv">PV</Checkbox>
            <Checkbox label="unused-pvc">PVC</Checkbox>
            <Checkbox label="unused-hpa">HPA</Checkbox>
            <Checkbox label="unused-cluster-role">集群角色</Checkbox>
<!--            <Checkbox label="unused-cluster-role-binding">集群角色绑定</Checkbox>-->
            <Checkbox label="unused-role">角色</Checkbox>
<!--            <Checkbox label="unused-role-binding">角色绑定</Checkbox>-->
            <Checkbox label="unused-service">服务</Checkbox>
            <Checkbox label="unused-replica-set">副本集</Checkbox>
            <Checkbox label="unused-pod-disruption-budget">Pod中断预算</Checkbox>
            <Checkbox label="unused-pod-preset">Pod预设</Checkbox>
<!--            <Checkbox label="unused-ingress">Ingress</Checkbox>-->
          </CheckboxGroup>
        </FormItem>
        <FormItem label="状态检查">
          <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
            <Checkbox
              :indeterminate="indeterminateState"
              :value="checkAllState"
              @click.prevent.native="handleCheckAllState">全选
            </Checkbox>
          </div>
          <CheckboxGroup v-model="formItem.state"  @on-change="checkAllGroupChangeState">
            <Checkbox label="node-state">节点状态</Checkbox>
            <Checkbox label="namespace-state">命名空间状态</Checkbox>
            <Checkbox label="pod-state">Pod状态</Checkbox>
            <Checkbox label="component-state">组件状态</Checkbox>
<!--            <Checkbox label="container-state">容器状态</Checkbox>-->
          </CheckboxGroup>
        </FormItem>
        <FormItem label="安全检查">
          <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
            <Checkbox
              :indeterminate="indeterminateSecurity"
              :value="checkAllSecurity"
              @click.prevent.native="handleCheckAllSecurity">全选
            </Checkbox>
          </div>
          <CheckboxGroup v-model="formItem.security"  @on-change="checkAllGroupChangeSecurity">
            <Checkbox label="privileged-containers">特权容器</Checkbox>
<!--            <Checkbox label="non-root-user">容器运行权限</Checkbox>-->
            <Checkbox label="api-server">API Server</Checkbox>
            <Checkbox label="controller-manager">Controller Manager</Checkbox>
            <Checkbox label="scheduler">Scheduler</Checkbox>
            <Checkbox label="etcd">Etcd</Checkbox>
          </CheckboxGroup>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancel()">{{this.$t('cancel')}}</Button>
        <Button type="primary" @click="confirm()">{{this.$t('commit')}}</Button>
      </div>
    </Modal>
    <Modal v-model="deleteModel" width="360">
      <p slot="header" title="删除">
        <span>删除</span>
      </p>
      <div style="text-align:center">
        <p>删除后所有的基于此检查的检查报告都将删除</p>
        <p style="line-height: 35px">确认删除 <strong style="color:#f60;text-align:center">{{name}}</strong> 插件吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long @click="del()">{{this.$t('delete')}}</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import {
  List,
  Delete,
  Update,
  Create,
  Action
} from '@/api/plugin/inspect'
import { getAllNamespaceByCluster } from '@/api/manage'
import SearchTable from '@/view/other-page/search-table.vue'
import Information from '../other-page/information.vue'
import { formatTimestamp } from '../../api/tools'
import { hasPermission } from '@/router/permission'

export default {
  components: {
    SearchTable,
    Information
  },
  data () {
    return {
      namespace: [],
      indeterminateNamespace: false,
      checkAllNamespace: false,
      indeterminateBasic: false,
      checkAllBasic: false,
      indeterminateState: false,
      checkAllState: false,
      indeterminateUnused: false,
      checkAllUnused: false,
      indeterminateSecurity: false,
      checkAllSecurity: false,
      name: '',
      title: '',
      modalMode: '',
      deleteModel: false,
      enterShow: false,
      loading: false,
      modalShow: false,
      formItem: {
        name: '',
        describe: '',
        level: [],
        namespace: [],
        basic: [],
        state: [],
        unused: [],
        security: []
      },
      ruleValidate: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        describe: [
          { required: true, message: '描述不能为空', trigger: 'blur' }
        ]
      },
      columns: [
        {
          title: this.$t('name'),
          key: 'name',
          render: (h, params) => {
            return h(
              'router-link',
              {
                props: {
                  to: {
                    name: 'inspectinfo',
                    params: {
                      resourceId: params.row.id,
                      resourceName: params.row.name
                    }
                  }
                }
              },
              params.row.name
            )
          }
        },
        {
          title: 'ID',
          key: 'id'
        },
        {
          title: this.$t('describe'),
          key: 'describe'
        },
        {
          title: this.$t('modify_time'),
          key: 'modifyTime'
        },
        {
          title: this.$t('create_time'),
          key: 'create_time',
          sortable: true,
          sortType: 'desc'
        },
        {
          title: this.$t('action'),
          key: 'action',
          width: 170,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'success',
                    size: 'small',
                    ghost: true,
                    disabled: !hasPermission('action_inspect')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.resourceName = params.row.id
                      this.name = params.row.name
                      this.actionInspect()
                    }
                  }
                },
                this.$t('action')
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'success',
                    size: 'small',
                    disabled: !hasPermission('edit_inspect')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.handleReset('createForm')
                      this.formItem.name = params.row.name
                      this.formItem.describe = params.row.describe
                      this.formItem.level = params.row.level
                      this.formItem.namespace = params.row.namespace
                      this.formItem.basic = params.row.basic
                      this.formItem.unused = params.row.unused
                      this.formItem.state = params.row.state
                      this.formItem.security = params.row.security
                      this.modalMode = 'UPDATE'
                      this.modalShow = true
                      this.resourceName = params.row.id
                      this.name = params.row.name
                      this.title = '编辑 ' + params.row.name
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
                    disabled: !hasPermission('del_inspect')
                  },
                  on: {
                    click: () => {
                      this.deleteModel = true
                      this.deleteLoading = false
                      this.resourceName = params.row.id
                      this.name = params.row.name
                    }
                  }
                },
                this.$t('delete')
              )
            ])
          }
        }
      ],
      tableData: []
    }
  },
  mounted () {
    this.$store.commit('setClusterSelect', false)
    this.formatTableData()
    this.getNamespace()
  },
  methods: {
    // namespace
    handleCheckAllNamespace () {
      if (this.indeterminateNamespace) {
        this.checkAllNamespace = false
      } else {
        this.checkAllNamespace = !this.checkAllNamespace
      }
      this.indeterminateNamespace = false

      if (this.checkAllNamespace) {
        this.formItem.namespace = this.namespace
      } else {
        this.formItem.namespace = []
      }
    },
    checkAllGroupChangeNamespace  (data) {
      if (data.length === this.namespace.length) {
        this.indeterminateNamespace = false
        this.checkAllNamespace = true
      } else if (data.length > 0) {
        this.indeterminateNamespace = true
        this.checkAllNamespace = false
      } else {
        this.indeterminateNamespace = false
        this.checkAllNamespace = false
      }
    },
    // basic
    handleCheckAllBasic () {
      if (this.indeterminateBasic) {
        this.checkAllBasic = false
      } else {
        this.checkAllBasic = !this.checkAllBasic
      }
      this.indeterminateBasic = false

      if (this.checkAllBasic) {
        this.formItem.basic = ['bare-pod',
          'fully-qualified-image',
          'latest-tag',
          'resource-requirements',
          'liveness',
          'readiness',
          'default-namespace',
          'admission-controller-webhook',
          'hostpath-volume',
          'node-name-pod-selector',
          'node-labels',
          'metric-server'
        ]
      } else {
        this.formItem.basic = []
      }
    },
    checkAllGroupChangeBasic (data) {
      if (data.length === 11) {
        this.indeterminateBasic = false
        this.checkAllBasic = true
      } else if (data.length > 0) {
        this.indeterminateBasic = true
        this.checkAllBasic = false
      } else {
        this.indeterminateBasic = false
        this.checkAllBasic = false
      }
    },
    // unused
    handleCheckAllUnused () {
      if (this.indeterminateUnused) {
        this.checkAllUnused = false
      } else {
        this.checkAllUnused = !this.checkAllUnused
      }
      this.indeterminateUnused = false

      if (this.checkAllUnused) {
        this.formItem.unused = ['unused-service-account',
          'unused-config-map',
          'unused-secret',
          'unused-pv',
          'unused-pvc',
          'unused-hpa',
          'unused-cluster-role',
          // 'unused-cluster-role-binding',
          'unused-role',
          // 'unused-role-binding',
          // 'unused-ingress',
          'unused-service',
          'unused-replica-set',
          'unused-pod-disruption-budget',
          'unused-pod-preset']
      } else {
        this.formItem.unused = []
      }
    },
    checkAllGroupChangeUnused (data) {
      if (data.length === 12) {
        this.indeterminateUnused = false
        this.checkAllUnused = true
      } else if (data.length > 0) {
        this.indeterminateUnused = true
        this.checkAllUnused = false
      } else {
        this.indeterminateUnused = false
        this.checkAllUnused = false
      }
    },
    // state
    handleCheckAllState () {
      if (this.indeterminateState) {
        this.checkAllState = false
      } else {
        this.checkAllState = !this.checkAllState
      }
      this.indeterminateState = false

      if (this.checkAllState) {
        this.formItem.state = [
          'namespace-state',
          'pod-state',
          'node-state',
          'component-state'
          // 'container-state'
        ]
      } else {
        this.formItem.state = []
      }
    },
    checkAllGroupChangeState (data) {
      if (data.length === 4) {
        this.indeterminateState = false
        this.checkAllState = true
      } else if (data.length > 0) {
        this.indeterminateState = true
        this.checkAllState = false
      } else {
        this.indeterminateState = false
        this.checkAllState = false
      }
    },
    // security
    handleCheckAllSecurity () {
      if (this.indeterminateSecurity) {
        this.checkAllSecurity = false
      } else {
        this.checkAllSecurity = !this.checkAllSecurity
      }
      this.indeterminateSecurity = false

      if (this.checkAllSecurity) {
        this.formItem.security = [
          'privileged-containers',
          // 'non-root-user',
          'api-server',
          'controller-manager',
          'scheduler',
          'etcd']
      } else {
        this.formItem.security = []
      }
    },
    checkAllGroupChangeSecurity (data) {
      if (data.length === 5) {
        this.indeterminateSecurity = false
        this.checkAllSecurity = true
      } else if (data.length > 0) {
        this.indeterminateSecurity = true
        this.checkAllSecurity = false
      } else {
        this.indeterminateSecurity = false
        this.checkAllSecurity = false
      }
    },
    getNamespace () {
      this.namespace = []
      getAllNamespaceByCluster({
        productId: 100,
        clusterId: this.$store.getters.currentClusterId
      }).then(res => {
        res.data.items.forEach((item, index) => {
          this.namespace.push(item.metadata.name)
        })
      })
    },
    cancel () {
      this.modalShow = false
      this.deleteModel = false
    },
    createBtnClick () {
      this.handleReset('createForm')
      this.modalMode = 'CREATE'
      this.modalShow = true
      this.title = '添加'
    },
    handleReset (name) {
      this.$refs[name].resetFields()
      this.indeterminateNamespace = false
      this.checkAllNamespace = false
      this.indeterminateBasic = false
      this.checkAllBasic = false
      this.indeterminateState = false
      this.checkAllState = false
      this.indeterminateUnused = false
      this.checkAllUnused = false
      this.indeterminateSecurity = false
      this.checkAllSecurity = false
      this.formItem = {
        name: '',
        describe: '',
        level: [],
        namespace: [],
        basic: [],
        state: [],
        unused: [],
        security: []
      }
    },
    confirm () {
      this.$refs['createForm'].validate(valid => {
        if (valid) {
          let params = {
            name: this.formItem.name,
            describe: this.formItem.describe,
            id: this.resourceName,
            level: this.formItem.level,
            namespace: this.formItem.namespace,
            basic: this.formItem.basic,
            unused: this.formItem.unused,
            state: this.formItem.state,
            security: this.formItem.security
          }
          if (this.modalMode === 'CREATE') {
            Create(params).then(res => {
              if (res.code === 200) {
                this.$Message.success({
                  content: this.$t('action_success')
                })
                this.formatTableData()
                this.modalShow = false
              } else {
                this.$Message.error('操作失败')
              }
            })
          }
          if (this.modalMode === 'UPDATE') {
            Update(params).then(res => {
              if (res.code === 200) {
                this.$Message.success({
                  content: this.$t('action_success')
                })
                this.formatTableData()
                this.modalShow = false
              } else {
                this.$Message.error('操作失败')
              }
            })
          }
        }
      })
    },
    del () {
      Delete({
        productId: 100,
        resourceName: this.resourceName
      }).then(res => {
        if (res.code === 200) {
          this.$Message.success({
            content: this.$t('action_success')
          })
          this.formatTableData()
          this.deleteModel = false
        }
      })
    },
    formatTableData () {
      List({
        productId: 100
      }).then(res => {
        this.tableData = []
        res.data.forEach((item, index) => {
          this.tableData.push({
            id: item.id,
            name: item.name,
            describe: item.describe,
            level: item.level || [],
            namespace: item.namespace || [],
            basic: item.basic || [],
            unused: item.unused || [],
            state: item.state || [],
            security: item.security || [],
            modifyTime: formatTimestamp(item.modifyTime) || '',
            create_time: formatTimestamp(item.createTime) || ''
          })
        })
      })
    },
    actionInspect () {
      this.loading = true
      Action({
        productId: 100,
        resourceName: this.resourceName,
        clusterId: this.$store.getters.currentClusterId
      }).then(res => {
        if (res.code === 200) {
          this.$Message.success({
            content: this.$t('action_success')
          })
        }
        this.loading = false
      })
    },
    refresh () {
      this.formatTableData()
      this.getNamespace()
      this.$Message.success(this.$t('refresh_success'))
    }
  }
}
</script>

<template>
  <div>
    <Card shadow>
      <SearchTable :columns="columns" :data="data">
        <ButtonGroup>
            <Button v-if="hasPerm('add_user')" @click="createBtnClick('CREATE')" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
            <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
        </ButtonGroup>
      </SearchTable>
    </Card>
    <Modal slot="option" v-model="modalShow" :title=title>
      <Form ref="createForm" :model="formItem" :label-width="70" :rules="ruleValidate">
        <FormItem label="用户名" prop="name">
          <template v-if="modalMode === 'CREATE'">
            <Row type="flex" justify="start" :gutter="12">
              <Col :span="authMode === 'ldap' ? 19 : 24">
                <Input v-model="formItem.name"></Input>
              </Col>
              <Col span="3" v-if="authMode === 'ldap'">
                <Button type="success" @click="fillBtnClick(formItem.name)" :disabled="!formItem.name.length">
                  自动填充
                </Button>
              </Col>
            </Row>
          </template>
          <template v-else>
            <Input v-model="formItem.name" :disabled="modalMode !== 'CREATE'"></Input>
          </template>
        </FormItem>
        <FormItem label="姓名" prop="realName">
          <Input v-model="formItem.realName"></Input>
        </FormItem>
        <FormItem label="邮箱" prop="mail">
          <Input v-model="formItem.mail"></Input>
        </FormItem>
        <FormItem label="密码" prop="password" v-if="authMode === 'local' && modalMode === 'CREATE'">
          <Input type="password" v-model="formItem.password"></Input>
        </FormItem>
        <FormItem label="确认密码" class="ivu-form-item ivu-form-item-required" prop="confirm" v-if="authMode === 'local' && modalMode === 'CREATE'">
          <Input type="password" v-model="formItem.confirm"></Input>
        </FormItem>
        <FormItem :label="this.$t('role')" prop="role">
          <Select v-model="formItem.role">
            <Option v-for="item in roleData" :value="item.id" :key="item.id" :label="item.name">
              <span>{{ item.name }}</span>
              <span style="float:right;color:#ccc">{{ item.describe}}</span>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="资源">
          <div style="overflow:auto; height: 300px; margin-top: 0px">
            <Tree
              :data="userTree"
              show-checkbox
              :check-strictly="false"
              :render="renderContent"
              ref="tree"
            ></Tree>
          </div>
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
        <p style="line-height: 35px; margin-bottom: 10px">确认删除  <strong style="color:#f60;text-align:center">{{name}}</strong> 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long  @click="del()" :loading="deleteLoading">{{this.$t('delete')}}</Button>
      </div>
    </Modal>
    <Modal slot="option" v-model="changePasswordShow" :title=title>
      <Form ref="changePasswordForm" :model="formItemChangePassword" :label-width="70" :rules="ruleValidateChangePassword">
        <FormItem label="密码" prop="password">
          <Input type="password" v-model="formItemChangePassword.password"></Input>
        </FormItem>
        <FormItem label="确认密码" prop="confirm" class="ivu-form-item ivu-form-item-required">
          <Input type="password" v-model="formItemChangePassword.confirm"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancel()">{{this.$t('cancel')}}</Button>
        <Button type="primary" @click="changePassword()">{{this.$t('commit')}}</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import SearchTable from '../../other-page/search-table.vue'
import { getAllUser, deleteUser, updateUser, createUser, userLookup, Tree, userAuthMode, changePassword } from '../../../api/manage'
import { forEach } from '../../../libs/tools'
import { List } from '@/api/platform-role'
import { hasPermission } from '@/router/permission'
import { formatTimestamp } from '@/api/tools'

export default {
  components: {
    SearchTable: SearchTable
  },
  mounted () {
    this.$store.commit('setClusterSelect', true)
    this.getUserAuthMode()
    this.formatTableData()
    this.getRole()
    this.getUserTree([], [], [])
  },
  data () {
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('not_null')))
      } else {
        if (this.title === this.$t('add_user')) {
          if (this.formItem.password !== value) {
            callback(new Error(this.$t('password_net_mach')))
          }
        } else {
          if (this.formItemChangePassword.password !== value) {
            callback(new Error(this.$t('password_net_mach')))
          }
        }
        callback()
      }
    }
    return {
      changePasswordShow: false,
      formItemChangePassword: {
        password: '',
        confirm: ''
      },
      ruleValidateChangePassword: {
        password: {
          required: true,
          message: this.$t('not_null'),
          trigger: 'blur'
        },
        confirm: [{ validator: validatePassword, trigger: 'blur' }]
      },
      authMode: 'local',
      userTree: [],
      userId: '',
      name: '',
      deleteModel: false,
      deleteLoading: false,
      title: '',
      updateData: {},
      modalMode: '',
      roleData: [],
      modalData: null,
      modalShow: false,
      listStyle: {
        width: '250px',
        height: '300px'
      },
      loadingStatus: false,
      formItem: {
        name: '',
        realName: '',
        userId: '',
        mail: '',
        password: '',
        role: '',
        confirm: ''
      },
      ruleValidate: {
        name: {
          required: true,
          message: this.$t('not_null'),
          trigger: 'change'
        },
        realName: {
          required: true,
          message: this.$t('not_null'),
          trigger: 'change'
        },
        mail: {
          required: true,
          message: this.$t('not_null'),
          trigger: 'change'
        },
        password: {
          required: true,
          message: this.$t('not_null'),
          trigger: 'change'
        },
        role: [
          {
            required: true,
            message: this.$t('not_null'),
            trigger: 'change'
          }
        ],
        confirm: [{ validator: validatePassword, trigger: 'blur' }]
      },
      columns: [
        {
          title: this.$t('name'),
          key: 'name',
          render: (h, params) => {
            return h(
              'Tooltip',
              {
                props: {
                  content: params.row.userId,
                  placement: 'right'
                }
              },
              params.row.name
            )
          }
        },
        {
          title: this.$t('realName'),
          key: 'realName'
        },
        {
          title: this.$t('mail'),
          key: 'mail',
          minWidth: 90
        },
        {
          title: this.$t('product'),
          key: 'product',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              params.row.product.map(item => {
                return h('li', item.name)
              })
            )
          }
        },
        {
          title: this.$t('role'),
          key: 'role',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              params.row.role.name
            )
          }
        },
        {
          title: this.$t('auth_mode'),
          key: 'authMode'
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
          title: this.$t('option'),
          key: 'action',
          width: 200,
          align: 'center',
          render: (h, params) => {
            let changePassword = true
            let editPermission = true
            let deletePermission = true
            if (hasPermission('change_pw') && params.row.authMode === 'local' && params.row.authMode === this.authMode) {
              changePassword = false
            }
            if (hasPermission('edit_user') && params.row.authMode === this.authMode) {
              editPermission = false
            }
            if (hasPermission('del_user') && params.row.authMode === this.authMode) {
              deletePermission = false
            }
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: editPermission
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.createBtnClick('UPDATE')
                      this.formItem.role = params.row.role.id
                      this.formItem.userId = params.row.userId
                      this.formItem.name = params.row.name
                      this.formItem.realName = params.row.realName
                      this.formItem.mail = params.row.mail
                      let product = []
                      params.row.product.forEach((item, index) => {
                        product.push(item.id)
                      })
                      let cluster = []
                      params.row.cluster.forEach((item, index) => {
                        cluster.push(item.id)
                      })
                      let namespace = []
                      params.row.namespace.forEach((item, index) => {
                        namespace.push(item.id)
                      })
                      this.getUserTree(product, cluster, namespace)
                    }
                  }
                },
                this.$t('edit')
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                    ghost: true,
                    disabled: changePassword
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.changePasswordShow = true
                      this.$refs['changePasswordForm'].resetFields()
                      this.title = this.$t('change_password')
                      this.name = params.row.name
                      this.userId = params.row.userId
                    }
                  }
                },
                this.$t('change_password')
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small',
                    disabled: deletePermission
                  },
                  on: {
                    click: () => {
                      this.deleteModel = true
                      this.deleteLoading = false
                      this.name = params.row.name
                      this.userId = params.row.userId
                    }
                  }
                },
                this.$t('delete')
              )
            ])
          }
        }
      ],
      data: []
    }
  },
  methods: {
    renderContent (h, { root, node, data }) {
      let icon = ''
      if (data.level === 0) {
        icon = 'md-move'
      } else if (data.level === 1) {
        icon = 'md-list-box'
      } else if (data.level === 2) {
        icon = 'md-list'
      } else if (data.level === 3) {
        icon = 'md-radio-button-on'
      } else {
        icon = 'md-radio-button-off'
      }
      return h(
        'span',
        {
          style: {
            display: 'inline-block',
            cursor: 'pointer'
          },
          on: {
            click: () => {
              data.checked = !data.checked
            }
          }
        },
        [
          h('span', [
            h('Icon', {
              props: {
                type: icon,
                size: '16'
              },
              style: {
                'margin-right': '5px',
                'margin-bottom': '0px'
              }
            }),
            h('span', { class: 'ivu-tree-title' }, data.title)
          ])
        ]
      )
    },
    isInArray (arr, value) {
      for (let i = 0; i < arr.length; i++) {
        if (value === arr[i]) {
          return true
        }
      }
      return false
    },
    getUserTree (product, cluster, namespace) {
      this.userTree = []
      Tree({
        productId: 100
      }).then(res => {
        if (res.code === 200) {
          res.data.forEach((item, index1) => {
            if (this.isInArray(product, item.value)) {
              if (res.data[index1].level === 2) {
                res.data[index1].checked = true
              }
              if (res.data[index1].children) {
                res.data[index1].children.forEach((item, index2) => {
                  if (this.isInArray(cluster, item.value)) {
                    if (res.data[index1].children[index2].level === 2) {
                      res.data[index1].children[index2].checked = true
                    }
                    if (res.data[index1].children[index2].children) {
                      res.data[index1].children[index2].children.forEach((item, index3) => {
                        if (this.isInArray(namespace, item.value)) {
                          if (res.data[index1].children[index2].children[index3].level === 2) {
                            res.data[index1].children[index2].children[index3].checked = true
                          }
                        }
                      })
                    }
                  }
                })
              }
            }
          })
          this.userTree = res.data
        }
      })
    },
    fillBtnClick (username) {
      userLookup({ username: username }).then(res => {
        let user = res.data
        this.formItem.realName = user.name
        this.formItem.mail = user.mail
      })
    },
    cancel () {
      this.modalShow = false
      this.changePasswordShow = false
    },
    createBtnClick (mode) {
      this.getUserAuthMode()
      this.handleReset('createForm')
      if (mode === 'CREATE') {
        this.updateData = null
        this.title = this.$t('add_user')
      } else {
        this.title = this.$t('edit_user')
      }
      this.modalShow = true
      this.modalMode = mode
    },
    changePassword () {
      this.$refs['changePasswordForm'].validate(valid => {
        if (valid) {
          let params = {
            password: this.formItemChangePassword.password,
            userId: this.userId
          }
          changePassword(params).then(res => {
            if (res.code === 200) {
              this.$Message.success({
                content: this.$t('action_success')
              })
              this.changePasswordShow = false
            } else {
              this.$Message.error('操作失败')
            }
          })
        }
      })
    },
    confirm () {
      this.$refs['createForm'].validate(valid => {
        if (valid) {
          let product = []
          let cluster = []
          let namespace = []
          let tree = this.$refs.tree.getCheckedAndIndeterminateNodes()
          tree.forEach((item, index) => {
            if (item.level === 0) {
              product.push(item.value)
            } else if (item.level === 1) {
              cluster.push(item.value)
            } else if (item.level === 2) {
              namespace.push(item.value)
            }
          })
          let params = {
            mail: this.formItem.mail,
            realName: this.formItem.realName,
            name: this.formItem.name,
            product: product,
            cluster: cluster,
            namespace: namespace,
            role: this.formItem.role,
            password: this.formItem.password,
            authMode: this.authMode,
            userId: this.formItem.userId
          }
          // create
          if (this.modalMode === 'CREATE') {
            createUser(params).then(res => {
              if (res.code === 200) {
                this.$Message.success({
                  content: this.$t('action_success')
                })
                this.modalShow = false
                this.formatTableData()
              } else {
                this.$Message.error('操作失败')
              }
            })
          }
          if (this.modalMode === 'UPDATE') {
            updateUser(params).then(res => {
              if (res.code === 200) {
                this.$Message.success({
                  content: this.$t('action_success')
                })
                this.modalShow = false
                this.formatTableData()
              } else {
                this.$Message.error('操作失败')
              }
            })
          }
        }
      })
    },
    handleReset (name) {
      this.$refs[name].resetFields()
    },
    getRole () {
      List({
        userId: this.userId
      }).then(res => {
        if (res.code === 200) {
          this.roleData = res.data
        }
      })
    },
    del () {
      this.deleteLoading = true
      deleteUser({
        userId: this.userId
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
    },
    formatTableData () {
      getAllUser().then(res => {
        let data = []
        forEach(res.data, (item, index) => {
          data.push({
            name: item.name,
            realName: item.realName,
            userId: item.id,
            mail: item.mail,
            product: item.product || [{ 'id': '', 'name': '' }],
            cluster: item.cluster || [{ 'id': '', 'name': '' }],
            namespace: item.namespace || [{ 'id': '', 'name': '' }],
            role: item.role[0] || [{ 'id': '', 'name': '' }],
            authMode: item.authMode,
            modifyTime: formatTimestamp(item.modifyTime) || '',
            create_time: formatTimestamp(item.createTime) || ''
          })
        })
        this.data = data
      })
    },
    refresh () {
      this.formatTableData()
      this.getUserTree([], [], [])
      this.$Message.success(this.$t('refresh_success'))
    },
    getUserAuthMode () {
      userAuthMode({
        userId: this.userId
      }).then(res => {
        if (res.code === 200) {
          this.authMode = res.data.mode
        }
      })
    }
  }
}
</script>

<template>
  <div>
    <information info="平台角色：用于控制整个平台的访问控制权限，可以根据需求自定义角色。"></information>
    <Card shadow>
       <SearchTable :data="tableData" :columns="columns">
        <ButtonGroup>
            <Button v-if="hasPerm('add_platform_role')" @click="createBtnClick('CREATE')" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
            <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
        </ButtonGroup>
      </SearchTable>
    </Card>
    <Modal slot="option" v-model="modalShow" :title="this.$t('add_platform_role')">
        <Form ref="createForm" :model="formItem" :label-width="55" :rules="ruleValidate">
          <FormItem :label="this.$t('name')" prop="name">
            <Input v-model="formItem.name" ></Input>
          </FormItem>
          <FormItem label="描述" prop="describe">
            <Input v-model="formItem.describe" type="textarea" :autosize="{minRows: 2,maxRows: 5}"></Input>
          </FormItem>
          <FormItem label="权限" prop="interest">
            <div style="overflow:auto; height: 500px; margin-top: 0px" >
              <Tree
                :data="roleTree"
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
          <span>{{this.$t('delete')}}</span>
      </p>
      <div style="text-align:center">
        <p style="line-height: 35px; margin-bottom: 10px">确认删除  <strong style="color:#f60;text-align:center">{{platformRoleName}}</strong> 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long  @click="del()">{{this.$t('delete')}}</Button>
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
  Tree
} from '@/api/platform-role'
import SearchTable from '@/view/other-page/search-table.vue'
import Information from '../../other-page/information.vue'
import { hasPermission } from '@/router/permission'
import { formatTimestamp } from '../../../api/tools'

export default {
  components: {
    SearchTable,
    Information
  },
  data () {
    return {
      roleTree: [],
      platformRoleName: '',
      title: '',
      modalMode: '',
      deleteModel: false,
      enterShow: false,
      loading: false,
      modalShow: false,
      formItem: {
        name: '',
        describe: ''
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
              'Tooltip',
              {
                props: {
                  content: params.row.id,
                  placement: 'right'
                }
              },
              params.row.name
            )
          }
        },
        // {
        //   title: 'ID',
        //   key: 'id'
        // },
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
          width: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'success',
                    size: 'small',
                    disabled: !hasPermission('edit_platform_role')
                  },
                  on: {
                    click: () => {
                      this.handleReset('createForm')
                      this.formItem.name = params.row.name
                      this.formItem.describe = params.row.describe
                      this.modalMode = 'UPDATE'
                      this.modalShow = true
                      this.resourceName = params.row.id
                      this.platformRoleName = params.row.name
                      this.title = '编辑 ' + params.row.name
                      this.getRoleTree(params.row.access)
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
                    disabled: !hasPermission('del_platform_role')
                  },
                  style: {
                    margin: '5px'
                  },
                  on: {
                    click: () => {
                      this.deleteModel = true
                      this.deleteLoading = false
                      this.resourceName = params.row.id
                      this.platformRoleName = params.row.name
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
    this.getRoleTree([])
  },
  methods: {
    renderContent (h, { root, node, data }) {
      let icon = ''
      if (data.level === 0) {
        icon = 'md-home'
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
    },
    confirm () {
      this.$refs['createForm'].validate(valid => {
        if (valid) {
          let menuRoles = []
          let tree = this.$refs.tree.getCheckedAndIndeterminateNodes()
          tree.forEach((item, index) => {
            menuRoles.push(item.name)
          })
          let params = {
            name: this.formItem.name,
            describe: this.formItem.describe,
            id: this.resourceName,
            access: menuRoles
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
    isInArray (arr, value) {
      for (let i = 0; i < arr.length; i++) {
        if (value === arr[i]) {
          return true
        }
      }
      return false
    },
    getRoleTree (checked) {
      this.roleTree = []
      Tree({
        productId: 100
      }).then(res => {
        if (res.code === 200) {
          res.data[0].children.forEach((item, index1) => {
            if (this.isInArray(checked, item.name)) {
              if (res.data[0].children[index1].level === 3) {
                res.data[0].children[index1].checked = true
              }
              if (res.data[0].children[index1].children) {
                res.data[0].children[index1].children.forEach((item, index2) => {
                  if (this.isInArray(checked, item.name)) {
                    if (res.data[0].children[index1].children[index2].level === 3) {
                      res.data[0].children[index1].children[index2].checked = true
                    }
                    if (res.data[0].children[index1].children[index2].children) {
                      res.data[0].children[index1].children[index2].children.forEach((item, index3) => {
                        if (this.isInArray(checked, item.name)) {
                          if (res.data[0].children[index1].children[index2].children[index3].level === 3) {
                            res.data[0].children[index1].children[index2].children[index3].checked = true
                          }
                        }
                      })
                    }
                  }
                })
              }
            }
          })
          this.roleTree = res.data
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
            access: item.access,
            modifyTime: formatTimestamp(item.modifyTime) || '',
            create_time: formatTimestamp(item.createTime) || ''
          })
        })
      })
    },
    refresh () {
      this.formatTableData()
      this.getRoleTree([])
      this.$Message.success(this.$t('refresh_success'))
    }
  }
}
</script>

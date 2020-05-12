<template>
  <div>
    <information info="插件管理：通过添加不同的插件可以扩展原有kubernetes功能，包括各种Operator及其他插件的管理。"></information>
    <Card shadow>
      <SearchTable :data="tableData" :columns="columns">
      <ButtonGroup>
        <Button v-if="hasPerm('add_plugin')" @click="createBtnClick()" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
        <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
      </ButtonGroup>
    </SearchTable>
    </Card>
    <Modal slot="option" v-model="modalShow" :title="title">
      <Form ref="createForm" :model="formItem" :rules="ruleValidate" :label-width="55">
        <FormItem label="名称"  prop="name">
          <Input v-model="formItem.name"></Input>
        </FormItem>
        <FormItem label="描述"  prop="describe">
          <Input v-model="formItem.describe"></Input>
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
            <p>删除后所有使用此插件的 kubernetes 集群将无法使用此功能</p>
            <p style="line-height: 35px">确认删除 <strong style="color:#f60;text-align:center">{{name}}</strong> 插件吗？</p>
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
  Create
} from '@/api/plugin'
import SearchTable from '@/view/other-page/search-table.vue'
import Information from '../../other-page/information.vue'
import { formatTimestamp } from '../../../api/tools'
import { hasPermission } from '@/router/permission'

export default {
  components: {
    SearchTable,
    Information
  },
  data () {
    return {
      name: '',
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
                    disabled: !hasPermission('edit_plugin')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.handleReset('createForm')
                      this.formItem.name = params.row.name
                      this.formItem.describe = params.row.describe
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
                    disabled: !hasPermission('del_plugin')
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
  },
  methods: {
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
          let params = {
            name: this.formItem.name,
            describe: this.formItem.describe,
            id: this.resourceName
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
            modifyTime: formatTimestamp(item.modifyTime) || '',
            create_time: formatTimestamp(item.createTime) || ''
          })
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

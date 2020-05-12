<template>
  <div>
    <information info="模板：系统中各种资源可以保存成模板，通过模板可以快速部署各种资源。"></information>
    <Card shadow>
      <SearchTable :data="tableData" :columns="columns">
      <ButtonGroup>
<!--        <Button v-if="hasPerm('add_plugin')" @click="createBtnClick()" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>-->
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
        <p style="line-height: 35px; margin-bottom: 10px">确认删除  <strong style="color:#f60;text-align:center">{{name}}</strong> 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long  @click="del()" :loading="deleteLoading">{{this.$t('delete')}}</Button>
      </div>
    </Modal>
    <FormModal :formAddModel=formAddModel :optionTitle=optionTitle :spec="spec" :action="option"></FormModal>
  </div>
</template>
<script>
import { Create, Delete, List, Update } from '@/api/template'
import SearchTable from '@/view/other-page/search-table.vue'
import Information from '@/view/other-page/information.vue'
import { formatTimestamp } from '../../../api/tools'
import { hasPermission } from '@/router/permission'
import FormModal from '@/view/workload/deployment/form-modal.vue'

export default {
  components: {
    SearchTable,
    Information,
    FormModal
  },
  data () {
    return {
      formAddModel: false,
      optionTitle: '',
      option: '',
      spec: '',
      name: '',
      title: '',
      modalMode: '',
      deleteModel: false,
      deleteLoading: false,
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
          title: '类型',
          key: 'kind'
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
              // h(
              //   'Button',
              //   {
              //     props: {
              //       type: 'success',
              //       size: 'small',
              //       disabled: !hasPermission('edit_plugin')
              //     },
              //     style: {
              //       marginRight: '3px'
              //     },
              //     on: {
              //       click: () => {
              //         this.formatTableData()
              //         this.formItem.name = params.row.name
              //         this.formItem.describe = params.row.describe
              //         this.modalMode = 'UPDATE'
              //         // this.modalShow = true
              //         this.resourceName = params.row.id
              //         this.name = params.row.name
              //         this.formAddModel = true
              //         this.optionTitle = this.$t('edit') + ' ' + params.row.name
              //         this.option = 'edit'
              //         this.spec = params.row.spec
              //         this.title = '编辑 ' + params.row.name
              //       }
              //     }
              //   },
              //   this.$t('edit')
              // ),
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
            kind: item.kind,
            spec: item.spec,
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

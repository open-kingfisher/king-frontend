<template>
  <div>
    <information info="集群管理：通过上传KubeConfig文件，获取Kubernetes的管理权限，以便此平台进行管理；集群作为一种平台资源绑定到产品线后才可以使用。"></information>
    <Card shadow>
      <SearchTable :columns="columns" :data="data">
        <ButtonGroup>
          <Button v-if="hasPerm('add_cluster_manage')" @click="createBtnClick('CREATE')" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
          <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
        </ButtonGroup>
      </SearchTable>
    </Card>
    <Modal slot="option" v-model="modalShow" :title=title>
        <Form ref="createForm" :model="formItem" :label-width="70"  :rules="ruleValidate" id="cluster_form">
          <FormItem label="集群名称" prop="input_clusterName">
            <Input v-model="formItem.input_clusterName" ></Input>
          </FormItem>
          <FormItem label="描述信息" prop="input_clusterDesc">
            <Input v-model="formItem.input_clusterDesc" ></Input>
          </FormItem>
          <FormItem label="令牌" prop="input_token">
            <Input v-model="formItem.input_token" placeholder="集群增加节点时的令牌：--token参数值"></Input>
          </FormItem>
          <FormItem label="证书哈希" prop="input_caHash">
            <Input v-model="formItem.input_caHash" placeholder="集群增加节点时的CA证书哈希值：--discovery-token-ca-cert-hash参数值"></Input>
          </FormItem>
          <FormItem label="配置文件">
            <Button v-if="this.modalMode === 'UPDATE'" @click="onConfClick()" style="margin-right: 5px">查看原配置文件</Button>
            <label class="ivu-btn ivu-btn-dashed" icon="md-cloud-upload" for="uploadFile" style="padding-top: 6px;">上传配置文件</label>
            <input id="uploadFile" style="display: none" type="file" v-on:change="handleFileUpload($event)">
            <span v-if="fileName" style="margin-left: 10px">{{fileName}}</span>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" @click="cancel()">{{this.$t('cancel')}}</Button>
          <Button type="primary" @click="confirm()">{{this.$t('commit')}}</Button>
        </div>
      </Modal>
    <Modal
      width="650"
      v-model="configShow"
      title="KubeConfig 配置文件"
      @on-cancel="cancelConfigShow">
      <YamlModal editorLang="yaml" :editorContent="formItem.input_kubconf" style="height: 400px"></YamlModal>
    </Modal>
    <Modal v-model="deleteModel" width="360">
      <p slot="header" title="删除">
          <span>{{this.$t('delete')}}</span>
      </p>
      <div style="text-align:center">
        <p style="line-height: 25px; color: #f60; font-size: 12px; font-weight: bold">删除集群操作不会删除集群上真正的Namespace ！！！</p>
        <p style="line-height: 35px; margin-bottom: 10px">确认删除  <strong style="color:#f60;text-align:center">{{name}}</strong> 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long  @click="del()" :loading="deleteLoading">{{this.$t('delete')}}</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import SearchTable from '../../other-page/search-table.vue'
import { getAllCluster, getOneCluster, delOneCluster, updateCluster, createCluster } from '../../../api/manage'
import { forEach } from '../../../libs/tools'
import { formatTimestamp } from '../../../api/tools'
import YamlModal from '../../other-page/yaml-editor.vue'
import Information from '../../other-page/information.vue'
import { hasPermission } from '@/router/permission'

export default {
  components: {
    SearchTable,
    Information,
    YamlModal
  },
  mounted () {
    this.$store.commit('setClusterSelect', true)
    this.formatTableData()
    this.$watch('modalData', newVal => {
      this.formItem.input_clusterName = newVal.name
      this.formItem.input_token = newVal.token
      this.formItem.input_clusterDesc = newVal.describe
      this.formItem.input_caHash = newVal.ca_hash
      this.formItem.input_kubconf = newVal.kub_config
      this.formItem.input_clusterId = newVal.id
    })
  },
  data () {
    return {
      clusterId: '',
      name: '',
      deleteModel: false,
      deleteLoading: false,
      fileName: '',
      configShow: false,
      title: '',
      modalMode: '',
      modalData: null,
      modalShow: false,
      file: null,
      loadingStatus: false,
      formItem: {
        input_clusterName: '',
        input_clusterDesc: '',
        input_token: '',
        input_caHash: '',
        input_kubconf: '',
        input_clusterId: ''
      },
      ruleValidate: {
        input_clusterName: [
          {
            required: true,
            message: '该项不能为空',
            trigger: 'blur'
          }
        ],
        input_clusterDesc: [
          {
            required: true,
            message: '该项不能为空',
            trigger: 'blur'
          }
        ],
        input_token: [
          {
            required: true,
            message: '该项不能为空',
            trigger: 'blur'
          }
        ],
        input_caHash: [
          {
            required: true,
            message: '该项不能为空',
            trigger: 'blur'
          }
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
        //   title: this.$t('id'),
        //   key: 'id'
        // },
        {
          title: this.$t('describe'),
          key: 'describe'
        },
        {
          title: this.$t('version'),
          key: 'version'
        },
        {
          title: this.$t('token'),
          key: 'token'
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
          width: 130,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: !hasPermission('edit_cluster_manage')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.createBtnClick('UPDATE')
                      getOneCluster({
                        clusterId: params.row.id,
                        productId: 100
                      }).then(res => {
                        let item = res.data
                        this.modalData = item
                      })
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
                    disabled: !hasPermission('del_cluster_manage')
                  },
                  on: {
                    click: () => {
                      this.deleteModel = true
                      this.deleteLoading = false
                      this.name = params.row.name
                      this.clusterId = params.row.id
                    }
                  }
                },
                this.$t('delete')
              )
            ])
          }
        }
      ],
      data: [],
      uniqueName: ''
    }
  },
  methods: {
    handleFileUpload (event) {
      event.preventDefault()
      this.fileName = $('#uploadFile')[0].files[0].name
    },
    onConfClick () {
      this.configShow = true
    },
    confirm () {
      this.$refs['createForm'].validate(valid => {
        if (valid) {
          if (this.modalMode === 'CREATE') {
            let formData = new FormData()
            let fileObjs = $('#uploadFile')[0].files
            if (this.fileName === '') {
              this.$Message.error({
                content: '请上传配置文件'
              })
              return
            }
            formData.append('name', this.formItem.input_clusterName)
            formData.append('describe', this.formItem.input_clusterDesc)
            formData.append('token', this.formItem.input_token)
            formData.append('ca_hash', this.formItem.input_caHash)
            formData.append('kub_config', fileObjs[0])
            createCluster({
              formData: formData,
              productId: 100
            }).then(res => {
              if (res.code === 200 && res.msg === '') {
                this.createModalMsg(2)
                this.$Message.success({
                  content: this.$t('action_success')
                })
                this.$store.dispatch('flushSelectObj')
              } else {
                this.$Message.error('操作失败')
              }
            })
          }
          if (this.modalMode === 'UPDATE') {
            let formData = new FormData()
            formData.append('name', this.formItem.input_clusterName)
            formData.append('describe', this.formItem.input_clusterDesc)
            formData.append('token', this.formItem.input_token)
            formData.append('ca_hash', this.formItem.input_caHash)
            let fileObjs = $('#uploadFile')[0].files
            formData.append('kub_config', fileObjs[0])
            updateCluster({
              formData: formData,
              productId: 100,
              cluster: this.formItem.input_clusterId
            }).then(res => {
              if (res.code === 200 && res.msg === '') {
                this.createModalMsg(2)
                this.$Message.success({
                  content: this.$t('action_success')
                })
              } else {
                this.$Message.error('操作失败')
              }
            })
          }
        }
      })
    },
    cancel () {
      this.modalShow = false
    },
    cancelConfigShow () {
      this.configShow = false
    },
    handleReset (name) {
      this.$refs[name].resetFields()
    },
    createBtnClick (mode) {
      if (mode === 'CREATE') {
        this.title = this.$t('add_cluster')
      } else {
        this.title = this.$t('edit_cluster')
      }
      this.modalMode = mode
      this.modalShow = true
      this.fileName = ''
      this.handleReset('createForm')
    },
    upload () {
      this.loadingStatus = true
      setTimeout(() => {
        this.file = null
        this.loadingStatus = false
        this.$Message.success('Success')
      }, 1500)
    },
    createModalMsg (val) {
      if (val === true) {
        this.modalShow = val
      } else if (val === false) {
        this.modalShow = val
      } else if (val === 2) {
        this.modalShow = false
        this.formatTableData()
      }
    },
    del () {
      this.deleteLoading = true
      delOneCluster({
        productId: 100,
        clusterId: this.clusterId
      }).then(res => {
        if (res.code === 200) {
          this.$Message.success({
            content: this.$t('action_success')
          })
          this.formatTableData()
          this.$store.dispatch('flushSelectObj')
          this.deleteLoading = false
          this.deleteModel = false
        } else {
          this.deleteLoading = false
        }
      })
    },
    formatTableData () {
      let params = {
        productId: 100
      }
      getAllCluster(params).then(res => {
        let data = []
        forEach(res.data, (item, index) => {
          data.push({
            name: item.name,
            id: item.id,
            version: item.version,
            describe: item.describe,
            token: item.token,
            kub_config: item.kub_config,
            modifyTime: formatTimestamp(item.modifyTime) || '',
            create_time: formatTimestamp(item.createTime) || ''
          })
        })
        this.data = data
      })
    },
    refresh () {
      this.formatTableData()
      this.$Message.success(this.$t('refresh_success'))
    }
  }
}
</script>

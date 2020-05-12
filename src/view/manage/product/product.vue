<template>
  <div>
    <information info="产品线：用于控制平台资源的使用，产品线绑定集群和命名空间后，对应用户再绑定产品线就拥有了此产品线对应资源的使用权。"></information>
    <Card shadow>
      <SearchTable :columns="columns" :data="data">
        <ButtonGroup>
          <Button v-if="hasPerm('add_product')" @click="createBtnClick('CREATE')" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
          <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
        </ButtonGroup>
      </SearchTable>
    </Card>
    <Modal slot="option" v-model="modalShow" :title=title>
      <Form ref="createForm" :model="formItem" :label-width="60"  :rules="ruleValidate" style="margin-right: 27px">
        <FormItem label="产品线" prop="select_product">
          <Select v-model="formItem.select_product" :disabled="modalMode === 'UPDATE'" filterable>
              <Option v-for="item in productsData" :key="item.uuid" :value="item.uuid" >{{ item.path }}</Option>
          </Select>
        </FormItem>
        <FormItem label="命名空间" prop="select_namespace">
            <div style="overflow:auto; height: 300px; margin-top: 0px" >
              <Tree
                :data="productTree"
                show-checkbox
                :check-strictly="false"
                :render="renderContent"
                ref="tree"
              ></Tree>
            </div>
        </FormItem>
<!--        <FormItem label="命名空间" prop="select_namespace">-->
<!--&lt;!&ndash;          https://vue-treeselect.js.org/#more-features&ndash;&gt;-->
<!--          <treeselect v-model="value"-->
<!--                      :multiple="true"-->
<!--                      :options="options"-->
<!--                      :searchable="true"-->
<!--                      :show-count="true"-->
<!--                      :defaultExpandLevel=1-->
<!--                      :disable-branch-nodes="true"-->
<!--                      placeholder="选择集群和命名空间"/>-->
<!--        </FormItem>-->
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
  </div>
</template>

<script>
import {
  getAllProducts,
  getKingfisherProducts,
  getAllCluster,
  bindProductLine,
  updateProductLine,
  delOneProduct,
  getTreeClusterNamespace
} from '../../../api/manage'
import SearchTable from '../../other-page/search-table.vue'
import Information from '../../other-page/information.vue'
import { forEach } from '../../../libs/tools'
// import Treeselect from '@riophae/vue-treeselect'
// import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { formatTimestamp } from '../../../api/tools'
import { hasPermission } from '@/router/permission'

export default {
  components: {
    SearchTable,
    Information
    // Treeselect
  },
  mounted () {
    this.$store.commit('setClusterSelect', true)
    this.formatTableData()
    this.treeClusterNamespace()
  },
  data () {
    return {
      productTree: [],
      productId: '',
      name: '',
      deleteModel: false,
      deleteLoading: false,
      value: null,
      options: [],
      model12: [],
      title: '',
      updateData: {},
      modalMode: '',
      productsData: [],
      modalData: null,
      modalShow: false,
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
        {
          title: this.$t('cluster'),
          key: 'cluster',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              params.row.cluster.map(item => {
                return h('li', item.name)
              })
            )
          }
        },
        // {
        //   title: this.$t('namespace'),
        //   key: 'namespace',
        //   render: (h, params) => {
        //     return h(
        //       'ul',
        //       {
        //         style: {
        //           listStyle: 'none'
        //         }
        //       },
        //       params.row.namespace.map(item => {
        //         return h('li', item.name)
        //       })
        //     )
        //   }
        // },
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
                    disabled: !hasPermission('edit_product')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.createBtnClick('UPDATE')
                      let cluster = []
                      params.row.cluster.forEach((item, index) => {
                        cluster.push(item.id)
                      })
                      let namespace = []
                      params.row.namespace.forEach((item, index) => {
                        namespace.push(item.id)
                      })
                      this.getUserTree(cluster, namespace)
                      this.formItem.select_product = params.row.id
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
                    disabled: !hasPermission('del_product')
                  },
                  on: {
                    click: () => {
                      this.deleteModel = true
                      this.deleteLoading = false
                      this.name = params.row.name
                      this.productId = params.row.id
                    }
                  }
                },
                this.$t('delete')
              )
            ])
          }
        }
      ],
      listStyle: {
        width: '250px',
        height: '300px'
      },
      formItem: {
        select_product: ''
      },
      ruleValidate: {
        select_product: [
          {
            required: true,
            message: '该项不能为空',
            trigger: 'change'
          }
        ]
      },
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
    getUserTree (cluster, namespace) {
      this.productTree = []
      getTreeClusterNamespace({
        productId: 100
      }).then(res => {
        if (res.code === 200) {
          res.data.forEach((item, index1) => {
            if (this.isInArray(cluster, item.value)) {
              if (res.data[index1].level === 1) {
                res.data[index1].checked = true
              }
              if (res.data[index1].children) {
                res.data[index1].children.forEach((item, index2) => {
                  if (this.isInArray(namespace, item.value)) {
                    if (res.data[index1].children[index2].level === 1) {
                      res.data[index1].children[index2].checked = true
                    }
                  }
                })
              }
            }
          })
          this.productTree = res.data
        }
      })
    },
    treeClusterNamespace () {
      let params = {
        productId: 100
      }
      getTreeClusterNamespace(params).then(res => {
        this.productTree = res.data
      })
    },
    cancel () {
      this.modalShow = false
    },
    createBtnClick (mode) {
      this.treeClusterNamespace()
      if (mode === 'CREATE') {
        this.updateData = null
        this.title = this.$t('add_product')
        this.value = []
      } else {
        this.title = this.$t('edit_product')
      }
      this.modalShow = true
      this.modalMode = mode
      this.getProductApi()
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
      delOneProduct({
        productId: this.productId
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
            label: item.name,
            key: item.id
          })
        })
        this.transfer_clusterData = data
      })
      getKingfisherProducts().then(res => {
        let data = []
        forEach(res.data, (item, index) => {
          data.push({
            name: item.name,
            id: item.id,
            cluster: item.cluster,
            namespace: item.namespace,
            modifyTime: formatTimestamp(item.modifyTime) || '',
            create_time: formatTimestamp(item.createTime) || ''
          })
        })
        this.data = data
      })
    },
    confirm () {
      this.$refs['createForm'].validate(valid => {
        if (valid) {
          let cluster = []
          let namespace = []
          let tree = this.$refs.tree.getCheckedAndIndeterminateNodes()
          tree.forEach((item, index) => {
            if (item.level === 0) {
              cluster.push(item.value)
            } else if (item.level === 1) {
              namespace.push(item.value)
            }
          })
          // create
          if (this.modalMode === 'CREATE') {
            let params = {
              productLineId: this.formItem.select_product,
              clusterIdList: cluster,
              namespaceIdList: namespace
            }
            bindProductLine(params).then(res => {
              if (res.code === 200 && res.msg === '') {
                this.$Message.success({
                  content: this.$t('action_success')
                })
                this.createModalMsg(2)
                this.$store.dispatch('flushSelectObj')
              } else {
                this.$Message.error('操作失败')
              }
            })
            this.value = []
          }
          if (this.modalMode === 'UPDATE') {
            let params = {
              productLineId: this.formItem.select_product,
              clusterIdList: cluster,
              namespaceIdList: namespace
            }
            updateProductLine(params).then(res => {
              if (res.code === 200 && res.msg === '') {
                this.$Message.success({
                  content: this.$t('action_success')
                })
                this.createModalMsg(2)
                this.$store.dispatch('flushSelectObj')
              } else {
                this.$Message.error('操作失败')
              }
            })
            this.value = []
          }
        }
      })
    },
    getProductApi () {
      getAllProducts().then(res => {
        let pl = Object.values(res.data.SINA['2013052110474179'].BU)
        let data = []
        forEach(pl, (item, index) => {
          let classOne = item.name
          let segment = Object.values(item['Segment'])
          forEach(segment, (item, index) => {
            let classTwo = item.name
            if (item['Product']) {
              let product = Object.values(item['Product'])
              forEach(product, (item, index) => {
                let classThree = item.name
                data.push({
                  uuid: item.uuid,
                  name: item.name,
                  path: ['SINA', classOne, classTwo, classThree].join(' / ')
                })
              })
            }
          })
        })
        this.productsData = data
      })
    },
    refresh () {
      this.formatTableData()
      this.treeClusterNamespace()
      this.$Message.success(this.$t('refresh_success'))
    }
  }
}
</script>

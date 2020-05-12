<template>
  <div>
    <information info="配置字典：即ConfigMap，它提供了向容器中注入配置信息的机制，可以用来保存配置信息、命令行参数或环境变量等信息。达到配置信息与Docker Image解耦的目的。"></information>
    <Card shadow>
      <SearchTable :data="tableData" :columns="columns">
      <ButtonGroup>
        <Button @click="createBtnClick('CREATE')" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
        <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
      </ButtonGroup>
    </SearchTable>
    </Card>
  </div>
</template>
<script>
import {
  getAllService,
  getOneService,
  createService,
  updateService,
  deleteService
} from '@/api/discovery'
import { formatDate } from '@/api/tools'
import { forEach } from '@/libs/tools'
import YamlModal from '@/view/other-page/yaml-editor.vue'
import SearchTable from '@/view/other-page/search-table.vue'
import Information from '../other-page/information.vue'

export default {
  components: {
    SearchTable,
    YamlModal,
    Information
  },
  data () {
    return {
      createModalShow: false,
      updateYaml: '',
      originYaml: '',
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
                    name: 'serviceinfo',
                    params: {
                      servicename: params.row.name
                    }
                  }
                }
              },
              params.row.name
            )
          }
        },
        {
          title: this.$t('label'),
          key: 'labels',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.keys(params.row.labels).map(item => {
                return h('li', item + ':' + params.row.labels[item])
              })
            )
          }
        },
        {
          title: '集群IP',
          key: 'cluster_ip'
        },
        {
          title: 'Internal',
          key: 'internal_endpoints',
          width: 195,
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.keys(params.row.internal_endpoints).map(item => {
                let info =
                  'nodePort=' +
                  params.row.internal_endpoints[item]['nodePort'] +
                  '，' +
                  'port=' +
                  params.row.internal_endpoints[item]['port'] +
                  '，' +
                  'targetPort=' +
                  params.row.internal_endpoints[item]['targetPort'] +
                  '，' +
                  params.row.internal_endpoints[item]['protocol']
                return h('li', info)
              })
            )
          }
        },
        {
          title: 'External',
          key: 'external_endpoints'
        },
        {
          title: this.$t('create_time'),
          key: 'create_time',
          width: 150,
          sortable: true,
          render: (h, params) => {
            return h('div', formatDate(params.row.create_time))
          }
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
                    type: 'primary',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.updateYaml = ''
                      this.originYaml = ''
                      getOneService({
                        productId: 100,
                        serviceName: params.row.name
                        // namespace: "default"
                      }).then(res => {
                        this.originYaml = res.data
                      })
                      this.$Modal.confirm({
                        styles: { top: '10px' },
                        width: 750,
                        okText: '更新',
                        cancelText: this.$t('cancel'),
                        onOk: () => {
                          updateService({
                            // namespace: "default",
                            productId: 100,
                            updateJson: JSON.parse(this.updateYaml)
                          }).then(res => {
                            if (res.code === 200 && res.msg === '') {
                              this.formatTableData()
                              this.$Notice.info({
                                title: this.$t('edit_success'),
                                duration: 4
                              })
                            } else {
                              this.$Notice.info({
                                title: this.$t('edit_failure'),
                                duration: 4
                              })
                            }
                          })
                        },
                        render: () => {
                          return h(YamlModal, {
                            props: {
                              editorContent: this.originYaml
                            },
                            on: {
                              change: content => {
                                this.updateYaml = content
                              }
                            }
                          })
                        }
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
                    size: 'small'
                  },
                  style: {
                    margin: '5px'
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '确定要删除么?',
                        content: params.row.name,
                        onOk: () => {
                          let data = {
                            serviceName: params.row.name,
                            // namespace: "default",
                            productId: '100'
                            // cluster: params.clusterId
                          }

                          deleteService(data).then(x => {
                            if (x.code === 200) {
                              this.$Message.loading({
                                content: this.$t('action_success'),
                                duration: 0.6
                              })

                              this.formatTableData()
                            } else {
                              this.$Message.info('操作失败')
                            }
                          })
                        },
                        onCancel: () => {
                          this.$Message.info('操作取消')
                        }
                      })
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
    createModalMsg (val) {
      if (val === true) {
        this.createModalShow = val
      } else if (val === false) {
        this.createModalShow = val
      } else if (val === 2) {
        this.createModalShow = false
        this.formatTableData()
      }
    },
    yamlBtnClick () {
      this.updateYaml = ''
      this.originYaml = ''
      this.$Modal.confirm({
        width: 750,
        okText: '创建',
        cancelText: this.$t('cancel'),
        onOk: () => {
          if (this.updateYaml) {
            createService({
              productId: 100,
              // yaml: { context: this.updateYaml }
              yaml: JSON.stringify(this.updateYaml)
            }).then(res => {
              if (res.code === 200 && res.msg === '') {
                this.formatTableData()
                this.$Notice.info({
                  title: this.$t('create_success'),
                  duration: 4
                })
              } else {
                this.$Notice.info({
                  title: this.$t('edit_failure'),
                  duration: 4
                })
              }
            })
          }
        },
        render: h => {
          return h('div', [
            h(YamlModal, {
              props: {
                editorLang: 'yaml'
              },
              on: {
                change: content => {
                  this.updateYaml = content
                }
              }
            })
          ])
        }
      })
    },
    formatTableData () {
      getAllService({
        productId: 100
      }).then(res => {
        let data = []
        forEach(res.data, (item, index) => {
          data.push({
            name: item.metadata.name,
            labels: item.metadata.labels || { '无': '无' },
            cluster_ip: item.spec.clusterIP,
            internal_endpoints: item.spec.ports,
            create_time: formatDate(item.metadata.creationTimestamp),
            external_endpoints: '预留'
          })
        })
        this.tableData = data
      })
    },
    refresh () {
      this.formatTableData()
      this.$Message.success(this.$t('refresh_success'))
    }
  }
}
</script>

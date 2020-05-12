<style scoped>
.col-gutter {
  margin: 10px;
}
.row {
  margin-bottom: 25px;
}
.bc {
  background-color: rgba(204, 204, 204, 0.1);
  text-align: right;
}
</style>

<template>
<div v-if="tableData">
    <!-- <Table border :columns="columns" :data="tableData"></Table> -->

        <!-- <Row type="flex" justify="end" class="row" >
        <Col span="24">
            <Card dis-hover  class="bc" :padding="5">
                <Button @click="yamlBtnClick()" shape="circle" icon="md-add" type="info">
                  Yaml创建
                </Button>
            </Card >
        </Col>
    </Row> -->
    <Card :dis-hover="true">
        <Row type="flex" justify="center">
          <Col span="24">
            <SearchTable :pageSize="10" :columns="columns" :data="tableData">
                <Button @click="yamlBtnClick()" shape="circle" icon="md-add" type="info"></Button>
            </SearchTable>
          </Col>
        </Row>
    </Card>

</div>
</template>
<script>
// eslint-disable-next-line
import { getAllPVC, deletePVC, getOnePVC, updatePVC, createPVC } from '@/api/storage'
import { formatDate } from '@/api/tools'
import { forEach } from '@/libs/tools'

import YamlModal from '@/view/other-page/yaml-editor.vue'
import SearchTable from '@/view/other-page/search-table.vue'
export default {
  components: {
    SearchTable: SearchTable,
    YamlModal: YamlModal
  },
  data () {
    return {
      createModalShow: false,
      updateYaml: '',
      originYaml: '',
      columns: [
        {
          title: 'Name',
          key: 'name',
          render: (h, params) => {
            return h(
              'router-link',
              {
                props: {
                  to: {
                    name: 'pvcdetail',
                    params: {
                      pvcname: params.row.name
                    }
                  }
                }
              },
              params.row.name
            )
          }
        },
        {
          title: 'Status',
          key: 'status'
        },
        {
          title: 'Capacity',
          key: 'capacity'
        },
        {
          title: 'Access Modes',
          key: 'access',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              params.row.access.map(item => {
                return h('li', item)
              })
            )
          }
        }, {
          title: 'Storage Class',
          key: 'storage'
        },

        {
          title: 'Volume',
          key: 'volume'
        },

        {
          title: 'Create Time',
          key: 'create_time',
          width: 155,
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
                      getOnePVC({
                        productId: 100,
                        pvcName: params.row.name
                      }).then(res => {
                        this.originYaml = res.data
                      })

                      this.$Modal.confirm({
                        styles: { top: '10px' },
                        width: 750,
                        okText: '更新',
                        cancelText: this.$t('cancel'),
                        onOk: () => {
                          updatePVC({
                            pvcName: params.row.name,
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
                            pvcName: params.row.name,
                            productId: '100'
                          }

                          deletePVC(data).then(x => {
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
            createPVC({
              productId: 100,
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
      this.getTableData()
    },
    getTableData () {
      getAllPVC({ productId: 100 }).then(res => {
        let data = []
        forEach(res.data, (item, index) => {
          data.push({
            name: item.metadata.name,
            status: item.status.phase || '-',
            access: item.spec.accessModes || '-',
            storage: item.spec.storageClassName || '-',
            volume: item.spec.volumeName || '-',
            capacity: item.spec.resources.requests.storage || '-',
            create_time: formatDate(item.metadata.creationTimestamp)
          })
          // alert(item.status.capacity.storage)
        })

        this.tableData = data
      })
    }
  }
}
</script>

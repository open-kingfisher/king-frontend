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
  <div>
        <!-- <Row type="flex" justify="end" class="row" >
            <Col span="24">
                <Card dis-hover  class="bc" :padding="5">
                    <Button @click="createModalShow = true" shape="circle" icon="md-add" type="info">
                      简易创建
                    </Button>
                </Card >
            </Col>
        </Row> -->
    <Card dis-hover>
      <Row type="flex" justify="center">
        <Col span="24">
          <SearchTable  :data="tableData" :columns="tableColumns">
            <!-- <Button @click="createModalShow = true" shape="circle" icon="md-add" type="info"></Button> -->
            <Button @click="yamlBtnClick" shape="circle" icon="md-add" type="info"></Button>
          </SearchTable>
        </Col>
      </Row>
  </Card>

        <CreateModal :modal-show="createModalShow" @createModalMsg="createModalMsg"></CreateModal>
  </div>
</template>

<script>
import {
  getAllRole,
  getOneRole,
  deleteRole,
  updateRole,
  createRole
} from '@/api/rbac'
import { forEach } from '@/libs/tools'
import { formatDate } from '@/api/tools'

import CreateModal from './create-modal.vue'
import YamlModal from '@/view/other-page/yaml-editor.vue'
import SearchTable from '@/view/other-page/search-table.vue'
export default {
  components: {
    SearchTable: SearchTable,
    YamlModal: YamlModal,
    CreateModal: CreateModal
  },
  mounted () {
    this.formatTableData()
  },
  data () {
    return {
      createModalShow: false,
      updateYaml: '',
      originYaml: '',
      tableData: [],
      tableColumns: [
        {
          title: 'Name',
          key: 'name'
        },
        {
          title: 'Namespace',
          key: 'namespace'
        },
        {
          title: 'Verbs',
          key: 'verbs',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              params.row.verbs.map(item => {
                return h('li', item)
              })
            )
          }

        },
        {
          title: 'Resources',
          key: 'resources',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              params.row.resources.map(item => {
                return h('li', item)
              })
            )
          }

        },
        {
          title: 'ApiGroups',
          key: 'apiGroups',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              params.row.apiGroups.map(item => {
                return h('li', item)
              })
            )
          }

        },
        {
          title: this.$t('create_time'),
          key: 'create_time',
          sortable: true,
          render: (h, params) => {
            return h(
              'div',
              formatDate(this.tableData[params.index].create_time)
            )
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
                      getOneRole({
                        productId: 100,
                        roleName: params.row.name
                      }).then(res => {
                        this.originYaml = res.data
                      })

                      this.$Modal.confirm({
                        styles: { top: '10px' },
                        width: 750,
                        okText: '更新',
                        cancelText: this.$t('cancel'),
                        onOk: () => {
                          updateRole({
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
                            roleName: params.row.name,
                            productId: 100
                          }

                          deleteRole(data).then(x => {
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
      ]
    }
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
            createRole({
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
      getAllRole({
        productId: 100
      }).then(res => {
        let data = []
        forEach(res.data, (item, index) => {
          forEach(item.rules, (rule, index) => {
            data.push({
              name: item.metadata.name,
              create_time: item.metadata.creationTimestamp,
              verbs: rule.verbs || [],
              apiGroups: rule.apiGroups || [],
              resources: rule.resources || [],
              namespace: item.metadata.namespace
            })
          })
        })
        this.tableData = data
      })
    },
    formatTableData_bck () {
      getAllRole({
        productId: 100
      }).then(res => {
        let data = []
        forEach(res.data, (item, index) => {
          forEach(item.rules, (rule, index) => {
            data.push({
              name: item.metadata.name,
              create_time: item.metadata.creationTimestamp,
              verbs: rule.verbs || [],
              apiGroups: rule.apiGroups || [],
              resources: rule.resources || [],
              namespace: item.metadata.namespace
            })
          })
        })
        this.tableData = data
      })
    }
  }
}
</script>

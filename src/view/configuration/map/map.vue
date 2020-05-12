<template>
  <div>
    <information info="配置字典：即ConfigMap，它提供了向容器中注入配置信息的机制，可以用来保存配置信息、命令行参数或环境变量等信息。达到配置信息与Docker Image解耦的目的。"></information>
    <Card shadow>
      <SearchTable :data="tableData" :columns="tableColumns">
        <ButtonGroup>
          <Button v-if="hasPerm('add_config_map')" @click="createBtnClick('CREATE')" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
          <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
        </ButtonGroup>
      </SearchTable>
    </Card>
    <Modal slot="option" v-model="modalShow" :title="title">
        <Form ref="formDynamicKV" :model="formDynamicKV" :label-width="60" :rules="ruleValidate">
          <FormItem label="名称" prop="mapName">
            <Input v-model="formDynamicKV.mapName" placeholder="请输入配置字典名称" :disabled="disabled">
            </Input>
          </FormItem>
          <div v-for="(item, index) in formDynamicKV.items" :key="index" :value="item">
            <FormItem
            :label="'键值对'"
            :prop="'items.' + index + '.key'"
            :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
            <Row type="flex" justify="space-between">
              <Col span="21">
                <Input v-model="item.key" placeholder="请输入键">
                </Input>
              </Col>
              <Col span="3" offset="0" style="margin-right: -9px">
                <Button type="dashed" @click="handleRemove('formDynamicKV',index)" icon="md-trash">
                </Button>
              </Col>
            </Row>
          </FormItem>
            <FormItem
            :key="index"
            :prop="'items.' + index + '.val'"
            :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
            <Row type="flex" justify="space-between">
              <Col span="21">
                <Input v-model="item.val" type="textarea" :autosize="{minRows: 1,maxRows: 50}" placeholder="请输入值">
                </Input>
              </Col>
            </Row>
          </FormItem>
          </div>
          <FormItem>
            <Row>
              <Button type="dashed" long @click="handleAdd('formDynamicKV')" icon="md-add"></Button>
            </Row>
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
  </div>
</template>

<script>
import {
  getAllConfMap,
  getOneConfMap,
  updateConfMap,
  deleteConfMap,
  createConfMap
} from '@/api/configuration'
import { forEach } from '@/libs/tools'
import { formatDate } from '@/api/tools'
import YamlModal from '@/view/other-page/yaml-editor.vue'
import SearchTable from '@/view/other-page/search-table.vue'
import Information from '../../other-page/information.vue'
import { hasPermission } from '@/router/permission'

export default {
  components: {
    SearchTable,
    YamlModal,
    Information
  },
  mounted () {
    this.$store.commit('setClusterSelect', false)
    this.formatTableData()
  },
  data () {
    return {
      name: '',
      deleteModel: false,
      deleteLoading: false,
      disabled: false,
      title: '',
      option: '',
      modalShow: false,
      ruleValidate: {
        mapName: {
          required: true,
          message: '该项不能为空',
          trigger: 'change'
        }
      },
      formDynamicKV: {
        mapName: '',
        items: [
          {
            val: '',
            key: '',
            index: 1
          }
        ]
      },
      tableData: [],
      tableColumns: [
        {
          title: this.$t('name'),
          key: 'name'
        },
        {
          title: this.$t('data'),
          key: 'label',
          minWidth: 60,
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.keys(params.row.kv).map(item => {
                let confVal = params.row.kv[item].length
                if (confVal > 100) {
                  return h('li', item + '：' + '内容过长，请去详细中查看')
                } else {
                  return h('li', item + ':' + params.row.kv[item])
                }
              })
            )
          }
        },
        {
          title: this.$t('create_time'),
          key: 'create_time',
          sortable: true,
          sortType: 'desc',
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
                    size: 'small',
                    disabled: !hasPermission('edit_config_map')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.title = '编辑配置字典'
                      this.modalShow = true
                      this.option = '1'
                      getOneConfMap({ confmap: params.row.name }).then(res => {
                        this.formDynamicKV.mapName = res.data.metadata.name
                        this.disabled = true
                        this.formDynamicKV.items.splice(0)
                        for (let key in res.data.data) {
                          this.formDynamicKV.items.push({
                            key: key,
                            val: res.data.data[key],
                            index: this.formDynamicKV.length + 1
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
                    size: 'small',
                    disabled: !hasPermission('del_config_map')
                  },
                  on: {
                    click: () => {
                      this.deleteModel = true
                      this.deleteLoading = false
                      this.name = params.row.name
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
    createBtnClick (mode) {
      this.handleReset('formDynamicKV')
      this.title = '添加配置字典'
      this.modalShow = true
      this.option = '0'
      this.disabled = false
    },
    handleReset (name) {
      this.$refs[name].resetFields()
    },
    confirm () {
      this.$refs['formDynamicKV'].validate(valid => {
        if (valid) {
          let createJson = {}
          for (let i = 0; i < this.formDynamicKV.items.length; i++) {
            let item = this.formDynamicKV.items[i]
            if (!item.key || !item.val) {
              this.$Message.warning({
                content: '请检查输入是否有空值'
              })
              return
            } else {
              createJson[item['key']] = item['val']
            }
          }
          let params = {
            productId: 100,
            namespace: this.$store.getters.currentNamespaceName,
            mapname: this.formDynamicKV.mapName,
            createJson: createJson
          }
          if (this.option === '0') {
            createConfMap(params).then(res => {
              if (res.code === 200 && res.msg === '') {
                this.$Message.success({
                  content: this.$t('action_success')
                })
                this.createModalMsg(2)
              } else {
                this.$Message.error('操作失败')
              }
            })
          } else {
            updateConfMap(params).then(res => {
              if (res.code === 200 && res.msg === '') {
                this.$Message.success({
                  content: this.$t('action_success')
                })
                this.createModalMsg(2)
              } else {
                this.$Message.error('操作失败')
              }
            })
          }
        }
      })
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
    handleAdd (type) {
      if (type === 'formDynamicKV') {
        this.formDynamicKV.items.push({
          val: '',
          key: '',
          index: this.formDynamicKV.length + 1
        })
      }
    },
    handleRemove (type, index) {
      if (type === 'formDynamicKV') {
        this.formDynamicKV.items.splice(index, 1)
      }
    },
    cancel () {
      this.modalShow = false
    },
    del () {
      this.deleteLoading = true
      deleteConfMap({
        productId: 100,
        confmap: this.name
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
      getAllConfMap({
        productId: 100
        // namespace: "default"
      }).then(res => {
        let data = []
        forEach(res.data, (item, index) => {
          data.push({
            name: item.metadata.name,
            create_time: formatDate(item.metadata.creationTimestamp),
            label: item.metadata.labels || '无',
            kv: item.data || {},
            namespace: item.namespace
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

<template>
  <div>
    <information info="保密字典：即Secret，解决了密码、token、密钥等敏感数据的配置问题，不需要把这些敏感数据暴露到镜像或者Pod Spec中。Secret可以以Volume或者环境变量的方式使用。"></information>
    <Card shadow>
      <SearchTable :data="tableData" :columns="tableColumns">
        <ButtonGroup>
          <Button v-if="hasPerm('add_secret_map')" @click="createBtnClick('CREATE')" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
          <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
        </ButtonGroup>
      </SearchTable>
    </Card>
    <Drawer
      :draggable=true
      :closable=false
      v-model="editShow"
      :scrollable=true
      width="50">
      <div slot="header">
        <span>{{optionTitle}} {{name}}</span>
        <ButtonGroup style="float: right; margin-top: -5px">
        <Button @click="yaml()" size="small" :type="yamlType">Yaml</Button>
        <Button @click="json()" size="small" :type="jsonType">Json</Button>
      </ButtonGroup>
      </div>
      <YamlModal :editorContent="editorContent" @change="change" :editorLang="editorLang"></YamlModal>
      <div class="drawer-footer" style="margin-bottom: 1px">
        <Button type="text" style="margin-right: 5px" @click="editShow = false">{{this.$t('cancel')}}</Button>
        <Button type="primary" @click="update(option)">{{this.$t('commit')}}</Button>
      </div>
    </Drawer>
    <Modal slot="option" v-model="modalShow" :title="this.$t('add_secrets')">
      <Form ref="formDynamicKV" :model="formDynamicKV" :label-width="60" :rules="ruleValidate">
        <FormItem label="名称" prop="secretName">
          <Input v-model="formDynamicKV.secretName" placeholder="请输入保密字典名称">
          </Input>
        </FormItem>
        <FormItem label="类型">
          <Select v-model="formDynamicKV.select_type">
            <Option v-for="item in secretsType" :value="item" :key="item" >{{ item }}</Option>
          </Select>
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
  getAllSecret,
  getOneSecret,
  updateSecret,
  deleteSecret,
  createSecret
} from '@/api/configuration'
import { forEach } from '@/libs/tools'
import { formatDate } from '@/api/tools'
import YamlModal from '@/view/other-page/yaml-editor.vue'
import SearchTable from '@/view/other-page/search-table.vue'
import Information from '../../other-page/information.vue'
import { hasPermission } from '@/router/permission'
const json2yaml = require('json2yaml')
const yaml2json = require('js-yaml')

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
      yamlType: 'success',
      jsonType: 'default',
      JsonFormat: false,
      YamlFormat: true,
      editorLang: 'yaml',
      editorContent: '',
      editShow: false,
      createModalShow: false,
      option: '',
      optionTitle: '',
      updateYaml: '',
      originYaml: '',
      modalShow: false,
      ruleValidate: {
        secretName: {
          required: true,
          message: '该项不能为空',
          trigger: 'change'
        }
      },
      secretsType: [
        'Opaque',
        '镜像仓库秘钥',
        '账户秘钥',
        'TLS'
      ],
      formDynamicKV: {
        secretName: '',
        select_type: '',
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
          title: this.$t('secret_type'),
          key: 'type',
          minWidth: 60
        },
        // {
        //   title: '数据',
        //   key: 'label',
        //   minWidth: 60,
        //   render: (h, params) => {
        //     return h(
        //       'ul',
        //       {
        //         style: {
        //           listStyle: 'none'
        //         }
        //       },
        //       Object.keys(params.row.kv).map(item => {
        //         let confVal = params.row.kv[item].length
        //         if (confVal > 100) {
        //           return h('li', item + '：' + '内容过长，请去详细中查看')
        //         } else {
        //           return h('li', item + ':' + params.row.kv[item])
        //         }
        //       })
        //     )
        //   }
        // },
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
                    type: 'primary',
                    size: 'small',
                    disabled: !hasPermission('edit_secret_map')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.yamlType = 'success'
                      this.jsonType = 'default'
                      this.updateYaml = ''
                      this.originYaml = ''
                      this.editShow = true
                      this.optionTitle = this.$t('edit')
                      this.option = 'edit'
                      this.name = params.row.name
                      this.edit()
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
                    disabled: !hasPermission('del_secret_map')
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
    // yaml转json
    json () {
      this.yamlType = 'default'
      this.jsonType = 'success'
      this.editorLang = 'json'
      this.editorContent = yaml2json.load(this.updateYaml)
    },
    // json转yaml
    yaml () {
      // 如果已经是yaml文件不在执行格式化
      if (this.yamlType !== 'success') {
        this.yamlType = 'success'
        this.jsonType = 'default'
        this.editorLang = 'yaml'
        this.editorContent = json2yaml.stringify(JSON.parse(this.updateYaml))
      }
    },
    edit () {
      this.editorContent = this.updateYaml
      getOneSecret({
        productId: 100,
        secret: this.name
      }).then(res => {
        this.type = 'success'
        this.originYaml = res.data
        this.editorLang = 'yaml'
        this.editorContent = json2yaml.stringify(this.originYaml)
      })
    },
    // 监听子组件的change事件
    change (content) {
      this.updateYaml = content
    },
    update () {
      let updateJson = ''
      if (this.option === 'edit') {
        try {
          // updateJson = JSON.parse(this.updateYaml)
          updateJson = yaml2json.load(this.updateYaml)
        } catch (e) {
          this.$Message.error({
            content: '格式不对'
          })
          return
        }
        this.editorContent = this.updateYaml
        updateSecret({
          productId: 100,
          updateJson: updateJson
        }).then(res => {
          if (res.code === 200 && res.msg === '') {
            this.formatTableData()
            this.$Message.success({
              content: this.$t('edit_success')
            })
            this.editShow = false
          } else {
            this.$Message.error({
              content: this.$t('edit_failure')
            })
          }
        })
      } else {
        if (this.updateYaml) {
          createSecret({
            productId: 100,
            yaml: JSON.stringify(this.updateYaml)
          }).then(res => {
            if (res.code === 200 && res.msg === '') {
              this.formatTableData()
              this.$Message.success({
                content: this.$t('create_success')
              })
              this.editShow = false
            } else {
              this.$Message.error({
                content: this.$t('edit_failure')
              })
            }
          })
        } else {
          this.$Message.error({
            content: '添加的内容为空'
          })
        }
      }
    },
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
    createBtnClick () {
      this.handleReset('formDynamicKV')
      this.yamlType = 'success'
      this.jsonType = 'default'
      this.updateYaml = ''
      this.originYaml = ''
      this.editorContent = ''
      this.name = ''
      this.optionTitle = this.$t('add')
      this.option = 'add'
      this.editShow = true
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
            secretName: this.formDynamicKV.secretName,
            createJson: createJson
          }
          createSecret(params).then(res => {
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
      })
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
      deleteSecret({
        productId: 100,
        secretName: this.name
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
      getAllSecret({
        productId: 100
        // namespace: "default"
      }).then(res => {
        let data = []
        forEach(res.data, (item, index) => {
          data.push({
            name: item.metadata.name,
            create_time: formatDate(item.metadata.creationTimestamp),
            type: item.type || '无',
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

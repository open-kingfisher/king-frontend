<template>
  <div>
    <information info="入口：Ingress 是从 Kubernetes 集群外部访问集群内部服务的入口，采用Nginx-Ingress的方式接入。"></information>
    <Card shadow>
      <SearchTable :data="tableData" :columns="columns">
        <ButtonGroup>
          <Button v-if="hasPerm('add_ingress')" @click="createBtnClick('CREATE')" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
          <Button v-if="hasPerm('a_add_ingress')" @click="advancedCreateBtnClick('CREATE')" style="margin-right: 3px" type="success" ghost>{{ this.$t('advanced_Add') }}</Button>
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
        <span>{{optionTitle}} {{ingressName}}</span>
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
    <Modal v-model="deleteModel" width="360">
      <p slot="header" title="删除">
          <span>{{this.$t('delete')}}</span>
      </p>
      <div style="text-align:center">
        <p style="line-height: 35px; margin-bottom: 10px">确认删除  <strong style="color:#f60;text-align:center">{{ingressName}}</strong> 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long  @click="del()" :loading="deleteLoading">{{this.$t('delete')}}</Button>
      </div>
    </Modal>
    <Modal v-model="formAddModel" :title="optionTitle" width="900">
      <div style="width: 800px;margin-bottom: 15px;margin-left: 30px">
        <Steps :current="current">
          <Step title="基本信息"></Step>
          <Step title="路由规则"></Step>
          <Step title="注解"></Step>
        </Steps>
      </div>
      <hr style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px" />
      <Form ref="createFormItem" v-show="current === 0" :model="formItem" :label-width="55" :rules="ruleValidate">
        <FormItem :label="this.$t('name')" prop="name" class="ivu-form-item ivu-form-item-required">
          <Input v-model="formItem.name" :disabled="nameDisabled"></Input>
        </FormItem>
        <div v-for="(item, index) in formItem.labels" :key="index" :value="item">
          <hr v-if="index != 0" style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px" />
          <FormItem label="标签">
            <Row type="flex" justify="space-between">
              <Col span="22">
                <Input v-model="item.key" placeholder="请输入键">
                </Input>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('formItem',index)" icon="md-trash">
                </Button>
              </Col>
            </Row>
          </FormItem>
          <FormItem :key="index">
            <Row type="flex" justify="space-between">
              <Col span="24">
                <Input v-model="item.val" type="textarea" :autosize="{minRows: 1,maxRows: 50}" placeholder="请输入值">
                </Input>
              </Col>
            </Row>
          </FormItem>
        </div>
        <FormItem>
          <Row>
            <Button type="dashed" long @click="handleAdd('formItem')" icon="md-add"></Button>
          </Row>
        </FormItem>
      </Form>
      <Form ref="createFormRouter" v-show="current === 1" :model="formItemRouter" :label-width="55">
        <div v-for="(item, index) in formItemRouter.items" :key="index" :value="item">
          <hr v-if="index != 0" style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px" />
          <FormItem class="ivu-form-item ivu-form-item-required" label="域名">
            <Row type="flex" justify="space-between">
              <Col span="22">
                 <FormItem
                  :prop="'items.' + index + '.domain'"
                  :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                    <Input v-model="item.domain"></Input>
                 </FormItem>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('formItemRouter',index)"  :disabled= "formItemRouter.items.length === 1" icon="md-trash">
                </Button>
              </Col>
            </Row>
          </FormItem>
          <FormItem class="ivu-form-item ivu-form-item-required" label="协议"
            :prop="'items.' + index + '.protocol'"
            :rules="{required: true, message: '该项不能为空', trigger: 'change'}">
             <Select v-model="item.protocol" placeholder="协议">
              <Option value="http">HTTP</Option>
              <Option value="https">HTTPS</Option>
             </Select>
          </FormItem>
          <div v-for="(item, i) in formItemRouter.items[index].paths" :key="i" :value="item">
            <FormItem class="ivu-form-item ivu-form-item-required" :label="i ===0 ? '路径' : ''">
            <Row type="flex" justify="space-between">
              <Col span="8">
                <FormItem
                  :prop="'items.' + index + '.paths.' + i + '.path'"
                  :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                  <Input v-model="item.path" placeholder="路径">
                  </Input>
                </FormItem>
              </Col>
              <Col span="10">
                <FormItem
                  :prop="'items.' + index + '.paths.' + i + '.service'"
                  :rules="{required: true, message: '该项不能为空', trigger: 'change'}">
                  <Select v-model="item.service" placeholder="服务名" filterable>
                     <Option v-for="(v, k ) in service" :value="k" :key="k" >{{ k }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="3">
                 <FormItem
                  :prop= "'items.' + index + '.paths.' + i + '.port'"
                  :rules="{required: true, type: 'number', message: '该项不能为空', trigger: 'change'}">
                  <Select v-model="item.port" placeholder="端口">
                     <Option v-for="item in service[formItemRouter.items[index].paths[i].service]" :value="item.port" :key="item.port" >{{ item.port }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('formItemRouterPath',index, i)" :disabled= "formItemRouter.items[index].paths.length === 1" icon="md-trash">
                </Button>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleAdd('formItemRouterPath', index)" icon="md-add">
                </Button>
              </Col>
            </Row>
            </FormItem>
          </div>
        </div>
        <FormItem>
          <Row>
            <Button type="dashed" long @click="handleAdd('formItemRouter')" icon="md-add"></Button>
          </Row>
        </FormItem>
      </Form>
      <Form ref="createFormAnnotations" v-show="current === 2" :model="formItemAnnotations" :label-width="55">
        <div v-for="(item, index) in formItemAnnotations.items" :key="index" :value="item">
          <hr v-if="index != 0" style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px" />
          <FormItem :label="'注解'">
          <Row type="flex" justify="space-between">
            <Col span="22">
              <Input v-model="item.key" placeholder="请输入键">
              </Input>
            </Col>
            <Col span="1" offset="0" style="margin-right: 0px">
              <Button type="dashed" @click="handleRemove('formItemAnnotations',index)" icon="md-trash">
              </Button>
            </Col>
          </Row>
          </FormItem>
          <FormItem :key="index">
            <Row type="flex" justify="space-between">
              <Col span="24">
                <Input v-model="item.val" type="textarea" :autosize="{minRows: 1,maxRows: 50}" placeholder="请输入值">
                </Input>
              </Col>
            </Row>
          </FormItem>
        </div>
        <FormItem>
          <Row>
            <Button type="dashed" long @click="handleAdd('formItemAnnotations')" icon="md-add"></Button>
          </Row>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" v-if="current != 0" @click="previous">{{this.$t('previous')}}</Button>
        <Button type="primary" v-if="current != 2" @click="next">{{this.$t('next')}}</Button>
        <Button type="primary" v-if="current == 2 && option == 'add'" @click="formOption('CREATE')">{{this.$t('create')}}</Button>
        <Button type="primary" v-if="current == 2 && option == 'edit'" @click="formOption('EDIT')">{{this.$t('commit')}}</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import {
  getAllIngress,
  getOneIngress,
  createIngress,
  deleteIngress,
  updateIngress,
  getAllService,
  formCreateIngress
} from '@/api/discovery'
import { formatDate } from '@/api/tools'
import { forEach } from '@/libs/tools'
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
  data () {
    const validateName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('not_null')))
      } else {
        if (this.nameExistCheck) {
          this.tableData.forEach((item, index) => {
            if (item.name === value) {
              callback(new Error(this.$t('name_exists')))
            }
          })
        }
        callback()
      }
    }
    return {
      // From Add Model
      nameDisabled: false,
      editData: '',
      formAddModel: false,
      service: [],
      port: [],
      servicePort: {},
      current: 0,
      formItem: {
        name: '',
        labels: [
          {
            val: '',
            key: ''
          }
        ]
      },
      formItemRouter: {
        items: [
          {
            domain: '',
            protocol: 'http',
            paths: [
              {
                path: '/',
                service: '',
                port: ''
              }
            ]
          }
        ]
      },
      formItemAnnotations: {
        items: [
          {
            val: '',
            key: ''
          }
        ]
      },
      ruleValidate: {
        name: [
          { validator: validateName, trigger: 'blur' }
        ]
      },
      // Advanced Add Model End
      nameExistCheck: true,
      deleteModel: false,
      deleteLoading: false,
      option: '',
      optionTitle: '',
      yamlType: 'success',
      jsonType: 'default',
      JsonFormat: false,
      YamlFormat: true,
      editorLang: 'yaml',
      editorContent: '',
      ingressName: '',
      editShow: false,
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
                    name: 'ingressinfo',
                    params: {
                      ingressname: params.row.name
                    }
                  }
                }
              },
              params.row.name
            )
          }
        },
        {
          title: this.$t('domain'),
          key: 'domain',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.values(params.row.domain).map(item => {
                return h('li', item.host)
              })
            )
          }
        },
        {
          title: this.$t('annotations'),
          key: 'annotations',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.keys(params.row.annotations).map(item => {
                if (item !== 'kubectl.kubernetes.io/last-applied-configuration') {
                  return h('li', item + ':' + params.row.annotations[item])
                }
              })
            )
          }
        },
        {
          title: this.$t('create_time'),
          key: 'create_time',
          width: 150,
          sortable: true,
          sortType: 'desc',
          render: (h, params) => {
            return h('div', formatDate(params.row.create_time))
          }
        },
        {
          title: this.$t('action'),
          key: 'action',
          width: 200,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                    ghost: true,
                    disabled: !hasPermission('edit_ingress')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.$refs['createFormItem'].resetFields()
                      this.$refs['createFormRouter'].resetFields()
                      this.current = 0
                      this.optionTitle = this.$t('edit') + ' ' + params.row.name
                      this.option = 'edit'
                      this.formAddModel = true
                      this.nameExistCheck = false
                      this.ingressName = params.row.name
                      this.formEdit()
                    }
                  }
                },
                this.$t('edit')
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: !hasPermission('a_edit_ingress')
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
                      this.ingressName = params.row.name
                      this.edit()
                    }
                  }
                },
                this.$t('advanced_edit')
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small',
                    disabled: !hasPermission('del_ingress')
                  },
                  on: {
                    click: () => {
                      this.deleteModel = true
                      this.deleteLoading = false
                      this.ingressName = params.row.name
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
      getOneIngress({
        productId: 100,
        ingressName: this.ingressName
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
        updateIngress({
          productId: 100,
          postType: 'yaml',
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
          createIngress({
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
    advancedCreateBtnClick () {
      this.yamlType = 'success'
      this.jsonType = 'default'
      this.updateYaml = ''
      this.originYaml = ''
      this.editorContent = ''
      this.ingressName = ''
      this.optionTitle = this.$t('add')
      this.option = 'add'
      this.editShow = true
    },
    del () {
      this.deleteLoading = true
      deleteIngress({
        productId: 100,
        ingressName: this.ingressName
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
      getAllIngress({
        productId: 100
      }).then(res => {
        let data = []
        forEach(res.data, (item, index) => {
          data.push({
            name: item.metadata.name,
            annotations: item.metadata.annotations || '',
            domain: item.spec.rules,
            create_time: formatDate(item.metadata.creationTimestamp)
          })
        })
        this.tableData = data
      })
    },
    refresh () {
      this.formatTableData()
      this.$Message.success(this.$t('refresh_success'))
    },
    // 表单添加
    createBtnClick () {
      this.$refs['createFormItem'].resetFields()
      this.$refs['createFormRouter'].resetFields()
      this.handleReset()
      this.nameExistCheck = true
      this.current = 0
      this.ingressName = ''
      this.optionTitle = this.$t('add')
      this.option = 'add'
      this.formAddModel = true
      this.nameDisabled = false
      this.getService()
    },
    getService () {
      getAllService({
        productId: 100
      }).then(res => {
        this.service = {}
        forEach(res.data, (item, index) => {
          this.service[item.metadata.name] = item.spec.ports
        })
      })
    },
    next () {
      if (this.current === 0) {
        this.$refs['createFormItem'].validate(valid => {
          if (valid) {
            this.current += 1
          }
        })
      } else if (this.current === 1) {
        this.$refs['createFormRouter'].validate(valid => {
          if (valid) {
            this.current += 1
          }
        })
      }
    },
    previous () {
      this.current -= 1
    },
    handleRemove (type, index, indexPath) {
      if (type === 'formItem') {
        this.formItem.labels.splice(index, 1)
      }
      if (type === 'formItemRouter') {
        this.formItemRouter.items.splice(index, 1)
      }
      if (type === 'formItemRouterPath') {
        this.formItemRouter.items[index].paths.splice(indexPath, 1)
      }
      if (type === 'formItemAnnotations') {
        this.formItemAnnotations.items.splice(index, 1)
      }
    },
    handleAdd (type, index) {
      if (type === 'formItem') {
        this.formItem.labels.push({
          labels: [
            {
              val: '',
              key: ''
            }
          ]
        })
      }
      if (type === 'formItemRouter') {
        this.formItemRouter.items.push(
          {
            domain: '',
            protocol: 'http',
            paths: [
              {
                path: '/',
                service: '',
                port: ''
              }
            ]
          }
        )
      }
      if (type === 'formItemRouterPath') {
        this.formItemRouter.items[index].paths.push(
          {
            path: '/',
            service: '',
            port: ''
          }
        )
      }
      if (type === 'formItemAnnotations') {
        this.formItemAnnotations.items.push({
          items: [
            {
              val: '',
              key: ''
            }
          ]
        })
      }
    },
    formOption (value) {
      let json = {
        'metadata': {
          'name': this.formItem.name,
          'labels': {},
          'annotations': {}
        },
        'spec': {
          'rules': []
        }
      }
      if (this.formItem.labels.length > 0) {
        this.formItem.labels.forEach((item, index) => {
          if (item.key) {
            json.metadata.labels[item.key] = item.val
          }
        })
      }
      this.formItemRouter.items.forEach((item, index) => {
        json.spec.rules.push(
          {
            'host': item.domain
          }
        )
        let paths = []
        item.paths.forEach((p, index) => {
          paths.push({
            'path': p.path,
            'backend': {
              'serviceName': p.service,
              'servicePort': p.port
            }
          })
        })
        json.spec.rules[index][item.protocol] = {
          'paths': paths
        }
      })
      if (this.formItemAnnotations.items.length > 0) {
        this.formItemAnnotations.items.forEach((item, index) => {
          if (item.key) {
            json.metadata.annotations[item.key] = item.val
          }
        })
      }
      if (value === 'CREATE') {
        formCreateIngress({
          productId: 100,
          yaml: JSON.stringify(json)
        }).then(res => {
          if (res.code === 200 && res.msg === '') {
            this.$Message.success({
              content: this.$t('create_success')
            })
            this.formAddModel = false
          } else {
            this.$Message.error({
              content: this.$t('create_failure')
            })
          }
          this.formatTableData()
        })
      } else if (value === 'EDIT') {
        updateIngress({
          productId: 100,
          postType: 'form',
          updateJson: JSON.stringify(json)
        }).then(res => {
          if (res.code === 200 && res.msg === '') {
            this.$Message.success({
              content: this.$t('edit_success')
            })
            this.formAddModel = false
          } else {
            this.$Message.error({
              content: this.$t('edit_failure')
            })
          }
          this.formatTableData()
        })
      }
    },
    handleReset () {
      this.formItem = {
        name: '',
        labels: [
          {
            val: '',
            key: ''
          }
        ]
      }
      this.formItemRouter = {
        items: [
          {
            domain: '',
            protocol: 'http',
            paths: [
              {
                path: '/',
                service: '',
                port: ''
              }
            ]
          }
        ]
      }
      this.formItemAnnotations = {
        items: [
          {
            val: '',
            key: ''
          }
        ]
      }
    },
    formEdit () {
      this.nameDisabled = true
      // 获取service信息
      this.getService()
      getOneIngress({
        productId: 100,
        ingressName: this.ingressName
      }).then(res => {
        this.editData = res.data
        this.formItem.name = res.data.metadata.name
        this.formItem.labels = []
        // labels 存在进行填充
        if (res.data.metadata.labels) {
          for (const k in res.data.metadata.labels) {
            this.formItem.labels.push(
              {
                'key': k,
                'val': res.data.metadata.labels[k]
              }
            )
          }
        } else { // labels不存在填充空表格
          this.formItem.labels.push(
            {
              'key': '',
              'val': ''
            }
          )
        }
        this.formItemAnnotations.items = []
        if (res.data.metadata.annotations) {
          for (const k in res.data.metadata.annotations) {
            this.formItemAnnotations.items.push(
              {
                'key': k,
                'val': res.data.metadata.annotations[k]
              }
            )
          }
        } else {
          this.formItemAnnotations.items.push(
            {
              'key': '',
              'val': ''
            }
          )
        }
        this.formItemRouter.items = []
        res.data.spec.rules.forEach((item, index) => {
          let pathList = []
          if (item.http) {
            item.http.paths.forEach((p, index) => {
              pathList.push(
                {
                  'path': p.path,
                  'service': p.backend.serviceName,
                  'port': p.backend.servicePort
                }
              )
            })
            this.formItemRouter.items.push(
              {
                'domain': item.host,
                'protocol': 'http',
                'paths': pathList
              }
            )
          } else if (item.https) {
            item.https.paths.forEach((p, index) => {
              pathList.push(
                {
                  'path': p.path,
                  'service': p.backend.serviceName,
                  'port': p.backend.servicePort
                }
              )
            })
            this.formItemRouter.items.push(
              {
                'domain': item.host,
                'protocol': 'https',
                'paths': pathList
              }
            )
          } else {
            this.formItemRouter.items.push(
              {
                'domain': item.host,
                'protocol': 'http',
                'paths': [{
                  'path': '/',
                  'service': '',
                  'port': ''
                }]
              }
            )
          }
        })
      })
    }
  }
}
</script>

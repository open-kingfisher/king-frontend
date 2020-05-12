<template>
  <div>
    <information info="网关：为 HTTP/TCP 流量配置了一个负载均衡，多数情况下在网格边缘进行操作，用于启用一个服务的入口（ingress）流量，相当于前端代理。与 Kubernetes 的 Ingress 不同，Istio Gateway 只配置四层到六层的功能。"></information>
    <Card shadow>
      <SearchTable :data="tableData" :columns="columns">
        <ButtonGroup>
          <Button v-if="hasPerm('add_gateway')" @click="createBtnClick('CREATE')" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
          <Button v-if="hasPerm('a_add_gateway')" @click="advancedCreateBtnClick('CREATE')" style="margin-right: 3px" type="success" ghost>{{ this.$t('advanced_Add') }}</Button>
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
        <span>{{optionTitle}} {{resourceName}}</span>
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
        <p style="line-height: 35px; margin-bottom: 10px">确认删除  <strong style="color:#f60;text-align:center">{{resourceName}}</strong> 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long  @click="del()" :loading="deleteLoading">{{this.$t('delete')}}</Button>
      </div>
    </Modal>
    <Modal v-model="formAddModel" :title="optionTitle" width="900">
      <div style="width: 800px;margin-bottom: 15px;margin-left: 30px">
        <Steps :current="current">
          <Step title="基本信息"></Step>
          <Step title="网关配置"></Step>
          <Step title="选择网关控制器"></Step>
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
      <Form ref="createFormConfig" v-show="current === 1" :model="formItemConfig" :label-width="70">
        <div v-for="(item, index) in formItemConfig.servers" :key="index" :value="item">
          <hr v-if="index != 0" style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px" />
          <FormItem class="ivu-form-item ivu-form-item-required" label="网关名称">
             <Row type="flex" justify="space-between">
                <Col span="11">
                  <FormItem
                    :prop="'servers.' + index + '.port.name'"
                    :rules="[{required: true, message: '该项不能为空', trigger: 'blur'}]">
                    <Input v-model="item.port.name" placeholder="名称">
                    </Input>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem
                    :prop="'servers.' + index + '.port.protocol'"
                    :rules="{required: true, message: '该项不能为空', trigger: 'change'}">
                    <Select v-model="item.port.protocol" placeholder="协议">
                      <Option value="HTTP">HTTP</Option>
                      <Option value="HTTPS">HTTPS</Option>
                      <Option value="GRPC">GRPC</Option>
                      <Option value="HTTP2">HTTP2</Option>
                      <Option value="MONGO">MONGO</Option>
                      <Option value="TCP">TCP</Option>
                      <Option value="TLS">TLS</Option>
                     </Select>
                  </FormItem>
                </Col>
                <Col span="5">
                   <FormItem
                    :prop= "'servers.' + index + '.port.number'"
                    :rules="[{required: true, message: '该项不能为空', trigger: 'blur'},
                    {required: true, message: '必须是非零数字', pattern:/^\+?[1-9][0-9]*$/, trigger: 'blur'}
                    ]">
                    <Input v-model="item.port.number" placeholder="端口">
                      <span slot="prepend">端口</span>
                    </Input>
                  </FormItem>
                </Col>
               <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('formItemConfig',index)"  :disabled= "formItemConfig.servers.length === 1" icon="md-trash">
                </Button>
              </Col>
             </Row>
          </FormItem>
          <div v-for="(item, i) in formItemConfig.servers[index].hosts" :key="i" :value="item">
            <FormItem class="ivu-form-item ivu-form-item-required" :label="i === 0 ? '主机': ''">
              <Row type="flex" justify="space-between">
                <Col span="21">
                  <FormItem
                    :prop="'servers.' + index + '.hosts.' + i + '.key'"
                    :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                    <Input v-model=item.key placeholder="主机">
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('formItemConfigHosts',index, i)" :disabled= "formItemConfig.servers[index].hosts.length === 1" icon="md-trash">
                  </Button>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleAdd('formItemConfigHosts', index)" icon="md-add">
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </div>
        </div>
        <FormItem>
          <Row>
            <Button type="dashed" long @click="handleAdd('formItemConfig')" icon="md-add"></Button>
          </Row>
        </FormItem>
      </Form>
      <Form ref="createFormSelector" v-if="current === 2" :model="formItemSelector" :label-width="70">
        <FormItem label="部署标签">
           <Select v-model="formItemSelector.deployment" placeholder="通过部署获取标签" @on-change="deploymentChange(formItemSelector.deployment)">
             <Option v-for="v in deployment" :value="v.name" :key="v.name">{{ v.name }}</Option>
           </Select>
        </FormItem>
        <div v-for="(item, index) in formItemSelector.selectors" :key="index" :value="item">
          <FormItem class="ivu-form-item ivu-form-item-required" :label="index === 0 ? '选择标签': ''">
          <Row type="flex" justify="space-between">
            <Col span="11">
              <FormItem
                :prop="'selectors.' + index + '.key'"
                :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                <Input v-model="item.key" placeholder="请输入键"></Input>
              </FormItem>
            </Col>
            <Col span="10">
              <FormItem
                :prop="'selectors.' + index + '.val'"
                :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                <Input v-model="item.val" placeholder="请输入值"></Input>
              </FormItem>
            </Col>
            <Col span="1" offset="0" style="margin-right: 5px">
              <Button type="dashed" @click="handleRemove('formItemSelector', index)" :disabled="formItemSelector.selectors.length === 1" icon="md-trash">
              </Button>
            </Col>
            <Col span="1" offset="0" style="margin-right: 5px">
              <Button type="dashed" @click="handleAdd('formItemSelector')" icon="md-add">
              </Button>
            </Col>
          </Row>
          </FormItem>
        </div>
      </Form>
      <Form ref="createFormAnnotations" v-show="current === 3" :model="formItemAnnotations" :label-width="55">
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
        <Button type="primary" v-if="current != 3" @click="next">{{this.$t('next')}}</Button>
        <Button type="primary" v-if="current == 3 && option == 'add'" @click="formOption('CREATE')">{{this.$t('create')}}</Button>
        <Button type="primary" v-if="current == 3 && option == 'edit'" @click="formOption('EDIT')">{{this.$t('commit')}}</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import {
  Get,
  List,
  Create,
  Delete,
  Update,
  formCreate
} from '@/api/istio/gateways.js'
import { getControllerInfoIstio } from '@/api/deployment'
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
      gateway: '',
      deployment: [],
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
      formItemConfig: {
        servers: [
          {
            hosts: [{
              key: ''
            }],
            port: {
              number: '',
              protocol: 'HTTP',
              name: ''
            }
          }
        ]
      },
      formItemSelector: {
        deployment: '',
        selectors: [
          {
            val: '',
            key: ''
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
      resourceName: '',
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
                    name: 'gatewayinfo',
                    params: {
                      resourceName: params.row.name
                    }
                  }
                }
              },
              params.row.name
            )
          }
        },
        {
          title: this.$t('selector'),
          key: 'selector',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.keys(params.row.selector).map(item => {
                return h(
                  'Tag',
                  {
                    style: {
                      textAlign: 'center'
                    },
                    props: {
                      color: 'success'
                    }
                  },
                  item + ' | ' + params.row.selector[item]
                )
              })
            )
          }
        },
        {
          title: this.$t('service'),
          key: 'servers',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.keys(params.row.servers).map(item => {
                let info =
                  '名称： ' +
                  params.row.servers[item].port.name +
                  '，' +
                  '端口：' +
                  params.row.servers[item].port.number +
                  '，' +
                  '协议：' +
                  params.row.servers[item].port.protocol +
                  '，' +
                  '域名：' +
                   params.row.servers[item].hosts.join('；')
                return h('li', info)
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
                    disabled: !hasPermission('edit_gateway')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.$refs['createFormItem'].resetFields()
                      this.$refs['createFormConfig'].resetFields()
                      this.current = 0
                      this.optionTitle = this.$t('edit') + ' ' + params.row.name
                      this.option = 'edit'
                      this.formAddModel = true
                      this.nameExistCheck = false
                      this.resourceName = params.row.name
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
                    disabled: !hasPermission('a_edit_gateway')
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
                      this.resourceName = params.row.name
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
                    disabled: !hasPermission('del_gateway')
                  },
                  on: {
                    click: () => {
                      this.deleteModel = true
                      this.deleteLoading = false
                      this.resourceName = params.row.name
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
      Get({
        productId: 100,
        resourceName: this.resourceName
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
        Update({
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
          Create({
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
      this.resourceName = ''
      this.optionTitle = this.$t('add')
      this.option = 'add'
      this.editShow = true
    },
    del () {
      this.deleteLoading = true
      Delete({
        productId: 100,
        resourceName: this.resourceName
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
      List({
        productId: 100
      }).then(res => {
        let data = []
        forEach(res.data, (item, index) => {
          data.push({
            name: item.metadata.name,
            selector: item.spec.selector,
            servers: item.spec.servers,
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
      this.$refs['createFormConfig'].resetFields()
      this.handleReset()
      this.nameExistCheck = true
      this.current = 0
      this.ingressName = ''
      this.optionTitle = this.$t('add')
      this.option = 'add'
      this.formAddModel = true
      this.nameDisabled = false
      this.getDeployment()
    },
    next () {
      if (this.current === 0) {
        this.$refs['createFormItem'].validate(valid => {
          if (valid) {
            this.current += 1
          }
        })
      } else if (this.current === 1) {
        this.$refs['createFormConfig'].validate(valid => {
          if (valid) {
            this.current += 1
          }
        })
      } else if (this.current === 2) {
        this.$refs['createFormSelector'].validate(valid => {
          if (valid) {
            this.current += 1
          }
        })
      }
    },
    previous () {
      this.current -= 1
    },
    handleRemove (type, index, secondIndex) {
      if (type === 'formItem') {
        this.formItem.labels.splice(index, 1)
      }
      if (type === 'formItemConfig') {
        this.formItemConfig.servers.splice(index, 1)
      }
      if (type === 'formItemConfigHosts') {
        this.formItemConfig.servers[index].hosts.splice(secondIndex, 1)
      }
      if (type === 'formItemSelector') {
        this.formItemSelector.selectors.splice(index, 1)
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
      if (type === 'formItemConfig') {
        this.formItemConfig.servers.push(
          {
            hosts: [{
              key: ''
            }],
            port: {
              number: '',
              protocol: 'HTTP',
              name: ''
            }
          }
        )
      }
      if (type === 'formItemSelector') {
        this.formItemSelector.selectors.push(
          {
            val: '',
            key: ''
          }
        )
      }
      if (type === 'formItemConfigHosts') {
        this.formItemConfig.servers[index].hosts.push(
          {
            key: ''
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
    getDeployment () {
      this.deployment = []
      getControllerInfoIstio({
        productId: 100,
        setName: 'deployment'
      }).then(res => {
        res.data.forEach((item, index) => {
          this.deployment.push({
            name: item.metadata.name,
            labels: item.metadata.labels
          })
        })
      })
    },
    deploymentChange (value) {
      this.deployment.forEach((item, index) => {
        if (value === item.name) {
          this.formItemSelector.selectors = []
          for (const k in item.labels) {
            this.formItemSelector.selectors.push(
              {
                'key': k,
                'val': item.labels[k]
              }
            )
          }
        }
      })
    },
    formOption (value) {
      let json = {
        'metadata': {
          'name': this.formItem.name,
          'labels': {},
          'annotations': {}
        },
        'spec': {
          'servers': [],
          'selector': {}
        }
      }
      if (this.formItem.labels.length > 0) {
        this.formItem.labels.forEach((item, index) => {
          if (item.key) {
            json.metadata.labels[item.key] = item.val
          }
        })
      }
      if (this.formItemConfig.servers.length > 0) {
        this.formItemConfig.servers.forEach((item, index) => {
          let hosts = []
          item.hosts.forEach((h, i) => {
            hosts.push(h.key)
          })
          json.spec.servers.push({
            'port': {
              'number': parseInt(item.port.number),
              'protocol': item.port.protocol,
              'name': item.port.name
            },
            hosts: hosts
          })
        })
      }
      if (this.formItemSelector.selectors.length > 0) {
        this.formItemSelector.selectors.forEach((item, i) => {
          json.spec.selector[item.key] = item.val
        })
      }
      if (this.formItemAnnotations.items.length > 0) {
        this.formItemAnnotations.items.forEach((item, index) => {
          if (item.key) {
            json.metadata.annotations[item.key] = item.val
          }
        })
      }
      if (value === 'CREATE') {
        formCreate({
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
        json.metadata.resourceVersion = this.gateway.metadata.resourceVersion
        Update({
          productId: 100,
          updateJson: JSON.stringify(json),
          postType: 'form'
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
      this.formItemConfig = {
        servers: [
          {
            hosts: [{
              key: ''
            }],
            port: {
              number: '',
              protocol: 'HTTP',
              name: ''
            }
          }
        ]
      }
      this.formItemSelector = {
        deployment: '',
        selectors: [
          {
            val: '',
            key: ''
          }
        ]
      }
    },
    formEdit () {
      this.nameDisabled = true
      // 获取Deployment信息
      this.getDeployment()
      Get({
        productId: 100,
        resourceName: this.resourceName
      }).then(res => {
        this.gateway = res.data
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
        this.formItemSelector.selectors = []
        if (res.data.spec.selector) {
          for (const k in res.data.spec.selector) {
            this.formItemSelector.selectors.push(
              {
                'key': k,
                'val': res.data.spec.selector[k]
              }
            )
          }
        } else {
          this.formItemSelector.selectors.push(
            {
              'key': '',
              'val': ''
            }
          )
        }
        this.formItemConfig.servers = []
        res.data.spec.servers.forEach((item, index) => {
          let hosts = []
          item.hosts.forEach((h, i) => {
            hosts.push({
              'key': h
            })
          })
          this.formItemConfig.servers.push({
            'port': {
              'number': item.port.number.toString(),
              'protocol': item.port.protocol,
              'name': item.port.name
            },
            hosts: hosts
          })
        })
      })
    }
  }
}
</script>

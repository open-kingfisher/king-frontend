<template>
  <div>
    <information info="服务：Kubernetes Service 定义了这样一种抽象：一个 Pod 的逻辑分组，一种可以访问它们的策略，通常是通过 Label Selector 实现的。"></information>
    <Card shadow>
      <SearchTable :data="tableData" :columns="columns">
      <ButtonGroup>
        <Button v-if="hasPerm('add_service')" @click="createBtnClick('CREATE')" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
        <Button v-if="hasPerm('a_add_service')" @click="advancedCreateBtnClick('CREATE')" style="margin-right: 3px" type="success" ghost>{{ this.$t('advanced_Add') }}</Button>
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
        <span>{{optionTitle}} {{serviceName}}</span>
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
          <span>删除</span>
      </p>
      <div style="text-align:center">
        <p style="line-height: 35px; margin-bottom: 10px">确认删除  <strong style="color:#f60;text-align:center">{{serviceName}}</strong> 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long  @click="del()" :loading="deleteLoading">{{this.$t('delete')}}</Button>
      </div>
    </Modal>
    <Modal v-model="formAddModel" :title="optionTitle" width="900">
      <div style="width: 800px;margin-bottom: 15px;margin-left: 30px">
        <Steps :current="current">
          <Step title="基本信息"></Step>
          <Step title="服务设置"></Step>
          <Step title="选择器设置" v-if="!externalName"></Step>
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
              <Col span="1" offset="0" style="margin-right: 4px">
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
      <Form ref="createFormConfig" v-show="current === 1" :model="formItemConfig" :label-width="90">
        <FormItem label="访问模式" prop="type" class="ivu-form-item ivu-form-item-required">
          <Select v-model="formItemConfig.type" placeholder="访问模式" @on-change="typeChange(formItemConfig.type)" :disabled="typeDisabled">
            <Option value="ClusterIP" label="ClusterIP">
              <span>ClusterIP</span>
              <span style="float:right;color:#ccc">生成集群内唯一IP，集群内部可以通过此IP进行服务访问</span>
            </Option>
            <Option value="Headless" label="Headless" :disabled="headlessDisabled">
              <span>Headless</span>
              <span style="float:right;color:#ccc">集群内部直接通过后端的Endpoint IP进行服务访问，由DNS负责解析，创建后不能修改模式</span>
            </Option>
            <Option value="NodePort" label="NodePort">
              <span>NodePort</span>
              <span style="float:right;color:#ccc">生成集群内唯一IP，并在Node上开启对应的端口，可以通过Node地址加端口的方式访问</span>
            </Option>
            <Option value="LoadBalancer" label="LoadBalancer" disabled="true">
              <span>LoadBalancer</span>
              <span style="float:right;color:#ccc">使用云提供商的负载均衡器，可以向外部暴露服务</span>
            </Option>
            <Option value="ExternalName" label="ExternalName" :disabled="externalNameDisabled">
              <span>ExternalName</span>
              <span style="float:right;color:#ccc">把集群外部的服务引入到集群内部，避免因外部服务地址变化导致内部服务不可用</span>
            </Option>
           </Select>
        </FormItem>
        <FormItem label="会话亲和性" prop="sessionAffinity" class="ivu-form-item ivu-form-item-required" v-if="!externalName">
           <Select v-model="formItemConfig.sessionAffinity" placeholder="会话亲和性">
            <Option value="None">None</Option>
            <Option value="ClientIP">ClientIP</Option>
           </Select>
        </FormItem>
        <FormItem label="服务域名" prop="domain" class="ivu-form-item ivu-form-item-required" :rules="{required: true, message: '该项不能为空', trigger: 'change'}" v-if="externalName">
           <Input v-model="formItemConfig.domain" placeholder="集群外部服务域名">
           </Input>
        </FormItem>
        <div v-for="(item, index) in formItemConfig.ports" :key="index" :value="item" v-if="!externalName">
          <FormItem :label="index === 0 ? '端口': ''">
            <Row type="flex" justify="space-between">
            <Col :span="nameWidth">
              <FormItem>
                <Input v-model="item.name" placeholder="端口名称"></Input>
              </FormItem>
            </Col>
            <Col span="3">
              <FormItem
                :prop="'ports.' + index + '.protocol'"
                :rules="{required: true, message: '该项不能为空', trigger: 'change'}">
                <Select v-model="item.protocol" placeholder="协议">
                  <Option value="TCP">TCP</Option>
                  <Option value="UDP">UDP</Option>
                  <Option value="SCTP">SCTP</Option>
                </Select>
              </FormItem>
            </Col>
            <Col span="3">
              <FormItem
                :prop="'ports.' + index + '.port'"
                :rules="{required: true, type: 'number', message: '该项不能为空', trigger: 'change'}">
                <InputNumber  style="width: 97px" v-model="item.port" placeholder="服务端口" :max="65536"></InputNumber>
              </FormItem>
            </Col>
            <Col span="3">
              <FormItem
                :prop="'ports.' + index + '.targetPort'"
                :rules="{required: true, type: 'number', message: '该项不能为空', trigger: 'change'}">
                <InputNumber style="width: 97px" v-model="item.targetPort" placeholder="容器端口" :max="65536"></InputNumber>
              </FormItem>
            </Col>
            <Col span="3" v-if="nodePort">
              <FormItem
                :prop="'ports.' + index + '.nodePort'">
                <InputNumber style="width: 97px" v-model="item.nodePort" placeholder="节点端口" :max="32767"></InputNumber>
              </FormItem>
            </Col>
            <Col span="1" offset="0" style="margin-right: 5px">
              <Button type="dashed" @click="handleRemove('formItemConfig', index)" :disabled="formItemConfig.ports.length === 1" icon="md-trash">
              </Button>
            </Col>
            <Col span="1" offset="0" style="margin-right: 5px">
              <Button type="dashed" @click="handleAdd('formItemConfig')" icon="md-add">
              </Button>
            </Col>
          </Row>
          </FormItem>
        </div>
      </Form>
      <Form ref="createFormSelector" v-if="current === 2" :model="formItemSelector" :label-width="70">
        <FormItem label="部署标签">
           <Select v-model="formItemSelector.deployment" placeholder="通过部署获取标签" @on-change="deploymentChange(formItemSelector.deployment)">
             <Option v-for="v in deployment" :value="v.name" :key="v.name">{{ v.name }}</Option>
           </Select>
        </FormItem>
        <div v-for="(item, index) in formItemSelector.selectors" :key="index" :value="item">
          <FormItem class="ivu-form-item ivu-form-item-required" :label="index ===0 ? '选择标签' : ''">
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
      <div slot="footer">
        <Button type="primary" v-if="current != 0 && !externalName" @click="previous">{{this.$t('previous')}}</Button>
        <Button type="primary" v-if="current != 2 && !externalName" @click="next">{{this.$t('next')}}</Button>
        <Button type="primary" v-if="current == 0 && externalName" @click="next">{{this.$t('next')}}</Button>
        <Button type="primary" v-if="current == 1 && externalName" @click="previous">{{this.$t('previous')}}</Button>
        <Button type="primary" v-if="current == 1 && externalName && option == 'add'" @click="formOption('CREATE')">{{this.$t('create')}}</Button>
        <Button type="primary" v-if="current == 1 && externalName && option == 'edit'" @click="formOption('EDIT')">{{this.$t('commit')}}</Button>
        <Button type="primary" v-if="current == 2 && option == 'add'" @click="formOption('CREATE')">{{this.$t('create')}}</Button>
        <Button type="primary" v-if="current == 2 && option == 'edit'" @click="formOption('EDIT')">{{this.$t('commit')}}</Button>
        <Button type="primary" ghost v-if="current == 2 && option == 'copy'" @click="formOption('Template')">保存为模板</Button>
        <Button type="primary" v-if="current == 2 && option == 'copy'" @click="formOption('CREATE')">{{this.$t('create')}}</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import {
  getAllService,
  getOneService,
  createService,
  updateService,
  deleteService,
  formCreateService
} from '@/api/discovery'
import { getControllerInfo } from '@/api/deployment'
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
      externalName: true,
      typeDisabled: false,
      headlessDisabled: false,
      externalNameDisabled: false,
      deployment: [],
      nameWidth: 11,
      nodePort: false,
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
        resourceVersion: '',
        type: 'ClusterIP',
        sessionAffinity: 'None',
        domain: '',
        ports: [
          {
            name: '',
            protocol: 'TCP',
            port: null,
            targetPort: null,
            nodePort: null
          }
        ]
      },
      formItemSelector: {
        clusterIP: '',
        deployment: '',
        selectors: [
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
      serviceName: '',
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
          title: this.$t('type'),
          width: 130,
          key: 'type'
        },
        {
          title: this.$t('cluster_ip'),
          width: 130,
          key: 'cluster_ip'
        },
        {
          title: this.$t('port'),
          key: 'port',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.keys(params.row.port).map(item => {
                let nodePort = '--'
                if (params.row.port[item]['nodePort']) {
                  nodePort = params.row.port[item]['nodePort']
                }
                let info =
                  '节点端口：' +
                  nodePort +
                  '，' +
                  '服务端口：' +
                  params.row.port[item]['port'] +
                  '，' +
                  '容器端口：' +
                  params.row.port[item]['targetPort'] +
                  '，' +
                  '协议：' +
                  params.row.port[item]['protocol']
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
          width: 240,
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
                    disabled: !hasPermission('edit_service')
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
                      this.serviceName = params.row.name
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
                    disabled: !hasPermission('a_edit_service')
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
                      this.serviceName = params.row.name
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
                    type: 'primary',
                    size: 'small',
                    ghost: true,
                    disabled: !hasPermission('copy_service')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.$refs['createFormItem'].resetFields()
                      this.$refs['createFormConfig'].resetFields()
                      this.current = 0
                      this.optionTitle = '复制 ' + params.row.name
                      this.option = 'copy'
                      this.formAddModel = true
                      this.nameExistCheck = false
                      this.serviceName = params.row.name
                      this.formEdit()
                    }
                  }
                },
                this.$t('copy')
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small',
                    disabled: !hasPermission('del_service')
                  },
                  on: {
                    click: () => {
                      this.deleteModel = true
                      this.deleteLoading = false
                      this.serviceName = params.row.name
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
      this.editorContent = this.updateYaml // 为了保证每次点击更新的时候，呈现的数据都是后端真实的数据，而不是已经编辑没有提交的
      getOneService({
        productId: 100,
        serviceName: this.serviceName
      }).then(res => {
        this.type = 'success'
        this.originYaml = ''
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
        this.editorContent = this.updateYaml // 提交的数据后端不支持，但是可以提交，需要更新editorContent
        updateService({
          productId: 100,
          updateJson: updateJson,
          postType: 'yaml'
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
          createService({
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
    advancedCreateBtnClick () {
      this.yamlType = 'success'
      this.jsonType = 'default'
      this.updateYaml = ''
      this.originYaml = ''
      this.editorContent = ''
      this.serviceName = ''
      this.optionTitle = this.$t('add')
      this.option = 'add'
      this.editShow = true
    },
    del () {
      this.deleteLoading = true
      deleteService({
        productId: 100,
        serviceName: this.serviceName
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
      getAllService({
        productId: 100
      }).then(res => {
        let data = []
        forEach(res.data, (item, index) => {
          let type = ''
          if (item.spec.clusterIP === 'None') {
            type = 'Headless'
          } else {
            type = item.spec.type
          }
          data.push({
            name: item.metadata.name,
            selector: item.spec.selector || {},
            type: type,
            cluster_ip: item.spec.clusterIP,
            port: item.spec.ports || {},
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
      this.headlessDisabled = false
      this.externalNameDisabled = false
      this.typeDisabled = false
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
      }
    },
    previous () {
      this.current -= 1
    },
    handleRemove (type, index) {
      if (type === 'formItem') {
        this.formItem.labels.splice(index, 1)
      }
      if (type === 'formItemConfig') {
        this.formItemConfig.ports.splice(index, 1)
      }
      if (type === 'formItemSelector') {
        this.formItemSelector.selectors.splice(index, 1)
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
        this.formItemConfig.ports.push(
          {
            name: '',
            protocol: 'TCP',
            port: null,
            targetPort: null,
            nodePort: null
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
    },
    typeChange (value) {
      if (value === 'NodePort') {
        this.nameWidth = 8
        this.nodePort = true
        this.externalName = false
      } else if (value === 'ExternalName') {
        this.externalName = true
      } else {
        this.nameWidth = 11
        this.nodePort = false
        this.externalName = false
      }
    },
    getDeployment () {
      this.deployment = []
      getControllerInfo({
        productId: 100,
        setName: 'deployment'
      }).then(res => {
        res.data.forEach((item, index) => {
          this.deployment.push({
            name: item.metadata.name,
            labels: item.spec.selector.matchLabels
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
          'labels': {}
        },
        'spec': {
          'ports': [],
          'selector': {},
          'type': '',
          'sessionAffinity': this.formItemConfig.sessionAffinity
        }
      }
      if (this.formItem.labels.length > 0) {
        this.formItem.labels.forEach((item, index) => {
          if (item.key) {
            json.metadata.labels[item.key] = item.val
          }
        })
      }
      // type 设置
      if (this.formItemConfig.type === 'Headless') {
        json.spec.clusterIP = 'None'
      } else {
        json.spec.type = this.formItemConfig.type
      }
      if (this.formItemConfig.type !== 'ExternalName') {
        this.$refs['createFormSelector'].validate(valid => {
          if (valid) {
            // ports 设置
            this.formItemConfig.ports.forEach((item, index) => {
              if (this.formItemConfig.type === 'NodePort') {
                json.spec.ports.push(
                  {
                    'name': item.name,
                    'protocol': item.protocol,
                    'port': item.port,
                    'targetPort': item.targetPort,
                    'nodePort': item.nodePort
                  }
                )
              } else {
                json.spec.ports.push(
                  {
                    'name': item.name,
                    'protocol': item.protocol,
                    'port': item.port,
                    'targetPort': item.targetPort
                  }
                )
              }
            })
            if (this.formItemSelector.selectors.length > 0) {
              this.formItemSelector.selectors.forEach((item, index) => {
                if (item.key) {
                  json.spec.selector[item.key] = item.val
                }
              })
            }
            if (value === 'CREATE') {
              formCreateService({
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
              json.metadata.resourceVersion = this.formItemSelector.resourceVersion
              json.spec.clusterIP = this.formItemSelector.clusterIP
              updateService({
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
          }
        })
      } else {
        json.spec.type = 'ExternalName'
        json.spec.externalName = this.formItemConfig.domain
        this.$refs['createFormConfig'].validate(valid => {
          if (valid) {
            if (value === 'CREATE') {
              formCreateService({
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
              json.metadata.resourceVersion = this.formItemSelector.resourceVersion
              json.spec.clusterIP = this.formItemSelector.clusterIP
              updateService({
                productId: 100,
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
          }
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
        resourceVersion: '',
        type: 'ClusterIP',
        sessionAffinity: 'None',
        ports: [
          {
            name: '',
            protocol: 'TCP',
            port: null,
            targetPort: null,
            nodePort: null
          }
        ]
      }
      this.formItemSelector = {
        clusterIP: '',
        deployment: '',
        selectors: [
          {
            val: '',
            key: ''
          }
        ]
      }
      // 隐藏nodePort
      this.typeChange()
      // this.$refs['createFormItem'].resetFields()
      // this.$refs['createFormConfig'].resetFields()
      // this.$refs['createFormSelector'].resetFields()
    },
    formEdit () {
      this.nameDisabled = this.option === 'edit'
      // headless已有service不能改成headless模式
      this.headlessDisabled = true
      this.externalNameDisabled = true
      // 获取Deployment信息
      this.getDeployment()
      getOneService({
        productId: 100,
        serviceName: this.serviceName
      }).then(res => {
        this.formItem.name = this.option === 'edit' ? res.data.metadata.name : res.data.metadata.name + '-copy'
        this.formItem.labels = []
        // labels 存在进行填充
        if (res.data.metadata.labels && this.option !== 'copy') {
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
        this.formItemSelector.resourceVersion = res.data.metadata.resourceVersion // 没有这项没法更新
        this.formItemSelector.clusterIP = res.data.spec.clusterIP // 没有这项没法更新
        this.formItemSelector.selectors = []
        // copy的时候nodePort不复制，Deployment不选择
        if (this.option === 'copy') {
          this.formItemSelector.deployment = ''
        }
        if (res.data.spec.selector && this.option !== 'copy') {
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
        this.nameWidth = 11
        this.nodePort = false
        if (res.data.spec.clusterIP === 'None') {
          this.formItemConfig.type = 'Headless'
          this.externalName = false
          this.typeDisabled = true
        } else if (res.data.spec.type === 'ExternalName') {
          this.externalName = true
          this.typeDisabled = true
          this.formItemConfig.type = 'ExternalName'
        } else {
          this.externalName = false
          this.typeDisabled = false
          this.formItemConfig.type = res.data.spec.type
          if (res.data.spec.type === 'NodePort') {
            this.nameWidth = 8
            this.nodePort = true
          }
        }
        this.formItemConfig.sessionAffinity = res.data.spec.sessionAffinity
        this.formItemConfig.ports = []
        if (res.data.spec.type !== 'ExternalName') {
          res.data.spec.ports.forEach((item, index) => {
            this.formItemConfig.ports.push({
              'name': item.name,
              'protocol': item.protocol,
              'port': item.port,
              'targetPort': item.targetPort,
              'nodePort': this.option === 'copy' ? null : item.nodePort
            })
          })
        } else {
          this.formItemConfig.domain = res.data.spec.externalName
        }
      })
    }
  }
}
</script>

<template>
  <div>
    <information info="服务入口：通过 ServiceEntry，可以在Istio的内部服务注册表中添加其他条目，以便网格中自动发现的服务可以访问或者路由到这些手动指定的服务。"></information>
    <Card shadow>
      <SearchTable :data="tableData" :columns="columns">
        <ButtonGroup>
          <Button v-if="hasPerm('add_se')" @click="createBtnClick('CREATE')" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
          <Button v-if="hasPerm('a_add_se')" @click="advancedCreateBtnClick('CREATE')" style="margin-right: 3px" type="success" ghost>{{ this.$t('advanced_Add') }}</Button>
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
          <Step title="入口配置"></Step>
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
        <!-- hosts -->
        <div v-for="(item, index) in formItemConfig.hosts" :key="'hosts' + index" :value="item">
          <FormItem :label="index === 0 ? '服务域名': ''" class="ivu-form-item ivu-form-item-required" >
             <Row type="flex" justify="space-between">
                <Col span="21">
                  <FormItem
                    :prop="'hosts.' + index + '.key'"
                    :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                    <Input v-model="item.key" placeholder="名称">
                    </Input>
                  </FormItem>
                </Col>
               <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('hosts',index)"  :disabled= "formItemConfig.hosts.length === 1" icon="md-trash">
                </Button>
              </Col>
               <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" long @click="handleAdd('hosts')" icon="md-add"></Button>
              </Col>
             </Row>
          </FormItem>
        </div>
        <!-- addresses -->
        <div v-for="(item, index) in formItemConfig.addresses" :key="'addresses' + index" :value="item">
          <FormItem :label="index === 0 ? 'IP地址': ''">
             <Row type="flex" justify="space-between">
                <Col span="21">
                  <FormItem>
                    <Input v-model="item.key" placeholder="名称">
                    </Input>
                  </FormItem>
                </Col>
               <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('addresses',index)"  :disabled= "formItemConfig.addresses.length === 1" icon="md-trash">
                </Button>
              </Col>
               <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" long @click="handleAdd('addresses')" icon="md-add"></Button>
              </Col>
             </Row>
          </FormItem>
        </div>
        <!-- 端口 -->
        <div v-for="(item, index) in formItemConfig.ports" :key="'ports' + index" :value="item">
          <FormItem :label="index === 0 ? '端口': ''" class="ivu-form-item ivu-form-item-required" >
            <Row type="flex" justify="space-between">
              <Col span="13">
                <FormItem
                 :prop="'ports.' + index + '.name'"
                 :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                  <Input v-model="item.name" placeholder="名称">
                  </Input>
                </FormItem>
              </Col>
              <Col span="4">
                <FormItem>
                  <Select v-model="item.protocol" placeholder="协议">
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
              <Col span="4">
                <FormItem
                  :prop="'ports.' + index + '.number'"
                  :rules="[{required: true, message: '该项不能为空', trigger: 'blur'},
                  {required: true, message: '必须是数字', pattern:/^\+?[1-9][0-9]*$/, trigger: 'blur'}]">
                  <Input v-model="item.number">
                    <span slot="prepend">端口</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('port',index)"
                        :disabled="formItemConfig.ports.length === 1" icon="md-trash">
                </Button>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" long @click="handleAdd('port')" icon="md-add"></Button>
              </Col>
            </Row>
          </FormItem>
        </div>
        <!-- location -->
        <FormItem label="作用域">
          <Row type="flex" justify="space-between">
            <Col span="24">
              <FormItem>
                <Select v-model="formItemConfig.location">
                  <Option value="MESH_EXTERNAL">网格外部</Option>
                  <Option value="MESH_INTERNAL">网格内部</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <!-- resolution -->
        <FormItem label="发现模式">
          <Row type="flex" justify="space-between">
            <Col span="24">
              <FormItem>
                <Select v-model="formItemConfig.resolution">
                  <Option value="NONE">NONE</Option>
                  <Option value="STATIC">STATIC</Option>
                  <Option value="DNS">DNS</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <!-- endpoints -->
        <div v-for="(item, index) in formItemConfig.endpoints" :key="'endpoints' + index" :value="item">
          <hr style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px;margin-left: 70px" v-if="index !== 0"/>
          <FormItem :label="index === 0 ? '端点': ''">
            <Row type="flex" justify="space-between">
              <Col span="7">
                <FormItem>
                  <Input v-model="item.address" placeholder="地址">
                    <span slot="prepend">地址</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem>
                  <Input v-model="item.network" placeholder="网络">
                    <span slot="prepend">网络</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem>
                  <Input v-model="item.locality" placeholder="位置">
                    <span slot="prepend">位置</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="3">
                <FormItem>
                  <Input v-model="item.weight" placeholder="权重">
                    <span slot="prepend">权重</span>
                  </Input>
                </FormItem>
              </Col>
              <Col span="1" offset="0" style="margin-right: 0px">
                <Button type="dashed" @click="handleRemove('endpoints',index)"
                        :disabled="formItemConfig.endpoints.length === 1" icon="md-trash">
                </Button>
              </Col>
            </Row>
          </FormItem>
          <!-- ports -->
          <div style="margin-left: 40px" v-for="(v, i) in item.ports" :key="'ports' + i" :value="i">
            <FormItem :label="i === 0 ? '端口': ''">
              <Row type="flex" justify="space-between">
                <Col span="10">
                  <FormItem>
                    <Input v-model="v.key">
                      <span slot="prepend">键</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="11">
                  <FormItem>
                    <Input v-model="v.val">
                      <span slot="prepend">值</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('ports',index, i)"
                          :disabled="formItemConfig.endpoints[index].ports.length === 1" icon="md-trash">
                  </Button>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" long @click="handleAdd('ports', index)" icon="md-add"></Button>
                </Col>
              </Row>
            </FormItem>
          </div>
          <!-- labels -->
          <div style="margin-left: 40px" v-for="(v, i) in item.labels" :key="'labels' + i" :value="i">
            <FormItem :label="i === 0 ? '标签': ''">
              <Row type="flex" justify="space-between">
                <Col span="10">
                  <FormItem>
                    <Input v-model="v.key">
                      <span slot="prepend">键</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="11">
                  <FormItem>
                    <Input v-model="v.val">
                      <span slot="prepend">值</span>
                    </Input>
                  </FormItem>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" @click="handleRemove('labels',index, i)"
                          :disabled="formItemConfig.endpoints[index].labels.length === 1" icon="md-trash">
                  </Button>
                </Col>
                <Col span="1" offset="0" style="margin-right: 0px">
                  <Button type="dashed" long @click="handleAdd('labels', index)" icon="md-add"></Button>
                </Col>
              </Row>
            </FormItem>
          </div>
        </div>
        <FormItem>
          <Row>
            <Button type="dashed" long @click="handleAdd('endpoints')" icon="md-add"></Button>
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
  Get,
  List,
  Create,
  Delete,
  Update,
  formCreate
} from '@/api/istio/serviceentry.js'
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
      se: '',
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
        hosts: [{
          key: ''
        }],
        addresses: [{
          key: ''
        }],
        ports: [{
          number: '',
          protocol: 'HTTP',
          name: ''
        }],
        location: '',
        resolution: '',
        endpoints: [{
          address: '',
          ports: [{
            'key': '',
            'val': ''
          }],
          labels: [{
            'key': '',
            'val': ''
          }],
          network: '',
          locality: '',
          weight: ''
        }]
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
          key: 'name'
        //   render: (h, params) => {
        //     return h(
        //       'router-link',
        //       {
        //         props: {
        //           to: {
        //             name: 'serviceentryinfo',
        //             params: {
        //               resourceName: params.row.name
        //             }
        //           }
        //         }
        //       },
        //       params.row.name
        //     )
        //   }
        },
        {
          title: this.$t('location'),
          key: 'location'
        },
        {
          title: this.$t('resolution'),
          key: 'resolution'
        },
        {
          title: this.$t('domain'),
          key: 'hosts',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.values(params.row.hosts).map(item => {
                return h('li', item)
              })
            )
          }
        },
        {
          title: this.$t('addresses'),
          key: 'addresses',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.values(params.row.addresses).map(item => {
                return h('li', item)
              })
            )
          }
        },
        {
          title: this.$t('port'),
          key: 'ports',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.values(params.row.ports).map(item => {
                let info =
                  '名称： ' +
                  item.name +
                  '，' +
                  '端口：' +
                  item.number +
                  '，' +
                  '协议：' +
                  item.protocol
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
                    disabled: !hasPermission('edit_se')
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
                    disabled: !hasPermission('a_edit_se')
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
                    disabled: !hasPermission('del_se')
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
            hosts: item.spec.hosts || '',
            addresses: item.spec.addresses || '',
            ports: item.spec.ports || '',
            location: item.spec.location ? '网格内部' : '网格外部',
            resolution: item.spec.resolution ? item.spec.resolution : 'NONE',
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
    },
    next () {
      if (this.current === 0) {
        this.$refs['createFormItem'].validate(valid => {
          if (valid) {
            this.current += 1
          }
        })
      } else if (this.current === 1) {
        // this.current += 1
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
    handleRemove (type, index, secondIndex) {
      if (type === 'formItem') {
        this.formItem.labels.splice(index, 1)
      }
      if (type === 'hosts') {
        this.formItemConfig.hosts.splice(index, 1)
      }
      if (type === 'addresses') {
        this.formItemConfig.addresses.splice(index, 1)
      }
      if (type === 'port') {
        this.formItemConfig.ports.splice(index, 1)
      }
      if (type === 'endpoints') {
        this.formItemConfig.endpoints.splice(secondIndex, 1)
      }
      if (type === 'ports') {
        this.formItemConfig.endpoints[index].ports.splice(secondIndex, 1)
      }
      if (type === 'labels') {
        this.formItemConfig.endpoints[index].labels.splice(secondIndex, 1)
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
      if (type === 'hosts') {
        this.formItemConfig.hosts.push({
          key: ''
        })
      }
      if (type === 'addresses') {
        this.formItemConfig.addresses.push({
          key: ''
        })
      }
      if (type === 'endpoints') {
        this.formItemConfig.endpoints.push(
          {
            address: '',
            ports: [{
              'key': '',
              'val': ''
            }],
            labels: [{
              'key': '',
              'val': ''
            }],
            network: '',
            locality: '',
            weight: ''
          }
        )
      }
      if (type === 'port') {
        this.formItemConfig.ports.push({
          number: '',
          protocol: 'HTTP',
          name: ''
        })
      }
      if (type === 'ports') {
        this.formItemConfig.endpoints[index].ports.push(
          {
            'key': '',
            'val': ''
          }
        )
      }
      if (type === 'labels') {
        this.formItemConfig.endpoints[index].labels.push(
          {
            'key': '',
            'val': ''
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
    formOption (value) {
      let json = {
        'metadata': {
          'name': this.formItem.name,
          'labels': {},
          'annotations': {}
        },
        'spec': {
          'hosts': [],
          'addresses': [],
          'ports': [],
          'endpoints': []
        }
      }
      if (this.formItem.labels.length > 0) {
        this.formItem.labels.forEach((item, index) => {
          if (item.key) {
            json.metadata.labels[item.key] = item.val
          }
        })
      }
      // hosts
      if (this.formItemConfig.hosts.length > 0) {
        this.formItemConfig.hosts.forEach((item, index) => {
          if (item.key) {
            json.spec.hosts.push(item.key)
          }
        })
      }
      // addresses
      if (this.formItemConfig.addresses.length > 0) {
        this.formItemConfig.addresses.forEach((item, index) => {
          if (item.key) {
            json.spec.addresses.push(item.key)
          }
        })
      }
      // ports
      if (this.formItemConfig.ports.length > 0) {
        this.formItemConfig.ports.forEach((item, index) => {
          let port = {}
          if (item.name) {
            port['name'] = item.name
          }
          if (item.number) {
            port['number'] = item.number
          }
          if (item.protocol) {
            port['protocol'] = item.protocol
          }
          json.spec.ports.push(port)
        })
      }
      // location
      if (this.formItemConfig.location) {
        json.spec['location'] = this.formItemConfig.location
      }
      // resolution
      if (this.formItemConfig.resolution) {
        json.spec['resolution'] = this.formItemConfig.resolution
      }
      // endpoints
      if (this.formItemConfig.endpoints.length > 0) {
        this.formItemConfig.endpoints.forEach((item, index) => {
          let ports = {}
          item.ports.forEach((p, i) => {
            if (p.key) {
              ports[p.key] = p.val
            }
          })
          let labels = {}
          item.labels.forEach((p, i) => {
            if (p.key) {
              labels[p.key] = p.val
            }
          })
          let endpoints = {}
          if (item.address) {
            endpoints['address'] = item.address
          }
          if (JSON.stringify(ports) !== '{}') {
            endpoints['ports'] = ports
          }
          if (JSON.stringify(labels) !== '{}') {
            endpoints['labels'] = labels
          }
          if (item.network) {
            endpoints['network'] = item.network
          }
          if (item.locality) {
            endpoints['locality'] = item.locality
          }
          if (item.weight) {
            endpoints['weight'] = item.weight
          }
          if (JSON.stringify(endpoints) !== '{}') {
            json.spec.endpoints.push(endpoints)
          }
        })
      }
      if (json.spec.ports.length < 1) {
        delete json.spec['ports']
      }
      if (json.spec.hosts.length < 1) {
        delete json.spec['hosts']
      }
      if (json.spec.addresses.length < 1) {
        delete json.spec['addresses']
      }
      if (json.spec.endpoints.length < 1) {
        delete json.spec['endpoints']
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
        json.metadata.resourceVersion = this.se.metadata.resourceVersion
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
        hosts: [{
          key: ''
        }],
        addresses: [{
          key: ''
        }],
        ports: [{
          number: '',
          protocol: 'HTTP',
          name: ''
        }],
        location: 'MESH_INTERNAL',
        resolution: 'DNS',
        endpoints: [{
          address: '',
          ports: [{
            'key': '',
            'val': ''
          }],
          labels: [{
            'key': '',
            'val': ''
          }],
          network: '',
          locality: '',
          weight: ''
        }]
      }
    },
    formEdit () {
      this.nameDisabled = true
      Get({
        productId: 100,
        resourceName: this.resourceName
      }).then(res => {
        this.se = res.data
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
        // hosts
        this.formItemConfig.hosts = [{
          key: ''
        }]
        if (res.data.spec.hosts) {
          this.formItemConfig.hosts = []
          res.data.spec.hosts.forEach((item, index) => {
            this.formItemConfig.hosts.push({
              'key': item
            })
          })
        }
        // addresses
        this.formItemConfig.addresses = [{
          key: ''
        }]
        if (res.data.spec.addresses) {
          this.formItemConfig.addresses = []
          res.data.spec.addresses.forEach((item, index) => {
            this.formItemConfig.addresses.push({
              'key': item
            })
          })
        }
        // ports
        this.formItemConfig.ports = [{
          number: '',
          protocol: 'HTTP',
          name: ''
        }]
        if (res.data.spec.ports) {
          this.formItemConfig.ports = []
          res.data.spec.ports.forEach((item, index) => {
            this.formItemConfig.ports.push({
              number: item.number.toString(),
              protocol: item.protocol,
              name: item.name
            })
          })
        }
        // location
        this.formItemConfig.location = res.data.spec.location ? 'MESH_INTERNAL' : 'MESH_EXTERNAL'
        // resolution
        this.formItemConfig.resolution = res.data.spec.resolution ? res.data.spec.resolution : 'NONE'
        // endpoints
        this.formItemConfig.endpoints = [{
          address: '',
          ports: [{
            'key': '',
            'val': ''
          }],
          labels: [{
            'key': '',
            'val': ''
          }],
          network: '',
          locality: '',
          weight: ''
        }]
        if (res.data.spec.endpoints) {
          this.formItemConfig.endpoints = []
          res.data.spec.endpoints.forEach((item, index) => {
            let ports = [{
              'key': '',
              'val': ''
            }]
            if (item.ports) {
              ports = []
              for (const k in item.ports) {
                ports.push({
                  'key': k,
                  'val': item.ports[k]
                })
              }
            }
            let labels = [{
              'key': '',
              'val': ''
            }]
            if (item.labels) {
              labels = []
              for (const k in item.labels) {
                labels.push({
                  'key': k,
                  'val': item.labels[k]
                })
              }
            }
            this.formItemConfig.endpoints.push({
              address: item.address,
              ports: ports,
              labels: labels,
              network: item.network,
              locality: item.locality,
              weight: item.weight
            })
          })
        }
      })
    }
  }
}
</script>

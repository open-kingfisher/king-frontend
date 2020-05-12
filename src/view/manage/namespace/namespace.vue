<template>
  <div>
    <information info="命名空间：对应Kubernetes的Namespace，日常操作都是在对应的命名空间上进行的；可以接管已有的Namespace，也可通过此平台进行命名空间的创建。"></information>
    <Card shadow>
      <SearchTable :columns="columns" :data="data">
        <ButtonGroup>
            <Button v-if="hasPerm('add_namespace')" @click="createBtnClick('CREATE')" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
            <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
        </ButtonGroup>
      </SearchTable>
    </Card>
    <Modal v-model="deleteModel" width="360">
      <p slot="header" title="删除">
        <span>{{this.$t('delete')}}</span>
      </p>
      <div style="text-align:center">
        <p style="line-height: 25px; color: #f60; font-size: 12px; font-weight: bold">危险操作！！！删除后此命名空间下所有资源都将删除</p>
        <p style="line-height: 25px; font-size: 12px; margin-bottom: 10px">输入你要删除的命名空间名称 <strong style="color:#f60;text-align:center">{{deleteNamespace}}</strong></p>
        <Form ref="deleteForm" :model="deleteFormItem" :label-width="0" :rules="deleteRuleValidate">
          <FormItem prop="delete_namespace">
             <Input v-model="deleteFormItem.delete_namespace"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
          <Button type="error" long :loading="deleteLoading" size="large" @click="del">{{this.$t('delete')}}</Button>
      </div>
    </Modal>
    <Modal v-model="formAddModel" :title="optionTitle" width="900">
      <div style="width: 800px;margin-bottom: 15px;margin-left: 30px">
        <Steps :current="current">
          <Step title="基本信息"></Step>
          <Step title="资源限制"></Step>
          <Step title="资源配额"></Step>
          <Step title="注解"></Step>
        </Steps>
      </div>
      <hr style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px" />
      <Form ref="createFormItem" v-show="current === 0" :model="formItem" :label-width="55" :rules="ruleValidate">
        <FormItem :label="this.$t('cluster')" prop="cluster">
          <Select v-model="formItem.cluster" :disabled="nameDisabled">
            <Option v-for="item in clustersData" :value="item.id" :key="item.id" >{{ item.name }}</Option>
          </Select>
        </FormItem>
        <FormItem :label="this.$t('name')" prop="name" class="ivu-form-item ivu-form-item-required">
          <Input v-model="formItem.name" :disabled="nameDisabled"></Input>
        </FormItem>
        <FormItem label="已存在">
          <i-switch  v-model="formItem.exist" :true-value="1" :false-value="0" :disabled="nameDisabled">
            <span slot="open">是</span>
            <span slot="close">否</span>
          </i-switch>
          <Icon type="md-information-circle" size="15" style="margin-left: 20px; margin-top: 7px"/>
          <span style="vertical-align: middle">
            如果命名空间已经存在请选是，否则选择否，将自动创建命名空间
          </span>
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
      <Form ref="createFormConfig" v-show="current === 1" :model="formItemConfig" :label-width="100" :rules="configvalidate">
        <!--资源配额-->
        <FormItem label="资源限制">
          <i-switch size="large" v-model="formItemConfig.limitDisplay" :true-value=1 :false-value=0>
            <span slot="open">开启</span>
            <span slot="close">关闭</span>
          </i-switch>
        </FormItem>
        <!--CPU配额-->
        <FormItem label="CPU" v-if="formItemConfig.limitDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="5">
              <FormItem prop="limits.min.cpu">
                <Input v-model="formItemConfig.limits.min.cpu">
                  <span slot="prepend">最小</span>
                  <Select v-model="formItemConfig.limits.min.cpuUnit" slot="append"
                          style="width: 70px">
                    <Option value="m">m</Option>
                    <Option value="core">core</Option>
                  </Select>
                </Input>
              </FormItem>
            </Col>
            <Col span="6">
               <FormItem prop="limits.max.cpu">
                <Input v-model="formItemConfig.limits.max.cpu">
                  <span slot="prepend">最大</span>
                  <Select v-model="formItemConfig.limits.max.cpuUnit" slot="append"
                          style="width: 70px">
                    <Option value="m">m</Option>
                    <Option value="core">core</Option>
                  </Select>
                </Input>
              </FormItem>
            </Col>
            <Col span="6">
               <FormItem prop="limits.default.cpu">
                <Input v-model="formItemConfig.limits.default.cpu">
                  <span slot="prepend">默认</span>
                  <Select v-model="formItemConfig.limits.default.cpuUnit" slot="append"
                          style="width: 70px">
                    <Option value="m">m</Option>
                    <Option value="core">core</Option>
                  </Select>
                </Input>
              </FormItem>
            </Col>
            <Col span="6">
               <FormItem prop="limits.defaultRequest.cpu">
                <Input v-model="formItemConfig.limits.defaultRequest.cpu">
                  <span slot="prepend">默认要求</span>
                  <Select v-model="formItemConfig.limits.defaultRequest.cpuUnit" slot="append"
                          style="width: 70px">
                    <Option value="m">m</Option>
                    <Option value="core">core</Option>
                  </Select>
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <!--内存配额-->
        <FormItem label="内存" v-if="formItemConfig.limitDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="5">
              <FormItem prop="limits.min.memory">
                <Input v-model="formItemConfig.limits.min.memory">
                  <span slot="prepend">最小</span>
                  <Select v-model="formItemConfig.limits.min.memoryUnit" slot="append"
                          style="width: 70px">
                    <Option value="Ki">Ki</Option>
                    <Option value="Mi">Mi</Option>
                    <Option value="Gi">Gi</Option>
                    <Option value="Ti">Ti</Option>
                  </Select>
                </Input>
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem prop="limits.max.memory">
                <Input v-model="formItemConfig.limits.max.memory">
                  <span slot="prepend">最大</span>
                  <Select v-model="formItemConfig.limits.max.memoryUnit" slot="append"
                          style="width: 70px">
                    <Option value="Ki">Ki</Option>
                    <Option value="Mi">Mi</Option>
                    <Option value="Gi">Gi</Option>
                    <Option value="Ti">Ti</Option>
                  </Select>
                </Input>
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem prop="limits.default.memory">
                <Input v-model="formItemConfig.limits.default.memory">
                  <span slot="prepend">默认</span>
                  <Select v-model="formItemConfig.limits.default.memoryUnit" slot="append"
                          style="width: 70px">
                    <Option value="Ki">Ki</Option>
                    <Option value="Mi">Mi</Option>
                    <Option value="Gi">Gi</Option>
                    <Option value="Ti">Ti</Option>
                  </Select>
                </Input>
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem prop="limits.defaultRequest.memory">
                <Input v-model="formItemConfig.limits.defaultRequest.memory">
                  <span slot="prepend">默认要求</span>
                  <Select v-model="formItemConfig.limits.defaultRequest.memoryUnit" slot="append"
                          style="width: 70px">
                    <Option value="Ki">Ki</Option>
                    <Option value="Mi">Mi</Option>
                    <Option value="Gi">Gi</Option>
                    <Option value="Ti">Ti</Option>
                  </Select>
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <!--卷配额-->
<!--        <FormItem label="存储" v-if="formItemConfig.limitDisplay === 1">-->
<!--          <Row type="flex" justify="space-between">-->
<!--            <Col span="5">-->
<!--              <FormItem>-->
<!--                <Input v-model="formItemConfig.limits.min.storage">-->
<!--                  <span slot="prepend">最小</span>-->
<!--                  <Select v-model="formItemConfig.limits.min.storageUnit" slot="append"-->
<!--                          style="width: 70px">-->
<!--                    <Option value="Ki">Ki</Option>-->
<!--                    <Option value="Mi">Mi</Option>-->
<!--                    <Option value="Gi">Gi</Option>-->
<!--                    <Option value="Ti">Ti</Option>-->
<!--                  </Select>-->
<!--                </Input>-->
<!--              </FormItem>-->
<!--            </Col>-->
<!--            <Col span="6">-->
<!--              <FormItem>-->
<!--                <Input v-model="formItemConfig.limits.max.storage">-->
<!--                  <span slot="prepend">最大</span>-->
<!--                  <Select v-model="formItemConfig.limits.max.storageUnit" slot="append"-->
<!--                          style="width: 70px">-->
<!--                    <Option value="Ki">Ki</Option>-->
<!--                    <Option value="Mi">Mi</Option>-->
<!--                    <Option value="Gi">Gi</Option>-->
<!--                    <Option value="Ti">Ti</Option>-->
<!--                  </Select>-->
<!--                </Input>-->
<!--              </FormItem>-->
<!--            </Col>-->
<!--            <Col span="6">-->
<!--              <FormItem>-->
<!--                <Input v-model="formItemConfig.limits.default.storage">-->
<!--                  <span slot="prepend">默认</span>-->
<!--                  <Select v-model="formItemConfig.limits.default.storageUnit" slot="append"-->
<!--                          style="width: 70px">-->
<!--                    <Option value="Ki">Ki</Option>-->
<!--                    <Option value="Mi">Mi</Option>-->
<!--                    <Option value="Gi">Gi</Option>-->
<!--                    <Option value="Ti">Ti</Option>-->
<!--                  </Select>-->
<!--                </Input>-->
<!--              </FormItem>-->
<!--            </Col>-->
<!--            <Col span="6">-->
<!--              <FormItem>-->
<!--                <Input v-model="formItemConfig.limits.defaultRequest.storage">-->
<!--                  <span slot="prepend">默认要求</span>-->
<!--                  <Select v-model="formItemConfig.limits.defaultRequest.storageUnit" slot="append"-->
<!--                          style="width: 70px">-->
<!--                    <Option value="Ki">Ki</Option>-->
<!--                    <Option value="Mi">Mi</Option>-->
<!--                    <Option value="Gi">Gi</Option>-->
<!--                    <Option value="Ti">Ti</Option>-->
<!--                  </Select>-->
<!--                </Input>-->
<!--              </FormItem>-->
<!--            </Col>-->
<!--          </Row>-->
<!--        </FormItem>-->
      </Form>
      <Form ref="createFormQuota" v-show="current === 2" :model="formItemQuota" :label-width="100" :rules="validate">
        <!--资源配额-->
        <FormItem label="资源配额">
          <i-switch size="large" v-model="formItemQuota.quotaDisplay" :true-value=1 :false-value=0>
            <span slot="open">开启</span>
            <span slot="close">关闭</span>
          </i-switch>
        </FormItem>
        <FormItem label="配置字典数量" v-if="formItemQuota.quotaDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="24">
              <FormItem prop="configmaps">
                <Input v-model="formItemQuota.configmaps">
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="PVC数量" v-if="formItemQuota.quotaDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="24">
              <FormItem prop="persistentvolumeclaims">
                <Input v-model="formItemQuota.persistentvolumeclaims">
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="容器组数量" v-if="formItemQuota.quotaDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="24">
              <FormItem prop="pods">
                <Input v-model="formItemQuota.pods">
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="副本控制器数量" v-if="formItemQuota.quotaDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="24">
              <FormItem prop="replicationcontrollers">
                <Input v-model="formItemQuota.replicationcontrollers">
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
<!--        <FormItem label="资源配额数量" v-if="formItemQuota.quotaDisplay === 1">-->
<!--          <Row type="flex" justify="space-between">-->
<!--            <Col span="24">-->
<!--              <FormItem>-->
<!--                <Input v-model="formItemQuota.hard.resourcequotas">-->
<!--                </Input>-->
<!--              </FormItem>-->
<!--            </Col>-->
<!--          </Row>-->
<!--        </FormItem>-->
        <FormItem label="服务数量" v-if="formItemQuota.quotaDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="24">
              <FormItem prop="services">
                <Input v-model="formItemQuota.services">
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="负载均衡数量" v-if="formItemQuota.quotaDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="24">
              <FormItem prop="loadbalancers">
                <Input v-model="formItemQuota.loadbalancers">
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="NodePort数量" v-if="formItemQuota.quotaDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="24">
              <FormItem prop="nodeports">
                <Input v-model="formItemQuota.nodeports">
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="保密字典数量" v-if="formItemQuota.quotaDisplay === 1">
          <Row type="flex" justify="space-between">
            <Col span="24">
              <FormItem prop="secrets">
                <Input v-model="formItemQuota.secrets">
                </Input>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
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
import SearchTable from '../../other-page/search-table.vue'
import {
  getAllNamespace,
  getAllCluster,
  delOneNamespace,
  createNamespace,
  getOneNamespace,
  getOneLimitRange,
  getOneQuota,
  updateNamespace,
  formCreateLimitRange,
  formCreateQuota,
  updateLimitRange,
  updateQuota,
  delLimitRange,
  delQuota
} from '../../../api/manage'
import { forEach } from '../../../libs/tools'
import { formatTimestamp } from '../../../api/tools'
import Information from '../../other-page/information.vue'
import { hasPermission } from '@/router/permission'

export default {
  components: {
    SearchTable,
    Information
  },
  mounted () {
    this.$store.commit('setClusterSelect', true)
    this.formatTableData()
  },
  data () {
    const validateDelete = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('not_null')))
      } else {
        if (this.deleteNamespace !== value) {
          callback(new Error('填写的命名空间名称与所选的命名空间名称不匹配'))
        }
        callback()
      }
    }
    const validateName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('not_null')))
      } else {
        if (this.nameExistCheck) {
          this.data.forEach((item, index) => {
            if (item.name === value && item.cluster_id === this.formItem.cluster) {
              callback(new Error(this.$t('name_exists')))
            }
          })
        }
        callback()
      }
    }
    const validateNumber = (rule, value, callback) => {
      if (!value) {
        callback()
      } else {
        let reg = /^[0-9]*$/
        if (!reg.test(value)) {
          callback(new Error(this.$t('number')))
        }
        callback()
      }
    }
    const validateNumberAndSize = (rule, value, callback) => {
      if (!value) {
        callback()
      } else {
        let reg = /^[0-9]*$/
        if (!reg.test(value)) {
          callback(new Error(this.$t('number')))
        } else {
          if (rule.field === 'limits.max.cpu' || rule.field === 'limits.default.cpu' || rule.field === 'limits.defaultRequest.cpu') {
            if (rule.field === 'limits.max.cpu' && this.formItemConfig.limits.max.cpuUnit === 'core') {
              value = value * 1000
            }
            if (rule.field === 'limits.default.cpu' && this.formItemConfig.limits.default.cpuUnit === 'core') {
              value = value * 1000
            }
            if (rule.field === 'limits.defaultRequest.cpu' && this.formItemConfig.limits.defaultRequest.cpuUnit === 'core') {
              value = value * 1000
            }
            let cpu = parseInt(this.formItemConfig.limits.min.cpu)
            if (this.formItemConfig.limits.min.cpuUnit === 'core') {
              cpu = cpu * 1000
            }
            if (value < cpu) {
              callback(new Error('不能小于最小CPU限制'))
            }
          }
          if (rule.field === 'limits.default.cpu' || rule.field === 'limits.defaultRequest.cpu') {
            let cpu = parseInt(this.formItemConfig.limits.max.cpu)
            if (this.formItemConfig.limits.max.cpuUnit === 'core') {
              cpu = cpu * 1000
            }
            if (value > cpu) {
              callback(new Error('不能大于最大CPU限制'))
            }
          }
          if (rule.field === 'limits.defaultRequest.cpu') {
            let cpu = parseInt(this.formItemConfig.limits.default.cpu)
            if (this.formItemConfig.limits.default.cpuUnit === 'core') {
              cpu = cpu * 1000
            }
            if (value > cpu) {
              callback(new Error('不能大于默认CPU限制'))
            }
          }
          // memory
          if (rule.field === 'limits.max.memory' || rule.field === 'limits.default.memory' || rule.field === 'limits.defaultRequest.memory') {
            if (rule.field === 'limits.max.memory') {
              value = this.formItemConfig.limits.max.memoryUnit === 'Mi' ? value * 1024 : value
              value = this.formItemConfig.limits.max.memoryUnit === 'Gi' ? value * 1024 * 1024 : value
              value = this.formItemConfig.limits.max.memoryUnit === 'Ti' ? value * 1024 * 1024 * 1024 : value
            }
            if (rule.field === 'limits.default.memory') {
              value = this.formItemConfig.limits.default.memoryUnit === 'Mi' ? value * 1024 : value
              value = this.formItemConfig.limits.default.memoryUnit === 'Gi' ? value * 1024 * 1024 : value
              value = this.formItemConfig.limits.default.memoryUnit === 'Ti' ? value * 1024 * 1024 * 1024 : value
            }
            if (rule.field === 'limits.defaultRequest.memory') {
              value = this.formItemConfig.limits.defaultRequest.memoryUnit === 'Mi' ? value * 1024 : value
              value = this.formItemConfig.limits.defaultRequest.memoryUnit === 'Gi' ? value * 1024 * 1024 : value
              value = this.formItemConfig.limits.defaultRequest.memoryUnit === 'Ti' ? value * 1024 * 1024 * 1024 : value
            }
            let memory = parseInt(this.formItemConfig.limits.min.memory)
            memory = this.formItemConfig.limits.min.memoryUnit === 'Mi' ? memory * 1024 : memory
            memory = this.formItemConfig.limits.min.memoryUnit === 'Gi' ? memory * 1024 * 1024 : memory
            memory = this.formItemConfig.limits.min.memoryUnit === 'Ti' ? memory * 1024 * 1024 * 1024 : memory
            if (value < memory) {
              callback(new Error('不能小于最小内存限制'))
            }
          }
          if (rule.field === 'limits.default.memory' || rule.field === 'limits.defaultRequest.memory') {
            let memory = parseInt(this.formItemConfig.limits.max.memory)
            memory = this.formItemConfig.limits.max.memoryUnit === 'Mi' ? memory * 1024 : memory
            memory = this.formItemConfig.limits.max.memoryUnit === 'Gi' ? memory * 1024 * 1024 : memory
            memory = this.formItemConfig.limits.max.memoryUnit === 'Ti' ? memory * 1024 * 1024 * 1024 : memory
            if (value > memory) {
              callback(new Error('不能大于最大内存限制'))
            }
          }
          if (rule.field === 'limits.defaultRequest.memory') {
            let memory = parseInt(this.formItemConfig.limits.default.memory)
            memory = this.formItemConfig.limits.default.memoryUnit === 'Mi' ? memory * 1024 : memory
            memory = this.formItemConfig.limits.default.memoryUnit === 'Gi' ? memory * 1024 * 1024 : memory
            memory = this.formItemConfig.limits.default.memoryUnit === 'Ti' ? memory * 1024 * 1024 * 1024 : memory
            if (value > memory) {
              callback(new Error('不能大于默认内存限制'))
            }
          }
        }
        callback()
      }
    }
    return {
      // From Add Model
      nameExistCheck: false,
      name: '',
      cluster_id: '',
      nameDisabled: false,
      formAddModel: false,
      optionTitle: '',
      option: '',
      current: 0,
      formItem: {
        name: '',
        cluster: '',
        exist: 0,
        labels: [
          {
            val: '',
            key: ''
          }
        ]
      },
      formItemConfig: {
        limitDisplay: 0,
        limits: {
          max: {
            memory: '',
            cpu: '',
            storage: '',
            cpuUnit: 'core',
            memoryUnit: 'Gi',
            storageUnit: 'Gi'
          },
          min: {
            memory: '',
            cpu: '',
            storage: '',
            cpuUnit: 'core',
            memoryUnit: 'Gi',
            storageUnit: 'Gi'
          },
          default: {
            memory: '',
            cpu: '',
            storage: '',
            cpuUnit: 'core',
            memoryUnit: 'Gi',
            storageUnit: 'Gi'
          },
          defaultRequest: {
            memory: '',
            cpu: '',
            storage: '',
            cpuUnit: 'core',
            memoryUnit: 'Gi',
            storageUnit: 'Gi'
          },
          type: ''
        }
      },
      formItemQuota: {
        quotaDisplay: 0,
        configmaps: '',
        persistentvolumeclaims: '',
        pods: '',
        replicationcontrollers: '',
        resourcequotas: '',
        loadbalancers: '',
        nodeports: '',
        services: '',
        secrets: ''
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
        ],
        cluster: [
          {
            required: true,
            message: this.$t('not_null'),
            trigger: 'change'
          }
        ]
      },
      configvalidate: {
        'limits.max.cpu': [
          { validator: validateNumberAndSize, trigger: 'blur' }
        ],
        'limits.max.memory': [
          { validator: validateNumberAndSize, trigger: 'blur' }
        ],
        'limits.max.storage': [
          { validator: validateNumberAndSize, trigger: 'blur' }
        ],
        'limits.min.cpu': [
          { validator: validateNumberAndSize, trigger: 'blur' }
        ],
        'limits.min.memory': [
          { validator: validateNumberAndSize, trigger: 'blur' }
        ],
        'limits.min.storage': [
          { validator: validateNumberAndSize, trigger: 'blur' }
        ],
        'limits.default.cpu': [
          { validator: validateNumberAndSize, trigger: 'blur' }
        ],
        'limits.default.memory': [
          { validator: validateNumberAndSize, trigger: 'blur' }
        ],
        'limits.default.storage': [
          { validator: validateNumberAndSize, trigger: 'blur' }
        ],
        'limits.defaultRequest.cpu': [
          { validator: validateNumberAndSize, trigger: 'blur' }
        ],
        'limits.defaultRequest.memory': [
          { validator: validateNumberAndSize, trigger: 'blur' }
        ],
        'limits.defaultRequest.storage': [
          { validator: validateNumberAndSize, trigger: 'blur' }
        ]
      },
      validate: {
        configmaps: [
          { validator: validateNumber, trigger: 'blur' }
        ],
        persistentvolumeclaims: [
          { validator: validateNumber, trigger: 'blur' }
        ],
        pods: [
          { validator: validateNumber, trigger: 'blur' }
        ],
        replicationcontrollers: [
          { validator: validateNumber, trigger: 'blur' }
        ],
        resourcequotas: [
          { validator: validateNumber, trigger: 'blur' }
        ],
        loadbalancers: [
          { validator: validateNumber, trigger: 'blur' }
        ],
        nodeports: [
          { validator: validateNumber, trigger: 'blur' }
        ],
        services: [
          { validator: validateNumber, trigger: 'blur' }
        ],
        secrets: [
          { validator: validateNumber, trigger: 'blur' }
        ]
      },
      deleteLoading: false,
      deleteClusterId: '',
      deleteNamespace: '',
      deleteModel: false,
      deleteFormItem: {
        delete_namespace: ''
      },
      deleteRuleValidate: {
        delete_namespace: { validator: validateDelete, trigger: 'blur' }
      },
      clustersData: [],
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
          title: this.$t('label'),
          key: 'selector',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.keys(params.row.labels).map(item => {
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
                  item + ' | ' + params.row.labels[item]
                )
              })
            )
          }
        },
        // {
        //   title: this.$t('id'),
        //   key: 'id'
        // },
        {
          title: this.$t('cluster'),
          key: 'cluster'
        },
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
          title: this.$t('option'),
          key: 'action',
          width: 140,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: !hasPermission('edit_namespace')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.$refs['createFormItem'].resetFields()
                      this.current = 0
                      this.optionTitle = this.$t('edit') + ' ' + params.row.name
                      this.option = 'edit'
                      this.formAddModel = true
                      this.nameExistCheck = false
                      this.name = params.row.name
                      this.cluster_id = params.row.cluster_id
                      this.nameDisabled = true
                      this.formItem.exist = 1
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
                    type: 'error',
                    size: 'small',
                    disabled: !hasPermission('del_namespace')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.deleteModel = true
                      this.deleteLoading = false
                      this.$refs['deleteForm'].resetFields()
                      this.deleteNamespace = params.row.name
                      this.deleteFormItem.delete_namespace = ''
                      this.deleteClusterId = params.row.cluster_id
                    }
                  }
                },
                this.$t('delete')
              )
            ])
          }
        }
      ],
      data: []
    }
  },
  methods: {
    del () {
      this.$refs['deleteForm'].validate(valid => {
        if (valid) {
          let data = {
            namespaceName: this.deleteFormItem.delete_namespace,
            clusterId: this.deleteClusterId
          }
          this.deleteLoading = true
          delOneNamespace(data).then(x => {
            if (x.code === 200) {
              this.$Message.success({
                content: this.$t('action_success')
              })
              this.formatTableData()
              this.deleteLoading = false
              this.$store.dispatch('flushSelectObj')
            } else {
              this.deleteLoading = false
              this.$Message.error('操作失败')
            }
          })
          this.deleteModel = false
        }
      })
    },
    confirm () {
      this.$refs['createFormItem'].validate(valid => {
        if (valid) {
          if (this.modalMode === 'CREATE') {
            let params = {
              clusterId: this.formItem.cluster,
              namespaceName: this.formItem.name,
              exist: this.exist
            }
            createNamespace(params).then(res => {
              if (res.code === 200) {
                this.$Message.success({
                  content: this.$t('action_success')
                })
                this.createModalMsg(2)
                this.$store.dispatch('flushSelectObj')
              } else {
                this.$Message.error('操作失败')
              }
            })
          }
          if (this.modalMode === 'UPDATE') {
            this.$Message.error('修改功能暂不开放')
          }
        }
      })
    },
    cancel () {
      this.modalShow = false
    },
    createBtnClick (mode) {
      this.$refs['createFormItem'].resetFields()
      this.handleReset()
      this.nameExistCheck = true
      this.name = ''
      this.current = 0
      this.formAddModel = true
      this.modalMode = mode
      this.option = 'add'
      this.optionTitle = this.$t('add')
      this.nameDisabled = false
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
    formatTableData () {
      let params = {
        productId: 100
      }
      getAllCluster(params).then(res => {
        let data = []
        forEach(res.data, (item, index) => {
          data.push({
            name: item.name,
            id: item.id,
            describe: item.describe,
            token: item.token
          })
        })
        this.clustersData = data
        this.clustersData.map(item => {
          let params = {
            productId: 100,
            clusterId: item.id
          }
          this.data = []
          getAllNamespace(params).then(res => {
            forEach(res.data, (item, index) => {
              this.data.push({
                id: item.id,
                name: item.name,
                labels: item.labels || {},
                annotations: item.annotations || {},
                namespace_id: item.id,
                cluster: item.cluster.name,
                cluster_id: item.cluster.id,
                modifyTime: formatTimestamp(item.modifyTime) || '',
                create_time: formatTimestamp(item.createTime) || ''
              })
            })
          })
        })
      })
    },
    refresh () {
      this.formatTableData()
      this.$Message.success(this.$t('refresh_success'))
    },
    next () {
      if (this.current === 0) {
        this.$refs['createFormItem'].validate(valid => {
          if (valid) {
            this.current += 1
          }
        })
      } else if (this.current === 1) {
        if (this.formItemConfig.limitDisplay === 0) {
          this.current += 1
        } else {
          this.$refs['createFormConfig'].validate(valid => {
            if (valid) {
              this.current += 1
            }
          })
        }
      } else if (this.current === 2) {
        if (this.formItemQuota.quotaDisplay === 0) {
          this.current += 1
        } else {
          this.$refs['createFormQuota'].validate(valid => {
            if (valid) {
              this.current += 1
            }
          })
        }
      } else {
        this.current += 1
      }
    },
    previous () {
      this.current -= 1
    },
    handleRemove (type, index, indexPath) {
      if (type === 'formItem') {
        this.formItem.labels.splice(index, 1)
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
        'apiVersion': 'v1',
        'kind': 'Namespace',
        'metadata': {
          'name': this.formItem.name,
          'labels': {},
          'annotations': {}
        }
      }
      if (this.formItem.labels.length > 0) {
        this.formItem.labels.forEach((item, index) => {
          if (item.key) {
            json.metadata.labels[item.key] = item.val
          }
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
        createNamespace({
          productId: 100,
          clusterId: this.formItem.cluster,
          namespaceName: this.formItem.name,
          exist: this.formItem.exist,
          yaml: JSON.stringify(json)
        }).then(res => {
          if (res.code === 200 && res.msg === '') {
            this.$Message.success({
              content: this.$t('create_success')
            })
            this.limitRange(value)
            this.quota(value)
            this.formAddModel = false
            this.$store.dispatch('flushSelectObj')
          } else {
            this.$Message.error({
              content: this.$t('create_failure')
            })
          }
          this.formatTableData()
        })
      } else if (value === 'EDIT') {
        updateNamespace({
          productId: 100,
          clusterId: this.formItem.cluster,
          updateJson: JSON.stringify(json)
        }).then(res => {
          if (res.code === 200 && res.msg === '') {
            this.$Message.success({
              content: this.$t('edit_success')
            })
            this.limitRange(value)
            this.quota(value)
            this.formAddModel = false
            this.$store.dispatch('flushSelectObj')
          } else {
            this.$Message.error({
              content: this.$t('edit_failure')
            })
          }
          this.formatTableData()
        })
      }
    },
    limitRange (value) {
      let json = {
        'metadata': {
          'name': this.formItem.name
        },
        'spec': {
          'limits': [{
            'type': 'Container'
          }]
        }
      }
      if (this.formItemConfig.limitDisplay === 1) {
        if (this.formItemConfig.limits.max) {
          json.spec.limits[0].max = {}
          if (this.formItemConfig.limits.max.cpu) {
            json.spec.limits[0].max.cpu = this.formItemConfig.limits.max.cpu + (this.formItemConfig.limits.max.cpuUnit !== 'core' ? this.formItemConfig.limits.max.cpuUnit : '')
          }
          if (this.formItemConfig.limits.max.memory) {
            json.spec.limits[0].max.memory = this.formItemConfig.limits.max.memory + this.formItemConfig.limits.max.memoryUnit
          }
        }
        if (this.formItemConfig.limits.min) {
          json.spec.limits[0].min = {}
          if (this.formItemConfig.limits.min.cpu) {
            json.spec.limits[0].min.cpu = this.formItemConfig.limits.min.cpu + (this.formItemConfig.limits.min.cpuUnit !== 'core' ? this.formItemConfig.limits.min.cpuUnit : '')
          }
          if (this.formItemConfig.limits.min.memory) {
            json.spec.limits[0].min.memory = this.formItemConfig.limits.min.memory + this.formItemConfig.limits.min.memoryUnit
          }
        }
        if (this.formItemConfig.limits.default) {
          json.spec.limits[0].default = {}
          if (this.formItemConfig.limits.default.cpu) {
            json.spec.limits[0].default.cpu = this.formItemConfig.limits.default.cpu + (this.formItemConfig.limits.default.cpuUnit !== 'core' ? this.formItemConfig.limits.default.cpuUnit : '')
          }
          if (this.formItemConfig.limits.default.memory) {
            json.spec.limits[0].default.memory = this.formItemConfig.limits.default.memory + this.formItemConfig.limits.default.memoryUnit
          }
        }
        if (this.formItemConfig.limits.defaultRequest) {
          json.spec.limits[0].defaultRequest = {}
          if (this.formItemConfig.limits.defaultRequest.cpu) {
            json.spec.limits[0].defaultRequest.cpu = this.formItemConfig.limits.defaultRequest.cpu + (this.formItemConfig.limits.defaultRequest.cpuUnit !== 'core' ? this.formItemConfig.limits.defaultRequest.cpuUnit : '')
          }
          if (this.formItemConfig.limits.defaultRequest.memory) {
            json.spec.limits[0].defaultRequest.memory = this.formItemConfig.limits.defaultRequest.memory + this.formItemConfig.limits.defaultRequest.memoryUnit
          }
        }
        if (value === 'CREATE') {
          formCreateLimitRange({
            productId: 100,
            clusterId: this.formItem.cluster,
            namespaceName: this.formItem.name,
            yaml: JSON.stringify(json)
          }).then(res => {
            if (res.code === 200 && res.msg === '') {
              // this.$Message.success({
              //   content: this.$t('create_success')
              // })
              // this.formAddModel = false
            } else {
              this.$Message.error({
                content: this.$t('create_failure')
              })
            }
          })
        }
        if (value === 'EDIT') {
          updateLimitRange({
            productId: 100,
            clusterId: this.formItem.cluster,
            namespaceName: this.formItem.name,
            updateJson: JSON.stringify(json)
          }).then(res => {
            if (res.code === 200 && res.msg === '') {
              // this.$Message.success({
              //   content: this.$t('create_success')
              // })
              // this.formAddModel = false
            } else {
              this.$Message.error({
                content: this.$t('edit_failure')
              })
            }
          })
        }
      } else {
        delLimitRange({
          productId: 100,
          clusterId: this.formItem.cluster,
          namespaceName: this.formItem.name,
          resource: this.formItem.name
        }).then(res => {
          if (res.code === 200 && res.msg === '') {
            // this.$Message.success({
            //   content: this.$t('edit_success')
            // })
            // this.formAddModel = false
          } else {
            this.$Message.error({
              content: '删除失败'
            })
          }
        })
      }
    },
    quota (value) {
      let json = {
        'metadata': {
          'name': this.formItem.name
        },
        'spec': {
          'hard': {}
        }
      }
      if (this.formItemQuota.quotaDisplay === 1) {
        if (this.formItemQuota.configmaps) {
          json.spec.hard.configmaps = this.formItemQuota.configmaps
        }
        if (this.formItemQuota.persistentvolumeclaims) {
          json.spec.hard.persistentvolumeclaims = this.formItemQuota.persistentvolumeclaims
        }
        if (this.formItemQuota.pods) {
          json.spec.hard.pods = this.formItemQuota.pods
        }
        if (this.formItemQuota.replicationcontrollers) {
          json.spec.hard.replicationcontrollers = this.formItemQuota.replicationcontrollers
        }
        if (this.formItemQuota.loadbalancers) {
          json.spec.hard['services.loadbalancers'] = this.formItemQuota.loadbalancers
        }
        if (this.formItemQuota.nodeports) {
          json.spec.hard['services.nodeports'] = this.formItemQuota.nodeports
        }
        if (this.formItemQuota.services) {
          json.spec.hard.services = this.formItemQuota.services
        }
        if (this.formItemQuota.secrets) {
          json.spec.hard.secrets = this.formItemQuota.secrets
        }
        // 开启才创建
        if (value === 'CREATE') {
          formCreateQuota({
            productId: 100,
            clusterId: this.formItem.cluster,
            namespaceName: this.formItem.name,
            yaml: JSON.stringify(json)
          }).then(res => {
            if (res.code === 200 && res.msg === '') {
              // this.$Message.success({
              //   content: this.$t('create_success')
              // })
              // this.formAddModel = false
            } else {
              this.$Message.error({
                content: this.$t('create_failure')
              })
            }
          })
        }
        // 编辑的时候如果之前没有开启，后端服务会创建一个，若果之前有，现在关闭会制空，limitrange资源依然存在
        if (value === 'EDIT') {
          updateQuota({
            productId: 100,
            clusterId: this.formItem.cluster,
            namespaceName: this.formItem.name,
            updateJson: JSON.stringify(json)
          }).then(res => {
            if (res.code === 200 && res.msg === '') {
              // this.$Message.success({
              //   content: this.$t('edit_success')
              // })
              // this.formAddModel = false
            } else {
              this.$Message.error({
                content: this.$t('edit_failure')
              })
            }
          })
        }
      } else {
        delQuota({
          productId: 100,
          clusterId: this.formItem.cluster,
          namespaceName: this.formItem.name,
          resource: this.formItem.name
        }).then(res => {
          if (res.code === 200 && res.msg === '') {
            // this.$Message.success({
            //   content: this.$t('edit_success')
            // })
            // this.formAddModel = false
          } else {
            this.$Message.error({
              content: '删除失败'
            })
          }
        })
      }
    },
    handleReset () {
      this.formItem = {
        name: '',
        cluster: '',
        exist: 0,
        labels: [
          {
            val: '',
            key: ''
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
      this.formItemConfig = {
        limitDisplay: 0,
        limits: {
          max: {
            memory: '',
            cpu: '',
            storage: '',
            cpuUnit: 'core',
            memoryUnit: 'Gi',
            storageUnit: 'Gi'
          },
          min: {
            memory: '',
            cpu: '',
            storage: '',
            cpuUnit: 'core',
            memoryUnit: 'Gi',
            storageUnit: 'Gi'
          },
          default: {
            memory: '',
            cpu: '',
            storage: '',
            cpuUnit: 'core',
            memoryUnit: 'Gi',
            storageUnit: 'Gi'
          },
          defaultRequest: {
            memory: '',
            cpu: '',
            storage: '',
            cpuUnit: 'core',
            memoryUnit: 'Gi',
            storageUnit: 'Gi'
          },
          type: ''
        }
      }
      this.formItemQuota = {
        quotaDisplay: 0,
        configmaps: '',
        persistentvolumeclaims: '',
        pods: '',
        replicationcontrollers: '',
        resourcequotas: '',
        loadbalancers: '',
        nodeports: '',
        services: '',
        secrets: ''
      }
    },
    formEdit () {
      this.nameDisabled = true
      // 获取service信息
      // this.getService()
      getOneNamespace({
        namespaceName: this.name,
        clusterId: this.cluster_id
      }).then(res => {
        this.editData = res.data
        this.formItem.name = res.data.metadata.name
        this.formItem.cluster = this.cluster_id
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
      })
      this.formItemConfig = {
        limitDisplay: 0,
        limits: {
          max: {
            memory: '',
            cpu: '',
            storage: '',
            cpuUnit: 'core',
            memoryUnit: 'Gi',
            storageUnit: 'Gi'
          },
          min: {
            memory: '',
            cpu: '',
            storage: '',
            cpuUnit: 'core',
            memoryUnit: 'Gi',
            storageUnit: 'Gi'
          },
          default: {
            memory: '',
            cpu: '',
            storage: '',
            cpuUnit: 'core',
            memoryUnit: 'Gi',
            storageUnit: 'Gi'
          },
          defaultRequest: {
            memory: '',
            cpu: '',
            storage: '',
            cpuUnit: 'core',
            memoryUnit: 'Gi',
            storageUnit: 'Gi'
          },
          type: ''
        }
      }
      getOneLimitRange({
        namespaceName: this.name,
        clusterId: this.cluster_id
      }).then(res => {
        res.data.forEach((item, index) => {
          if (item.spec.limits.length > 0 && Object.keys(item.spec.limits[0]).length > 1) {
            this.formItemConfig.limitDisplay = 1
            if (item.spec.limits[0].max && item.spec.limits[0].max.cpu) {
              this.formItemConfig.limits.max.cpu = item.spec.limits[0].max.cpu.split('m')[0]
              this.formItemConfig.limits.max.cpuUnit = item.spec.limits[0].max.cpu.includes('m') ? 'm' : 'core'
            }
            if (item.spec.limits[0].min && item.spec.limits[0].min.cpu) {
              this.formItemConfig.limits.min.cpu = item.spec.limits[0].min.cpu.split('m')[0]
              this.formItemConfig.limits.min.cpuUnit = item.spec.limits[0].min.cpu.includes('m') ? 'm' : 'core'
            }
            if (item.spec.limits[0].default && item.spec.limits[0].default.cpu) {
              this.formItemConfig.limits.default.cpu = item.spec.limits[0].default.cpu.split('m')[0]
              this.formItemConfig.limits.default.cpuUnit = item.spec.limits[0].default.cpu.includes('m') ? 'm' : 'core'
            }
            if (item.spec.limits[0].defaultRequest && item.spec.limits[0].defaultRequest.cpu) {
              this.formItemConfig.limits.defaultRequest.cpu = item.spec.limits[0].defaultRequest.cpu.split('m')[0]
              this.formItemConfig.limits.defaultRequest.cpuUnit = item.spec.limits[0].defaultRequest.cpu.includes('m') ? 'm' : 'core'
            }
            // memory
            let unit = ['Ki', 'Mi', 'Gi', 'Ti']
            unit.forEach((u, index) => {
              if (item.spec.limits[0].max && item.spec.limits[0].max.memory && item.spec.limits[0].max.memory.search(u) !== -1) {
                this.formItemConfig.limits.max.memory = item.spec.limits[0].max.memory.split(u)[0]
                this.formItemConfig.limits.max.memoryUnit = u
              }
              if (item.spec.limits[0].min && item.spec.limits[0].min.memory && item.spec.limits[0].min.memory.search(u) !== -1) {
                this.formItemConfig.limits.min.memory = item.spec.limits[0].min.memory.split(u)[0]
                this.formItemConfig.limits.min.memoryUnit = u
              }
              if (item.spec.limits[0].default && item.spec.limits[0].default.memory && item.spec.limits[0].default.memory.search(u) !== -1) {
                this.formItemConfig.limits.default.memory = item.spec.limits[0].default.memory.split(u)[0]
                this.formItemConfig.limits.default.memoryUnit = u
              }
              if (item.spec.limits[0].defaultRequest && item.spec.limits[0].defaultRequest.memory && item.spec.limits[0].defaultRequest.memory.search(u) !== -1) {
                this.formItemConfig.limits.defaultRequest.memory = item.spec.limits[0].defaultRequest.memory.split(u)[0]
                this.formItemConfig.limits.defaultRequest.memoryUnit = u
              }
            })
            // storage
            // unit.forEach((u, index) => {
            //   if (item.spec.limits[0].max && item.spec.limits[0].max.storage && item.spec.limits[0].max.storage.search(u) !== -1) {
            //     this.formItemConfig.limits.max.storage = item.spec.limits[0].max.storage.split(u)[0]
            //     this.formItemConfig.limits.max.storageUnit = u
            //   }
            //   if (item.spec.limits[0].min && item.spec.limits[0].min.storage && item.spec.limits[0].min.storage.search(u) !== -1) {
            //     this.formItemConfig.limits.min.storage = item.spec.limits[0].min.storage.split(u)[0]
            //     this.formItemConfig.limits.min.storageUnit = u
            //   }
            //   if (item.spec.limits[0].default && item.spec.limits[0].default.storage && item.spec.limits[0].default.storage.search(u) !== -1) {
            //     this.formItemConfig.limits.default.storage = item.spec.limits[0].default.storage.split(u)[0]
            //     this.formItemConfig.limits.default.storageUnit = u
            //   }
            //   if (item.spec.limits[0].defaultRequest && item.spec.limits[0].defaultRequest.storage && item.spec.limits[0].defaultRequest.storage.search(u) !== -1) {
            //     this.formItemConfig.limits.defaultRequest.storage = item.spec.limits[0].defaultRequest.storage.split(u)[0]
            //     this.formItemConfig.limits.defaultRequest.storageUnit = u
            //   }
            // })
          }
        })
      })
      this.formItemQuota = {
        quotaDisplay: 0,
        configmaps: '',
        persistentvolumeclaims: '',
        pods: '',
        replicationcontrollers: '',
        resourcequotas: '',
        loadbalancers: '',
        nodeports: '',
        services: '',
        secrets: ''
      }
      getOneQuota({
        namespaceName: this.name,
        clusterId: this.cluster_id
      }).then(res => {
        res.data.forEach((item, index) => {
          if (JSON.stringify(item.spec) !== '{}') {
            this.formItemQuota.quotaDisplay = 1
            this.formItemQuota.configmaps = item.spec.hard.configmaps ? item.spec.hard.configmaps.replace('k', '000') : ''
            this.formItemQuota.persistentvolumeclaims = item.spec.hard.persistentvolumeclaims ? item.spec.hard.persistentvolumeclaims.replace('k', '000') : ''
            this.formItemQuota.pods = item.spec.hard.pods ? item.spec.hard.pods.replace('k', '000') : ''
            this.formItemQuota.replicationcontrollers = item.spec.hard.replicationcontrollers ? item.spec.hard.replicationcontrollers.replace('k', '000') : ''
            this.formItemQuota.resourcequotas = item.spec.hard.resourcequotas ? item.spec.hard.resourcequotas.replace('k', '000') : ''
            this.formItemQuota.loadbalancers = item.spec.hard['services.loadbalancers'] ? item.spec.hard['services.loadbalancers'].replace('k', '000') : ''
            this.formItemQuota.nodeports = item.spec.hard['services.nodeports'] ? item.spec.hard['services.nodeports'].replace('k', '000') : ''
            this.formItemQuota.services = item.spec.hard.services ? item.spec.hard.services.replace('k', '000') : ''
            this.formItemQuota.secrets = item.spec.hard.secrets ? item.spec.hard.secrets.replace('k', '000') : ''
          }
        })
      })
    }
  }
}
</script>

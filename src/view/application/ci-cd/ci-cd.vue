<template>
  <div>
    <information info="CI/CD：直接通过代码仓库进行代码的编译、构建、集成测试、部署上线等进行持续集成持续部署"></information>
    <Card shadow v-if="hasPerm('m_cicd')">
      <Row>
        <Col span="24" style="margin-top: 15px; margin-bottom: 15px">
          <Col span="4">
              <div style="text-align:center">
                <h2>初始消费者数：{{concurrency}}</h2>
              </div>
          </Col>
          <Col span="4">
              <div style="text-align:center">
                <h2>初始队列长度：{{queueSize}}</h2>
              </div>
          </Col>
          <Col span="4">
              <div style="text-align:center">
                <h2>最大消费者数：{{maxConcurrency}}</h2>
              </div>
          </Col>
          <Col span="4">
              <div style="text-align:center">
                <h2>稳定期：{{stableTime}} 秒</h2>
              </div>
          </Col>
          <Col span="4">
              <div style="text-align:center">
                <h2>拥堵检测周期：{{duration}} 秒</h2>
              </div>
          </Col>
          <Col span="4">
            <div style="text-align:center">
              <InputNumber v-model="consumer" size="small" style="margin-right: 3px"></InputNumber>
              <ButtonGroup>
                <Button @click="increase()" style="margin-right: 3px" type="success" size="small">
                  {{ this.$t('increase') }}
                </Button>
                <Button @click="reduce()" type="success" size="small" ghost>
                  {{ this.$t('reduce') }}
                </Button>
              </ButtonGroup>
            </div>
          </Col>
        </Col>
        <Col span="24">
          <hr style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px"/>
        </Col>
        <Col span="12">
          <charts :data=queue title="待消费数" name="单位（个）"></charts>
        </Col>
        <Col span="12">
          <charts :data=currentConcurrency title="消费者数" name="单位（个）"></charts>
        </Col>
        <Col span="12">
          <charts :data=surge title="激增数" name="单位（个）"></charts>
        </Col>
        <Col span="12">
          <charts :data=workingSize title="工作中消费者数" name="单位（个）"></charts>
        </Col>
         <Col span="24">
          <hr style="height:1px;border:none;border-top:1px dashed #dcdee2;margin-bottom: 15px"/>
        </Col>
      </Row>
    </Card>
    <Card shadow>
      <SearchTable :data="tableData" :columns="columns">
      <ButtonGroup>
        <Button v-if="hasPerm('add_plugin')" @click="createBtnClick()" style="margin-right: 3px" type="success">{{ this.$t('add') }}</Button>
        <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
      </ButtonGroup>
    </SearchTable>
    </Card>
    <Modal slot="option" v-model="modalShow" :title="title">
      <Form ref="createForm" :model="formItem" :rules="ruleValidate" :label-width="55">
        <FormItem label="名称"  prop="name">
          <Input v-model="formItem.name"></Input>
        </FormItem>
        <FormItem label="描述"  prop="describe">
          <Input v-model="formItem.describe"></Input>
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
        <p style="line-height: 35px">确认删除 <strong style="color:#f60;text-align:center">{{ name }}</strong> 吗？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long  @click="del()">{{this.$t('delete')}}</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import {
  List,
  Delete,
  Update,
  Create,
  Metric,
  Increase,
  Reduce
} from '@/api/ci-cd/ci-cd'
import SearchTable from '@/view/other-page/search-table.vue'
import Information from '../../other-page/information.vue'
import { formatTimestamp } from '../../../api/tools'
import { hasPermission } from '@/router/permission'
import Charts from './charts.vue'

export default {
  components: {
    SearchTable,
    Charts,
    Information
  },
  data () {
    return {
      consumer: 0,
      currentConcurrency: [0, 0, 0, 0, 0, 0],
      queue: [0, 0, 0, 0, 0, 0],
      surge: [0, 0, 0, 0, 0, 0],
      workingSize: [0, 0, 0, 0, 0, 0],
      queueSize: 0,
      concurrency: 0,
      duration: 0,
      maxConcurrency: 0,
      stableTime: 0,
      name: '',
      title: '',
      modalMode: '',
      deleteModel: false,
      enterShow: false,
      loading: false,
      modalShow: false,
      formItem: {
        name: '',
        describe: ''
      },
      ruleValidate: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        describe: [
          { required: true, message: '描述不能为空', trigger: 'blur' }
        ]
      },
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
        // {
        //   title: 'ID',
        //   key: 'id'
        // },
        {
          title: this.$t('describe'),
          key: 'describe'
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
                    type: 'success',
                    size: 'small',
                    disabled: !hasPermission('edit_plugin')
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.handleReset('createForm')
                      this.formItem.name = params.row.name
                      this.formItem.describe = params.row.describe
                      this.modalMode = 'UPDATE'
                      this.modalShow = true
                      this.resourceName = params.row.id
                      this.name = params.row.name
                      this.title = '编辑 ' + params.row.name
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
                    disabled: !hasPermission('del_plugin')
                  },
                  on: {
                    click: () => {
                      this.deleteModel = true
                      this.deleteLoading = false
                      this.resourceName = params.row.id
                      this.name = params.row.name
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
    this.getChartData()
    // 刷新图表
    if (hasPermission('m_cicd')) {
      if (this.timer) {
        clearInterval(this.timer)
      } else {
        this.timer = setInterval(() => {
          this.getChartData()
        }, 10 * 1000)
      }
    }
  },
  // 关闭页面后停止刷新
  destroyed () {
    clearInterval(this.timer)
  },
  methods: {
    cancel () {
      this.modalShow = false
      this.deleteModel = false
    },
    createBtnClick () {
      this.handleReset('createForm')
      this.modalMode = 'CREATE'
      this.modalShow = true
      this.title = '添加'
    },
    handleReset (name) {
      this.$refs[name].resetFields()
    },
    confirm () {
      this.$refs['createForm'].validate(valid => {
        if (valid) {
          let params = {
            name: this.formItem.name,
            describe: this.formItem.describe,
            id: this.resourceName
          }
          if (this.modalMode === 'CREATE') {
            Create(params).then(res => {
              if (res.code === 200) {
                this.$Message.success({
                  content: this.$t('action_success')
                })
                this.formatTableData()
                this.modalShow = false
              } else {
                this.$Message.error('操作失败')
              }
            })
          }
          if (this.modalMode === 'UPDATE') {
            Update(params).then(res => {
              if (res.code === 200) {
                this.$Message.success({
                  content: this.$t('action_success')
                })
                this.formatTableData()
                this.modalShow = false
              } else {
                this.$Message.error('操作失败')
              }
            })
          }
        }
      })
    },
    del () {
      Delete({
        productId: 100,
        resourceName: this.resourceName
      }).then(res => {
        if (res.code === 200) {
          this.$Message.success({
            content: this.$t('action_success')
          })
          this.formatTableData()
          this.deleteModel = false
        }
      })
    },
    reduce () {
      Reduce({
        reduce: this.consumer
      }).then(res => {
        if (res.code === 200) {
          this.$Message.success({
            content: this.$t('action_success')
          }).catch(() => {
            // this.loading = false
          })
        }
      })
    },
    increase () {
      Increase({
        surge: this.consumer
      }).then(res => {
        if (res.code === 200) {
          this.$Message.success({
            content: this.$t('action_success')
          }).catch(() => {
            // this.loading = false
          })
        }
      })
    },
    formatTableData () {
      List({
        productId: 100
      }).then(res => {
        this.tableData = []
        res.data.forEach((item, index) => {
          this.tableData.push({
            id: item.id,
            name: item.name,
            describe: item.describe,
            modifyTime: formatTimestamp(item.modifyTime) || '',
            create_time: formatTimestamp(item.createTime) || ''
          })
        })
      })
    },
    getChartData () {
      Metric({
        productId: 100
      }).then(res => {
        this.currentConcurrency.splice(0, 1)
        this.currentConcurrency.push(res.currentConcurrency)
        this.queue.splice(0, 1)
        this.queue.push(res.queue)
        this.surge.splice(0, 1)
        this.surge.push(res.surge)
        this.workingSize.splice(0, 1)
        this.workingSize.push(res.workingSize)
        this.queueSize = res.queueSize
        this.concurrency = res.concurrency
        this.duration = res.duration
        this.maxConcurrency = res.maxConcurrency
        this.stableTime = res.stableTime
      })
    },
    refresh () {
      this.formatTableData()
      this.$Message.success(this.$t('refresh_success'))
    }
  }
}
</script>

<style>
.row {
  margin-bottom: 25px;
}
</style>

<template>
  <div >
      <Row type="flex" justify="center" class="row" >
          <Col span="24">
              <Card dis-hover v-if="data1">
                      <p slot="title">详情</p>
                      <Table border stripe :columns="columns1" :data="data1">
                      </Table>
              </Card >
          </Col>
      </Row>
            <Row type="flex" justify="center" class="row">
          <Col span="24">
              <Card dis-hover v-if="data2 && false">
                      <p slot="title">配置</p>
                      <Table border stripe :columns="columns2" :data="data2"></Table>
              </Card >
          </Col>
      </Row>
            <Row type="flex" justify="center" class="row">
          <Col span="24">
              <Card dis-hover v-if="data3 && false">
                      <p slot="title">现状</p>
                      <Table border stripe :columns="columns3" :data="data3"></Table>
              </Card >
          </Col>
      </Row>
  </div>
</template>

<script>
import { formatDate } from '@/api/tools'
import { getOneSC } from '@/api/storage'
export default {
  data () {
    return {
      columns1: [
        {
          title: '指标',
          key: 'key'
        },
        {
          title: this.$t('describe'),
          key: 'val',
          render: (h, params) => {
            if (params.row.key === '参数(parameters)') {
              return h(
                'p',
                Object.keys(params.row.val).map(item => {
                  return h(
                    'Poptip',
                    {
                      props: {
                        trigger: 'hover',
                        title:
                        item +
                        ': ' +
                        (params.row.val[item] === ''
                          ? '无'
                          : params.row.val[item]),
                        placement: 'right-end'
                      }
                    },
                    [
                      h(
                        'Tag',
                        {
                          style: {
                            textAlign: 'center',
                            padding: '1px'
                          },
                          props: {
                            color: 'geekblue'
                          }
                        },
                        item +
                        ': ' +
                        (params.row.val[item] === ''
                          ? '无'
                          : params.row.val[item])
                      ),
                      h('div', {
                        slot: 'content',
                        style: {
                          textAlign: 'center'
                        }
                      })
                    ]
                  )
                })
              )
            } else {
              let val = params.row.val
              return h(
                'span',
                typeof val === 'object' ? JSON.stringify(params.row.val) : val
              )
            }
          }
        }
      ],
      columns2: [
        {
          title: 'Host',
          key: 'host'
        },
        {
          title: 'Path',
          key: 'path'
        },
        {
          title: 'ServiceName',
          key: 'serviceName'
        },
        {
          title: 'ServicePort',
          key: 'servicePort'
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
                      getOneConfMap({
                        confmap: params.row.name
                        // namespace: "default"
                      }).then(res => {
                        this.originYaml = res.data
                      })

                      this.$Modal.confirm({
                        styles: { top: '10px' },
                        width: 750,
                        okText: '更新',
                        cancelText: this.$t('cancel'),
                        onOk: () => {
                          updateConfMap({
                            // namespace: "default",
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
              )
            ])
          }
        }
      ],
      columns3: [
        {
          title: '类型',
          key: 'type'
        },
        {
          title: this.$t('status'),
          key: 'status'
        },
        {
          title: '最近心跳',
          key: 'heartBeat'
        },
        {
          title: '最近更改',
          key: 'lastTransitionTime'
        },
        {
          title: '原因',
          key: 'reason'
        },
        {
          title: '消息',
          key: 'message'
        }
      ],
      data1: [],
      data2: [],
      data3: [],

      allData: null
    }
  },
  mounted () {
    this.$store.commit('setClusterSelect', false)
    this.formatTableData()
  },
  methods: {
    formatTableData () {
      let params = this.$route.params
      this.getTableData1(params)
      // this.getTableData2()
    },
    getTableData1 (params) {
      getOneSC({
        productId: 100,
        scName: params.scname
      }).then(res => {
        let item = res.data
        // 赋值给全局
        // this.allData = item
        // this.getTableData2(item)

        let details = {
          '名称(name)': item.metadata.name,
          '标签(labels)': '???',
          '创建时间(creationTimestamp)': formatDate(
            item.metadata.creationTimestamp
          ),
          '注释(provisioner)': item.provisioner,
          '参数(parameters)': item.parameters
        }

        let data = []
        for (let i = 0; i < Object.keys(details).length; i++) {
          data.push({
            key: Object.keys(details)[i],
            val: Object.values(details)[i] || '无'
          })
        }

        this.data1 = data
      })
    },
    getTableData3 () {
      let obj = this.allData.spec
      let data = []
      let lastTransitionTime = null
      for (let i = 0; i < Object.keys(obj).length; i++) {
        lastTransitionTime =
          obj[i].lastTransitionTime && formatDate(obj[i].lastTransitionTime)
        data.push({
          type: obj[i].type,
          status: obj[i].status,
          lastTransitionTime: lastTransitionTime || '-',
          heartBeat: obj[i].heartBeat || '-',
          reason: obj[i].reason || '-',
          message: obj[i].message || '-'
        })
      }

      this.data3 = data
    },
    getTableData2 (item) {
      let obj = item.spec.rules
      let data = []
      for (let i = 0; i < obj.length; i++) {
        for (let j = 0; j < obj[i].http.paths.length; j++) {
          data.push({
            host: obj[i].host || '无',
            path: obj[i].http.paths[j].path || '无',
            serviceName: obj[i].http.paths[j].backend.serviceName || '无',
            servicePort: obj[i].http.paths[j].backend.servicePort || '无',
            fullJson: obj[i].http.paths[j]
          })
        }
      }
      this.data2 = data
    }
  }
}
</script>

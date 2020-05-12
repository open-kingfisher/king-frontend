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
                      <p slot="title">容器</p>
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
import { getOneService } from '@/api/discovery'
import { formatDate } from '@/api/tools'
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
            if (
              params.row.key === '标签(labels)' ||
              params.row.key === '选择器(selector)'
            ) {
              return h(
                'ul',
                {
                  style: {
                    listStyle: 'none'
                  }
                },
                Object.keys(params.row.val).map(item => {
                  return h('li', item + ':' + params.row.val[item])
                })
              )
            } else if (params.row.key === '端口(Internal endpoints)') {
              return h(
                'ul',
                {
                  style: {
                    listStyle: 'none'
                  }
                },
                Object.keys(params.row.val).map(item => {
                  let info =
                    'nodePort=' +
                    params.row.val[item]['nodePort'] +
                    '，' +
                    'port=' +
                    params.row.val[item]['port'] +
                    '，' +
                    'targetPort=' +
                    params.row.val[item]['targetPort'] +
                    '，' +
                    'protocol=' +
                    params.row.val[item]['protocol']
                  return h('li', info)
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
          title: '名字',
          key: 'name'
        },
        {
          title: this.$t('image'),
          key: 'image'
        },
        {
          title: '环境变量',
          key: 'env'
        },
        {
          title: '命令',
          key: 'cmd'
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
      this.getTableData(params)
      // this.getTableData(params).then(res => {
      //   let item = res.data

      //   let details = {
      //     '名称(name)': item.metadata.name,
      //     '命名空间(namespace)': item.metadata.namespace,
      //     '标签(labels)': item.metadata.labels,
      //     '创建时间(creationTimestamp)': formatDate(item.metadata.creationTimestamp),
      //     '状态(status.phase)': item.status.phase,
      //     'QoS等级(qosClass)': item.status.qosClass,
      //     '节点(nodeName)': item.spec.nodeName,
      //     '地址(podIP)': item.status.podIP,
      //     containers: item.spec.containers,
      //     conditions: item.status.conditions
      //   }

      // 初始化table2、table3
      // this.allData = details
      // this.getTableData2()
      // this.getTableData3()

      // let data = []
      // for (let i = 0; i < Object.keys(details).length - 2; i++) {
      //   data.push({
      //     key: Object.keys(details)[i],
      //     val: Object.values(details)[i] || '无'
      //   })
      // }

      // this.data1 = data
      // })
    },
    getTableData (params) {
      getOneService({
        productId: 100,
        serviceName: params.servicename
      }).then(res => {
        let item = res.data
        let details = {
          '名称(name)': item.metadata.name,
          '命名空间(namespace)': item.metadata.namespace,
          '标签(labels)': item.metadata.labels,
          '创建时间(creationTimestamp)': formatDate(
            item.metadata.creationTimestamp
          ),
          '选择器(selector)': item.spec.selector,
          '类型(type)': item.spec.type,
          '会话保持(sessionAffinity)': item.spec.sessionAffinity,
          '地址(ClusterIP)': item.spec.clusterIP,
          '端口(Internal endpoints)': item.spec.ports
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
      let obj = this.allData.conditions
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
    getTableData2 () {
      let obj = this.allData.containers
      let data = []
      for (let i = 0; i < Object.keys(obj).length; i++) {
        data.push({
          name: obj[i].name,
          image: obj[i].image,
          env: obj[i].env || '无',
          cmd: obj[i].cmd || '无'
        })
      }

      this.data2 = data
    }
  }
}
</script>

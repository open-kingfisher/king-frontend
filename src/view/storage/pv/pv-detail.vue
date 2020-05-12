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
                      <p slot="title">Detail</p>
                      <Table border stripe :columns="columns1" :data="data1">
                      </Table>
              </Card >
          </Col>
      </Row>
            <Row type="flex" justify="center" class="row">
          <Col span="24">
              <Card dis-hover v-if="data2">
                      <p slot="title">Source</p>
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
import { getOnePV } from '@/api/storage'
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
            if (params.row.key === '端口(Internal endpoints)') {
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
          title: '指标',
          key: 'key'
        },
        {
          title: this.$t('describe'),
          key: 'val',
          render: (h, params) => {
            if (params.row.key === '端口(Internal endpoints)') {
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
      getOnePV({
        productId: 100,
        pvName: params.pvname
      }).then(res => {
        let item = res.data

        // 赋值给全局
        this.allData = item
        this.getTableData2(item)

        let details = {
          '名称(name)': item.metadata.name,
          '命名空间(namespace)': item.metadata.namespace,
          '创建时间(creationTimestamp)': formatDate(
            item.metadata.creationTimestamp
          ),
          '注释(Annotations)': item.metadata.annotations,
          '状态(Status)': item.status.phase,
          '访问模式(Access Mode)': item.spec.accessModes,
          '存储类别(Storage Class)': item.spec.storageClassName,
          '卷': item.spec.volumeName,
          '策略(Reclaim policy)': item.spec.persistentVolumeReclaimPolicy || '-',
          '引用(ClaimRef)':
              item.spec.claimRef['namespace'] +
              '/' +
              item.spec.claimRef['name']
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
      /*
                  "fc":{
                "targetWWNs":[
                    "50060e801049cfd1"
                ],
                "lun":0
            },
      */

      let details = {
        'fc.targetWWNs': item.spec.fc.targetWWNs,
        'fc.lun': item.spec.fc.lun
      }

      let data = []
      for (let i = 0; i < Object.keys(details).length; i++) {
        data.push({
          key: Object.keys(details)[i],
          val: Object.values(details)[i] || '无'
        })
      }

      this.data2 = data
    }
  }
}
</script>

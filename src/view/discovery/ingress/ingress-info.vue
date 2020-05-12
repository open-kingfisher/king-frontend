<template>
  <div>
    <Row type="flex" justify="center" class="row" :gutter=10>
      <Col span="6">
        <Card dis-hover>
          <p slot="title">{{ingressname}}</p>
          <Table border stripe :columns="ingressColumns" :data="ingressData" :show-header=false></Table>
        </Card>
      </Col>
      <Col span="18">
        <Card shadow>
          <Tabs value="status">
            <TabPane label="运行状态" name="status">
              <Card shadow>
                <Row type="flex" justify="center" class="row">
                  <Col span="24">
                    <charts :data="chartData"></charts>
                  </Col>
                </Row>
              </Card>
            </TabPane>
            <TabPane label="注释" name="annotations">
              <div style="margin:10px">
                <information info="可以通过给Ingress添加注解来设置Ingress的行为。详细的可供配置的注解列表，可查看： " href="https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/" link="Annotations"></information>
                <div v-for="(v, k) in annotations" :key="k" :value="v" class="containers">
                  <span class="expand-value">{{ k }}</span>
                  <div class="separator"></div>
                  <span class="expand-value">{{ v }}</span>
                </div>
              </div>
            </TabPane>
            <TabPane label="事件" name="event">
              <SearchTable :columns="eventColumns" :data="eventData">
              </SearchTable>
            </TabPane>
            <div slot="extra">
            <Button @click="refresh()" type="success" size="small" ghost>{{ this.$t('refresh') }}</Button>
          </div>
          </Tabs>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script>
import Charts from './charts.vue'
import { getOneIngress, getIngressChartData } from '@/api/discovery'
import { formatDate } from '@/api/tools'
import YamlModal from '@/view/other-page/yaml-editor.vue'
import Information from '../../other-page/information.vue'
import { getEvent } from '../../../api/common'
import SearchTable from '../../other-page/search-table.vue'
import { forEach } from '../../../libs/tools'

export default {
  components: {
    SearchTable,
    YamlModal,
    Information,
    Charts
  },
  data () {
    return {
      annotations: '',
      ingressColumns: [
        {
          title: '名称',
          key: 'key',
          width: 90
        },
        {
          title: '值',
          key: 'val',
          render: (h, params) => {
            if (
              params.row.key === '标签'
            ) {
              return h(
                'div',
                {
                  style: {
                    listStyle: 'none'
                  }
                },
                Object.keys(params.row.val).map(item => {
                  return h(
                    'Tag',
                    {
                      props: {
                        color: 'success'
                      }
                    },
                    item + ' | ' + params.row.val[item]
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
      eventColumns: [
        {
          title: '消息',
          key: 'message'
        },
        {
          title: '类型',
          key: 'type'
        },
        {
          title: '原因',
          key: 'reason'
        },
        {
          title: '次数',
          key: 'count',
          width: '80px'
        },
        // {
        //   title: '第一次时间',
        //   key: 'firstTimestamp'
        // },
        {
          title: '时间',
          key: 'lastTimestamp',
          sortable: true,
          sortType: 'desc'
        }
      ],
      ingressData: [],
      eventData: [],
      ingressname: '',
      chartData: '',
      uid: ''
    }
  },
  mounted () {
    this.$store.commit('setClusterSelect', true)
    if (this.$route.params.ingressname) {
      this.ingressname = this.$route.params.ingressname
      localStorage.setItem('ingressname', this.ingressname)
    } else {
      this.ingressname = localStorage.getItem('ingressname')
    }
    this.formatTableData()
    this.getChartData()
    // 刷新图表
    if (this.timer) {
      clearInterval(this.timer)
    } else {
      this.timer = setInterval(() => {
        this.getChartData()
      }, 5 * 1000)
    }
  },
  // 关闭页面后停止刷新
  destroyed () {
    clearInterval(this.timer)
  },
  methods: {
    getChartData () {
      getIngressChartData({
        productId: 100,
        ingressName: this.ingressname
      }).then(res => {
        this.chartData = res.data
      })
    },
    formatTableData () {
      getOneIngress({
        productId: 100,
        ingressName: this.ingressname
      }).then(res => {
        let item = res.data
        this.annotations = item.metadata.annotations
        this.uid = item.metadata.uid
        let details = {
          '名称': item.metadata.name,
          '命名空间': item.metadata.namespace,
          '标签': item.metadata.labels || '',
          '创建时间': formatDate(
            item.metadata.creationTimestamp
          )
        }
        let data = []
        for (let i = 0; i < Object.keys(details).length; i++) {
          data.push({
            key: Object.keys(details)[i],
            val: Object.values(details)[i]
          })
        }
        this.ingressData = data
        this.getEvents()
      })
    },
    getEvents () {
      this.eventData = []
      let params = {
        productId: 100,
        cluster: this.$store.getters.currentClusterId,
        uid: this.uid
      }
      getEvent(params).then(res => {
        if (res.data) {
          forEach(res.data, (item, index) => {
            this.eventData.push({
              message: item.message,
              type: item.type,
              count: item.count,
              // firstTimestamp: formatDate(item.firstTimestamp),
              lastTimestamp: formatDate(item.lastTimestamp),
              reason: item.reason
            })
          })
        }
      })
    },
    refresh () {
      this.formatTableData()
      this.getChartData()
      this.$Message.success(this.$t('refresh_success'))
    }
  }
}
</script>

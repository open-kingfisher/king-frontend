<template>
  <div>
    <Row type="flex" justify="center" class="row" :gutter=10>
      <Col span="24">
        <Card dis-hover :padding=10>
          <p slot="title">{{resourceName}}</p>
          <Row type="flex" justify="center" class="row" :gutter=10 style="margin-bottom: 10px">
            <Col span="24">
              <Card dis-hover :padding=10>
                <summary-chart :data="summaryData" :total="issueTotal" title="汇总信息"></summary-chart>
              </Card>
            </Col>
          </Row>
          <Row type="flex" justify="center" class="row" :gutter=10 style="margin-bottom: 10px">
            <Col span="24">
              <Card dis-hover :padding=10>
                <histogram :data="histogramBasicData" title="基本检查"></histogram>
                <SearchTable :columns="basicColumns" :data="basicData"></SearchTable>
              </Card>
            </Col>
          </Row>
          <Row type="flex" justify="center" class="row" :gutter=10>
            <Col span="24">
              <Card dis-hover :padding=10>
                <histogram :data="histogramUnusedData" title="无用检查"></histogram>
                <SearchTable :columns="unusedColumns" :data="unusedData"></SearchTable>
              </Card>
            </Col>
          </Row>
          <Row type="flex" justify="center" class="row" :gutter=10>
            <Col span="24">
              <Card dis-hover :padding=10>
                <histogram :data="histogramStateData" title="状态检查"></histogram>
                <SearchTable :columns="stateColumns" :data="stateData"></SearchTable>
              </Card>
            </Col>
          </Row>
          <Row type="flex" justify="center" class="row" :gutter=10>
            <Col span="24">
              <Card dis-hover :padding=10>
                <histogram :data="histogramSecurityData" title="安全检查"></histogram>
                <SearchTable :columns="securityColumns" :data="securityData"></SearchTable>
              </Card>
            </Col>
          </Row>
          <div slot="extra">
            <Select v-model="inspectFirstTime" style="width:200px;margin-right: 5px; margin-top: 0px;" size="small" @on-change="changeTime">
              <Option v-for="(v, k) in inspectTime" :key="k" :value="v.unix">{{ v.human }}</Option>
            </Select>
            <ButtonGroup>
                <Button v-if="hasPerm('action_inspect')" @click="actionInspect()" type="info" size="small" style="margin-right: 3px" ghost>{{ this.$t('action') }}</Button>
                <Button @click="refresh()" type="success" size="small" ghost>{{ this.$t('refresh') }}</Button>
              </ButtonGroup>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script>
import Charts from './charts.vue'
import { checkInfo } from './check'
import Histogram from './histogram.vue'
import SummaryChart from './summary-chart.vue'
// import DetailChart from './detail-chart.vue'
import { Action, Event, Time } from '@/api/plugin/inspect'
import { formatTimestamp } from '../../api/tools'
import YamlModal from '@/view/other-page/yaml-editor.vue'
import Information from '../other-page/information.vue'
import SearchTable from '../other-page/search-table.vue'
// import echarts from 'echarts'

export default {
  components: {
    SearchTable,
    YamlModal,
    Information,
    Charts,
    Histogram,
    SummaryChart
  },
  data () {
    return {
      issueTotal: 0,
      summaryData: [],
      histogramBasicData: [],
      histogramUnusedData: [],
      histogramStateData: [],
      histogramSecurityData: [],
      inspectTime: [],
      inspectFirstTime: '',
      inspectAll: {},
      basicColumns: [
        {
          title: '名称',
          key: 'object',
          render: (h, params) => {
            return h(
              'Tag',
              {
                props: {
                  color: 'success'
                }
              },
              params.row.object.name
            )
          }
        },
        {
          title: '级别',
          key: 'severity',
          width: '85px',
          render: (h, params) => {
            let color = 'default'
            let text = '建议'
            if (params.row.severity === 'warning') {
              color = 'warning'
              text = '警告'
            } else if (params.row.severity === 'error') {
              color = 'error'
              text = '错误'
            }
            return h(
              'Tag',
              {
                props: {
                  color: color
                }
              },
              text
            )
          }
        },
        {
          title: '检查项',
          key: 'check'
        },
        {
          title: '资源',
          key: 'kind'
        },
        {
          title: '命名空间',
          key: 'object',
          render: (h, params) => {
            return h(
              'div',
              params.row.object.namespace
            )
          }
        },
        {
          title: '原因',
          key: 'message'
        }
      ],
      basicData: [],
      unusedColumns: [
        {
          title: '名称',
          key: 'object',
          render: (h, params) => {
            return h(
              'Tag',
              {
                props: {
                  color: 'success'
                }
              },
              params.row.object.name
            )
          }
        },
        {
          title: '级别',
          key: 'severity',
          width: '85px',
          render: (h, params) => {
            let color = 'default'
            let text = '建议'
            if (params.row.severity === 'warning') {
              color = 'warning'
              text = '警告'
            } else if (params.row.severity === 'error') {
              color = 'error'
              text = '错误'
            }
            return h(
              'Tag',
              {
                props: {
                  color: color
                }
              },
              text
            )
          }
        },
        {
          title: '检查项',
          key: 'check'
        },
        {
          title: '资源',
          key: 'kind'
        },
        {
          title: '命名空间',
          key: 'object',
          render: (h, params) => {
            return h(
              'div',
              params.row.object.namespace
            )
          }
        },
        {
          title: '原因',
          key: 'message'
        }
      ],
      unusedData: [],
      stateColumns: [
        {
          title: '名称',
          key: 'object',
          render: (h, params) => {
            return h(
              'Tag',
              {
                props: {
                  color: 'success'
                }
              },
              params.row.object.name
            )
          }
        },
        {
          title: '级别',
          key: 'severity',
          width: '85px',
          render: (h, params) => {
            let color = 'default'
            let text = '建议'
            if (params.row.severity === 'warning') {
              color = 'warning'
              text = '警告'
            } else if (params.row.severity === 'error') {
              color = 'error'
              text = '错误'
            }
            return h(
              'Tag',
              {
                props: {
                  color: color
                }
              },
              text
            )
          }
        },
        {
          title: '检查项',
          key: 'check'
        },
        {
          title: '资源',
          key: 'kind'
        },
        {
          title: '命名空间',
          key: 'object',
          render: (h, params) => {
            return h(
              'div',
              params.row.object.namespace
            )
          }
        },
        {
          title: '原因',
          key: 'message'
        }
      ],
      stateData: [],
      securityColumns: [
        {
          title: '名称',
          key: 'object',
          render: (h, params) => {
            return h(
              'Tag',
              {
                props: {
                  color: 'success'
                }
              },
              params.row.object.name
            )
          }
        },
        {
          title: '级别',
          key: 'severity',
          width: '85px',
          render: (h, params) => {
            let color = 'default'
            let text = '建议'
            if (params.row.severity === 'warning') {
              color = 'warning'
              text = '警告'
            } else if (params.row.severity === 'error') {
              color = 'error'
              text = '错误'
            }
            return h(
              'Tag',
              {
                props: {
                  color: color
                }
              },
              text
            )
          }
        },
        {
          title: '检查项',
          key: 'check'
        },
        {
          title: '资源',
          key: 'kind'
        },
        {
          title: '命名空间',
          key: 'object',
          render: (h, params) => {
            return h(
              'div',
              params.row.object.namespace
            )
          }
        },
        {
          title: '原因',
          key: 'message'
        //   render: (h, params) => {
        //     return h(
        //       'Tooltip',
        //       {
        //         props: {
        //           content: params.row.message,
        //           maxWidth: 600
        //         }
        //       },
        //       [
        //         h(
        //           'Tag',
        //           '查看'
        //         )
        //       ]
        //     )
        //   }
        }
      ],
      securityData: [],
      resourceId: '',
      resourceName: '',
      chartData: '',
      uid: ''
    }
  },
  mounted () {
    this.$store.commit('setClusterSelect', true)
    if (this.$route.params.resourceId) {
      this.resourceId = this.$route.params.resourceId
      this.resourceName = this.$route.params.resourceName
      localStorage.setItem('inspectId', this.resourceId)
      localStorage.setItem('inspectName', this.resourceName)
    } else {
      this.resourceId = localStorage.getItem('inspectId')
      this.resourceName = localStorage.getItem('inspectName')
    }
    this.timeInspect()
    // this.getInspect()
  },
  methods: {
    actionInspect () {
      Action({
        productId: 100,
        resourceName: this.resourceId,
        clusterId: this.$store.getters.currentClusterId
      }).then(res => {
        if (res.code === 200) {
          this.timeInspect()
          this.$Message.success({
            content: this.$t('action_success')
          })
        }
      })
    },
    changeTime (value) {
      if (value) {
        this.getInspect(value)
      }
    },
    getChartData () {
      Chart({
        productId: 100,
        resourceName: this.resourceId
      }).then(res => {
        this.chartData = res.data
      })
    },
    timeInspect () {
      Time({
        productId: 100,
        resourceName: this.resourceId,
        clusterId: this.$store.getters.currentClusterId
      }).then(res => {
        if (res.code === 200) {
          this.inspectTime = []
          res.data.forEach((item, index) => {
            this.inspectTime.push({
              unix: item,
              human: formatTimestamp(item)
            })
          })
          this.inspectFirstTime = this.inspectTime[0].unix
          this.getInspect()
        }
      })
    },
    getInspect (value) {
      this.inspectAll = {}
      this.basicData = []
      this.unusedData = []
      this.stateData = []
      this.securityData = []
      Event({
        productId: 100,
        resourceName: this.resourceId,
        clusterId: this.$store.getters.currentClusterId,
        time: value
      }).then(res => {
        if (res.code === 200) {
          res.data.forEach((item, index) => {
            this.inspectAll = item
          })
          console.log(this.inspectAll.info)
          this.inspectAll.info.diagnostics.forEach((item, index) => {
            item.check = checkInfo(item.check)
            if (item.group.indexOf('basic') !== -1) {
              this.basicData.push(item)
            }
            if (item.group.indexOf('unused') !== -1) {
              this.unusedData.push(item)
            }
            if (item.group.indexOf('state') !== -1) {
              this.stateData.push(item)
            }
            if (item.group.indexOf('security') !== -1) {
              this.securityData.push(item)
            }
          })
          this.histogramBasicData = []
          this.issueTotal = 0
          let basicCheck = []
          let unusedCheck = []
          let stateCheck = []
          let securityCheck = []
          let basicSummaryCount = 0
          let unusedSummaryCount = 0
          let stateSummaryCount = 0
          let securitySummaryCount = 0
          for (let key in this.inspectAll.info.summary) {
            if (this.inspectAll.info.summary[key].group.indexOf('basic') !== -1) {
              basicCheck.push({
                'name': checkInfo(key),
                'num': this.inspectAll.info.summary[key].issue,
                'normol': this.inspectAll.info.summary[key].total - this.inspectAll.info.summary[key].issue
              })
              basicSummaryCount += this.inspectAll.info.summary[key].issue
            }
            if (this.inspectAll.info.summary[key].group.indexOf('unused') !== -1) {
              unusedCheck.push({
                'name': checkInfo(key),
                'num': this.inspectAll.info.summary[key].issue,
                'normol': this.inspectAll.info.summary[key].total - this.inspectAll.info.summary[key].issue
              })
              unusedSummaryCount += this.inspectAll.info.summary[key].issue
            }
            if (this.inspectAll.info.summary[key].group.indexOf('state') !== -1) {
              stateCheck.push({
                'name': checkInfo(key),
                'num': this.inspectAll.info.summary[key].issue,
                'normol': this.inspectAll.info.summary[key].total - this.inspectAll.info.summary[key].issue
              })
              stateSummaryCount += this.inspectAll.info.summary[key].issue
            }
            if (this.inspectAll.info.summary[key].group.indexOf('security') !== -1) {
              securityCheck.push({
                'name': checkInfo(key),
                'num': this.inspectAll.info.summary[key].issue,
                'normol': this.inspectAll.info.summary[key].total - this.inspectAll.info.summary[key].issue
              })
              securitySummaryCount += this.inspectAll.info.summary[key].issue
            }
          }
          this.summaryData = [
            ['product', 'nums'],
            ['基本检查', basicSummaryCount],
            ['无用检查', unusedSummaryCount],
            ['状态检查', stateSummaryCount],
            ['安全检查', securitySummaryCount]
          ]
          this.histogramBasicData = basicCheck.sort(this.sortNum)
          this.histogramUnusedData = unusedCheck.sort(this.sortNum)
          this.histogramStateData = stateCheck.sort(this.sortNum)
          this.histogramSecurityData = securityCheck.sort(this.sortNum)
          this.issueTotal = basicSummaryCount + unusedSummaryCount + stateSummaryCount + securitySummaryCount
        }
      })
    },
    refresh () {
      this.timeInspect()
      this.$Message.success(this.$t('refresh_success'))
    },
    sortNum (a, b) {
      return a.num - b.num
    }
  }
}
</script>

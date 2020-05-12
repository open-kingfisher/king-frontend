<template>
  <div ref="dom" style="height: 200px; width: 100%"></div>
</template>

<script>
import echarts from 'echarts'
import 'echarts-liquidfill/src/liquidFill.js'

export default {
  props: {
    title: '',
    chartData: null
  },
  data () {
    return {}
  },
  watch: {
    data: {
      handler (newValue, oldValue) {
        this.chart(this.title, newValue)
      },
      deep: true
    }
  },
  methods: {
    chart (title, chartData) {
      let total = chartData.total
      let value = chartData.used / chartData.total
      let data = [value]
      // let _this = this
      let echart = echarts.init(this.$refs.dom)
      let option = {
        backgroundColor: '#fff',
        graphic: [{
          type: 'group',
          left: 'center',
          bottom: 10,
          children: [{
            type: 'text',
            z: 100,
            left: '10',
            top: 'middle',
            style: {
              // fill: '#000',
              text: this.title + '：' + total
            }
          }, {
            type: 'text',
            z: 100,
            left: '150',
            top: 'middle',
            style: {
              // fill: '#ff000',
              text: '已用：' + chartData.used
            }
          }]
        }],
        // tooltip: {
        //   show: true
        // },
        series: [{
          type: 'liquidFill',
          radius: '70%',
          center: ['50%', '40%'],
          outline: {
            // 不显示外环
            show: false,
            itemStyle: {
              borderColor: '#0ec21d'
            }
          },
          itemStyle: {
            // 不要阴影
            shadowBlur: 0
          },
          data: data,
          // 水的颜色
          color: ['#ff9900'],
          backgroundStyle: {
            borderWidth: 10,
            borderColor: '#91c7ae',
            // 水的背景颜色
            color: '#fff'
          },
          label: {
            normal: {
              formatter: (value * 100).toFixed(2) + '%',
              textStyle: {
                fontSize: 15,
                color: '#515a6e'
              }
            }
          }
        }]
      }
      echart.setOption(option)
      window.addEventListener('resize', function () {
        echart.resize()
      })
    }
  },
  mounted () {
    this.chart(this.title, this.chartData)
    // let totalInt = parseInt(this.total)
    // let usableInt = parseInt(this.usable)
  }
}
</script>

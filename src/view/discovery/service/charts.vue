<template>
  <div ref="dom" :style="[myStyle]"></div>
</template>

<script>
import echarts from 'echarts'

export default {
  props: {
    data: null
  },
  data () {
    return {
      myStyle: {
        width: '100%',
        height: '118px'
      }
    }
  },
  beforeMount () {
    // 挂载之前根据pod数量计算图表的高度
    if (this.data.line.length / 2 > 1) {
      this.myStyle.height = this.data.line.length / 2 * 55 + 55 + 'px'
    }
  },
  watch: {
    data: {
      handler (newValue, oldValue) {
        // 监听数据变化，根据pod数量重新计算高度
        if (this.data.line.length / 2 > 1) {
          this.myStyle.height = this.data.line.length / 2 * 55 + 55 + 'px'
        }
        this.chart(newValue)
        echarts.init(this.$refs.dom).resize()
      },
      deep: true
    }
  },
  methods: {
    // https://gallery.echartsjs.com/editor.html?c=xfUGR0eT-U
    chart (data) {
      let _this = this
      // 根据计算的高度重新设置div dom元素的高
      this.$refs.dom.style.height = this.myStyle.height
      let echart = echarts.init(this.$refs.dom)
      let option = {
        tooltip: {
          trigger: 'item',
          show: true,
          // position: 'bottom',
          formatter: function (params, ticket, callback) {
            if (params.componentSubType === 'scatter') {
              return params.name
            } else if (params.componentSubType === 'lines') {
              return params.name
            }
          }
        },
        geo: {
          label: {
            emphasis: {
              show: false
            }
          },
          roam: true,
          itemStyle: {
            normal: {
              position: 'bottom',
              areaColor: '#323c48',
              borderColor: '#404a59'
            },
            emphasis: {
              areaColor: '#2a333d'
            }
          }
        },
        series: [{
          // type: 'effectScatter',
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 2,
          rippleEffect: {
            brushType: 'stroke',
            period: 70,
            scale: 26
          },
          label: {
            normal: {
              show: true,
              //   position:'top',
              formatter: '{b}',
              color: '#000'
            },
            emphasis: {
              show: true,
              // position: 'right',
              formatter: '{b}'
            }
          },
          symbolSize: 2,
          showEffectOn: 'render',
          itemStyle: {
            normal: {
              color: '#46bee9'
            }
          },
          data: data.port
        },
        {
          name: '线路',
          type: 'lines',
          coordinateSystem: 'geo',
          zlevel: 2,
          large: true,
          effect: {
            show: true,
            constantSpeed: 30,
            symbol: 'arrow', // ECharts 提供的标记类型包括 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'
            symbolSize: 6,
            trailLength: 0
          },

          lineStyle: {
            normal: {
              color: 'green',
              width: 2,
              opacity: 0.6,
              curveness: 0 // 线弧度
            }
          },
          data: data.line
        }]
      }
      echart.setOption(option)
      // 避免出发多次事件
      echart.off('click')
      echart.on('click', function (params) {
        let name = params.name
        if (params.data.rank === 'pod') {
          const route = {
            name: 'podinfo',
            params: {
              'podName': name
            }
          }
          _this.$router.push(route)
        }
      })
      window.addEventListener('resize', function () {
        echart.resize()
      })
    }
  },
  mounted () {
    this.chart(this.data)
  }
}
</script>

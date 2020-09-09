<template>
  <div style="margin: 0px 10px">
    <div ref="dom" :style="[myStyle]"></div>
  </div>
</template>

<script>
import echarts from 'echarts'

export default {
  props: {
    data: null,
    title: '',
    name: '',
    time: null
  },
  data () {
    return {
      myStyle: {
        width: '100%',
        height: '220px'
      }
    }
  },
  watch: {
    data: {
      handler (newValue, oldValue) {
        this.chart(newValue)
        echarts.init(this.$refs.dom).resize()
      },
      deep: true
    }
  },
  methods: {
    // https://gallery.echartsjs.com/editor.html?c=xfUGR0eT-U
    chart (data) {
      // 根据计算的高度重新设置div dom元素的高
      this.$refs.dom.style.height = this.myStyle.height
      let echart = echarts.init(this.$refs.dom)

      let time = []
      function initDate (value) { // 时间格式化
        if (value <= 9) {
          return '0' + value
        } else {
          return value
        }
      }
      for (let i = 5; i >= 0; i--) { // X轴上显示多少个刻度
        let now = new Date((+new Date() - 10 * 1000 * i)) // 10秒间隔
        time.push(initDate(now.getHours()) + ':' + initDate(now.getMinutes()) + ':' + initDate(now.getSeconds()))
      }
      let option = {
        title: {
          text: this.title + ' ' + data[5],
          left: '45%',
          top: 15
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            params = params[0]
            // var date = new Date(params.name)
            return params.name + ' ' + params.value
          },
          axisPointer: {
            animation: false
          }
        },
        xAxis: {
          type: 'category',
          // type: 'value',
          splitLine: {
            show: false
          },
          axisTick: {
            alignWithLabel: true
          },
          boundaryGap: false,
          data: time
        },
        yAxis: {
          name: this.name,
          type: 'value'
        },
        grid: {
          left: 80
        },
        series: [{
          data: data,
          type: 'line',
          smooth: true,
          areaStyle: {
            normal: {
              color: '#19be6b' // 堆叠区域颜色
            }
          },
          itemStyle: {
            normal: {
              // color: '#386db3', // 折线点的颜色
              lineStyle: {
                color: '#19be6b'
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
    this.chart(this.data)
  }
}
</script>

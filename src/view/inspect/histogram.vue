<template>
  <div>
    <div ref="dom" :style="[myStyle]"></div>
  </div>
</template>

<script>
import echarts from 'echarts'

export default {
  props: {
    data: null,
    title: ''
  },
  data () {
    return {
      item: '',
      myStyle: {
        width: '100%',
        height: '300px',
        overflowY: 'auto',
        overflowX: 'hidden'
      }
    }
  },
  beforeMount () {
    // 挂载之前根据pod数量计算图表的高度
    // if (this.data.podNumber * 50 > 500) {
    //   this.myStyle.height = this.data.podNumber * 50 + 'px'
    // }
  },
  watch: {
    data: {
      handler (newValue, oldValue) {
        // 监听数据变化，根据pod数量重新计算高度
        // if (newValue.podNumber * 50 > 500) {
        //   this.myStyle.height = newValue.podNumber * 50 + 'px'
        // }
        this.chart(newValue)
        echarts.init(this.$refs.dom).resize()
      },
      deep: true
    }
  },
  methods: {
    chart (data) {
      let check = []
      let issue = []
      let normol = []
      data.forEach((item, index) => {
        check.push(item.name)
        issue.push(item.num)
        normol.push(item.normol)
      })
      let echart = echarts.init(this.$refs.dom)
      console.log(data.check)
      let option = {
        title: [{
          text: this.title,
          x: 'left',
          textStyle: {
            fontSize: 20
          }
        }],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: [{
          left: '0%',
          right: '2%',
          // top: '65%',
          // bottom: '5%',
          containLabel: true
        }
        // {
        //   gridindex: 1,
        //   left: '48%',
        //   right: '3%',
        //   top: '65%',
        //   bottom: '5%',
        //   containLabel: true
        // }
        ],
        xAxis: [{
          type: 'value',
          axisLabel: {
            formatter: '{value}'
          },
          boundaryGap: [0, 0.01]
        }],
        yAxis: [{
          type: 'category',
          data: check,
          axisLabel: {
            interval: 0
          }
        }],
        series: [
          {
            name: '问题数量',
            type: 'bar',
            stack: '总量',
            itemStyle: {
              normal: {
                color: function (params) {
                  // let colorList = ['#0092ff', '#eba954', '#21b6b9', '#60a900', '#01949b', '#f17677']
                  // let colorList = ['#60a900']
                  let colorList = ['#8d7fec', '#5085f2', '#e75fc3', '#32c5e9', '#f2719a', '#fca4bb',
                    '#f59a8f', '#fdb301', '#9fe6b8', '#cf9ef1',
                    '#fb7293', '#ffdb5c']
                  return colorList[params.dataIndex]
                }
              }
            },
            label: {
              normal: {
                show: true,
                position: 'insideRight'
              }
            },
            data: issue
          }
          // {
          //   name: '正常数量',
          //   type: 'bar',
          //   stack: '总量',
          //   itemStyle: {
          //     normal: {
          //       color: '#19be6b'
          //     }
          //   },
          //   label: {
          //     normal: {
          //       show: true,
          //       position: 'insideRight'
          //     }
          //   },
          //   data: normol
          // }
        ]
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

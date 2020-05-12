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
    title: '',
    total: 0
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
      let echart = echarts.init(this.$refs.dom)
      // https://gallery.echartsjs.com/editor.html?c=xAY5XaiBu5
      let option = {
        title: [{
          text: this.title,
          x: 'left',
          textStyle: {
            fontSize: 20
          }
        },
        {
          text: '问题总数',
          subtext: this.total + '个',
          textStyle: {
            fontSize: 20,
            color: 'black'
          },
          subtextStyle: {
            fontSize: 18,
            color: 'black'
          },
          textAlign: 'center',
          x: '19.5%',
          y: '43%'
        }],
        dataset: {
          source: data
        },
        color: ['#d74e67', '#0092ff', '#eba954', '#21b6b9', '#60a900', '#01949b', '#f17677'],
        grid: {
          left: '40%',
          top: '10%',
          bottom: 0,
          right: '5%',
          containLabel: true
        },
        xAxis: [{
          show: false
        },
        {
          show: false
        }
        ],
        yAxis: {
          type: 'category',
          inverse: true,
          show: false
        },

        series: [{
          tooltip: {
            trigger: 'item',
            formatter: '{b} : {c} ({d}%)'
          },
          type: 'pie',
          center: ['20%', '50%'],
          radius: ['48%', '60%'],
          avoidLabelOverlap: false,

          label: {
            normal: {
              formatter: '{b|{b}}\n{d}%',
              // formatter: '{b|{b}:}  {per|{d}%} ',
              rich: {
                'a': {
                  'color': '#999',
                  'lineHeight': 22,
                  'align': 'center'
                },
                'hr': {
                  'borderColor': '#aaa',
                  'width': '100%',
                  'borderWidth': 1,
                  'height': 0
                },
                'b': {
                  // 'color': '#b3e5ff',
                  'fontSize': 14,
                  'lineHeight': 30
                },
                'c': {
                  'fontSize': 14,
                  'color': '#eee'
                },
                'per': {
                  'color': '#FDF44E',
                  'fontSize': 14,
                  'padding': [0, 5],
                  'borderRadius': 2
                }
              }
            }
          },
          labelLine: {
            normal: {
              show: true
            }
          },
          encode: {
            itemName: 'product',
            value: 'nums'
          }
        },
        // 亮色条 百分比
        {
          show: true,
          type: 'bar',
          barGap: '-100%',
          barWidth: '30%',
          z: 2,
          color: function (params) {
            // build a color map as your need.
            let colorList = [
              '#d74e67', '#0092ff', '#eba954', '#21b6b9', '#60a900', '#01949b', '#f17677'
            ]
            return colorList[params.dataIndex]
          },
          label: {
            normal: {
              show: true,
              textStyle: {
                color: '#000',
                fontSize: 25,
                fontWeight: 'bold'
              },
              position: 'right'
            }
          },
          encode: {
            x: 'nums'
          }
        },
        // 年份
        {
          show: true,
          type: 'bar',
          xAxisIndex: 1, // 代表使用第二个X轴刻度
          barGap: '-100%',
          barWidth: '10%',
          itemStyle: {
            normal: {
              barBorderRadius: 200,
              color: 'transparent'
            }
          },
          label: {
            normal: {
              show: true,
              position: [0, '-20'],
              formatter: '{b}',
              textStyle: {
                fontSize: 14,
                color: '#333'
              }
            }
          },
          encode: {
            y: 'product'
          }
        }
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

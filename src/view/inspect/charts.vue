<template>
  <div>
    <div ref="dom" :style="[myStyle]"></div>
  </div>
</template>

<script>
import echarts from 'echarts'

export default {
  props: {
    data: null
  },
  data () {
    return {
      item: '',
      myStyle: {
        width: '100%',
        height: '500px',
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
    // data: {
    //   handler (newValue, oldValue) {
    //     // 监听数据变化，根据pod数量重新计算高度
    //     if (newValue.podNumber * 50 > 500) {
    //       this.myStyle.height = newValue.podNumber * 50 + 'px'
    //     }
    //     this.chart(newValue)
    //     echarts.init(this.$refs.dom).resize()
    //   },
    //   deep: true
    // }
  },
  methods: {
    cancel () {
      this.modalShow = false
    },
    chart (data) {
      let echart = echarts.init(this.$refs.dom)
      let option = {
        title: [{
          text: '内外块粉比',
          x: '19.8%',
          y: '30%',
          textAlign: 'center',
          textBaseline: 'middle',
          textStyle: {
            fontSize: 20
          }
        },
        {
          text: '块粉比',
          x: '49.8%',
          y: '30%',
          textAlign: 'center',
          textBaseline: 'middle',
          textStyle: {
            fontSize: 20
          }
        },
        {
          text: '内外比',
          x: '79.8%',
          y: '30%',
          textAlign: 'center',
          textBaseline: 'middle',
          textStyle: {
            fontSize: 20
          }
        },
        {
          text: '内外比',
          x: '79.8%',
          y: '30%',
          textAlign: 'center',
          textBaseline: 'middle',
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
          right: '55%',
          top: '65%',
          bottom: '5%',
          containLabel: true
        },
        {
          gridindex: 1,
          left: '48%',
          right: '3%',
          top: '65%',
          bottom: '5%',
          containLabel: true
        }],
        series: [
          {
            name: '大煤种',
            type: 'pie',
            center: ['20%', '30%'],
            radius: ['15%', '20%'],
            label: {
              normal: {
                formatter: '{c} ({d}%)'
              }
            },
            data: [{
              value: 9182.57,
              name: '外销块煤'
            },
            {
              value: 4202.42,
              name: '内销块煤'
            },
            {
              value: 6361.68,
              name: '外销面煤'
            },
            {
              value: 11489.29,
              name: '内销面煤'
            }]
          },
          {
            name: '块粉比',
            type: 'pie',
            center: ['50%', '30%'],
            radius: ['15%', '20%'],
            label: {
              normal: {
                formatter: '{c} ({d}%)'
              }
            },
            data: [{
              value: 13384.99,
              name: '块煤'
            },
            {
              value: 17850.97,
              name: '面煤'
            }]
          },
          {
            name: '内外比',
            type: 'pie',
            center: ['80%', '30%'],
            radius: ['15%', '20%'],
            label: {
              normal: {
                formatter: '{c} ({d}%)'
              }
            },
            data: [{
              value: 15544.25,
              name: '外销'
            },
            {
              value: 15691.71,
              name: '内销'
            }]
          },
          {
            name: '内外比',
            type: 'pie',
            center: ['20%', '60%'],
            radius: ['15%', '20%'],
            label: {
              normal: {
                formatter: '{c} ({d}%)'
              }
            },
            data: [{
              value: 15544.25,
              name: '外销'
            },
            {
              value: 15691.71,
              name: '内销'
            }]
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

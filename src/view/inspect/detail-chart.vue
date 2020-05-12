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
    cancel () {
      this.modalShow = false
    },
    chart (data) {
      let echart = echarts.init(this.$refs.dom)
      // https://gallery.echartsjs.com/editor.html?c=xB14W3PDJW
      let option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}:({d}%)'
        },
        series: [{
          name: '一级指标',
          type: 'pie',
          selectedMode: 'single',
          radius: [0, '30%'],

          label: {
            normal: {
              position: 'inner'
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          data: [{
            value: 2,
            name: '应急管理组织指标'
          }, {
            value: 8,
            name: '应急管理对象指标'
          }, {
            value: 18,
            name: '应急管理能力指标'
          }, {
            value: 16,
            name: '应急管理态势指标'
          }, {
            value: 40,
            name: '应急管理效能指标'
          }]
        }, {
          name: '二级指标',
          type: 'pie',
          radius: ['32%', '60%'],
          label: {
            normal: {
              position: 'outer'
            }
          },
          data: [{
            value: 1,
            name: '应急机构组成情况'
          }, {
            value: 1,
            name: '应急知识准备情况'
          }, {
            value: 5,
            name: '危险源和风险隐患区情况'
          }, {
            value: 3,
            name: '防护目标情况'
          }, {
            value: 7,
            name: '应急保障资源情况'
          }, {
            value: 5,
            name: '应急管理专家情况'
          }, {
            value: 3,
            name: '应急避险场所情况'
          }, {
            value: 3,
            name: '应急预案情况'
          }, {
            value: 2,
            name: '预警信息上报情况'
          }, {
            value: 5,
            name: '突发事件情况'
          }, {
            value: 4,
            name: '应急事件级别情况'
          }, {
            value: 5,
            name: '应急事件处置情况'
          }, {
            value: 36,
            name: '街道应急管理工作效能情况'
          }, {
            value: 4,
            name: '区级应急管理工作效能情况'
          }]
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

<template>
    <div ref="dom"></div>
</template>

<script>
import echarts from 'echarts'
// import { on, off } from '@/libs/tools'
import { getPodStatus } from '@/api/dashboard'
export default {
  data () {
    return {
      dom: null,
      statusPod: []
    }
  },
  // props: {
  //   statusPod: null
  // },
  methods: {
    // resize () {
    //   this.dom.resize()
    // }
  },
  mounted () {
    getPodStatus().then(res => {
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          top: 10,
          data: ['Pending', 'Running', 'Succeeded', 'Failed', 'Unknown']
        },
        series: [
          {
            name: 'Pod',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['60%', '50%'],
            avoidLabelOverlap: false,
            color: ['#ff9900', '#19be6b', '#2db7f5', '#ed4014', '#dcdee2'],
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '15',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: res.data
          }
        ]
      }
      let echart = echarts.init(this.$refs.dom)
      echart.setOption(option)
      window.addEventListener('resize', function () {
        echart.resize()
      })
    })
  }
  // beforeDestroy () {
  //   off(window, 'resize', this.resize())
  // }
}
</script>

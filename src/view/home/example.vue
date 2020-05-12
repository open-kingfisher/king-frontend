<template>
    <div ref="dom"></div>
</template>

<script>
import echarts from 'echarts'
// import { on, off } from '@/libs/tools'
export default {
  data () {
    return {
      dom: null
    }
  },
  methods: {
    // resize () {
    //   this.dom.resize()
    // }
  },
  mounted () {
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      color: ['#2D8CF0', '#8352BE', '#F09252'],
      series: [
        {
          name: 'Deployment',
          type: 'pie',
          radius: ['30%', '40%'],
          label: {
            normal: {
              position: 'inner'
            }
          },
          data: [
            { value: 10, name: 'Running', color: '#2D8CF0' },
            { value: 90, name: 'Failed', color: '#8352BE' }
          ]
        },
        {
          name: 'Replica Sets',
          type: 'pie',
          radius: ['50%', '60%'],
          data: [
            { value: 60, name: 'Running' },
            { value: 40, name: 'Failed' }
          ]
        },
        {
          name: 'Pods',
          type: 'pie',
          radius: ['70%', '80%'],
          data: [
            {
              value: '100',
              name: 'Pods',
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                  normal: {
                    color: '#dc1439'
                  }
                }
              }
            },
            { value: 0, name: 'Failed' }
          ]
        }
      ]
    }
    let echart = echarts.init(this.$refs.dom)
    echart.setOption(option)
    window.addEventListener('resize', function () {
      echart.resize()
    })
  }
  // beforeDestroy () {
  //   off(window, 'resize', this.resize())
  // }
}
</script>

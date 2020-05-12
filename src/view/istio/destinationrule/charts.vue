<template>
  <div>
    <div ref="dom" :style="[myStyle]"></div>
  </div>
</template>

<script>
import echarts from 'echarts'
import YamlModal from '../../other-page/yaml-editor.vue'
import { hasPermission } from '@/router/permission'

export default {
  components: {
    YamlModal
  },
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
      },
      title: '编辑',
      modalShow: false,
      editShow: false,
      formItem: {
        domain: '',
        path: ''
      },
      ruleValidate: {
        domain: {
          required: true,
          message: '该项不能为空',
          trigger: 'change'
        },
        path: {
          required: true,
          message: '该项不能为空',
          trigger: 'change'
        }
      }
    }
  },
  beforeMount () {
    // 挂载之前根据pod数量计算图表的高度
    if (this.data.podNumber * 50 > 500) {
      this.myStyle.height = this.data.podNumber * 50 + 'px'
    }
  },
  watch: {
    data: {
      handler (newValue, oldValue) {
        // 监听数据变化，根据pod数量重新计算高度
        if (newValue.podNumber * 50 > 500) {
          this.myStyle.height = newValue.podNumber * 50 + 'px'
        }
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
    show () {
      // this.modalShow = true
      // this.editShow = true
    },
    // https://gallery.echartsjs.com/editor.html?c=xyib0o_Lpe
    chart (data) {
      let _this = this
      // 根据计算的高度重新设置div dom元素的高
      this.$refs.dom.style.height = this.myStyle.height
      let echart = echarts.init(this.$refs.dom)
      let option = {
        tooltip: {
          trigger: 'item',
          formatter: function (data) {
            if (data.value) {
              return 'Pod名称：' + data.name + '<br/>Pod地址：' + data.value.ip + '<br/>Pod所在节点：' + data.value.node + '<br/>Pod状态：' + data.value.status
            } else {
              return data.name
            }
          },
          triggerOn: 'mousemove'
        },
        series: [{
          type: 'tree',
          initialTreeDepth: -1,
          expandAndCollapse: false, // 点击不折叠
          data: [data],

          top: 40,
          left: 20,
          bottom: 25,
          right: '31%',

          symbolSize: 13,
          itemStyle: {
            color: '#19be6b', // 这是节点折叠时候的颜色
            borderColor: '#19be6b',
            borderWidth: 2
          },

          label: {
            normal: {
              position: 'top',
              verticalAlign: 'middle',
              align: 'left',
              color: 'black',
              distance: 13, // 文本对图像的距离
              fontSize: 13
              // formatter: ['{name|{b}}', '{name|{b}}'].join('\t'),
              // rich: {
              //   type: {
              //     fontWeight: 'bold',
              //     fontSize: '14'
              //   },
              //   name: {
              //     color: '#999',
              //     fontSize: '13'
              //   }
              // }
            }
          },

          leaves: {
            label: {
              normal: {
                position: 'right',
                verticalAlign: 'middle',
                align: 'left'
              }
            }
          }
        }]
      }
      echart.setOption(option)
      window.addEventListener('resize', function () {
        echart.resize()
      })
      // 避免出发多次事件
      echart.off('click')
      echart.on('click', function (params) {
        let name = params.name
        if (params.data.rank === 'pod' && hasPermission('pod')) {
          const route = {
            name: 'podinfo',
            params: {
              'podName': name
            }
          }
          _this.$router.push(route)
        } else if (params.data.rank === 'deployment') {
          _this.show()
        } else if (params.data.rank === 'node' && hasPermission('node')) {
          const route = {
            name: 'nodedetail',
            params: {
              'nodename': name
            }
          }
          _this.$router.push(route)
        } else if (params.data.rank === 'service' && hasPermission('service')) {
          console.log(name.split(':')[0])
          const route = {
            name: 'serviceinfo',
            params: {
              'servicename': name.split(':')[0]
            }
          }
          _this.$router.push(route)
        } else {
          _this.show()
        }
      })
    }
  },
  mounted () {
    this.chart(this.data)
  }
}
</script>

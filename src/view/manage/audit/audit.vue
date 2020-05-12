<template>
  <div>
    <Card shadow>
      <SearchTable :columns="columns" :data="data">
         <ButtonGroup>
          <Button @click="refresh()" type="success" ghost>{{ this.$t('refresh') }}</Button>
        </ButtonGroup>
      </SearchTable>
    </Card>
    <Drawer
      :draggable=true
      :closable=false
      v-model="editShow"
      :scrollable=true
      width="50">
      <div slot="header">
        <span>数据</span>
        <ButtonGroup style="float: right; margin-top: -5px">
        <Button @click="yaml()" size="small" :type="yamlType">Yaml</Button>
        <Button @click="json()" size="small" :type="jsonType">Json</Button>
      </ButtonGroup>
      </div>
      <YamlModal :editorContent="editorContent" @change="change" :editorLang="editorLang"></YamlModal>
      <div class="drawer-footer" style="margin-bottom: 1px">
        <Button type="primary" style="margin-right: 5px" @click="editShow = false">{{this.$t('cancel')}}</Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
import SearchTable from '../../other-page/search-table.vue'
import YamlModal from '@/view/other-page/yaml-editor.vue'
import { getAuditLog, getAllCluster } from '../../../api/manage'
import { forEach } from '../../../libs/tools'
import { formatTimestamp } from '../../../api/tools'
const json2yaml = require('json2yaml')
const yaml2json = require('js-yaml')

export default {
  components: {
    SearchTable,
    YamlModal
  },
  mounted () {
    this.$store.commit('setClusterSelect', true)
    this.formatTableData()
  },
  data () {
    return {
      yamlType: 'success',
      jsonType: 'default',
      JsonFormat: false,
      YamlFormat: true,
      editorLang: '',
      editorContent: 'yaml',
      editShow: false,
      searchVal: '',
      updateYaml: '',
      originYaml: '',
      createModalData: null,
      createModalShow: false,
      columns: [
        {
          title: '用户',
          key: 'user',
          fixed: 'left',
          width: 120
        },
        {
          title: this.$t('action'),
          width: 100,
          fixed: 'left',
          key: 'action_type'
        },
        {
          title: '操作对象',
          width: 140,
          key: 'type'
        },
        {
          title: '名称',
          width: 300,
          key: 'name'
        },
        // {
        //   title: '产品线ID',
        //   width: 180,
        //   key: 'product_id'
        // },
        {
          title: '时间',
          width: 150,
          key: 'action_time',
          sortable: true,
          sortType: 'desc',
          fixed: 'right'
        },
        {
          title: '命名空间',
          width: 180,
          key: 'namespace'
        },
        {
          title: '集群',
          key: 'cluster',
          width: 220
        },
        {
          title: '方式',
          key: 'postType',
          width: 100
        },
        {
          title: '信息',
          minWidth: 100,
          key: 'msg'
          // render: (h, params) => {
          //   if (params.row.msg !== '-') {
          //     return h(
          //       'Tag',
          //       {
          //         style: {
          //           textAlign: 'center',
          //           padding: '1px'
          //         },
          //         nativeOn: {
          //           mouseenter: () => {
          //             this.$Modal.info({
          //               title: '失败原因',
          //               content: params.row.msg
          //             })
          //           }
          //         },
          //         props: {
          //           color: 'geekblue'
          //         }
          //       },
          //       '详情'
          //     )
          //   } else {
          //     return h('div', params.row.msg)
          //   }
          // }
        },
        {
          title: '数据',
          key: 'json',
          width: 100,
          render: (h, params) => {
            if (params.row.json !== '-') {
              return h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                    ghost: true
                  },
                  on: {
                    click: () => {
                      this.editShow = true
                      this.type = 'success'
                      this.originYaml = params.row.json
                      this.editorLang = 'yaml'
                      this.editorContent = json2yaml.stringify(this.originYaml)
                    }
                  }
                },
                '详情'
              )
            } else {
              return h('div', params.row.json)
            }
          }
        },
        {
          title: '结果',
          width: 100,
          key: 'result'
        }
      ],
      data: []
    }
  },
  methods: {
    // yaml转json
    json () {
      this.yamlType = 'default'
      this.jsonType = 'success'
      this.editorLang = 'json'
      this.editorContent = yaml2json.load(this.updateYaml)
    },
    // json转yaml
    yaml () {
      // 如果已经是yaml文件不在执行格式化
      if (this.yamlType !== 'success') {
        this.yamlType = 'success'
        this.jsonType = 'default'
        this.editorLang = 'yaml'
        this.editorContent = json2yaml.stringify(JSON.parse(this.updateYaml))
      }
    },
    edit () {
      this.yamlType = 'success'
      this.jsonType = 'default'
      this.updateYaml = ''
      this.originYaml = ''
      this.editShow = true
      this.optionTitle = '查看'
      this.option = 'edit'
    },
    // 监听子组件的change事件
    change (content) {
      this.updateYaml = content
    },
    cancel () {
      this.modalShow = false
    },
    formatTableData () {
      let params = {
        productId: 100
      }
      getAllCluster(params).then(res => {
        let cluster = {}
        forEach(res.data, (item, index) => {
          cluster[item.id] = item.name
        })
        getAuditLog().then(res => {
          let data = []
          forEach(res.data, (item, index) => {
            data.push({
              action_time: formatTimestamp(item.action_time) || '-',
              action_type: item.action_type || '-',
              cluster: cluster[item.cluster] || '-',
              id: item.id || '-',
              json: item.json || '-',
              msg: item.msg || '-',
              name: item.name || '-',
              namespace: item.namespace || '-',
              product_id: item.product_id || '-',
              result: item.result ? '成功' : '失败',
              type: item.type || '-',
              user: item.user || '-',
              postType: item.post_type || '-'
            })
          })
          this.data = data
        })
      })
    },
    refresh () {
      this.formatTableData()
      this.$Message.success(this.$t('refresh_success'))
    }
  }
}
</script>

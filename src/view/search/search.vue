<template>
  <div>
    <information info="搜索：可以全局检索此平台上的所有资源。"></information>
    <Card shadow>
      <Row>
        <Col span="24">
          <div style="margin: 13px 13px 0px 13px">
            <Input v-model="searchData" search enter-button placeholder="全局搜索，暂时支持Pod IP、Pod名、节点IP、节点名搜索" @on-search=formatTableData />
          </div>
        </Col>
      </Row>
      <SearchTable :loading="loading" :columns="columns" :data="tableData">
      </SearchTable>
    </Card>
  </div>
</template>
<script>
import { Get } from '@/api/search'
import Information from '@/view/other-page/information.vue'
import SearchTable from '@/view/other-page/search-table.vue'

export default {
  components: {
    Information,
    SearchTable
  },
  data () {
    return {
      searchData: '',
      loading: false,
      columns: [
        {
          title: this.$t('product'),
          key: 'product',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              params.row.product.map(item => {
                return h(
                  'Tag',
                  {
                    style: {
                      textAlign: 'center'
                    },
                    props: {
                      color: 'success'
                    }
                  },
                  item
                )
              })
            )
          }
        },
        {
          title: this.$t('cluster'),
          key: 'cluster'
        },
        {
          title: this.$t('namespace'),
          key: 'namespace'
        },
        {
          title: this.$t('hostIp'),
          key: 'hostIp'
        },
        {
          title: this.$t('nodeName'),
          key: 'nodeName'
        },
        {
          title: this.$t('kind'),
          key: 'kind',
          render: (h, params) => {
            return h(
              'ul',
              {
                style: {
                  listStyle: 'none'
                }
              },
              Object.keys(params.row.kind).map(item => {
                return h(
                  'Tag',
                  {
                    style: {
                      textAlign: 'center'
                    },
                    props: {
                      color: 'success'
                    }
                  },
                  item + ' | ' + params.row.kind[item]
                )
              })
            )
          }
        },
        {
          title: 'Pod',
          key: 'pod',
          render: (h, params) => {
            return h(
              'Tag',
              {
                style: {
                  textAlign: 'center'
                },
                props: {
                  color: 'success'
                }
              },
              params.row.pod
            )
          }
        },
        {
          title: 'IP',
          key: 'podIp'
        }
      ],
      tableData: []
    }
  },
  mounted () {
    this.$store.commit('setClusterSelect', false)
  },
  methods: {
    formatTableData () {
      this.loading = true
      this.tableData = []
      Get({
        productId: 100,
        resourceName: this.searchData
      }).then(res => {
        res.data.forEach((item, index) => {
          this.tableData.push({
            product: item.product,
            cluster: item.cluster,
            namespace: item.namespace,
            hostIp: item.hostIp,
            kind: item.kind,
            pod: item.pod,
            podIp: item.podIp,
            nodeName: item.nodeName
          })
        })
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    refresh () {
      this.formatTableData()
      this.$Message.success(this.$t('refresh_success'))
    }
  }
}
</script>

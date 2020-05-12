<template>
   <SearchTable :data="tableData" :columns="columns" ></SearchTable>
</template>

<script>
import { getApplication } from '@/api/dashboard'
import SearchTable from '@/view/other-page/search-table.vue'
import { forEach } from '@/libs/tools'
export default {
  components: {
    SearchTable
  },
  name: 'application',
  data () {
    return {
      columns: [
        {
          title: this.$t('name'),
          key: 'name',
          render: (h, params) => {
            return h(
              'router-link',
              {
                props: {
                  to: {
                    name: 'deploymentinfo',
                    params: {
                      setName: 'deployment',
                      ctrl: params.row.name,
                      uid: params.row.uid
                    }
                  }
                }
              },
              params.row.name
            )
          }
        },
        {
          title: '副本数',
          key: 'replicas',
          width: 80
        },
        {
          title: 'Pods',
          key: 'pods',
          width: 80
        },
        {
          title: this.$t('create_time'),
          key: 'creationTimestamp',
          width: 150
        },
        {
          title: this.$t('update_time'),
          key: 'lastTransitionTime',
          width: 150
        }
      ],
      tableData: []
    }
  },
  mounted () {
    getApplication().then(res => {
      let data = []
      forEach(res.data, (item, index) => {
        data.push({
          status: item.status,
          name: item.name,
          replicas: item.replicas,
          // pods: item.unavailableReplicas + '/' + item.availableReplicas,
          pods: item.availableReplicas,
          creationTimestamp: item.creationTimestamp,
          lastTransitionTime: item.lastTransitionTime,
          reason: item.reason
        })
      })
      this.tableData = data
    })
  }
}
</script>

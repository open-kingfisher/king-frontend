<style scoped>
  .time {
    font-size: 14px;
    font-weight: bold;
  }

  .content {
    padding-left: 5px;
  }
</style>
<template>
  <Timeline>
    <TimelineItem v-for="(info, i) in historyData" :key="`${i}`">
      <p class="time">{{info.action_time}}</p>
      {{info.user}}
      <Tag type="border" :color=info.action_color>{{info.action_type}}</Tag>
      <Tag type="border" color="cyan">{{info.type}}</Tag>
      {{info.name}}
      <Tag type="border" :color=info.result_color>{{info.result}}</Tag>
    </TimelineItem>
  </Timeline>
</template>
<script>
import { getHistory } from '@/api/dashboard'
import { forEach } from '@/libs/tools'
import { formatTimestamp } from '@/api/tools'

export default {
  name: 'timeLine',
  data () {
    return {
      historyData: []
    }
  },
  mounted () {
    getHistory().then(res => {
      let data = []
      forEach(res.data, (item, index) => {
        data.push({
          user: item.user,
          action_time: formatTimestamp(item.action_time),
          action_type: item.action_type,
          name: item.name,
          type: item.type,
          result: item.result === true ? 'True' : 'False',
          action_color: item.action_type === 'delete' ? 'warning' : 'success',
          result_color: item.result === true ? 'green' : 'error'
        })
      })
      this.historyData = data
    })
  }
}
</script>

<style scoped>
    .time{
        font-size: 10px;
        font-weight: bold;
    }
    .content{
        padding-left: 5px;
    }
</style>

<template>
    <div>
        <Tooltip content="更新日志" placement="bottom">
          <Icon style="cursor:pointer" @click="value = true" type="md-notifications-outline" :size="23"></Icon>
        </Tooltip>
        <Drawer title="message" :closable="false" width="400" v-model="value">
          <Timeline>
            <TimelineItem color="green">
              <p class="time">message</p>
              <p class="content">message</p>

            </TimelineItem>
          </Timeline>
        </Drawer>
    </div>
</template>

<script>
export default {
  data () {
    return {
      value: false
    }
  }
}
</script>

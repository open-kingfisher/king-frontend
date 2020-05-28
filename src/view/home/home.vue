<style lang="less">
.count-style{
  font-size: 50px;
}
</style>
<template>
  <div>
    <Row :gutter=10>
      <i-col span="16">
        <i-col span="6" v-for="(infor, i) in inforCardData" :key="`infor-${i}`" style="height: 120px; padding-right: 10px">
          <info-card shadow :color="infor.color" :icon="infor.icon" :icon-size="36">
            <count-to :end="infor.count" :counterId="infor.title" count-class="count-style"/>
            <p>{{ infor.title }}</p>
          </info-card>
        </i-col>
        <i-col span="24" style="margin-top: 10px; padding-right: 10px">
          <Card shadow>
            <p slot="title">{{this.$t('deployment')}}</p>
            <application></application>
          </Card>
        </i-col>
      </i-col>
      <i-col span="8">
<!--        <Card shadow>-->
<!--          <p slot="title">状态比例</p>-->
<!--          <example style="height: 240px;"/>-->
<!--        </Card>-->
<!--        <Card shadow>-->
<!--          <p slot="title">状态比例</p>-->
<!--          <pod style="height: 240px;"/>-->
<!--        </Card>-->
         <Card shadow style="margin-top: 0px;">
          <p slot="title">{{this.$t('dynamic')}}</p>
          <time-line style="padding: 15px 15px 9px 15px;"></time-line>
        </Card>
      </i-col>
    </Row>
    <!--<Row :gutter="20" style="margin-top: 20px;">-->
      <!--<i-col span="16">-->
        <!---->
      <!--</i-col>-->
      <!--<i-col span="8">-->
       <!---->
      <!--</i-col>-->
    <!--</Row>-->
    <!--<Row :gutter="20" style="margin-top: 20px;">-->
      <!--<Col span="12">-->
            <!--<div>col-6</div>-->
        <!--<div>col-6</div>-->
      <!--</Col>-->
      <!--<Col span="12">-->
            <!--<div>col-6</div>-->
      <!--</Col>-->
    <!--</Row>-->
  </div>
</template>

<script>
import { getInfoCard } from '@/api/dashboard'
import InfoCard from '../components/info-card'
import CountTo from '../components/count-to'
import Application from './application.vue'
import TimeLine from './timeline.vue'
import Example from './example.vue'
import Pod from './pod.vue'
export default {
  name: 'home',
  components: {
    InfoCard,
    CountTo,
    Application,
    TimeLine,
    Example,
    Pod
  },
  data () {
    return {
      inforCardData: [
        { title: this.$t('node'), icon: 'md-git-network', count: 0, color: '#2d8cf0' },
        { title: this.$t('deployment'), icon: 'ios-cloud-download-outline', count: 0, color: '#9A66E4' },
        { title: this.$t('service'), icon: 'ios-timer-outline', count: 0, color: '#ff9900' },
        { title: this.$t('ingress'), icon: 'ios-settings-outline', count: 0, color: '#E46CBB' }
      ],
      statusPod: []
    }
  },
  mounted () {
    // 页面刷新后使用vuex重新获取用户权限
    this.$store.dispatch('getUserInfo')
    this.$store.commit('setClusterSelect', false)
    getInfoCard().then(res => {
      for (let i = 0; i < res.data.length; i++) {
        if (res.data[i].title === 'Node') {
          this.inforCardData[0].count = res.data[i].count
        }
        if (res.data[i].title === 'Deployment') {
          this.inforCardData[1].count = res.data[i].count
        }
        if (res.data[i].title === 'Service') {
          this.inforCardData[2].count = res.data[i].count
        }
        if (res.data[i].title === 'Ingress') {
          this.inforCardData[3].count = res.data[i].count
        }
      }
    })
  },
  methods: {
    // ...mapActions(['getUserInfo'])
  }
}
</script>

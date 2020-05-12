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
          <Icon style="cursor:pointer" type="md-notifications-outline" :size="23"></Icon>
        </Tooltip>
        <Drawer title="KingFisher 更新日志" :closable="false" width="400" v-model="value">
          <Timeline>
            <TimelineItem color="red">
              <p class="time">问题修复(2019-2周)</p>
              <p class="content">连接pod终端的bug</p>
            </TimelineItem>

            <TimelineItem >
              <p class="time">优化完善(2019-1周)</p>
              <p class="content">不健康Pod加入状态提示</p>
              <p class="content">HPA 加入当前CPU的使用率</p>
              <p class="content">优化精简组建，提升速度</p>
            </TimelineItem>

            <TimelineItem color="green">
              <p class="time">功能更新(2018-52周)</p>
              <p class="content">支持HPA相关操作</p>
              <p class="content">支持容器web terminal操作</p>
            </TimelineItem>
            <TimelineItem color="red">
              <p class="time">问题修复(2018-52周)</p>
              <p class="content">解决Product编辑列表多次点击失效</p>
              <p class="content">解决User编辑列表多次点击失效</p>
              <p class="content">解决Pod中containerStatus字段undefined导致无内容</p>
            </TimelineItem>

            <TimelineItem color="green">
              <p class="time">功能更新(2018-51周)</p>
              <p class="content">支持role</p>
              <p class="content">支持rolebind</p>
              <p class="content">支持clusterrole</p>
              <p class="content">支持clusterrolebind</p>
            </TimelineItem>
            <TimelineItem color="green">
              <p class="time">功能更新(2018-50周)</p>
              <p class="content">支持Service Account</p>
            </TimelineItem>
            <TimelineItem color="green">
              <p class="time">功能更新(2018-47、48、49周)</p>
              <p class="content">支持pvc操作</p>
              <p class="content">支持pv存储操作</p>
              <p class="content">支持storage class存储操作</p>
              <p class="content">ingress支持修改单个映射</p>
              <p class="content">同时支持yaml、json创建</p>
            </TimelineItem>
            <TimelineItem >
              <p class="time">优化完善(2018-47、48、49周)</p>
              <p class="content">Controller加入状态显示和提示</p>
              <p class="content">Controller删除相关联pod也删除</p>
              <p class="content">Controller加入状态</p>
              <p class="content">pod支持单个删除</p>
              <p class="content">pod支持查看完整信息</p>
              <p class="content">完善dashboard显示</p>
              <p class="content">副本集支持按照创建时间排序</p>
              <p class="content">引入json-patch操作，提升接口更新效率</p>
            </TimelineItem>
            <TimelineItem color="red">
              <p class="time">问题修复(2018-47、48、49周)</p>
              <p class="content">编辑器支持ctrl+v</p>
              <p class="content">登录会按照规则自动填充“级联选择器”</p>
              <p class="content">刷新时，本次会话“级联选择器”选择后自动填充</p>
              <p class="content">刷新时，由于组件（生命周期）问题，会闪“选择集群”提示信息</p>
              <p class="content">登录系统时401鉴权失败</p>
            </TimelineItem>
            <TimelineItem color="#3d0e8c">
              <p class="time">新需求(2018-49周)</p>
              <p class="content">屏蔽系统管理</p>
              <p class="content">svn备份上传的yaml</p>
              <p class="content">product、user的更新</p>
              <p class="content">cascade 问题</p>
              <p class="content">biubiu json上传</p>

            </TimelineItem>
          </Timeline>
        </Drawer>
    </div>
</template>

<script>
import { fromEvent, timer } from 'rxjs'
import { map, filter, buffer, exhaustMap } from 'rxjs/operators'
export default {
  data () {
    return {
      value: false
    }
  },
  mounted () {
    var _self = this
    const keydown$ = fromEvent(window, 'keydown')
    const double$ = keydown$.pipe(
      map(e => e.keyCode),
      filter(keyCode => keyCode === 17),
      buffer(keydown$.pipe(exhaustMap(() => timer(210)))),
      filter(x => x.length >= 2)
    )
    double$.subscribe(() => {
      _self.value = !_self.value
    })
  }

}
</script>

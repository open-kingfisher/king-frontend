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

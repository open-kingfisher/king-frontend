<template>
    <div>
        <Tooltip content="V1.0.0" placement="bottom">
          <Icon style="cursor:pointer" @click="value = true" type="md-ionic" :size="23"></Icon>
        </Tooltip>
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

<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  provide () { // 在app组件这提供一个方法
    return {
      reload: this.reload
    }
  },
  data () {
    return {
      toggleFlag: true
    }
  },
  methods: {
    reload () {
      this.toggleFlag = false
      this.$nextTick(function () {
        this.toggleFlag = true
      })
    }
  }
}
</script>

<style lang="less">
  .size {
    width: 100%;
    height: 100%;
  }

  html, body {
    .size;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }

  #app {
    .size;
  }

  // 覆盖标签底部填充
  .ivu-tabs-bar {
    margin-bottom: 0 !important;
  }

  // Modal底部填充为0
  .ivu-modal-body {
    padding: 16px 16px 0 16px !important;
  }

  .drawer-footer {
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px 0 16px;
    text-align: right;
    background: #fff;
  }
  .containers {
    display: -ms-flexbox;
    display: flex;
    align-items: center;
    padding: 10px;
    margin-bottom: 8px;
    line-height: 20px;
    background-color: #d6efe2;
    border-radius: 4px;
  }
  .ivu-tabs-nav-right {
    float: right;
    margin: 15px 5px 10px 20px;
  }
  .ivu-tabs-nav-container {
    line-height: 2.7 !important;
  }
  .ivu-card-body {
    margin: 0 !important;
  }
  .separator {
    width: 1px;
    height: 11px;
    background: #19be6b;
    margin: 0 10px 0 10px;
  }
</style>

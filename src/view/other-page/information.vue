<style>
    .information {
    display: -ms-flexbox;
    display: flex;
    align-items: center;
    padding: 10px;
    margin-bottom: 10px;
    line-height: 20px;
    background-color: #17233d;
    /*background-color: #f0faff;*/
    /*border: 1px dashed #abdcff;*/
    border-radius: 4px;
    color: #19be6b;
    font-size: 14px;
    /*font-weight: bold;*/
  }
</style>
<template>
    <div class="information">
      <Icon type="md-information-circle" size="18" style="margin-right: 3px; margin-bottom: 2px"/>
      <span style="vertical-align: middle">{{info}}</span>
      <a :href=href target="_blank">{{link}}</a>
    </div>
</template>

<script>
export default {
  props: {
    info: '',
    href: '',
    link: ''
  }
}
</script>

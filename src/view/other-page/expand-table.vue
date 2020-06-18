<template>
  <div>
    <Row class="expand-row" v-for="(v, k) in row.container" :key="'container' + k" :value="v">
      <Col span="24">
        <div class="containers" style="margin-top: 5px">
          <strong>容器名：</strong>
          <span class="expand-value">{{ v.name}}</span>
          <Divider type="vertical"/>
          <strong>镜像地址：</strong>
          <span class="expand-value">{{ v.image }}</span>
        </div>
      </Col>
    </Row>
    <Row class="expand-row" v-for="(v, k) in row.initContainers" :key="'initContainers' + k" :value="v">
      <Col span="24">
        <div class="containers" style="margin-top: 5px">
          <strong>容器名：</strong>
          <span class="expand-value">{{ v.name}}</span>
          <Divider type="vertical"/>
          <strong>镜像地址：</strong>
          <span class="expand-value">{{ v.image }}</span>
        </div>
      </Col>
    </Row>
  </div>
</template>

<script>
export default {
  props: {
    row: Object
  }
}
</script>

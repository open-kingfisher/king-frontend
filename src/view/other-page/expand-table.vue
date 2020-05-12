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
          <Divider type="vertical"/>
          <strong>原因：</strong>
          <div v-for="(container, k) in row.containerStatuses" :key="'containerStatusesReason'+ k" :value="v">
            <span class="expand-value" v-if="!container.ready && container.name == v.name">
              {{container.state.waiting.reason}}
            </span>
          </div>
          <Divider type="vertical"/>
          <strong>信息：</strong>
          <div v-for="(container, k) in row.containerStatuses" :key="'containerStatuses'+ k" :value="v">
            <span class="expand-value" v-if="!container.ready && container.name == v.name">
              {{ container.state.waiting.message }}
            </span>
          </div>
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
          <Divider type="vertical"/>
          <strong>原因：</strong>
          <div v-for="(container, k) in row.initContainerStatuses" :key="'initContainerStatusesReason' + k" :value="v">
            <span class="expand-value" v-if="!container.ready && container.name == v.name && container.state.waiting">
              {{container.state.waiting.reason}}：{{ container.state.waiting.message }}
            </span>
          </div>
          <Divider type="vertical"/>
          <strong>信息：</strong>
          <div v-for="(container, k) in row.initContainerStatuses" :key="'initContainerStatuses' + k" :value="v">
            <span class="expand-value" v-if="!container.ready && container.name == v.name && container.state.terminated">
              {{container.state.terminated.reason}}：{{ container.state.terminated.message }}
            </span>
          </div>
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

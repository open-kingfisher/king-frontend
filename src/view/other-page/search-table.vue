<style scoped>
.col-gutter {
  margin: 10px;
}
</style>
<template>
  <div style="padding: 3px">
    <Row class="col-gutter">
      <Col span="8">
        <div>
          <Input v-model="searchVal" placeholder="搜索">
            <Button slot="append" icon="ios-search" @click="changeNodeList(state, { key: null, val: searchVal })"></Button>
          </Input>
        </div>
      </Col>
      <Col style="float:right">
        <slot></slot>
      </Col>
    </Row>
    <Row class="col-gutter">
      <Col span="24">
        <Table @on-selection-change="onTableSelect" border stripe :data="tableData" :columns="columns" :loading="loading"></Table>
      </Col>
    </Row>
    <Row class="col-gutter" type="flex" justify="space-between">
      <Col>
        <slot name="selectAll"></slot>
      </Col>
      <Col>
        <Page @on-page-size-change="pageSizeChange" :page-size="pageSize" @on-change="pageChange" :current="curPage"
              :page-size-opts="[5,10,20,30,50]" :total="this.state.nodeList.length" show-elevator show-sizer
              show-total/>
      </Col>
    </Row>
  </div>
</template>

<script>
import { forEach, isContains } from '../../libs/tools'

export default {
  props: {
    columns: {
      type: Array,
      required: true
    },
    data: {
      required: true,
      default: () => []
    },
    loading: false
  },
  computed: {
    tableData () {
      let array = this.state.nodeList
      // 进行排序
      array.sort(this.sortUpDate)
      let offset = (this.curPage - 1) * this.pageSize
      return array.slice(offset, offset + this.pageSize)
      // return this.state.nodeList;
    }
  },
  mounted () {
    this.initNodeList(this.state, this.data)
    this.$watch('data', newValue => {
      this.initNodeList(this.state, newValue)
    })
  },
  data () {
    return {
      curPage: 1,
      pageSize: 10,
      state: {
        nodeList: [],
        backupList: [],
        keyword: ''
      },
      searchVal: '',
      backupData: null
    }
  },
  watch: {
    searchVal (newVal, oldVal) {
      if (newVal.length === 0) {
        this.changeNodeList(this.state, null)
        return
      }
      this.changeNodeList(this.state, { key: null, val: newVal })
    }
  },
  methods: {
    sortDownDate (a, b) {
      return Date.parse(a.create_time) - Date.parse(b.create_time)
    },
    sortUpDate (a, b) {
      return Date.parse(b.create_time) - Date.parse(a.create_time)
    },
    pageSizeChange (newPageSize) {
      this.pageSize = newPageSize
    },
    onTableSelect (selection) {
      this.$emit('on-selection-change', selection)
    },
    pageChange (newPage) {
      this.curPage = newPage
    },
    initNodeList (state, nodeList) {
      state.nodeList = nodeList
      state.backupList = nodeList
    },
    changeNodeList (state, payload) {
      if (payload) {
        if (payload.key) {
          // key不为空，指定搜索
          let table = []
          forEach(state.backupList, (item, index) => {
            isContains(item[payload.key], payload.val) && table.push(item)
          })
          state.nodeList = [...new Set(table)]
        } else {
          // key为null，全局搜索
          let table = []
          forEach(state.backupList, (item, index) => {
            forEach(Object.values(item), (val, index) => {
              let subval = payload.val

              const rFindStr = (val, subval) => {
                // TODO 如果val 的类型是数组，触发bug
                if (Object.prototype.toString.call(val) === '[object Object]') {
                  rFindStr(Object.values(val), subval)
                }
                let fullstr = JSON.stringify(val)
                return isContains(fullstr, subval)
              }
              rFindStr(val, subval) && table.push(item)
            })
          })
          state.nodeList = [...new Set(table)]
        }
      } else {
        // 搜索为空
        state.nodeList = state.backupList
      }
      this.curPage = 1
    }
  }
}
</script>

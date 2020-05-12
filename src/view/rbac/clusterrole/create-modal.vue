<style>
</style>

<template>
  <Modal
    slot="option"
    v-model="modalShow"
    @on-visible-change="visibleChange"
    :footer-hide="true"
    width="600px"
    :mask-closable="false"
    :closable="false"
    :styles="{top: '5px'}"
  >
    <Row type="flex" justify="end" style="margin:1px;">
      <Col span="1">
        <Icon type="ios-close" size="30" style="cursor:pointer" @click="CancelBtnClick"/>
      </Col>
    </Row>
    <Row type="flex" justify="start">
      <Col span="23">
        <Form ref="formDynamicKV" :model="formDynamicKV" :label-width="80">
          <FormItem label="名称">
            <Col span="17">
              <Input v-model="formDynamicKV.secretName" placeholder="请输入Secret的名称"></Input>
            </Col>
          </FormItem>

          <FormItem
            v-for="(item, index) in formDynamicKV.items"
            :key="index"
            :label="'键值对 ' + (index+1)"
          >
            <Row>
              <Col span="17">
                <Input v-model="item.key" placeholder="请输入key"></Input>
              </Col>
              <Col span="5" offset="2">
                <ButtonGroup>
                  <Button
                    type="dashed"
                    size="small"
                    @click="handleAdd('formDynamicKV')"
                    icon="md-add"
                  ></Button>
                  <Button
                    type="dashed"
                    size="small"
                    @click="handleRemove('formDynamicKV',index)"
                    icon="md-close"
                  ></Button>
                </ButtonGroup>
              </Col>
            </Row>
            <Row style="margin-top:15px">
              <Col span="22">
                <Input
                  v-model="item.val"
                  type="textarea"
                  :autosize="{minRows: 1,maxRows: 5}"
                  placeholder="请输入value"
                ></Input>
              </Col>
            </Row>
          </FormItem>

          <FormItem>
            <Row type="flex" justify="end">
              <Col span="4">
                <Button style="margin-left: 8px" @click="CancelBtnClick">{{this.$t('cancel')}}</Button>
              </Col>
              <Col span="3">
                <Button type="primary" @click="OkBtnClick">{{this.$t('commit')}}</Button>
              </Col>
            </Row>
          </FormItem>
        </Form>
      </Col>
    </Row>
  </Modal>
</template>

<script>
// import { forEach } from '@/libs/tools'
import { createSecret } from '@/api/configuration'
export default {
  props: {
    modalShow: null
  },
  data () {
    return {
      formDynamicKV: {
        secretName: '',
        items: [
          {
            val: '',
            key: '',
            index: 1
          }
        ]
      }
    }
  },

  methods: {
    visibleChange (x) {
      const resetFields = () => {
        this.formDynamicKV = {
          secretName: '',
          items: [
            {
              val: '',
              key: '',
              index: 1
            }
          ]
        }
      }
      resetFields()
      if (!x) this.createModalMsg(false)
    },
    CancelBtnClick () {
      this.createModalMsg(false)
    },
    OkBtnClick () {
      if (!this.formDynamicKV.secretName) {
        this.$Notice.warning({
          title: '请检查输入是否有空值',
          duration: 4
        })
        return
      }

      let createJson = {}

      for (let i = 0; i < this.formDynamicKV.items.length; i++) {
        let item = this.formDynamicKV.items[i]
        if (!item.key || !item.val) {
          this.$Notice.warning({
            title: '请检查输入是否有空值',
            duration: 4
          })
          return
        } else {
          createJson[item['key']] = item['val']
        }
      }

      let params = {
        productId: 100,
        namespace: this.$store.getters.currentNamespaceName,
        secretName: this.formDynamicKV.secretName,
        createJson: createJson
      }

      createSecret(params).then(res => {
        if (res.code === 200 && res.msg === '') {
          this.$Message.loading({
            content: this.$t('action_success'),
            duration: 3
          })
          this.createModalMsg(2)
        } else {
          this.$Message.info('操作失败')
        }
      })
    },
    createModalMsg (val) {
      // 通过$emit一个事件通知父组件来更新，父组件调用时必需传入@createModalMsg
      this.$emit('createModalMsg', val)
    },
    handleAdd (type) {
      if (type === 'formDynamicKV') {
        this.formDynamicKV.items.push({
          val: '',
          key: '',
          index: this.formDynamicKV.length + 1
        })
      }
    },
    handleRemove (type, index) {
      if (type === 'formDynamicKV') {
        this.formDynamicKV.items.splice(index, 1)
      }
    }
  }
}
</script>

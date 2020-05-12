<style>
  .drawer-footer{
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  background: #fff;
  }
</style>
<template>
  <Drawer
    title="编辑节点"
    :draggable=true
    :closable=false
    v-model="editShow"
    :scrollable=true
    width="50">
    <YamlModal :editorContent="item"></YamlModal>
    <div class="drawer-footer">
      <Button type="text" style="margin-right: 8px" @click="editShow = false">{{this.$t('cancel')}}</Button>
      <Button type="primary" @click="updateNode()">{{this.$t('commit')}}</Button>
    </div>
  </Drawer>
</template>

<script>
import YamlModal from 'yaml-editor.vue'

export default {
  components: {
    YamlModal
  },
  props: {
    editorContent: {
      type: [Object, String],
      required: false,
      default: ''
    },
    editorLang: {
      type: String,
      required: false,
      default: 'json'
    }
  },
  data () {
    return {
      editor: null,
      formatAction: null
    }
  },
  mounted () {
    this.editor = monaco.editor.create(this.$el, {
      language: this.editorLang,
      theme: 'vs-dark',
      wrappingColumn: 0,
      formatOnType: true,
      wrappingIndent: 'indent',
      wordWrap: 'off',
      automaticLayout: true,
      overviewRulerLanes: 1,
      overviewRulerBorder: true,
      minimap: {
        enabled: false
      }
    })
    // const action = this.editor.getAction('editor.action.formatDocument')
    this.editor.setValue(this.editorContent)
    this.$watch('editorContent', newValue => {
      const value = typeof (newValue) === 'object' ? JSON.stringify(newValue) : newValue
      this.editor.setValue(value)
      this.editor.getAction('editor.action.formatDocument').run()
    })

    this.editor.onDidChangeModelContent(e => {
      this.$emit('change', this.editor.getValue())
    })
  },
  methods: {}
}
</script>

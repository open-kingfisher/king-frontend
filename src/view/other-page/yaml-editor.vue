<template>
  <div style="height:100%;"></div>
<!--  <div style="height:500px;"></div>-->
</template>

<script>
import * as monaco from 'monaco-editor'
export default {
  props: {
    editorContent: {
      type: [Object, String],
      required: false,
      default: ''
    },
    editorLang: {
      type: String,
      required: false,
      default: 'yaml'
    }
  },
  data () {
    return {
      editor: null,
      aa: null,
      formatAction: null
    }
  },
  mounted () {
    this.monaco()
  },
  watch: {
    // 监听语言的改变修改语言
    editorLang (val, oldval) {
      monaco.editor.setModelLanguage(this.editor.getModel(), val)
    }
  },
  methods: {
    monaco () {
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
      })
      this.$watch('editorLang', newValue => {
        this.editor.getAction('editor.action.formatDocument').run()
      })
      this.editor.onDidChangeModelContent(e => {
        this.$emit('change', this.editor.getValue())
      })
      // this.editor.onDidChangeModelLanguage(e => {
      //   // this.editor.getAction('editor.action.formatDocument').run()
      //   this.editor.getAction('editor.action.formatDocument').run()
      //   // this.editor.trigger('anyString', 'editor.action.formatDocument')
      // })
    }
  }
}
</script>

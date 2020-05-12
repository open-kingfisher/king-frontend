<template>
  <div class="console" id="terminal"></div>
</template>

<script>
import { Terminal } from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
import * as attach from 'xterm/lib/addons/attach/attach'
import { K8S_URL_PREFIX } from '../../config/conf'
import 'xterm/dist/xterm.css'
import BASE_URL from '_conf/url'
Terminal.applyAddon(fit)
Terminal.applyAddon(attach)

export default {
  name: 'Console',
  props: {
    terminal: {
      type: Object,
      default: function () {
        return {
          pid: 1,
          name: 'terminal',
          cols: 400,
          rows: 400
        }
      },
      required: false
    },
    wsUri: {
      type: String,
      default: '',
      required: true
    }
  },
  data () {
    return {
      term: null,
      terminalSocket: null
    }
  },
  methods: {
    runRealTerminal (e) {
    },
    errorRealTerminal (e) {
      console.log('ws-error')
      console.log(e)
    },
    closeRealTerminal (e) {
      console.log('ws-close')
      console.log(e)
    }
    // messageRealTerminal (e) {
    //   console.log(e)
    // }
  },
  mounted () {
    // 重组连接url
    let baseUrl = BASE_URL.split('/')[2]
    let wsFullUrl = 'ws://' + baseUrl + K8S_URL_PREFIX + 'terminal?' + this.wsUri
    let terminalContainer = document.getElementById('terminal')
    this.term = new Terminal()
    this.term.open(terminalContainer)
    // open websocket
    this.terminalSocket = new WebSocket(wsFullUrl)
    this.terminalSocket.readyState = this.runRealTerminal
    this.terminalSocket.onclose = this.closeRealTerminal
    this.terminalSocket.onerror = this.errorRealTerminal
    // this.terminalSocket.onmessage = this.messageRealTerminal
    this.term.attach(this.terminalSocket)
    this.term._initialized = true
  },
  beforeDestroy () {
    this.terminalSocket.close()
    this.term.destroy()
  }
}
</script>

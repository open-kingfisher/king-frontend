<template>
   <div>
    <Row type="flex" justify="center" class="row" :gutter=10>
      <Col span="24">
        <Card shadow>
          <p slot="title">{{podName}} / {{containerName}} </p>
            <ButtonGroup slot="extra">
              <Button @click="termBtn('reload')" style="margin-right: 3px" type="success">重连</Button>
              <Button @click="termBtn('clear')" type="success" ghost>清屏</Button>
            </ButtonGroup>
          <div id="terminal" style="padding: 10px"></div>
        </Card>
      </Col>
    </Row>
   </div>
</template>

<script>
import { Terminal } from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
import * as attach from 'xterm/lib/addons/attach/attach'
import 'xterm/dist/xterm.css'
// import { K8S_URL_PREFIX } from '../../../../config/conf'
// import BASE_URL from '_conf/url'
import { forEach } from '../../../libs/tools'
Terminal.applyAddon(fit)
Terminal.applyAddon(attach)

export default {
  inject: ['reload'],
  data () {
    return {
      loading: false,
      term: null,
      terminalSocket: null,
      wsUri: '',
      podName: '',
      podIP: '',
      containerName: '',
      containers: '',
      container: ''
    }
  },
  methods: {
    runRealTerminal (e) {
      // this.terminalSocket.send('/usr/local/bin/attach attacher\n')
    },
    errorRealTerminal (e) {
      if (e.target.readyState !== 1) {
        this.$Notice.error({
          title: '连接失败'
        })
      }
    },
    termBtn (cmd) {
      if (cmd === 'clear') {
        this.terminalSocket.send('x\n')
        this.terminalSocket.send('clear\n')
      } else if (cmd === 'reload') {
        this.reload()
      } else if (cmd === 'connect') {
        this.connect()
      } else if (cmd === 'terminal') {
        // this.terminalSocket.send('/usr/local/bin/attach attacher\n')
      }
    },
    terminal () {
      // let baseUrl = BASE_URL.split('/')[2]
      let wsFullUrl = 'ws://' + this.podIP + ':9091/terminal?' +
        'podName=debug-pod-' + this.podName +
        '&containerName=' + 'debug-pod' +
        '&cluster=' + this.$store.getters.currentClusterId +
        '&namespace=' + this.$store.getters.currentNamespaceName
      let terminalContainer = document.getElementById('terminal')
      this.term = new Terminal({
        cols: Math.floor($(window).width() / 11),
        rows: Math.floor($(window).height() / 24),
        cursorBlink: true,
        cursorStyle: 'underline',
        scrollback: 800,
        screenKeys: true
      })
      this.term.open(terminalContainer)
      // websocket create and set hook
      this.terminalSocket = new WebSocket(wsFullUrl)
      this.terminalSocket.onopen = this.runRealTerminal
      this.terminalSocket.onerror = this.errorRealTerminal
      this.term.attach(this.terminalSocket)
      this.term._initialized = true
    }
  },
  mounted () {
    if (this.$route.params.podName) {
      this.podName = this.$route.params.podName
      localStorage.setItem('podName', this.podName)
    } else {
      this.podName = localStorage.getItem('podName')
    }
    if (this.$route.params.podIP) {
      this.podIP = this.$route.params.podIP
      localStorage.setItem('podIP', this.podIP)
    } else {
      this.podIP = localStorage.getItem('podIP')
    }
    if (this.$route.params.containerName) {
      this.containerName = this.$route.params.containerName
      localStorage.setItem('containerName', this.containerName)
    } else {
      this.containerName = localStorage.getItem('containerName')
    }
    if (this.$route.params.containers) {
      this.containers = this.$route.params.containers
      let c = []
      forEach(this.$route.params.containers, (item, index) => {
        c.push({ 'name': item.name })
      })
      localStorage.containers = JSON.stringify(c)
    } else {
      this.containers = $.parseJSON(localStorage.getItem('containers'))
    }
    this.terminal()
  },
  beforeDestroy () {
    // this.terminalSocket.close()
    this.term.destroy()
  }
}
</script>

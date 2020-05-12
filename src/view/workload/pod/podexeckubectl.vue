<template>
   <div>
    <Row type="flex" justify="center" class="row" :gutter=10>
      <Col span="24">
        <Card shadow>
          <p slot="title">{{containerName}} </p>
            <ButtonGroup slot="extra">
              <Dropdown trigger="click" style="margin-right: 5px; float: left" @on-click="changeContainer">
                <Button type="default">
                  {{containerName}}
                    <Icon type="ios-arrow-down"></Icon>
                </Button>
                <DropdownMenu slot="list" v-for="(v, k) in containers" :key="k" :value="v">
                    <DropdownItem :name="v.name">{{v.name}}</DropdownItem>
                </DropdownMenu>
              </Dropdown>
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
import { getAllPodData } from '@/api/workload'
import * as fit from 'xterm/lib/addons/fit/fit'
import * as attach from 'xterm/lib/addons/attach/attach'
import 'xterm/dist/xterm.css'
import { K8S_URL_PREFIX } from '../../../../config/conf'
import BASE_URL from '_conf/url'
Terminal.applyAddon(fit)
Terminal.applyAddon(attach)

export default {
  inject: ['reload'],
  data () {
    return {
      term: null,
      terminalSocket: null,
      wsUri: '',
      podName: '',
      containerName: 'king-kubectl',
      containers: '',
      container: ''
    }
  },
  methods: {
    // runRealTerminal (e) {
    //   console.log(e.currentTarget.readyState)
    //   console.log(e)
    //   if (e.target.readyState === 1) {
    //     this.$Notice.success({
    //       title: '连接成功'
    //     })
    //   } else {
    //     this.$Notice.error({
    //       title: '连接失败'
    //     })
    //   }
    // },
    errorRealTerminal (e) {
      if (e.type === 'error') {
        this.$Notice.error({
          title: '连接失败'
        })
      }
    },
    // closeRealTerminal (e) {
    // },
    termBtn (cmd) {
      if (cmd === 'clear') {
        this.terminalSocket.send('x\n')
        this.terminalSocket.send('clear\n')
      } else if (cmd === 'reload') {
        this.reload()
      }
    },
    changeContainer (name) {
      this.containerName = name
      this.terminalSocket.close()
      this.term.destroy()
      this.pod()
    },
    pod () {
      getAllPodData({
        productId: 100,
        cluster: this.$store.getters.currentClusterId,
        namespace: 'default'
      }).then(res => {
        res.data.forEach((item, index) => {
          if (item.metadata.name.indexOf('king-kubectl') !== -1) {
            this.podName = item.metadata.name
            this.terminal()
          }
        })
      })
    },
    terminal () {
      let baseUrl = BASE_URL.split('/')[2]
      let wsFullUrl = 'ws://' + baseUrl + K8S_URL_PREFIX + 'terminal?' +
        'podName=' + this.podName +
        '&containerName=' + this.containerName +
        '&cluster=' + this.$store.getters.currentClusterId +
        '&namespace=default'
      let terminalContainer = document.getElementById('terminal')
      this.term = new Terminal({
        cols: Math.floor($(window).width() / 11),
        rows: Math.floor($(window).height() / 24),
        cursorBlink: true, // 光标闪烁
        cursorStyle: 'underline', // 光标样式  null | 'block' | 'underline' | 'bar'
        scrollback: 800, // 回滚
        // tabStopWidth: 8, // 制表宽度
        screenKeys: true //
      })
      this.term.open(terminalContainer)
      // websocket create and set hook
      this.terminalSocket = new WebSocket(wsFullUrl)
      this.terminalSocket.onopen = this.runRealTerminal
      this.terminalSocket.onerror = this.errorRealTerminal
      // this.terminalSocket.onclose = this.closeRealTerminal
      // this.terminalSocket.onmessage = this.messageRealTerminal
      this.term.attach(this.terminalSocket)
      this.term._initialized = true
    }
  },
  mounted () {
    // if (this.$route.params.podName) {
    //   this.podName = this.$route.params.podName
    //   localStorage.setItem('podName', this.podName)
    // } else {
    //   this.podName = localStorage.getItem('podName')
    // }
    // if (this.$route.params.containerName) {
    //   this.containerName = this.$route.params.containerName
    //   localStorage.setItem('containerName', this.containerName)
    // } else {
    //   this.containerName = localStorage.getItem('containerName')
    // }
    // if (this.$route.params.containers) {
    //   this.containers = this.$route.params.containers
    //   let c = []
    //   forEach(this.$route.params.containers, (item, index) => {
    //     c.push({ 'name': item.name })
    //   })
    //   localStorage.containers = JSON.stringify(c)
    // } else {
    //   this.containers = $.parseJSON(localStorage.getItem('containers'))
    // }
    this.pod()
  },
  beforeDestroy () {
    this.terminalSocket.close()
    this.term.destroy()
  }
}
</script>

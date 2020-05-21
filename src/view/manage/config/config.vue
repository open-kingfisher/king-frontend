<template>
  <div>
    <information info="配置管理：系统配置信息包括用户认证、镜像仓库等。"></information>
    <Row type="flex" justify="center" class="row" :gutter=10>
      <Col span="24">
        <Card shadow>
          <Tabs value="status">
            <TabPane label="认证模式" name="status">
              <Card shadow>
                <Col span="18" style="margin-top: 20px; margin-left: 10px">
                 <Form ref="createForm" :model="formItem"  :label-width="120">
                   <FormItem label="认证模式" prop="mode">
                     <Select v-model="formItem.ldap.mode">
                       <Option value="local">本地认证</Option>
                       <Option value="ldap">LDAP</Option>
                     </Select>
                   </FormItem>
                   <div v-if="formItem.ldap.mode === 'ldap'">
                     <FormItem label="LDAP URL" prop="ldap.url" :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                       <Input v-model="formItem.ldap.url" placeholder="ldap://ldap.example.com389"></Input>
                     </FormItem>
                     <FormItem label="LDAP 搜索DN" prop="ldap.searchDN" :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                       <Input v-model="formItem.ldap.searchDN" placeholder="有搜索权限的LDAP用户DN。如果LDAP服务器不支持匿名搜索，则需要配置搜索密码。如：cn=example,ou=ldap,dc=example"></Input>
                     </FormItem>
                     <FormItem label="LDAP 搜索密码" prop="ldap.searchPassword" :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                       <Input type="password" v-model="formItem.ldap.searchPassword"></Input>
                     </FormItem>
                     <FormItem label="LDAP 基础DN" prop="ldap.baseDN" :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                       <Input v-model="formItem.ldap.baseDN" placeholder="用来在LDAP和AD中搜寻用户的基础DN"></Input>
                     </FormItem>
                     <FormItem label="LDAP 用户过滤器" prop="ldap.userFilter" :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">
                       <Input v-model="formItem.ldap.userFilter" placeholder="在搜索中用来匹配用户属性，可以是uid，cn，email或者其他LDAP/AD服务器支持的属性"></Input>
                     </FormItem>
<!--                     <FormItem label="LDAP 用户属性" prop="ldap.attributes" :rules="{required: true, message: '该项不能为空', trigger: 'blur'}">-->
<!--                       <Input v-model="formItem.ldap.attributes"></Input>-->
<!--                     </FormItem>-->
                     <FormItem label="LDAP 检查证书">
                       <i-switch v-model="formItem.ldap.tls" size="large" :true-value=true :false-value=false>
                         <span slot="open">开启</span>
                         <span slot="close">关闭</span>
                       </i-switch>
                     </FormItem>
                   </div>
                   <FormItem>
                     <Button type="primary" @click="save('ldap')">{{this.$t('save')}}</Button>
<!--                     <Button style="margin-left: 8px">{{this.$t('cancel')}}</Button>-->
                     <Button style="margin-left: 8px" v-if="formItem.ldap.mode === 'ldap'" @click="test('ldap')">{{this.$t('connect_ldap')}}</Button>
                   </FormItem>
                 </Form>
                </Col>
              </Card>
            </TabPane>
<!--            <TabPane label="事件" name="event">-->
<!--              <SearchTable :columns="eventColumns" :data="eventData"></SearchTable>-->
<!--            </TabPane>-->
            <div href="#" slot="extra">
              <Button @click="refresh()" type="success" size="small" ghost>{{ this.$t('refresh') }}</Button>
            </div>
          </Tabs>
        </Card>
      </Col>
    </Row>
  </div>
</template>
<script>
import {
  Get,
  Test,
  Create
} from '@/api/config'
import Information from '../../other-page/information.vue'

export default {
  components: {
    Information
  },
  data () {
    return {
      formItem: {
        ldap: {
          mode: 'local',
          url: '',
          searchDN: '',
          searchPassword: '',
          baseDN: '',
          userFilter: '',
          tls: 1,
          attributes: ''
        }
      }
    }
  },
  mounted () {
    this.$store.commit('setClusterSelect', false)
    this.formatTableData()
  },
  methods: {
    formatTableData () {
      Get({
        productId: 100,
        resourceName: 'c_000000000001'
      }).then(res => {
        this.formItem.ldap.mode = res.data.ldap.mode
        this.formItem.ldap.url = res.data.ldap.url
        this.formItem.ldap.searchDN = res.data.ldap.searchDN
        this.formItem.ldap.searchPassword = res.data.ldap.searchPassword
        this.formItem.ldap.baseDN = res.data.ldap.baseDN
        this.formItem.ldap.userFilter = res.data.ldap.userFilter
        this.formItem.ldap.tls = res.data.ldap.tls
        // this.formItem.ldap.attributes = res.data.ldap.attributes
      })
    },
    save (value) {
      let params = {}
      if (value === 'ldap') {
        params = {
          configType: 'ldap',
          ldap: {
            mode: this.formItem.ldap.mode,
            url: this.formItem.ldap.url,
            searchDN: this.formItem.ldap.searchDN,
            searchPassword: this.formItem.ldap.searchPassword,
            userFilter: this.formItem.ldap.userFilter,
            baseDN: this.formItem.ldap.baseDN,
            tls: this.formItem.ldap.tls
            // attributes: this.formItem.ldap.attributes
          }
        }
      }
      this.$refs['createForm'].validate(valid => {
        if (valid) {
          Create(params).then(res => {
            if (res.code === 200) {
              this.$Message.success({
                content: this.$t('action_success')
              })
              this.formatTableData()
            } else {
              this.$Message.error('操作失败')
            }
          })
        }
      })
    },
    test () {
      let params = {}
      params = {
        configType: 'ldap',
        ldap: {
          mode: this.formItem.ldap.mode,
          url: this.formItem.ldap.url,
          searchDN: this.formItem.ldap.searchDN,
          searchPassword: this.formItem.ldap.searchPassword,
          userFilter: this.formItem.ldap.userFilter,
          baseDN: this.formItem.ldap.baseDN,
          tls: this.formItem.ldap.tls
          // attributes: this.formItem.ldap.attributes
        }
      }
      Test(params).then(res => {
        if (res.code === 200) {
          this.$Message.success({
            content: this.$t('ldap_test_success')
          })
        } else {
          this.$Message.error('操作失败')
        }
      })
    },
    refresh () {
      this.formatTableData()
      this.$Message.success(this.$t('refresh_success'))
    }
  }
}
</script>

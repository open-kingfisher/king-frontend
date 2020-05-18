<template>
  <div>
    <Row type="flex" justify="center" class="row" :gutter=10>
      <Col span="24">
        <Card shadow>
          <Tabs value="status">
            <TabPane label="认证模式" name="status">
              <Card shadow>
                <Col span="10" style="margin-top: 20px; margin-left: 10px">
                 <Form :model="formItem" :rules="ruleValidate" :label-width="120">
                   <FormItem label="认证模式" prop="mode">
                     <Select v-model="formItem.mode">
                       <Option value="local">本地认证</Option>
                       <Option value="ldap">LDAP</Option>
                     </Select>
                   </FormItem>
                   <FormItem label="LDAP URL" prop="url">
                     <Input v-model="formItem.url" placeholder="ldap://ldap.example.com389"></Input>
                   </FormItem>
                   <FormItem label="LDAP 搜索DN" prop="searchDN">
                     <Input v-model="formItem.searchDN" placeholder="cn=example,ou=ldap,dc=example"></Input>
                   </FormItem>
                   <FormItem label="LDAP 搜索密码" prop="searchPassword">
                     <Input type="password" v-model="formItem.searchPassword"></Input>
                   </FormItem>
                   <FormItem label="LDAP 用户过滤器" prop="userFilter">
                     <Input v-model="formItem.userFilter"></Input>
                   </FormItem>
                   <FormItem label="LDAP 用户属性" prop="attributes">
                     <Input v-model="formItem.attributes"></Input>
                   </FormItem>
                   <FormItem label="LDAP 检查证书">
                     <i-switch v-model="formItem.tls" size="large">
                       <span slot="open">开启</span>
                       <span slot="close">关闭</span>
                     </i-switch>
                   </FormItem>
                   <FormItem>
                     <Button type="primary">{{this.$t('commit')}}</Button>
                     <Button style="margin-left: 8px">{{this.$t('cancel')}}</Button>
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
import SearchTable from '../../other-page/search-table.vue'
import ExpandTable from '../../other-page/expand-table.vue'
import YamlModal from '../../other-page/yaml-editor.vue'
import Information from '../../other-page/information.vue'

export default {
  components: {
    SearchTable,
    ExpandTable,
    YamlModal,
    Information
  },
  data () {
    return {
      formItem: {
        mode: '',
        url: '',
        searchDN: '',
        searchPassword: '',
        userFilter: '',
        tls: '',
        attributes: ''
      },
      ruleValidate: {
        mode: [
          { required: true, message: this.$t('not_null'), trigger: 'blur' }
        ],
        url: [
          { required: true, message: this.$t('not_null'), trigger: 'blur' }
        ],
        searchDN: [
          { required: true, message: this.$t('not_null'), trigger: 'blur' }
        ],
        searchPassword: [
          { required: true, message: this.$t('not_null'), trigger: 'blur' }
        ],
        userFilter: [
          { required: true, message: this.$t('not_null'), trigger: 'blur' }
        ],
        attributes: [
          { required: true, message: this.$t('not_null'), trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    this.$store.commit('setClusterSelect', true)
    if (this.$route.params.servicename) {
      this.servicename = this.$route.params.servicename
      localStorage.setItem('servicename', this.servicename)
    } else {
      this.servicename = localStorage.getItem('servicename')
    }
    this.formatTableData()
    this.getPodData()
  },
  methods: {
    formatTableData () {
      //
    },
    refresh () {
      // this.formatTableData()
      // this.getPodData()
      this.$Message.success(this.$t('refresh_success'))
    }
  }
}
</script>

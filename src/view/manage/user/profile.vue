<template>
  <div>
    <information info="个人中心：查看个人权限、角色、修复密码等。"></information>
    <Row type="flex" justify="center" class="row" :gutter=10>
      <Col span="24">
        <Card shadow>
          <Tabs value="status">
            <TabPane label="修改密码" name="status">
              <Card shadow>
                <Col span="18" style="margin-top: 20px; margin-left: 10px">
                 <Form ref="createForm" :model="formItem"  :label-width="80" :rules="ruleValidate">
                   <FormItem label="当前密码" prop="currentPassword">
                     <Input type="password" v-model="formItem.currentPassword"></Input>
                   </FormItem>
                   <FormItem label="新密码" prop="newPassword">
                     <Input type="password" v-model="formItem.newPassword"></Input>
                   </FormItem>
                   <FormItem label="确认密码" prop="confirm" class="ivu-form-item ivu-form-item-required">
                     <Input type="password" v-model="formItem.confirm"></Input>
                   </FormItem>
                   <FormItem>
                     <Button type="primary" @click="save('ldap')">{{this.$t('save')}}</Button>
                   </FormItem>
                 </Form>
                </Col>
              </Card>
            </TabPane>
          </Tabs>
        </Card>
      </Col>
    </Row>
  </div>
</template>
<script>
import { changePassword } from '../../../api/manage'
import Information from '../../other-page/information.vue'
import { mapActions } from "vuex"

export default {
  components: {
    Information
  },
  data () {
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('not_null')))
      } else {
        if (this.formItem.newPassword !== value) {
          callback(new Error(this.$t('password_net_mach')))
        }
        callback()
      }
    }
    return {
      formItem: {
        currentPassword: '',
        newPassword: '',
        confirm: ''
      },
      ruleValidate: {
        currentPassword: [
          { required: true, message: this.$t('not_null'), trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: this.$t('not_null'), trigger: 'blur' }
        ],
        confirm: [{ validator: validatePassword, trigger: 'blur' }]
      }
    }
  },
  mounted () {
    this.$store.commit('setClusterSelect', false)
  },
  methods: {
    ...mapActions([
      'handleLogOut'
    ]),
    save (value) {
      this.$refs['createForm'].validate(valid => {
        if (valid) {
          let params = {
            currentPassword: this.formItem.currentPassword,
            password: this.formItem.newPassword,
            userId: this.$store.state.user.userId
          }
          changePassword(params).then(res => {
            if (res.code === 200) {
              this.$Message.success({
                content: this.$t('action_success')
              })
              // 退出登录
              this.handleLogOut().then(() => {
                this.$router.push({
                  name: 'login'
                })
              })
            } else {
              this.$Message.error('操作失败')
            }
          })
        }
      })
    }
  }
}
</script>

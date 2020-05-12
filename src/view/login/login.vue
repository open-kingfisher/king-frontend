<style lang="less">
@import "./login.less";
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" style="text-align:center" :bordered="true">
        <img slot="title" src="@/assets/images/kingfisher.png" style="height:65%;width:75%">
        <div class="form-con">
          <login-form @on-success-valid="handleSubmit"></login-form>
<!--          <p class="login-tip" style="margin-bottom:5px;">Copyright&nbsp;&copy;&nbsp;2018&nbsp;MOP·运维团队</p>-->
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import LoginForm from '_c/login-form'
import { mapActions } from 'vuex'
// import { login } from '@/api/user'
export default {
  components: {
    LoginForm
  },
  methods: {
    ...mapActions(['handleLogin', 'getUserInfo']),
    handleSubmit ({ userName, password }) {
      // this.handleLogin({ userName, password }).then(res => {
      //   this.$router.push({
      //     name: 'home'
      //   })
      // })
      this.handleLogin({ userName, password }).then(res => {
        this.getUserInfo().then(res => {
          this.$router.push({
            name: 'home'
          })
        })
      })
    }
  }
}
</script>

<style>
</style>

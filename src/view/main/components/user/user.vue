<template>
  <div class="user-avator-dropdown">
    <Dropdown @on-click="handleClick">
      <a href="javascript:void(0)">
        <Avatar :src="userAvator" style="border:1px solid #ccc"/>
        {{ this.$store.state.user.userName }}
        <Icon :size="18" type="md-arrow-dropdown"></Icon>
      </a>
      <DropdownMenu slot="list">
        <DropdownItem name="profile" style="text-align: center">{{this.$t('profile')}}</DropdownItem>
        <DropdownItem name="logout" style="text-align: center">{{this.$t('logout')}}</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
import './user.less'
import { mapActions } from 'vuex'
export default {
  name: 'User',
  props: {
    userAvator: {
      type: String,
      default: ''
    }
  },
  methods: {
    ...mapActions([
      'handleLogOut'
    ]),
    handleClick (name) {
      switch (name) {
        case 'logout':
          this.handleLogOut().then(() => {
            this.$router.push({
              name: 'login'
            })
          })
          break
        case 'profile':
          this.$router.push({
            name: 'profile'
          })
          break
      }
    }
  }
}
</script>

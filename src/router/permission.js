import store from '@/store'

export const hasPermission = (permission) => {
  let access = store.state.user.access
  return access.indexOf(permission) > -1
}

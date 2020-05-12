const main = () => import('@/view/main')
const parentView = () => import('@/components/parent-view')
const login = () => import('@/view/login/login.vue')
const home = () => import('@/view/home')
const node = () => import('@/view/cluster/node/node.vue')
const nodeDetail = () => import('@/view/cluster/node/node-detail.vue')
const pvc = () => import('@/view/storage/pvc/pvc.vue')
const pvcDetail = () => import('@/view/storage/pvc/pvc-detail.vue')
const pv = () => import('@/view/storage/pv/pv.vue')
const pvDetail = () => import('@/view/storage/pv/pv-detail.vue')
const sclass = () => import('@/view/storage/sclass/sclass.vue')
const sclassDetail = () => import('@/view/storage/sclass/sclass-detail.vue')
const srvaccount = () => import('@/view/configuration/srvaccount/srvaccount.vue')
const role = () => import('@/view/rbac/role/role.vue')
const rolebind = () => import('@/view/rbac/rolebind/rolebind.vue')
const clusterrole = () => import('@/view/rbac/clusterrole/clusterrole.vue')
const clusterrolebind = () => import('@/view/rbac/clusterrolebind/clusterrolebind.vue')
const apply = () => import('@/view/application/apply/apply.vue')
const applyInfo = () => import('@/view/workload/deployment/deployment-info.vue')
const template = () => import('@/view/application/template/template.vue')
const deployment = () => import('@/view/workload/deployment/deployment.vue')
const deploymentInfo = () => import('@/view/workload/deployment/deployment-info.vue')
const pod = () => import('@/view/workload/pod/pod.vue')
const podexec = () => import('@/view/workload/pod/podexec.vue')
const podexeckubectl = () => import('@/view/workload/pod/podexeckubectl.vue')
const poddebug = () => import('@/view/workload/pod/poddebug.vue')
const podInfo = () => import('@/view/workload/pod/pod-info.vue')
const service = () => import('@/view/discovery/service/service.vue')
const serviceInfo = () => import('@/view/discovery/service/service-info.vue')
const ingress = () => import('@/view/discovery/ingress/ingress.vue')
const ingressInfo = () => import('@/view/discovery/ingress/ingress-info.vue')
const map = () => import('@/view/configuration/map/map.vue')
const secrets = () => import('@/view/configuration/secrets/secrets.vue')
const gateway = () => import('@/view/istio/gateway/gateway.vue')
const gatewayInfo = () => import('@/view/istio/gateway/gateway-info.vue')
const destinationrule = () => import('@/view/istio/destinationrule/destinationrule.vue')
const destinationruleInfo = () => import('@/view/istio/destinationrule/destinationrule-info.vue')
const virtualservice = () => import('@/view/istio/virtualservice/virtualservice.vue')
const virtualserviceInfo = () => import('@/view/istio/virtualservice/virtualservice-info.vue')
const serviceentry = () => import('@/view/istio/serviceentry/serviceentry.vue')
const serviceentryInfo = () => import('@/view/istio/serviceentry/serviceentry-info.vue')
const alert = () => import('@/view/alert/alert.vue')
const clusterPlugin = () => import('@/view/cluster-plugin/cluster-plugin.vue')
const inspect = () => import('@/view/inspect/inspect.vue')
const inspectInfo = () => import('@/view/inspect/inspect-info.vue')
const cluster = () => import('@/view/manage/cluster/cluster.vue')
const namespace = () => import('@/view/manage/namespace/namespace.vue')
const product = () => import('@/view/manage/product/product.vue')
const platformRole = () => import('@/view/manage/platform-role/platform-role.vue')
const user = () => import('@/view/manage/user/user.vue')
const plugin = () => import('@/view/manage/plugin/plugin.vue')
const audit = () => import('@/view/manage/audit/audit.vue')
const search = () => import('@/view/search/search.vue')
const errorPage401 = () => import('@/view/error-page/401.vue')
const errorPage500 = () => import('@/view/error-page/500.vue')
const errorPage404 = () => import('@/view/error-page/404.vue')

export default {
  main,
  parentView,
  login,
  home,
  node,
  nodeDetail,
  pvc,
  pvcDetail,
  pv,
  pvDetail,
  sclass,
  sclassDetail,
  srvaccount,
  role,
  rolebind,
  clusterrole,
  clusterrolebind,
  apply,
  applyInfo,
  template,
  deployment,
  deploymentInfo,
  podexec,
  podexeckubectl,
  poddebug,
  podInfo,
  service,
  serviceInfo,
  ingress,
  ingressInfo,
  pod,
  map,
  secrets,
  gateway,
  gatewayInfo,
  destinationrule,
  destinationruleInfo,
  virtualservice,
  virtualserviceInfo,
  serviceentry,
  serviceentryInfo,
  alert,
  clusterPlugin,
  inspect,
  inspectInfo,
  cluster,
  namespace,
  product,
  platformRole,
  user,
  plugin,
  audit,
  search,
  errorPage401,
  errorPage500,
  errorPage404
}

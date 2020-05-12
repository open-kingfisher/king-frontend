import Main from "@/view/main";
import parentView from '@/components/parent-view'


/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  cache: (false) 设为true后页面不会缓存
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 * }
 */

const routes = [
  {
    path: "/login",
    name: "login",
    meta: {
      title: "Login - 登录",
      hideInMenu: true
    },
    component: () => import("@/view/login/login.vue")
  },
  {
    path: '/',
    name: '_home',
    redirect: '/home',
    component: Main,
    meta: {
      hideInBread: true,
      notCache: true
    },
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          title: '首页',
          notCache: true,
          icon: 'md-home'
        },
        component: () => import('@/view/home')
      }
    ]
  },
  {
    path: "/cluster",
    name: "cluster",
    meta: {
      icon: "logo-buffer",
      title: "集群",
      access: ['cluster']
    },
    component: Main,
    children: [
      {
        path: "node",
        name: "node",
        meta: {
          icon: "md-git-network",
          title: "节点",
          cache: false,
          access: ['node']
        },
        component: () => import("@/view/cluster/node/node.vue")
      },
      {
        path: "node/:nodename",
        name: "nodedetail",
        meta: {
          title: "节点信息",
          icon: "ios-document",
          hideInMenu: true,
          cache: false,
          access: ['node']
        },
        component: () => import("@/view/cluster/node/node-detail.vue")

      },
      {
        path: "/storage",
        component: parentView,
        name: "storage",
        meta: {
          title: "存储",
          hideInMenu: false,
          icon: "ios-filing-outline",
          access: ['admin1']
        },
        children: [
          {
            path: "pvc",
            name: "pvc",
            meta: {
              title: "持久卷申请",
              icon: "ios-create"
            },
            component: () => import("@/view/storage/pvc/pvc.vue")
          },
          {
            path: "pvc/:pvcname",
            name: "pvcdetail",
            meta: {
              title: "持久卷申请信息",
              icon: "ios-document",
              hideInMenu: true,
              cache: false
            },
            component: () => import("@/view/storage/pvc/pvc-detail.vue")
          },
          {
            path: "pv",
            name: "pv",
            meta: {
              title: "持久卷",
              icon: "ios-create-outline"
            },
            component: () => import("@/view/storage/pv/pv.vue")
          },
          {
            path: "pv/:pvname",
            name: "pvdetail",
            meta: {
              title: "持久卷信息",
              icon: "ios-document",
              hideInMenu: true,
              cache: false
            },
            component: () => import("@/view/storage/pv/pv-detail.vue")
          },
          {
            path: "sclass",
            name: "sclass",
            meta: {
              title: "存储类",
              icon: "ios-link"
            },
            component: () => import("@/view/storage/sclass/sclass.vue")
          },
          {
            path: "sclass/:scname",
            name: "scdetail",
            meta: {
              title: "存储类信息",
              icon: "ios-document",
              hideInMenu: true,
              cache: false
            },
            component: () => import("@/view/storage/sclass/sclass-detail.vue")
          }
        ]
      },
      {
        path: "/rbac",
        name: "rbac",
        meta: {
          icon: "logo-buffer",
          title: "角色控制",
          access: ['admin1']
        },
        component: parentView,
        children: [
          {
            path: "srvaccount",
            name: "srvaccount",
            meta: {
              title: "服务账户",
              icon: "ios-key-outline"
            },
            component: () => import("@/view/configuration/srvaccount/srvaccount.vue")
          },
          {
            path: "role",
            name: "role",
            meta: {
              title: "角色",
              icon: "ios-ionic-outline"
            },
            component: () => import("@/view/rbac/role/role.vue")
          },
          {
            path: "rolebind",
            name: "rolebind",
            meta: {
              title: "角色绑定",
              icon: "ios-ionic-outline"
            },
            component: () => import("@/view/rbac/rolebind/rolebind.vue")
          },
          {
            path: "clusterrole",
            name: "clusterrole",
            meta: {
              title: "集群角色",
              icon: "md-ionic"
            },
            component: () => import("@/view/rbac/clusterrole/clusterrole.vue")
          },
          {
            path: "clusterrolebind",
            name: "clusterrolebind",
            meta: {
              title: "集群角色绑定",
              icon: "md-ionic"
            },
            component: () => import("@/view/rbac/clusterrolebind/clusterrolebind.vue")
          }
        ]
      }
    ]
  },
  {
    path: "/application",
    component: Main,
    name: "application",
    meta: {
      title: "部署",
      icon: "ios-apps",
      access: ['application']
    },
    children: [
      {
        path: "apply",
        name: "apply",
        meta: {
          title: "应用",
          cache: false,
          icon: "ios-document",
          access: ['apply']
        },
        component: () => import("@/view/application/apply/apply.vue")
      },
      {
        path: "apply/:setName/:ctrl",
        name: "applyinfo",
        meta: {
          title: "应用信息",
          icon: "ios-document",
          hideInMenu: true,
          cache: false,
          access: ['apply']
        },
        component: () => import("@/view/workload/deployment/deployment-info.vue")
      },
      {
        path: "template",
        name: "template",
        meta: {
          title: "模板",
          icon: "ios-browsers-outline",
          cache: false,
          access: ['template']
        },
        component: () => import("@/view/application/template/template.vue")
      }
    ]
  },
  {
    path: "/workload",
    component: Main,
    name: "workload",
    meta: {
      title: "部署",
      icon: "ios-stats",
      access: ['workload']
    },
    children: [
      {
        path: "deployment",
        name: "deployment",
        meta: {
          title: "部署",
          cache: false,
          icon: "ios-open-outline",
          access: ['deployment']
        },
        component: () => import("@/view/workload/deployment/deployment.vue")
      },
      {
        path: "deployment/:setName/:ctrl",
        name: "deploymentinfo",
        meta: {
          title: "部署信息",
          icon: "ios-document",
          hideInMenu: true,
          cache: false,
          access: ['deployment']
        },
        component: () => import("@/view/workload/deployment/deployment-info.vue")
      },
      {
        path: "pod",
        name: "pod",
        meta: {
          title: "Pod",
          icon: "ios-cube-outline",
          cache: false,
          access: ['pod']
        },
        component: () => import("@/view/workload/pod/pod.vue")
      },
      {
        path: "podexec/:podName/:containerName",
        name: "podexec",
        meta: {
          title: "Pod终端",
          icon: "ios-cube-outline",
          cache: false,
          hideInMenu: true,
          access: ['pod']
        },
        component: () => import("@/view/workload/pod/podexec.vue")
      },
      {
        path: "kubectl/:podName/:containerName",
        name: "kubectl",
        meta: {
          title: "kubectl",
          icon: "ios-cube-outline",
          cache: false,
          hideInMenu: true,
          access: ['pod']
        },
        component: () => import("@/view/workload/pod/podexeckubectl.vue")
      },
      {
        path: "poddebug/:podName/:containerName",
        name: "poddebug",
        meta: {
          title: "Pod 调试",
          icon: "ios-cube-outline",
          cache: false,
          hideInMenu: true,
          access: ['pod']
        },
        component: () => import("@/view/workload/pod/poddebug.vue")
      },
      {
        path: "pod/:podName",
        name: "podinfo",
        meta: {
          title: "Pod 信息",
          icon: "ios-document",
          hideInMenu: true,
          cache: false,
          access: ['pod']
        },
        component: () => import("@/view/workload/pod/pod-info.vue")
      }
    ]
  },
  {
    path: "/discovery",
    component: Main,
    name: "discovery",
    meta: {
      title:"服务及入口",
      hideInMenu: false,
      icon: "md-options",
      access: ['discovery']
    },
    children: [
      {
        path: "service",
        name: "service",
        meta: {
          title: "服务",
          icon: "md-compass",
          access: ['service']
        },
        component: () => import("@/view/discovery/service/service.vue")
      },
      {
        path: "service/:servicename",
        name: "serviceinfo",
        meta: {
          title: "服务信息",
          icon: "md-compass",
          hideInMenu: true,
          cache: false,
          access: ['service']
        },
        component: () => import("@/view/discovery/service/service-info.vue")
      },
      {
        path: "ingress",
        name: "ingress",
        meta: {
          title: "Ingress",
          icon: "md-contract",
          access: ['ingress']
        },
        component: () => import("@/view/discovery/ingress/ingress.vue")
      },
      {
        path: "ingress/:ingressname",
        name: "ingressinfo",
        meta: {
          title: "入口信息",
          icon: "logo-contract",
          hideInMenu: true,
          cache: false,
          access: ['ingress']
        },
        component: () => import("@/view/discovery/ingress/ingress-info.vue")
      }
    ]
  },
  {
    path: "/configuration",
    component: Main,
    name: "configuration",
    meta: {
      title: "配置与存储",
      hideInMenu: false,
      icon: "md-cog",
      access: ['configuration']
    },
    children: [
      {
        path: "map",
        name: "map",
        meta: {
          title: "配置字典",
          icon: "ios-build-outline",
          access: ['config_map']
        },
        component: () => import("@/view/configuration/map/map.vue")
      },
      {
        path: "secrets",
        name: "secrets",
        meta: {
          title: "保密字典",
          icon: "ios-eye-outline",
          access: ['secret_map']
        },
        component: () => import("@/view/configuration/secrets/secrets.vue")
      }
    ]
  },
  {
    path: "/istio",
    component: Main,
    name: "istio",
    meta: {
      title: "微服务治理",
      hideInMenu: false,
      icon: "md-expand",
      access: ['istio']
    },
    children: [
      {
        path: "gateway",
        name: "gateway",
        meta: {
          title: "网关管理",
          icon: "ios-sync",
          access: ['gateway']
        },
        component: () => import("@/view/istio/gateway/gateway.vue")
      },
      {
        path: "gateway/:resourceName",
        name: "gatewayinfo",
        meta: {
          title: "网关信息",
          icon: "md-compass",
          hideInMenu: true,
          cache: false,
          access: ['gateway']
        },
        component: () => import("@/view/istio/gateway/gateway-info.vue")
      },
       {
        path: "destinationrule",
        name: "destinationrule",
        meta: {
          title: "目标规则",
          icon: "ios-shuffle",
          access: ['dr']
        },
        component: () => import("@/view/istio/destinationrule/destinationrule.vue")
      },
      {
        path: "destinationrule/:resourceName",
        name: "destinationruleinfo",
        meta: {
          title: "目标规则信息",
          icon: "md-compass",
          hideInMenu: true,
          cache: false,
          access: ['dr']
        },
        component: () => import("@/view/istio/destinationrule/destinationrule-info.vue")
      },
      {
        path: "virtualservice",
        name: "virtualservice",
        meta: {
          title: "虚拟服务",
          icon: "md-copy",
          access: ['vs']
        },
        component: () => import("@/view/istio/virtualservice/virtualservice.vue")
      },
      {
        path: "virtualservice/:resourceName",
        name: "virtualserviceinfo",
        meta: {
          title: "虚拟服务信息",
          icon: "md-podium",
          hideInMenu: true,
          cache: false,
          access: ['vs']
        },
        component: () => import("@/view/istio/virtualservice/virtualservice-info.vue")
      },
      {
        path: "serviceentry",
        name: "serviceentry",
        meta: {
          title: "服务入口",
          icon: "ios-arrow-dropup",
          access: ['se']
        },
        component: () => import("@/view/istio/serviceentry/serviceentry.vue")
      },
      {
        path: "serviceentry/:resourceName",
        name: "serviceentryinfo",
        meta: {
          title: "服务入口信息",
          icon: "ios-arrow-dropup",
          hideInMenu: true,
          cache: false,
          access: ['se']
        },
        component: () => import("@/view/istio/serviceentry/serviceentry-info.vue")
      }
    ]
  },
  {
    path: "/alert",
    component: Main,
    name: "alert",
    meta: {
      title:"监控告警",
      hideInMenu: false,
      icon: "md-alert",
      access: ['alert']
    },
    children: [
      {
        path: "rule",
        name: "rule",
        meta: {
          title: "规则管理",
          icon: "md-barcode",
          access: ['rule']
        },
        component: () => import("@/view/alert/alert.vue")
      },
      {
        path: "Scrape",
        name: "Scrape",
        meta: {
          title: "Scrape",
          icon: "md-contract",
          access: ['scrape']
        },
        component: () => import("@/view/alert/alert.vue")
      }
    ]
  },
  {
    path: "/cplugin",
    component: Main,
    name: "cplugin",
    meta: {
      title:"集群插件",
      hideInMenu: false,
      icon: "md-barcode",
      access: ['cluster_plugin']
    },
    children: [
      {
        path: "clusterPlugin",
        name: "clusterPlugin",
        meta: {
          title: "集群插件",
          icon: "md-barcode",
          access: ['cluster_plugin']
        },
        component: () => import("@/view/cluster-plugin/cluster-plugin.vue")
      }
    ]
  },
  {
    path: "/cinspect",
    component: Main,
    name: "cinspect",
    meta: {
      title:"健康检查",
      hideInMenu: false,
      icon: "md-recording",
      access: ['inspect']
    },
    children: [
      {
        path: "inspect",
        name: "inspect",
        meta: {
          title: "健康检查",
          icon: "md-recording",
          access: ['inspect']
        },
        component: () => import("@/view/inspect/inspect.vue")
      },
      {
        path: "inspect/:resourceName",
        name: "inspectinfo",
        meta: {
          title: "健康检查信息",
          icon: "md-compass",
          hideInMenu: true,
          cache: false,
          access: ['inspect']
        },
        component: () => import("@/view/inspect/inspect-info.vue")
      },
    ]
  },
  {
    path: "/manage",
    component: Main,
    name: "manage",
    meta: {
      title:'系统管理',
      hideInMenu: false,
      icon: "ios-construct",
      access: ['manage']
    },
    children: [
      {
        path: "cluster",
        name: "cluster_manage",
        meta: {
          title: "集群管理",
          icon: "md-grid",
          access: ['cluster_manage']
        },
        component: () => import("@/view/manage/cluster/cluster.vue")
      },
      {
        path: "namespace",
        name: "namespace",
        meta: {
          title: "命名空间",
          icon: "md-filing",
          access: ['namespace']
        },
        component: () => import("@/view/manage/namespace/namespace.vue")
      },
      {
        path: "product",
        name: "product",
        meta: {
          title: "产品线",
          icon: "md-list",
          access: ['product']
        },
        component: () => import("@/view/manage/product/product.vue")
      },
      {
        path: "platform_role",
        name: "platform_role",
        meta: {
          title: "平台角色",
          icon: "md-color-filter",
          access: ['platform_role']
        },
        component: () => import("@/view/manage/platform-role/platform-role.vue")
      },
      {
        path: "user",
        name: "user",
        meta: {
          title: "用户管理",
          icon: "md-person",
          access: ['user']
        },
        component: () => import("@/view/manage/user/user.vue")
      },
      {
        path: "plugin",
        name: "plugin",
        meta: {
          title: "插件管理",
          icon: "md-barcode",
          access: ['plugin']
        },
        component: () => import("@/view/manage/plugin/plugin.vue")
      },
      {
        path: "audit",
        name: "audit",
        meta: {
          title: "审计日志",
          icon: "ios-analytics",
          access: ['audit']
        },
        component: () => import("@/view/manage/audit/audit.vue")
      }
    ]
  },
  {
    path: "/_search",
    component: Main,
    name: "_search",
    meta: {
      hideInMenu: true,
    },
    children: [
      {
        path: "/search",
        name: "search",
        meta: {
          title: "集群管理",
          hideInMenu: true
        },
        component: () => import("@/view/search/search.vue")
      }
    ]
  },
  {
    path: "/401",
    name: "error_401",
    meta: {
      hideInMenu: true
    },
    component: () => import("@/view/error-page/401.vue")
  },
  {
    path: "/500",
    name: "error_500",
    meta: {
      hideInMenu: true
    },
    component: () => import("@/view/error-page/500.vue")
  },
  {
    path: "*",
    name: "error_404",
    meta: {
      hideInMenu: true
    },
    component: () => import("@/view/error-page/404.vue")
  }
];

export default routes;

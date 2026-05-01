const Layout = () => import("@/layout/index.vue");

export default {
  path: "/testcase",
  name: "TestCaseParent",
  component: Layout,
  redirect: "/testcase/list",
  meta: {
    icon: "ep/document",
    title: "用例管理",
    rank: 5
  },
  children: [
    {
      path: "/testcase/list",
      name: "TestCaseList",
      component: () => import("@/views/testcase/index.vue"),
      meta: {
        title: "测试用例",
        showLink: true,
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;

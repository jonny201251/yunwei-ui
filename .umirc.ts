import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'all'
  },
  targets: {
    ie: 11,
    firefox: 39
  },
  routes: [
    { path: '/login', component: '@/pages/SysUser/Login' },
    { path: '/back', component: '@/layouts/BackLayout' }
  ],
  title: '运维服务平台',
  fastRefresh: {},
  proxy: {
    '/yunwei': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  },
  // mfsu: {},用了msfsu，火狐47访问不了
  /*
    部署时打开注释
    base:页面路由前缀
    publicPath:css、js、图片等静态资源文件的前缀
   */
  // base: '/yunwei/',
  // publicPath: '/yunwei/'
});

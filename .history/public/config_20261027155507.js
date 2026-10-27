window.__APP_CONFIG__ = {
  // 部署后可直接修改以下两项，无需重新打包；留空则使用打包时 .env 注入的值
  // API_BASE_URL: axios 接口请求前缀，如 http://192.168.225.129:8899
  API_BASE_URL: 'http://127.0.0.1:8899/api',
  // FILE_BASE_URL: 图片/视频等文件资源前缀，与页面同源时留空（走 Nginx 反代）
  FILE_BASE_URL: 'http://127.0.0.1:8899/'
}

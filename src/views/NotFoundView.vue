<template>
  <div class="notfound-page">
    <van-empty image="error" description="页面走丢了">
      <van-button round type="primary" color="#FF6699" size="small" @click="router.push('/')">返回首页</van-button>
    </van-empty>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.notfound-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg3);
}
</style>

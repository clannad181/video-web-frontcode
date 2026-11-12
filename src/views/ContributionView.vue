<template>
  <div class="contribution-page">
    <!-- 顶栏 -->
    <div class="c-topbar">
      <van-icon name="arrow-left" size="20" @click="goBack" />
      <span class="c-topbar-title">创作中心</span>
      <router-link to="/" class="c-topbar-home">
        <van-icon name="home-o" size="19" />
      </router-link>
    </div>

    <van-tabs v-model:active="activeMenu" color="#FF6699" shrink sticky :offset-top="54">
      <van-tab title="稿件管理" name="contributions">
        <ContributionList @edit="startEdit" @go-submit="activeMenu = 'submit'" />
      </van-tab>

      <van-tab :title="editingUid ? '编辑稿件' : '投稿视频'" name="submit">
        <SubmitForm :edit-video-uid="editingUid" @submitted="onSubmitted" />
      </van-tab>

      <van-tab title="数据概览" name="stats">
        <StatsOverview />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ContributionList from '../components/contribution/ContributionList.vue'
import SubmitForm from '../components/contribution/SubmitForm.vue'
import StatsOverview from '../components/contribution/StatsOverview.vue'

const router = useRouter()
const route = useRoute()

const activeMenu = ref('contributions')
const editingUid = ref('')

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

const startEdit = (videoUid) => {
  editingUid.value = videoUid
  activeMenu.value = 'submit'
}

const onSubmitted = () => {
  editingUid.value = ''
  activeMenu.value = 'contributions'
}

onMounted(() => {
  if (route.query.edit) {
    editingUid.value = String(route.query.edit)
    activeMenu.value = 'submit'
  }
})
</script>

<style scoped>
.contribution-page {
  min-height: 100vh;
  background: var(--bg3);
}

.c-topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 12px;
  height: calc(var(--header-h) + var(--sat));
  padding: var(--sat) 14px 0;
  background: var(--bg1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.c-topbar-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
}

.c-topbar-home {
  color: var(--text2);
}
</style>

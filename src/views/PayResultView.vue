<template>
  <div class="pay-page">
    <div class="pay-card">
      <!-- 查询中 -->
      <template v-if="phase === 'checking'">
        <van-loading size="44" color="#FF6699" class="pay-icon" />
        <h2>正在确认支付结果</h2>
        <p class="pay-sub">请稍候，正在查询订单状态…</p>
      </template>

      <!-- 成功 -->
      <template v-else-if="phase === 'success'">
        <div class="pay-icon success"><van-icon name="checked" size="44" /></div>
        <h2>支付成功</h2>
        <p class="pay-sub">大会员已开通，快去享受专属特权吧</p>
        <p v-if="payTimeText" class="pay-time">支付时间：{{ payTimeText }}</p>
        <div class="pay-btns">
          <van-button type="primary" color="#FF6699" round block @click="router.push('/')">回到首页</van-button>
          <van-button plain round block @click="goProfile">查看我的会员</van-button>
        </div>
      </template>

      <!-- 失败/取消 -->
      <template v-else-if="phase === 'failed'">
        <div class="pay-icon failed"><van-icon name="clear" size="44" /></div>
        <h2>{{ failedTitle }}</h2>
        <p class="pay-sub">订单未完成支付，你可以重新发起支付</p>
        <div class="pay-btns">
          <van-button type="primary" color="#FF6699" round block @click="router.push('/')">返回首页</van-button>
          <van-button plain round block @click="refresh">重新查询</van-button>
        </div>
      </template>

      <!-- 轮询超时 -->
      <template v-else-if="phase === 'pending'">
        <div class="pay-icon pending"><van-icon name="clock-o" size="44" /></div>
        <h2>支付结果确认中</h2>
        <p class="pay-sub">银行/第三方可能有延迟，可稍后在个人中心查看会员状态</p>
        <div class="pay-btns">
          <van-button type="primary" color="#FF6699" round block @click="refresh">重新查询</van-button>
          <van-button plain round block @click="router.push('/')">返回首页</van-button>
        </div>
      </template>

      <!-- 无订单号 -->
      <template v-else-if="phase === 'no-order'">
        <div class="pay-icon failed"><van-icon name="warning-o" size="44" /></div>
        <h2>未找到订单</h2>
        <p class="pay-sub">缺少订单号参数，无法查询支付结果</p>
        <div class="pay-btns">
          <van-button type="primary" color="#FF6699" round block @click="router.push('/')">返回首页</van-button>
        </div>
      </template>

      <!-- 查询出错 -->
      <template v-else>
        <div class="pay-icon failed"><van-icon name="warning-o" size="44" /></div>
        <h2>查询失败</h2>
        <p class="pay-sub">{{ errorMsg }}</p>
        <div class="pay-btns">
          <van-button type="primary" color="#FF6699" round block @click="refresh">重新查询</van-button>
          <van-button plain round block @click="router.push('/')">返回首页</van-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail } from '../api/order'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const orderNo = route.query.orderNo || route.query.out_trade_no || route.query.trade_no
const phase = ref('checking')
const order = ref(null)
const errorMsg = ref('')
const refreshing = ref(false)

const POLL_INTERVAL = 2000
const MAX_TRIES = 30
let tries = 0
let timer = null

const payTimeText = computed(() => order.value?.payTime || order.value?.paymentTime || '')
const failedTitle = computed(() => {
  const s = Number(order.value?.status)
  if (s === 2) return '订单已取消'
  if (s === 3) return '订单已关闭'
  return '支付未完成'
})

const stopPolling = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

const query = async () => {
  if (!orderNo) {
    phase.value = 'no-order'
    return
  }
  refreshing.value = true
  try {
    const data = await getOrderDetail(orderNo)
    order.value = data
    const status = Number(data?.status)
    if (status === 1) {
      phase.value = 'success'
      stopPolling()
      authStore.init()
      return
    }
    if (status === 2 || status === 3) {
      phase.value = 'failed'
      stopPolling()
      return
    }
    tries += 1
    if (tries >= MAX_TRIES) {
      phase.value = 'pending'
      stopPolling()
      return
    }
    phase.value = 'checking'
    timer = setTimeout(query, POLL_INTERVAL)
  } catch (e) {
    tries += 1
    if (tries >= MAX_TRIES) {
      phase.value = 'error'
      errorMsg.value = e.message || '查询订单失败'
      stopPolling()
    } else {
      timer = setTimeout(query, POLL_INTERVAL)
    }
  } finally {
    refreshing.value = false
  }
}

const refresh = () => {
  tries = 0
  phase.value = 'checking'
  query()
}

const goProfile = () => router.push('/profile')

onMounted(() => {
  query()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.pay-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg3);
  padding: 24px;
}

.pay-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg1);
  border-radius: 16px;
  padding: 40px 24px 32px;
  text-align: center;
}

.pay-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
  color: var(--brand_pink);
}

.pay-icon.success { color: #07c160; }
.pay-icon.failed { color: #ee0a24; }
.pay-icon.pending { color: #ff9838; }

.pay-card h2 {
  font-size: 19px;
  font-weight: 700;
  color: var(--text1);
}

.pay-sub {
  font-size: 13px;
  color: var(--text3);
  margin-top: 10px;
  line-height: 1.6;
}

.pay-time {
  font-size: 12px;
  color: var(--text4);
  margin-top: 8px;
}

.pay-btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 26px;
}
</style>

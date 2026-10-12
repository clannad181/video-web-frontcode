<template>
  <div class="pay-result-page">
    <div class="pay-result-card">
      <template v-if="!orderNo">
        <div class="result-icon error"><IconClose :size="34" /></div>
        <h2 class="result-title">缺少订单号</h2>
        <p class="result-desc">请从支付页面返回后重试</p>
        <div class="result-actions">
          <button class="btn-primary" @click="router.push('/')">返回首页</button>
        </div>
      </template>

      <template v-else-if="phase === 'checking'">
        <div class="result-spinner"></div>
        <h2 class="result-title">正在确认支付结果</h2>
        <p class="result-desc">请稍候，正在查询订单状态…</p>
        <div class="result-order" v-if="order">
          <div class="result-row"><span>订单号</span><em>{{ order.orderNo }}</em></div>
        </div>
      </template>

      <template v-else-if="phase === 'success'">
        <div class="result-icon success"><IconCheck :size="34" /></div>
        <h2 class="result-title">支付成功</h2>
        <p class="result-desc">大会员已开通，感谢您的支持</p>
        <div class="result-order">
          <div class="result-row"><span>订单号</span><em>{{ order?.orderNo }}</em></div>
          <div class="result-row"><span>支付金额</span><em class="price">¥{{ order?.amount }}</em></div>
          <div class="result-row" v-if="payTimeText"><span>支付时间</span><em>{{ payTimeText }}</em></div>
        </div>
        <div class="result-actions">
          <button class="btn-primary" @click="router.push('/')">返回首页</button>
          <button class="btn-ghost" @click="router.push('/profile')">个人中心</button>
        </div>
      </template>

      <template v-else-if="phase === 'pending'">
        <div class="result-icon pending"><IconClock :size="34" /></div>
        <h2 class="result-title">支付结果确认中</h2>
        <p class="result-desc">已完成支付的话请稍候再查询，异步通知可能存在延迟</p>
        <div class="result-order">
          <div class="result-row"><span>订单号</span><em>{{ order?.orderNo }}</em></div>
          <div class="result-row"><span>应付金额</span><em class="price">¥{{ order?.amount }}</em></div>
        </div>
        <div class="result-actions">
          <button class="btn-primary" :disabled="refreshing" @click="refresh">
            {{ refreshing ? '查询中…' : '重新查询' }}
          </button>
          <button class="btn-ghost" @click="router.push('/')">返回首页</button>
        </div>
      </template>

      <template v-else-if="phase === 'failed'">
        <div class="result-icon error"><IconClose :size="34" /></div>
        <h2 class="result-title">{{ failedTitle }}</h2>
        <p class="result-desc">如仍在支付流程中，可重新查询或返回首页重新下单</p>
        <div class="result-order">
          <div class="result-row"><span>订单号</span><em>{{ order?.orderNo }}</em></div>
          <div class="result-row"><span>应付金额</span><em class="price">¥{{ order?.amount }}</em></div>
        </div>
        <div class="result-actions">
          <button class="btn-primary" :disabled="refreshing" @click="refresh">
            {{ refreshing ? '查询中…' : '重新查询' }}
          </button>
          <button class="btn-ghost" @click="router.push('/')">返回首页</button>
        </div>
      </template>

      <template v-else>
        <div class="result-icon error"><IconClose :size="34" /></div>
        <h2 class="result-title">查询失败</h2>
        <p class="result-desc">{{ errorMsg }}</p>
        <div class="result-actions">
          <button class="btn-primary" :disabled="refreshing" @click="refresh">
            {{ refreshing ? '查询中…' : '重新查询' }}
          </button>
          <button class="btn-ghost" @click="router.push('/')">返回首页</button>
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
import { IconCheck, IconClose, IconClock } from '../icons'

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

onMounted(() => {
  query()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.pay-result-page {
  min-height: calc(100vh - var(--header-height));
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg2);
  padding: 40px 20px;
}

.pay-result-card {
  width: 100%;
  max-width: 460px;
  background: var(--bg1);
  border: 1px solid var(--line_light);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  padding: 48px 40px;
  text-align: center;
}

.result-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.result-icon.success { background: #e8f8ef; color: #19b45f; }
.result-icon.error { background: var(--brand_pink_thin); color: var(--brand_pink); }
.result-icon.pending { background: var(--brand_blue_thin); color: var(--brand_blue); }

.result-spinner {
  width: 44px;
  height: 44px;
  margin: 14px auto 26px;
  border: 3px solid var(--line_regular);
  border-top-color: var(--brand_pink);
  border-radius: 50%;
  animation: pay-spin 0.8s linear infinite;
}

@keyframes pay-spin {
  to { transform: rotate(360deg); }
}

.result-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
  color: var(--text1);
}

.result-desc {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--text2);
  line-height: 1.6;
}

.result-order {
  background: var(--bg2);
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 24px;
  text-align: left;
}

.result-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 13px;
  line-height: 26px;
  color: var(--text2);
}

.result-row em {
  font-style: normal;
  color: var(--text1);
  word-break: break-all;
  text-align: right;
}

.result-row em.price {
  color: var(--brand_pink);
  font-weight: 600;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-primary,
.btn-ghost {
  min-width: 120px;
  height: 40px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background: var(--brand_pink);
  border: 1px solid var(--brand_pink);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: var(--brand_pink_hover);
  border-color: var(--brand_pink_hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-ghost {
  background: transparent;
  border: 1px solid var(--line_regular);
  color: var(--text2);
}

.btn-ghost:hover {
  border-color: var(--line_bold);
  color: var(--text1);
}
</style>

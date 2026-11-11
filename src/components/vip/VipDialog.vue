<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    safe-area-inset-bottom
    :style="{ maxHeight: '85vh', overflow: 'auto' }"
    @update:show="$emit('update:show', $event)"
  >
    <div class="vip-dialog">
      <div class="vip-dialog-header">
        <h3>{{ view === 'activate' ? '激活大会员' : '开通大会员' }}</h3>
        <van-icon name="cross" size="20" @click="$emit('update:show', false)" />
      </div>

      <template v-if="view === 'buy'">
        <div class="vip-dialog-body">
          <div class="vip-status-strip" :class="{ 'is-free': !user?.isVip }">
            <div class="vip-status-main">
              <span class="vip-status-icon"><IconVip :size="28" /></span>
              <div class="vip-status-text">
                <div class="vip-status-title">{{ user?.isVip ? '大会员' : '你还不是大会员' }}</div>
                <div class="vip-status-sub">{{ user?.isVip ? '已享受大会员专属特权' : '开通即享专属特权' }}</div>
              </div>
            </div>
            <div v-if="user?.isVip && vipExpireDate" class="vip-status-expire">
              <span class="expire-label">有效期至</span>
              <span class="expire-date">{{ vipExpireDate }}</span>
            </div>
          </div>

          <div class="vip-section-label">选择开通时长</div>
          <div v-if="plansLoading" class="vip-plans-status">套餐加载中…</div>
          <div v-else-if="!packages.length" class="vip-plans-status">暂无可用套餐，请稍后再试</div>
          <div v-else class="vip-packages">
            <button
              v-for="pkg in packages"
              :key="pkg.id"
              type="button"
              class="vip-package"
              :class="{ active: selectedId === pkg.id }"
              @click="selectedId = pkg.id"
            >
              <span class="vip-package-name">{{ pkg.name }}</span>
              <span class="vip-package-price"><i>¥</i>{{ pkg.price }}</span>
              <span v-if="pkg.original" class="vip-package-original">原价¥{{ pkg.original }}</span>
              <span v-if="pkg.months > 1" class="vip-package-unit">约¥{{ getUnitPrice(pkg) }}/月</span>
            </button>
          </div>

          <div class="vip-section-label">支付方式</div>
          <div class="vip-payments">
            <button
              type="button"
              class="vip-payment"
              :class="{ active: payMethod === 'alipay' }"
              @click="payMethod = 'alipay'"
            >
              <IconAlipay :size="20" />
              <span class="vip-payment-name">支付宝</span>
            </button>
            <button
              type="button"
              class="vip-payment"
              :class="{ active: payMethod === 'wechat' }"
              @click="payMethod = 'wechat'"
            >
              <IconWechat :size="20" color="#07C160" />
              <span class="vip-payment-name">微信支付</span>
              <em class="vip-payment-dev">开发中</em>
            </button>
          </div>
        </div>

        <div class="vip-dialog-footer">
          <button type="button" class="vip-dialog-link" @click="view = 'activate'">使用激活码开通</button>
          <div class="vip-dialog-purchase">
            <span v-if="selectedPackage" class="vip-total">合计<em>¥{{ selectedPackage.price }}</em></span>
            <van-button
              type="primary"
              round
              block
              class="vip-buy-btn"
              :loading="buying"
              :disabled="plansLoading || !selectedPackage"
              @click="handleBuy"
            >
              {{ buying ? '正在发起支付…' : (user?.isVip ? '立即续费' : '立即开通') }}
            </van-button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="vip-dialog-body">
          <p class="vip-dialog-tip">请输入您的激活码来开通大会员特权</p>
          <van-field
            v-model="vipCode"
            placeholder="请输入激活码"
            maxlength="50"
            clearable
            @keyup.enter="handleActivate"
          />
        </div>
        <div class="vip-dialog-footer vip-dialog-footer--col">
          <button type="button" class="vip-dialog-link" @click="view = 'buy'">返回选购</button>
          <van-button
            type="primary"
            round
            block
            :loading="activating"
            @click="handleActivate"
          >
            {{ activating ? '激活中...' : '立即激活' }}
          </van-button>
        </div>
      </template>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'
import { activateVip } from '../../api/auth'
import { createOrder, payOrder, getVipPlans } from '../../api/order'
import { useAuthStore } from '../../stores/auth'
import { formatDate } from '../../utils/format'
import { IconVip, IconAlipay, IconWechat } from '../../icons'

const props = defineProps({
  show: { type: Boolean, default: false }
})
const emit = defineEmits(['update:show'])

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const view = ref('buy')
const plansLoading = ref(false)
const packages = ref([])
const selectedId = ref('')
const payMethod = ref('alipay')
const buying = ref(false)
const vipCode = ref('')
const activating = ref(false)

const selectedPackage = computed(() =>
  packages.value.find(p => p.id === selectedId.value) || packages.value[0] || null
)

const getUnitPrice = (pkg) => (Number(pkg.price) / pkg.months).toFixed(1)

const vipExpireDate = computed(() => {
  const raw = user.value?.vipExpireTime || user.value?.vipExpireDate || user.value?.vipExpire
  if (!raw) return ''
  return formatDate(raw)
})

const loadPlans = async () => {
  plansLoading.value = true
  try {
    const res = await getVipPlans()
    const monthly = res && !Array.isArray(res) ? res.vip_price_per_month : null
    const list = Array.isArray(res) ? res : Array.isArray(res?.plans) ? res.plans : []
    const rawPlans = []
    if (monthly) rawPlans.push(monthly)
    rawPlans.push(...list)
    const plans = rawPlans
      .filter(p => p && p.durationMonths > 0 && p.price != null && Number(p.price) >= 0)
      .map((p, index) => {
        const price = Number(p.price)
        const original = p.originalPrice != null && p.originalPrice !== '' ? Number(p.originalPrice) : NaN
        return {
          id: `plan-${index}`,
          name: p.name || `${p.durationMonths}个月`,
          months: Number(p.durationMonths),
          price: price.toFixed(2),
          original: Number.isFinite(original) && original > price ? original.toFixed(2) : null
        }
      })
    packages.value = plans
    const preferred = plans.reduce((best, p) => (p.months > best.months ? p : best), plans[0])
    selectedId.value = preferred ? preferred.id : ''
  } catch (e) {
    packages.value = []
    selectedId.value = ''
    showToast(e.message || '获取大会员套餐失败')
  } finally {
    plansLoading.value = false
  }
}

watch(() => props.show, (val) => {
  if (val) {
    view.value = 'buy'
    vipCode.value = ''
    loadPlans()
  }
})

const submitPayForm = (html) => {
  const container = document.createElement('div')
  container.style.display = 'none'
  container.innerHTML = html
  document.body.appendChild(container)
  const form = container.querySelector('form')
  if (form) {
    if (!form.getAttribute('target')) form.target = '_self'
    form.submit()
    return true
  }
  document.body.removeChild(container)
  return false
}

const handleBuy = async () => {
  if (payMethod.value === 'wechat') {
    showToast('微信支付开发中，敬请期待')
    return
  }
  if (buying.value) return
  const plan = selectedPackage.value
  if (!plan) {
    showToast('暂无可用套餐')
    return
  }
  buying.value = true
  try {
    const order = await createOrder(plan.months)
    const orderNo = typeof order === 'string' ? order : order?.orderNo
    if (!orderNo) {
      showToast('创建订单失败')
      return
    }
    const html = await payOrder(orderNo, 1)
    if (!html || !submitPayForm(html)) {
      showToast('获取支付页面失败，请稍后重试')
    }
  } catch (e) {
    showToast(e.message || '发起支付失败')
  } finally {
    buying.value = false
  }
}

const handleActivate = async () => {
  if (!vipCode.value.trim()) {
    showToast('请输入激活码')
    return
  }
  activating.value = true
  try {
    await activateVip({ code: vipCode.value.trim() })
    showToast('激活成功')
    emit('update:show', false)
    await authStore.init()
  } catch (e) {
    showToast(e.message || '激活失败')
  } finally {
    activating.value = false
  }
}
</script>

<style scoped>
.vip-dialog {
  padding-bottom: calc(12px + var(--sab));
}

.vip-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 8px;
}

.vip-dialog-header h3 {
  font-size: 17px;
  font-weight: 600;
  color: var(--text1);
}

.vip-dialog-body {
  padding: 8px 16px;
}

.vip-status-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: linear-gradient(135deg, #FFF3E9 0%, #FFECF1 100%);
  border: 1px solid #FFD9E4;
}

.vip-status-strip.is-free {
  background: var(--bg2);
  border-color: var(--line_regular);
}

.vip-status-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.vip-status-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text1);
}

.vip-status-sub {
  font-size: 12px;
  color: var(--text3);
  margin-top: 2px;
}

.vip-status-expire {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 12px;
  flex-shrink: 0;
}

.expire-label {
  color: var(--text3);
}

.expire-date {
  color: var(--brand_pink);
  font-weight: 600;
}

.vip-section-label {
  margin: 16px 0 8px;
  font-size: 13px;
  color: var(--text2);
}

.vip-plans-status {
  padding: 16px 0;
  text-align: center;
  font-size: 13px;
  color: var(--text3);
}

.vip-packages {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.vip-package {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 12px;
  border: 1.5px solid var(--line_regular);
  border-radius: 10px;
  background: var(--bg1);
  cursor: pointer;
}

.vip-package.active {
  border-color: var(--brand_pink);
  background: var(--brand_pink_thin);
}

.vip-package-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text1);
}

.vip-package.active .vip-package-name {
  color: var(--brand_pink);
}

.vip-package-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--text1);
}

.vip-package-price i {
  font-size: 12px;
  font-style: normal;
}

.vip-package.active .vip-package-price {
  color: var(--brand_pink);
}

.vip-package-original {
  font-size: 11px;
  color: var(--text4);
  text-decoration: line-through;
}

.vip-package-unit {
  font-size: 11px;
  color: var(--text3);
}

.vip-payments {
  display: flex;
  gap: 10px;
}

.vip-payment {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding: 12px;
  border: 1.5px solid var(--line_regular);
  border-radius: 10px;
  background: var(--bg1);
  font-size: 13px;
  color: var(--text1);
  cursor: pointer;
}

.vip-payment.active {
  border-color: var(--brand_pink);
  background: var(--brand_pink_thin);
}

.vip-payment-dev {
  font-size: 10px;
  font-style: normal;
  color: var(--text4);
}

.vip-dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--line_light);
}

.vip-dialog-footer--col {
  flex-direction: column;
  align-items: stretch;
}

.vip-dialog-link {
  background: none;
  border: none;
  font-size: 13px;
  color: var(--text2);
  cursor: pointer;
  padding: 8px 0;
}

.vip-dialog-purchase {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
}

.vip-dialog-footer--col .vip-dialog-purchase {
  display: none;
}

.vip-total {
  font-size: 13px;
  color: var(--text2);
}

.vip-total em {
  font-style: normal;
  font-size: 18px;
  font-weight: 700;
  color: var(--brand_pink);
}

.vip-buy-btn {
  width: 140px;
  height: 40px;
  background: var(--brand_pink);
  border-color: var(--brand_pink);
}

.vip-dialog-tip {
  font-size: 13px;
  color: var(--text2);
  margin-bottom: 12px;
}
</style>

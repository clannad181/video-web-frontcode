<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ $t('系统设置') }}</h2>
      <span class="page-sub">{{ $t('管理网站基本信息和全局配置') }}</span>
    </div>

    <div class="settings-grid">
      <div class="settings-nav">
        <div v-for="item in navItems" :key="item.key" class="nav-item" :class="{ active: activeNav === item.key }" @click="activeNav = item.key">
          <span class="nav-indicator"></span>
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ $t(item.label) }}</span>
        </div>
      </div>

      <div class="settings-panel">
        <div class="panel-header">
          <h3 class="panel-title">{{ $t(currentPanel.title) }}</h3>
          <p class="panel-desc">{{ $t(currentPanel.desc) }}</p>
        </div>
        <div class="panel-divider"></div>

        <div class="panel-body" v-if="activeNav === 'basic'">
          <div class="form-group">
            <label class="form-label">{{ $t('网站名称') }}</label>
            <input v-model="form.siteName" class="form-input" :placeholder="$t('请输入网站名称')" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('网站描述') }}</label>
            <textarea v-model="form.siteDesc" class="form-textarea" rows="3" :placeholder="$t('请输入网站描述')"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('网站地址') }}</label>
            <input v-model="form.siteUrl" class="form-input" placeholder="https://example.com" />
          </div>
          <div class="form-row">
            <div class="form-half">
              <label class="form-label">{{ $t('语言') }}</label>
              <div class="select-wrap">
                <select v-model="form.language" class="form-select">
                  <option value="zh-CN">{{ $t('中文') }}</option>
                  <option value="en-US">English</option>
                </select>
              </div>
            </div>
            <div class="form-half">
              <label class="form-label">{{ $t('时区') }}</label>
              <div class="select-wrap">
                <select v-model="form.timezone" class="form-select">
                  <option value="Asia/Shanghai">Asia/Shanghai</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-body" v-if="activeNav === 'security'">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">{{ $t('修改密码') }}</div>
              <div class="setting-desc">{{ $t('定期修改密码以保证账户安全') }}</div>
            </div>
            <button class="setting-btn" @click="showPasswordModal = true">{{ $t('修改') }}</button>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">{{ $t('默认密码') }}</div>
              <div class="setting-desc">{{ $t('新建用户或重置密码时的初始密码') }}</div>
            </div>
            <input v-model="form.default_password" type="text" class="pwd-input" :placeholder="$t('请输入默认密码')" maxlength="32" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">{{ $t('登录通知') }}</div>
              <div class="setting-desc">{{ $t('新设备登录时发送邮件通知') }}</div>
            </div>
            <div class="toggle-switch" :class="{ on: form.loginNotify }" @click="form.loginNotify = !form.loginNotify">
              <span class="toggle-thumb"></span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">{{ $t('会话超时') }}</div>
              <div class="setting-desc">{{ $t('无操作后自动登出的时间') }}</div>
            </div>
            <div class="suffix-input-wrapper">
              <input v-model.number="form.sessionTimeout" type="number" class="suffix-input" min="1" max="1440" />
              <span class="suffix-text">{{ $t('分钟') }}</span>
            </div>
          </div>
        </div>

        <div class="panel-body" v-if="activeNav === 'token'">
          <div class="section-block">
            <div class="section-title-bar">{{ $t('前台令牌') }}</div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">{{ $t('前台认证令牌有效期') }}</div>
                <div class="setting-desc">{{ $t('前台 Access Token 过期时间') }}</div>
              </div>
              <div class="suffix-input-wrapper">
                <input v-model.number="form.front_access_token_expiry" type="number" class="suffix-input" min="1" max="1440" />
                <span class="suffix-text">{{ $t('分钟') }}</span>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">{{ $t('前台刷新令牌有效期') }}</div>
                <div class="setting-desc">{{ $t('前台 Refresh Token 过期时间') }}</div>
              </div>
              <div class="suffix-input-wrapper">
                <input v-model.number="form.front_refresh_token_expiry" type="number" class="suffix-input" min="1" max="365" />
                <span class="suffix-text">{{ $t('天') }}</span>
              </div>
            </div>
          </div>
          <div class="section-block">
            <div class="section-title-bar">{{ $t('后台令牌') }}</div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">{{ $t('后台认证令牌有效期') }}</div>
                <div class="setting-desc">{{ $t('后台管理端 Access Token 过期时间') }}</div>
              </div>
              <div class="suffix-input-wrapper">
                <input v-model.number="form.backend_access_token_expiry" type="number" class="suffix-input" min="1" max="1440" />
                <span class="suffix-text">{{ $t('分钟') }}</span>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">{{ $t('后台刷新令牌有效期') }}</div>
                <div class="setting-desc">{{ $t('后台管理端 Refresh Token 过期时间') }}</div>
              </div>
              <div class="suffix-input-wrapper">
                <input v-model.number="form.backend_refresh_token_expiry" type="number" class="suffix-input" min="1" max="365" />
                <span class="suffix-text">{{ $t('天') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-body" v-if="activeNav === 'notification'">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">{{ $t('审核通知') }}</div>
              <div class="setting-desc">{{ $t('视频审核完成时通知') }}</div>
            </div>
            <div class="toggle-switch" :class="{ on: form.videoReviewNotify }" @click="form.videoReviewNotify = !form.videoReviewNotify">
              <span class="toggle-thumb"></span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">{{ $t('评论通知') }}</div>
              <div class="setting-desc">{{ $t('有新评论时通知') }}</div>
            </div>
            <div class="toggle-switch" :class="{ on: form.commentNotify }" @click="form.commentNotify = !form.commentNotify">
              <span class="toggle-thumb"></span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">{{ $t('举报通知') }}</div>
              <div class="setting-desc">{{ $t('有新的举报时通知') }}</div>
            </div>
            <div class="toggle-switch" :class="{ on: form.reportNotify }" @click="form.reportNotify = !form.reportNotify">
              <span class="toggle-thumb"></span>
            </div>
          </div>
        </div>

        <div class="panel-body" v-if="activeNav === 'audit'">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">{{ $t('视频审核') }}</div>
              <div class="setting-desc">{{ $t('新上传的视频需要审核后才能发布') }}</div>
            </div>
            <div class="toggle-switch" :class="{ on: form.video_review }" @click="form.video_review = !form.video_review">
              <span class="toggle-thumb"></span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">{{ $t('评论审核') }}</div>
              <div class="setting-desc">{{ $t('新发布的评论需要审核后才能显示') }}</div>
            </div>
            <div class="toggle-switch" :class="{ on: form.comment_review }" @click="form.comment_review = !form.comment_review">
              <span class="toggle-thumb"></span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">{{ $t('敏感词过滤') }}</div>
              <div class="setting-desc">{{ $t('自动过滤包含敏感词的内容') }}</div>
            </div>
            <div class="toggle-switch" :class="{ on: form.sensitive_word_filter }" @click="form.sensitive_word_filter = !form.sensitive_word_filter">
              <span class="toggle-thumb"></span>
            </div>
          </div>
        </div>

        <div class="panel-body" v-if="activeNav === 'appearance'">
          <div class="form-group">
            <h3 class="form-label">{{ $t('主题色') }}</h3>
            <div class="color-palette">
              <div v-for="c in presetColors" :key="c.value" class="color-option"
                :class="{ active: form.primaryColor === c.value }"
                    :style="{ background: c.value }" :title="$t(c.name)"
                @click="form.primaryColor = c.value">
                <svg v-if="form.primaryColor === c.value" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
            </div>
            <transition name="fade-slide">
              <div v-if="serverPrimaryColor && serverPrimaryColor !== form.primaryColor" class="persist-palette">
                <div class="persist-label">{{ $t('主题色-持久化') }}</div>
                <div class="color-palette">
                  <div v-for="c in presetColors" :key="c.value" class="color-option"
                    :class="{ active: serverPrimaryColor === c.value }"
                :style="{ background: c.value }" :title="$t(c.name)"
                    @click="form.primaryColor = c.value">
                    <svg v-if="serverPrimaryColor === c.value" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                </div>
              </div>
            </transition>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">{{ $t('深色模式') }}</div>
              <div class="setting-desc">{{ $t('切换深色/浅色主题') }}</div>
            </div>
            <div class="toggle-switch" :class="{ on: form.darkMode }" @click="form.darkMode = !form.darkMode">
              <span class="toggle-thumb"></span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">{{ $t('紧凑模式') }}</div>
              <div class="setting-desc">{{ $t('减少界面间距以显示更多内容') }}</div>
            </div>
            <div class="toggle-switch" :class="{ on: form.compactMode }" @click="form.compactMode = !form.compactMode">
              <span class="toggle-thumb"></span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">{{ $t('侧边栏样式') }}</div>
              <div class="setting-desc">{{ $t('切换侧边栏深浅皮肤') }}</div>
            </div>
            <div class="radio-group">
              <div class="radio-item" :class="{ active: form.sidebarStyle === 'dark' }" @click="form.sidebarStyle = 'dark'">
                <span class="radio-dot"></span>{{ $t('深色') }}
              </div>
              <div class="radio-item" :class="{ active: form.sidebarStyle === 'light' }" @click="form.sidebarStyle = 'light'">
                <span class="radio-dot"></span>{{ $t('浅色') }}
              </div>
            </div>
          </div>
        </div>

        <div class="panel-body" v-if="activeNav === 'default'">
          <div class="form-group">
            <h3 class="form-label">{{ $t('默认角色') }}</h3>
            <p class="form-desc">{{ $t('当用户角色被删除时，自动分配此默认角色') }}</p>
            <div class="select-wrap">
              <select v-model="form.default_role" class="form-select">
                <option value="">{{ $t('请选择默认角色') }}</option>
                <option v-for="r in roleList" :key="r.id" :value="r.id">{{ r.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <h3 class="form-label">{{ $t('默认分类') }}</h3>
            <p class="form-desc">{{ $t('新建内容未指定分类时，使用此默认分类') }}</p>
            <div class="select-wrap">
              <select v-model="form.default_category" class="form-select">
                <option value="">{{ $t('请选择默认分类') }}</option>
                <option v-for="c in categoryList" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="panel-body" v-if="activeNav === 'vip'">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">{{ $t('大会员月单价') }}</div>
              <div class="setting-desc">{{ $t('未匹配套餐时按此单价×月数计算') }}</div>
            </div>
            <div class="suffix-input-wrapper">
              <input v-model.number="form.vip_price_per_month" type="number" class="suffix-input" min="0" step="0.01" />
              <span class="suffix-text">{{ $t('元/月') }}</span>
            </div>
          </div>

          <div class="plan-block">
            <div class="plan-head">
              <span class="plan-title">{{ $t('价格套餐') }}</span>
              <button class="btn btn-primary btn-sm" @click="addVipPlan">+ {{ $t('新增套餐') }}</button>
            </div>
            <div class="plan-cols">
              <span class="plan-col col-name">{{ $t('套餐名称') }}</span>
              <span class="plan-col col-months">{{ $t('时长（月）') }}</span>
              <span class="plan-col col-price">{{ $t('现价') }}</span>
              <span class="plan-col col-orig">{{ $t('原价') }}</span>
              <span class="plan-col col-act">{{ $t('操作') }}</span>
            </div>
            <div v-if="!vipPlans.length" class="plan-empty">{{ $t('暂无套餐，点击新增套餐按钮创建') }}</div>
            <div v-for="(p, i) in vipPlans" :key="i" class="plan-row">
              <input v-model="p.name" class="plan-input col-name" :placeholder="$t('选填')" />
              <input v-model.number="p.durationMonths" type="number" min="1" max="120" class="plan-input col-months" />
              <input v-model.number="p.price" type="number" min="0" step="0.01" class="plan-input col-price" :placeholder="$t('现价')" />
              <input v-model.number="p.originalPrice" type="number" min="0" step="0.01" class="plan-input col-orig" :placeholder="$t('选填')" @input="p.autoOrig = false" />
              <button class="plan-del" @click="vipPlans.splice(i, 1)">{{ $t('删除') }}</button>
            </div>
            <p class="plan-hint">{{ $t('前台按月数下单时优先匹配同月数套餐价，未匹配则按月单价×月数计算') }}</p>
          </div>
        </div>

        <div class="panel-divider"></div>
        <div class="settings-footer">
          <button class="btn btn-outline" @click="resetToDefault">{{ $t('重置默认') }}</button>
          <div v-if="activeNav === 'appearance'" class="save-btn-group">
            <button class="btn btn-primary save-main" @click="saveSettings('global')" :disabled="saving">
              <svg v-if="saving" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              {{ saving ? $t('保存中...') : $t('保存') }}
            </button>
            <button class="btn btn-primary save-arrow" @click.stop="showSaveMenu = !showSaveMenu">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <transition name="fade-slide">
              <div v-if="showSaveMenu" class="save-dropdown" @click.stop>
                <div class="save-dropdown-item" @click="saveSettings('local')">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  <div class="save-dropdown-text">
                    <div class="save-dropdown-label">{{ $t('本地生效') }}</div>
                    <div class="save-dropdown-desc">{{ $t('仅保存到浏览器') }}</div>
                  </div>
                </div>
                <div class="save-dropdown-item" @click="saveSettings('global')">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <div class="save-dropdown-text">
                    <div class="save-dropdown-label">{{ $t('全局生效') }}</div>
                    <div class="save-dropdown-desc">{{ $t('同步到服务器') }}</div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
          <button v-else class="btn btn-primary" @click="saveSettings('global')" :disabled="saving">
            <svg v-if="saving" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            {{ saving ? $t('保存中...') : $t('保存') }}
          </button>
        </div>
      </div>
    </div>

    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
          <div class="modal-card modal-password" @click.stop>
            <div class="modal-header">
              <h3>{{ $t('修改密码') }}</h3>
              <button class="modal-close" @click="showPasswordModal = false">&times;</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">{{ $t('当前密码') }}</label>
                <input v-model="passwordForm.oldPassword" type="password" class="form-input" :placeholder="$t('请输入当前密码')" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ $t('新密码') }}</label>
                <input v-model="passwordForm.newPassword" type="password" class="form-input" :placeholder="$t('请输入新密码')" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ $t('确认密码') }}</label>
                <input v-model="passwordForm.confirmPassword" type="password" class="form-input" :placeholder="$t('请再次输入新密码')" />
                <span v-if="passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword" class="form-hint error">{{ $t('两次密码不一致') }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">{{ $t('验证码') }}</label>
                <div class="captcha-row">
                  <input v-model="passwordForm.captcha" class="form-input" :placeholder="$t('请输入验证码')" style="flex:1" />
                  <div class="captcha-img" @click="refreshCaptcha" :class="{ loading: captchaLoading }">
                    <img v-if="captchaUrl" :src="captchaUrl" :alt="$t('验证码')" />
                    <span v-else class="captcha-placeholder">{{ $t('加载中') }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline" @click="showPasswordModal = false">{{ $t('取消') }}</button>
              <button class="btn btn-primary" @click="submitPassword" :disabled="passwordSaving || !canSubmitPassword">
                {{ passwordSaving ? $t('提交中...') : $t('确认') }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { getSettingsList, updateSettings, resetSettings, changePassword, getCaptcha } from '@/api/settings'
import { getRoleList } from '@/api/role'
import { getEnabledCategories } from '@/api/category'
import sparkMD5 from 'spark-md5'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const activeNav = ref('basic')
const appStore = useAppStore()
const saving = ref(false)
const showPasswordModal = ref(false)
const passwordSaving = ref(false)
const captchaLoading = ref(false)
const captchaUrl = ref('')
const captchaKey = ref('')

const navItems = [
  { key: 'basic', label: '网站设置', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' }, // i18n-key
  { key: 'security', label: '安全设置', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' }, // i18n-key
  { key: 'token', label: '令牌安全', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>' }, // i18n-key
  { key: 'notification', label: '通知设置', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' }, // i18n-key
  { key: 'audit', label: '审核设置', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' }, // i18n-key
  { key: 'appearance', label: '外观设置', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>' }, // i18n-key
  { key: 'default', label: '默认设置', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' }, // i18n-key
  { key: 'vip', label: '大会员定价', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 19h12M4.5 7.5l4 3.5L12 5l3.5 6 4-3.5-1.5 8.5h-13L4.5 7.5z"/></svg>' } // i18n-key
]

const panelConfig = {
  basic: { title: '网站设置', desc: '配置网站基本信息' }, // i18n-key
  security: { title: '安全设置', desc: '管理密码策略和登录安全' }, // i18n-key
  token: { title: '令牌安全', desc: '配置令牌有效期和策略' }, // i18n-key
  notification: { title: '通知设置', desc: '管理系统通知方式' }, // i18n-key
  audit: { title: '审核设置', desc: '配置内容审核策略' }, // i18n-key
  appearance: { title: '外观设置', desc: '自定义系统外观主题' }, // i18n-key
  default: { title: '默认设置', desc: '配置系统默认行为' }, // i18n-key
  vip: { title: '大会员定价', desc: '配置大会员开通与续期价格' } // i18n-key
}
const currentPanel = computed(() => panelConfig[activeNav.value] || panelConfig.basic)

const defaults = {
  siteName: 'VideoHub', siteDesc: t('视频平台管理后台'), siteUrl: 'https://videohub.com',
  language: 'zh-CN', timezone: 'Asia/Shanghai',
  primaryColor: '#fb7299', darkMode: false, compactMode: false, sidebarStyle: 'dark',
  video_review: false, comment_review: false, sensitive_word_filter: false,
  loginNotify: true, sessionTimeout: 30, default_password: '123456',
  front_access_token_expiry: 30, front_refresh_token_expiry: 7,
  backend_access_token_expiry: 15, backend_refresh_token_expiry: 7,
  videoReviewNotify: true, commentNotify: true, reportNotify: true,
  default_role: '', default_category: '', vip_price_per_month: 25, vip_pricing_plans: '[]'
}

const apiToForm = {
  siteName: 'siteName', siteDesc: 'siteDesc', siteUrl: 'siteUrl',
  language: 'language', timezone: 'timezone',
  primaryColor: 'primaryColor', darkMode: 'darkMode', compactMode: 'compactMode', sidebarStyle: 'sidebarStyle',
  video_review: 'video_review', comment_review: 'comment_review', sensitive_word_filter: 'sensitive_word_filter',
  loginNotify: 'loginNotify', sessionTimeout: 'sessionTimeout', default_password: 'default_password',
  front_access_token_expiry: 'front_access_token_expiry', front_refresh_token_expiry: 'front_refresh_token_expiry',
  backend_access_token_expiry: 'backend_access_token_expiry', backend_refresh_token_expiry: 'backend_refresh_token_expiry',
  videoReviewNotify: 'videoReviewNotify', commentNotify: 'commentNotify', reportNotify: 'reportNotify',
  default_role: 'default_role', default_category: 'default_category',
  vip_price_per_month: 'vip_price_per_month',
  vip_pricing_plans: 'vip_pricing_plans'
}

function parseApiValue(val) {
  if (val === 'true') return true
  if (val === 'false') return false
  if (val === 'null' || val === 'undefined') return null
  const num = Number(val)
  if (!isNaN(num) && val !== '') return num
  return val
}

const form = reactive({ ...defaults })
const settingsData = ref([])
const roleList = ref([])
const categoryList = ref([])
const serverPrimaryColor = ref('')
const showSaveMenu = ref(false)

// ===== 大会员定价套餐（web_config: vip_pricing_plans，JSON 数组）=====
const vipPlans = ref([])

function parseVipPlans(str) {
  try {
    const arr = JSON.parse(str)
    if (!Array.isArray(arr)) return []
    return arr.filter(p => p && typeof p === 'object').map(p => ({
      name: p.name || '',
      durationMonths: p.durationMonths ?? 1,
      price: p.price ?? null,
      originalPrice: p.originalPrice ?? null,
      autoOrig: p.autoOrig !== false
    }))
  } catch { return [] }
}

function addVipPlan() {
  const row = { name: '', durationMonths: 1, price: null, originalPrice: null, autoOrig: true }
  vipPlans.value.push(row)
  recalcPlanOrig(row)
}

// 原价自动回填：时长 × 月单价（保留两位小数）
function recalcPlanOrig(p) {
  const months = Number(p.durationMonths)
  const unit = Number(form.vip_price_per_month)
  if (!Number.isFinite(months) || months < 1) return
  if (!Number.isFinite(unit) || unit <= 0) return
  p.originalPrice = Math.round(months * unit * 100) / 100
}

function validateVipPlans() {
  const seen = new Set()
  for (const p of vipPlans.value) {
    const m = Number(p.durationMonths)
    if (!Number.isInteger(m) || m < 1 || m > 120) return t('套餐月数必须为 1~120 的整数')
    if (seen.has(m)) return t('套餐月数重复，请修改后再保存')
    seen.add(m)
    const price = Number(p.price)
    if (!price || price <= 0 || Number.isNaN(price)) return t('套餐现价必须大于0')
  }
  return ''
}

function normalizeVipPlans(list) {
  return list.map(p => ({
    name: (p.name || '').trim(),
    durationMonths: Number(p.durationMonths),
    price: p.price === null || p.price === undefined || p.price === '' ? null : Number(p.price),
    originalPrice: p.originalPrice === null || p.originalPrice === undefined || p.originalPrice === '' ? null : Number(p.originalPrice),
    autoOrig: p.autoOrig !== false
  }))
}

// form ↔ 数组双向同步（load/reset 走 form→数组，编辑走 数组→form）；
// 双端都用规范化 JSON（含 autoOrig 标记），口径一致才不会误判重解析
watch(() => form.vip_pricing_plans, (str) => {
  const next = str || '[]'
  if (JSON.stringify(normalizeVipPlans(vipPlans.value)) === next) return
  vipPlans.value = parseVipPlans(next)
})
watch(vipPlans, (list) => {
  const s = JSON.stringify(normalizeVipPlans(list))
  if (form.vip_pricing_plans !== s) form.vip_pricing_plans = s
}, { deep: true })

// 自动回填原价：autoOrig 未关闭的行跟随 时长 × 月单价；
// 手动改过原价的行 autoOrig=false（随 JSON 持久化），不覆盖
watch(() => vipPlans.value.map(p => p.durationMonths), () => {
  vipPlans.value.forEach(p => { if (p.autoOrig) recalcPlanOrig(p) })
})
watch(() => form.vip_price_per_month, () => {
  vipPlans.value.forEach(p => { if (p.autoOrig) recalcPlanOrig(p) })
})

const presetColors = [
  { name: '品牌粉', value: '#fb7299' }, // i18n-key
  { name: '科技蓝', value: '#00a1d6' }, // i18n-key
  { name: '优雅紫', value: '#7c5cfc' }, // i18n-key
  { name: '活力橙', value: '#ff8c42' }, // i18n-key
  { name: '成功绿', value: '#4caf50' } // i18n-key
]

const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '', captcha: '' })
const canSubmitPassword = computed(() => passwordForm.oldPassword && passwordForm.newPassword && passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.captcha)

watch(() => form.primaryColor, (v) => {
  document.documentElement.style.setProperty('--color-primary', v)
}, { immediate: true })

watch(() => form.darkMode, (v) => {
  if (v === appStore.darkMode) return
  appStore.setDarkMode(v)
})

watch(() => form.compactMode, (v) => {
  document.documentElement.classList.toggle('compact-mode', v)
})

watch(() => form.sidebarStyle, (v) => {
  appStore.setSidebarStyle(v)
})

async function loadSettings() {
  try {
    const res = await getSettingsList()
    const list = res.data || []
    settingsData.value = list
    list.forEach(item => {
      const formKey = apiToForm[item.key]
      if (formKey && defaults[formKey] !== undefined) {
        let val = item.key === 'default_password' ? String(item.value ?? '') : parseApiValue(item.value)
        if (item.key === 'front_access_token_expiry' || item.key === 'backend_access_token_expiry') {
          val = Math.round(val / 60000)
        } else if (item.key === 'front_refresh_token_expiry' || item.key === 'backend_refresh_token_expiry') {
          val = Math.round(val / 86400000)
        }
        form[formKey] = val
        if (item.key === 'primaryColor') serverPrimaryColor.value = val
      }
    })
    applyLocalSettings()
    appStore.setSiteName(form.siteName)
  } catch (e) { console.error('加载设置失败', e) }
}

function applyLocalSettings() {
  try {
    const raw = localStorage.getItem('app_settings')
    if (!raw) return
    const local = JSON.parse(raw)
    Object.keys(defaults).forEach(k => {
      if (local[k] !== undefined) form[k] = local[k]
    })
  } catch (e) { console.error('读取本地设置失败', e) }
}

async function loadOptions() {
  try {
    const [roleRes, catRes] = await Promise.allSettled([
      getRoleList({ page: 1, size: 100 }),
      getEnabledCategories()
    ])
    if (roleRes.status === 'fulfilled') {
      const data = roleRes.value?.data
      roleList.value = data?.records || data || []
    }
    if (catRes.status === 'fulfilled') {
      const data = catRes.value?.data
      categoryList.value = Array.isArray(data) ? data : (data?.records || [])
    }
  } catch (e) { console.error('加载选项失败', e) }
}

const categoryMap = {
  siteName: 'basic', siteDesc: 'basic', siteUrl: 'basic', language: 'basic', timezone: 'basic',
  primaryColor: 'display', darkMode: 'display', compactMode: 'display', sidebarStyle: 'display',
  video_review: 'review', comment_review: 'review', sensitive_word_filter: 'review',
  loginNotify: 'security', sessionTimeout: 'security', default_password: 'security',
  front_access_token_expiry: 'token_security', front_refresh_token_expiry: 'token_security',
  backend_access_token_expiry: 'token_security', backend_refresh_token_expiry: 'token_security',
  videoReviewNotify: 'notification', commentNotify: 'notification', reportNotify: 'notification',
  default_role: 'default', default_category: 'default',
  vip_price_per_month: 'vip', vip_pricing_plans: 'vip'
}

async function saveSettings(scope = 'global') {
  showSaveMenu.value = false
  if (scope === 'local') {
    localStorage.setItem('app_settings', JSON.stringify({ ...form }))
    appStore.setSiteName(form.siteName)
    document.dispatchEvent(new CustomEvent('settings-updated'))
    ElMessage.success(t('已保存到本地浏览器'))
    return
  }
  saving.value = true
  const planErr = validateVipPlans()
  if (planErr) { ElMessage.warning(planErr); saving.value = false; return }
  try {
    const settings = []
    Object.keys(form).forEach(k => {
      let value = form[k]
      if (k === 'front_access_token_expiry' || k === 'backend_access_token_expiry') {
        value = value * 60 * 1000
      } else if (k === 'front_refresh_token_expiry' || k === 'backend_refresh_token_expiry') {
        value = value * 24 * 60 * 60 * 1000
      }
      const existing = settingsData.value.find(s => s.key === k)
      settings.push({
        id: existing?.id || null,
        category: existing?.category || categoryMap[k] || '',
        key: k,
        value
      })
    })
    await updateSettings(settings)
    localStorage.setItem('app_settings', JSON.stringify({ ...form }))
    serverPrimaryColor.value = form.primaryColor
    appStore.setSiteName(form.siteName)
    document.dispatchEvent(new CustomEvent('settings-updated'))
    ElMessage.success(t('设置保存成功'))
  } catch (e) {
    console.error(e)
  } finally { saving.value = false }
}

function resetToDefault() {
  Object.assign(form, { ...defaults })
}

async function refreshCaptcha() {
  captchaLoading.value = true
  try {
    const res = await getCaptcha({ captchaType: 'img_captcha' })
    const d = res.data || {}
    captchaKey.value = d.key || ''
    captchaUrl.value = d.captcha || ''
  } catch { captchaUrl.value = '' }
  finally { captchaLoading.value = false }
}

async function submitPassword() {
  passwordSaving.value = true
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    await changePassword({
      userId: user.id,
      username: user.userName,
      oldPassword: sparkMD5.hash(passwordForm.oldPassword),
      newPassword: sparkMD5.hash(passwordForm.newPassword),
      key: captchaKey.value,
      captcha: passwordForm.captcha,
      type:1
    })
    ElMessage.success(t('密码修改成功'))
    showPasswordModal.value = false
    passwordForm.oldPassword = ''; passwordForm.newPassword = ''; passwordForm.confirmPassword = ''; passwordForm.captcha = ''
  } catch {
    refreshCaptcha()
    passwordForm.captcha = ''
  }
  finally { passwordSaving.value = false }
}

watch(showPasswordModal, (v) => { if (v) refreshCaptcha() })

function closeSaveMenu() { showSaveMenu.value = false }

onMounted(() => {
  loadSettings()
  loadOptions()
  document.addEventListener('click', closeSaveMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeSaveMenu)
})
</script>

<style lang="scss" scoped>
.page-container { padding: 0; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary, #303133); margin: 0 0 4px; }
.page-sub { font-size: 13px; color: var(--text-secondary, #909399); }

.settings-grid { display: grid; grid-template-columns: 220px 1fr; gap: 20px; }

.settings-nav {
  background: var(--card-bg, #fff); border-radius: 14px; padding: 12px;
  border: 1px solid var(--border-color, #e4e7ed); height: fit-content; position: sticky; top: 20px;
}
.nav-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px;
  cursor: pointer; transition: all 0.2s ease; position: relative; color: var(--text-secondary, #909399); font-size: 14px;
  &:hover { background: var(--bg-color, #f5f7fa); color: var(--text-primary, #303133); }
  &.active {
    background: rgba(251,114,153,0.08); color: #fb7299; font-weight: 600;
    .nav-indicator { opacity: 1; transform: translateY(-50%) scaleY(1); }
  }
}
.nav-indicator {
  position: absolute; left: 0; top: 50%; transform: translateY(-50%) scaleY(0); width: 3px; height: 20px;
  background: #fb7299; border-radius: 0 3px 3px 0; opacity: 0; transition: all 0.25s ease;
}
.nav-icon { width: 20px; height: 20px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }

.settings-panel {
  background: var(--card-bg, #fff); border-radius: 14px;
  border: 1px solid var(--border-color, #e4e7ed); overflow: hidden;
}
.panel-header { padding: 24px 28px 0; }
.panel-title { font-size: 18px; font-weight: 700; color: var(--text-primary, #303133); margin: 0 0 4px; }
.panel-desc { font-size: 13px; color: var(--text-secondary, #909399); margin: 0; }
.panel-divider { height: 1px; background: var(--border-color, #f2f3f5); margin: 16px 0 0; }

.panel-body { padding: 24px 28px; }
.form-group { margin-bottom: 20px; }
.form-label { display: block; font-size: 15px; font-weight: 600; color: var(--text-primary, #303133); margin-bottom: 6px; }
.form-desc { font-size: 13px; color: var(--text-secondary, #909399); margin: 0 0 10px; }
.form-input, .form-textarea, .form-select {
  width: 100%; height: 40px; border-radius: 10px; border: 1px solid var(--border-color, #dcdfe6);
  padding: 0 14px; font-size: 13px; background: var(--card-bg, #fff); color: var(--text-primary, #303133);
  outline: none; transition: all 0.2s ease; box-sizing: border-box;
  &:focus { border-color: #fb7299; box-shadow: 0 0 0 2px rgba(251,114,153,0.15); }
}
.form-textarea { height: auto; padding: 10px 14px; resize: vertical; line-height: 1.5; }
.form-row { display: flex; gap: 16px; }
.form-half { flex: 1; }
.form-hint { font-size: 12px; margin-top: 4px; display: block;
  &.error { color: #f56c6c; }
}

.select-wrap {
  position: relative;
  &::after {
    content: ''; position: absolute; right: 12px; top: 50%; width: 0; height: 0;
    border-left: 4.5px solid transparent; border-right: 4.5px solid transparent;
    border-top: 5.5px solid var(--text-secondary, #909399); pointer-events: none;
    transform: translateY(-60%); transition: all 0.2s ease;
  }
  &:hover::after { border-top-color: #fb7299; }
}
.form-select { appearance: none; padding-right: 32px; cursor: pointer; }

.setting-item {
  display: flex; align-items: center; justify-content: space-between; padding: 16px 0;
  border-bottom: 1px solid var(--border-color, #f2f3f5);
}
.setting-info { display: flex; flex-direction: column; gap: 2px; }
.setting-title { font-size: 15px; font-weight: 600; color: var(--text-primary, #303133); }
.setting-desc { font-size: 13px; color: var(--text-secondary, #909399); }
.setting-btn {
  padding: 7px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
  background: rgba(251,114,153,0.1); color: #fb7299; border: none; transition: all 0.2s ease;
  &:hover { background: #fb7299; color: #fff; }
}
.suffix-input-wrapper {
  display: flex; align-items: center; gap: 8px;
}
.suffix-input {
  width: 80px; height: 36px; border-radius: 8px; border: 1px solid var(--border-color, #dcdfe6);
  padding: 0 10px; font-size: 13px; text-align: center; background: var(--card-bg, #fff);
  color: var(--text-primary, #303133); outline: none;
  &:focus { border-color: #fb7299; box-shadow: 0 0 0 2px rgba(251,114,153,0.15); }
}
.suffix-text { font-size: 13px; color: var(--text-secondary, #909399); }

/* ---- 大会员定价套餐 ---- */
.btn-sm { height: 32px; padding: 0 14px; font-size: 12px; }
.plan-block { padding-top: 16px; }
.plan-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.plan-title { font-size: 15px; font-weight: 600; color: var(--text-primary, #303133); }
.plan-cols, .plan-row {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr 0.9fr 0.9fr 72px;
  gap: 10px;
  align-items: center;
}
.plan-cols { margin-bottom: 8px; }
.plan-col { font-size: 12px; color: var(--text-secondary, #909399); font-weight: 500; text-align: center; }
.plan-row { margin-bottom: 8px; }
.plan-input {
  height: 36px; border-radius: 8px; border: 1px solid var(--border-color, #dcdfe6);
  padding: 0 10px; font-size: 13px; background: var(--card-bg, #fff);
  color: var(--text-primary, #303133); outline: none; width: 100%; box-sizing: border-box;
  text-align: center;
  &:focus { border-color: #fb7299; box-shadow: 0 0 0 2px rgba(251,114,153,0.15); }
}
.plan-del {
  height: 36px; border-radius: 8px; border: none; cursor: pointer;
  font-size: 12px; font-weight: 500;
  background: rgba(245,108,108,0.1); color: #f56c6c;
  transition: all 0.2s ease;
  &:hover { background: #f56c6c; color: #fff; }
}
.plan-empty {
  padding: 24px; text-align: center; font-size: 13px;
  color: var(--text-secondary, #909399);
  border: 1px dashed var(--border-color, #dcdfe6); border-radius: 10px;
}
.plan-hint { margin: 10px 0 0; font-size: 12px; color: var(--text-secondary, #909399); }
.pwd-input {
  width: 160px; height: 36px; border-radius: 8px; border: 1px solid var(--border-color, #dcdfe6);
  padding: 0 12px; font-size: 13px; background: var(--card-bg, #fff);
  color: var(--text-primary, #303133); outline: none; transition: all 0.2s ease;
  &:focus { border-color: #fb7299; box-shadow: 0 0 0 2px rgba(251,114,153,0.15); }
}
.section-block { margin-bottom: 24px; }
.section-title-bar {
  font-size: 15px; font-weight: 600; color: var(--text-primary, #303133);
  padding-left: 12px; margin-bottom: 8px; position: relative;
  &::before {
    content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
    width: 3px; height: 16px; background: #00a1d6; border-radius: 2px;
  }
}

.toggle-switch {
  width: 48px; height: 26px; border-radius: 13px; background: var(--border-color, #dcdfe6);
  cursor: pointer; position: relative; transition: all 0.3s ease; flex-shrink: 0;
  &.on { background: #fb7299; }
}
.toggle-thumb {
  position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%;
  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.15); transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  .on & { transform: translateX(22px); }
}

.color-palette { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 4px; }
.color-option {
  width: 36px; height: 36px; border-radius: 50%; cursor: pointer;
  border: 3px solid transparent; transition: all 0.25s ease;
  display: flex; align-items: center; justify-content: center; box-sizing: border-box;
  &:hover { transform: scale(1.1); }
  &.active { border-color: var(--color-primary, #fb7299); box-shadow: 0 0 0 2px var(--card-bg, #fff), 0 2px 8px rgba(0,0,0,0.15); }
}
.persist-palette {
  margin-top: 16px; padding: 14px 16px; border-radius: 10px;
  background: var(--bg-color, #f6f7f9); border: 1px dashed var(--border-color, #dcdfe6);
}
.persist-label { font-size: 12px; font-weight: 600; color: var(--text-secondary, #909399); margin-bottom: 10px; }

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-8px); }

.radio-group { display: flex; gap: 20px; align-items: center; }
.radio-item {
  display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer;
  color: var(--text-primary, #303133); transition: color 0.2s ease;
  &:hover { color: #fb7299; }
  &.active { color: #fb7299; }
}
.radio-dot {
  width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border-color, #dcdfe6);
  position: relative; transition: all 0.2s ease; box-sizing: border-box; flex-shrink: 0;
  .active & { border-color: #fb7299; }
  .active &::after {
    content: ''; position: absolute; inset: 3px; border-radius: 50%; background: #fb7299;
  }
}

.save-btn-group { position: relative; display: flex; }
.save-main { border-radius: 10px 0 0 10px !important; padding: 0 20px !important; }
.save-arrow {
  border-radius: 0 10px 10px 0 !important; padding: 0 12px !important;
  border-left: 1px solid rgba(255,255,255,0.25) !important;
}
.save-dropdown {
  position: absolute; bottom: calc(100% + 8px); right: 0; width: 220px; z-index: 20;
  background: var(--card-bg, #fff); border: 1px solid var(--border-color, #ebeef5);
  border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); padding: 6px; box-sizing: border-box;
}
.save-dropdown-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px;
  cursor: pointer; color: var(--text-primary, #303133); transition: background 0.2s ease;
  svg { flex-shrink: 0; color: var(--text-secondary, #909399); }
  &:hover { background: rgba(251,114,153,0.06); }
  &:hover svg { color: #fb7299; }
}
.save-dropdown-label { font-size: 13px; font-weight: 600; }
.save-dropdown-desc { font-size: 12px; color: var(--text-secondary, #909399); margin-top: 1px; }

.settings-footer {
  display: flex; justify-content: flex-end; gap: 12px; padding: 16px 28px;
  border-top: 1px solid var(--border-color, #f2f3f5);
}

.btn {
  height: 38px; padding: 0 24px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer;
  border: none; transition: all 0.25s ease; display: inline-flex; align-items: center; gap: 6px;
  svg { flex-shrink: 0; }
  &.btn-primary {
    background: linear-gradient(135deg, #fb7299, #ff9ac6); color: #fff;
    box-shadow: 0 2px 8px rgba(251,114,153,0.25);
    &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(251,114,153,0.4); }
    &:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
  }
  &.btn-outline {
    background: transparent; color: var(--text-secondary, #909399); border: 1px solid var(--border-color, #dcdfe6);
    &:hover { color: #fb7299; border-color: #fb7299; background: rgba(251,114,153,0.04); }
  }
  &.setting-btn {
    background: rgba(251,114,153,0.08); color: #fb7299; border: 1px solid rgba(251,114,153,0.2);
    &:hover { background: rgba(251,114,153,0.15); }
  }
}

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  z-index: 2000; display: flex; align-items: center; justify-content: center;
}
.modal-card {
  background: var(--card-bg, #fff); border-radius: 16px; box-shadow: 0 24px 80px rgba(0,0,0,0.18);
}
.modal-password { width: 420px; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center; padding: 20px 24px;
  border-bottom: 1px solid var(--border-color, #f2f3f5);
  h3 { margin: 0; font-size: 17px; font-weight: 600; color: var(--text-primary, #303133); }
}
.modal-close {
  background: none; border: none; font-size: 22px; cursor: pointer; color: var(--text-secondary, #909399);
  padding: 4px 8px; border-radius: 8px; transition: all 0.15s;
  &:hover { background: var(--bg-color, #f5f7fa); color: var(--text-primary, #303133); }
}
.modal-body { padding: 24px; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px;
  border-top: 1px solid var(--border-color, #f2f3f5);
}

.captcha-row { display: flex; gap: 12px; align-items: center; }
.captcha-img {
  width: 120px; height: 40px; border-radius: 8px; overflow: hidden; cursor: pointer;
  border: 1px solid var(--border-color, #dcdfe6); display: flex; align-items: center; justify-content: center;
  background: var(--bg-color, #f5f7fa); flex-shrink: 0; transition: all 0.2s;
  &:hover { border-color: #fb7299; }
  &.loading { opacity: 0.6; }
  img { width: 100%; height: 100%; object-fit: cover; }
}
.captcha-placeholder { font-size: 12px; color: var(--text-secondary, #909399); }

.modal-fade-enter-active { transition: opacity 0.2s ease; .modal-card { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease; } }
.modal-fade-leave-active { transition: opacity 0.15s ease; .modal-card { transition: transform 0.15s ease, opacity 0.15s ease; } }
.modal-fade-enter-from { opacity: 0; .modal-card { transform: scale(0.9) translateY(16px); opacity: 0; } }
.modal-fade-leave-to { opacity: 0; .modal-card { transform: scale(0.95); opacity: 0; } }

@keyframes spin { to { transform: rotate(360deg); } }

html.dark-mode {
  .settings-nav, .settings-panel { background: var(--card-bg); border-color: var(--border-color); }
  .nav-item:hover { background: var(--bg-color); }
  .nav-item.active { background: rgba(251,114,153,0.12); }
  .form-input, .form-textarea, .form-select { background: var(--bg-color); border-color: var(--border-color); color: var(--text-primary); }
  .plan-input { background: var(--bg-color); border-color: var(--border-color); color: var(--text-primary); }
  .plan-empty { border-color: var(--border-color); }
  .plan-title { color: var(--text-primary); }
  .modal-card { background: var(--card-bg); }
  .toggle-switch { background: var(--border-color); &.on { background: #fb7299; } }
}
</style>

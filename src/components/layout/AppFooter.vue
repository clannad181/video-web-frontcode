<template>
  <footer class="bili-footer">
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-brand">
          <svg viewBox="0 0 28 16" width="28" height="16" class="footer-logo">
            <path d="M4.93 0L2.81 5.28H0L4.93 0Z" fill="var(--brand_pink)"/>
            <path d="M7.09 0L9.21 5.28H14.14L7.09 0Z" fill="var(--brand_pink)"/>
            <path d="M18.91 0L16.79 5.28H11.86L18.91 0Z" fill="var(--brand_pink)"/>
            <path d="M23.07 0L25.19 5.28H28L23.07 0Z" fill="var(--brand_pink)"/>
            <path d="M4.93 5.28H0L2.81 10.56H4.93V5.28Z" fill="var(--brand_pink)"/>
            <path d="M14.14 5.28H9.21L7.09 10.56H14.14V5.28Z" fill="var(--brand_pink)"/>
            <path d="M11.86 5.28H16.79L18.91 10.56H11.86V5.28Z" fill="var(--brand_pink)"/>
            <path d="M28 5.28H25.19L23.07 10.56H28V5.28Z" fill="var(--brand_pink)"/>
            <circle cx="2.81" cy="13" r="2" fill="var(--brand_pink)"/>
            <circle cx="9.21" cy="13" r="2" fill="var(--brand_pink)"/>
            <circle cx="18.91" cy="13" r="2" fill="var(--brand_pink)"/>
            <circle cx="25.19" cy="13" r="2" fill="var(--brand_pink)"/>
          </svg>
          <span class="footer-slogan">{{ siteName }}</span>
        </div>
        <div class="footer-links">
          <a href="#">关于我们</a>
          <span class="link-divider">|</span>
          <a href="#">联系我们</a>
          <span class="link-divider">|</span>
          <a href="#">用户协议</a>
          <span class="link-divider">|</span>
          <a href="#">隐私政策</a>
          <span class="link-divider">|</span>
          <a href="#">帮助中心</a>
        </div>
        <div class="footer-social">
          <a href="#" class="social-link" title="微博">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--text4)">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </a>
          <a href="#" class="social-link" title="微信">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--text4)">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© {{ currentYear }} VideoHub - 仅供学习演示使用</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const siteName = ref('VideoHub')
const currentYear = new Date().getFullYear()

const loadSettings = () => {
  try {
    const settings = JSON.parse(localStorage.getItem('front_settings') || '{}')
    if (settings.siteName) siteName.value = settings.siteName
  } catch {}
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.bili-footer {
  background: var(--bg1);
  border-top: 1px solid var(--line_light);
}

.footer-container {
  max-width: 2078px;
  margin: 0 auto;
  padding: 32px var(--layout-padding);
}

.footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-logo {
  flex-shrink: 0;
}

.footer-slogan {
  font-size: 14px;
  font-weight: 600;
  color: var(--text1);
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-links a {
  font-size: 13px;
  color: var(--text3);
  text-decoration: none;
  transition: all 0.2s;
}

.footer-links a:hover {
  color: var(--brand_pink);
}

.link-divider {
  color: var(--line_regular);
  font-size: 12px;
}

.footer-social {
  display: flex;
  gap: 12px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all 0.2s;
}

.social-link:hover {
  background: var(--brand_pink_thin);
}

.footer-bottom {
  padding-top: 20px;
  border-top: 1px solid var(--line_light);
  text-align: center;
}

.footer-bottom p {
  font-size: 12px;
  color: var(--text4);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .footer-container {
    padding: 24px 16px;
  }

  .footer-top {
    flex-direction: column;
    gap: 16px;
  }

  .footer-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>

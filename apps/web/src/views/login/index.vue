<template>
  <div class="login_container">
    <div class="login_box">
      <div class="login_left">
        <div class="brand_content">
          <!-- <div class="brand_logo">🛡️</div>
          <h1 class="brand_title">公安业务</h1>
          <h2 class="brand_subtitle">综合管理平台</h2>
          <div class="brand_decor">
            <span>安全</span> · <span>高效</span> · <span>严谨</span>
          </div> -->
        </div>
      </div>

      <div class="login_right">
        <div class="form_header">
          <h3>用户登录</h3>
          <p>请验证身份以访问系统</p>
        </div>

        <form @submit.prevent="handleLogin" class="login_form">
          <div class="form_item" style="position: relative">
            <input
              v-model="loginForm.account"
              type="text"
              placeholder="请输入账号"
              @focus="showHistory = true"
              @blur="showHistory = false"
              required />

            <transition name="fade">
              <div
                v-if="showHistory && userStore.accountList.length"
                class="history_dropdown">
                <div
                  v-for="acc in userStore.accountList"
                  :key="acc"
                  class="history_item"
                  @click="selectAccount(acc)">
                  <span>{{ acc }}</span>
                  <span class="delete_btn" @click.stop="removeHistory(acc)"
                    >✕</span
                  >
                </div>
              </div>
            </transition>
          </div>

          <div class="form_item">
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              required />
          </div>

          <div class="login_options">
            <label class="option_label">
              <input type="checkbox" v-model="userStore.rememberMe" />
              <span>记住我</span>
            </label>
            <label class="option_label">
              <input type="checkbox" v-model="userStore.autoLogin" />
              <span>自动登录</span>
            </label>
          </div>

          <button type="submit" :disabled="loading" class="login_btn">
            {{ loading ? '正在验证安全环境...' : '进入系统' }}
          </button>
        </form>

        <div class="login_footer">
          <span>忘记密码</span>
          <span class="divider">|</span>
          <span>CA证书登录</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@project/store'
import { BaseMessage } from '@project/ui'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const showHistory = ref(false)

const loginForm = reactive({
  account: '',
  password: '',
})

// 选择历史账号
const selectAccount = (acc: string) => {
  loginForm.account = acc
  // 如果选中的是上次记住的账号，回填星号占位
  if (
    userStore.rememberMe &&
    acc === userStore.lastAccount &&
    userStore.savedPassword
  ) {
    loginForm.password = '******'
  } else {
    loginForm.password = ''
  }
  showHistory.value = false
}

const handleLogin = async () => {
  if (loading.value) return
  loading.value = true

  try {
    // 调用 Store 封装后的登录，内部已处理 MD5 和账号存储
    await userStore.login(loginForm)

    BaseMessage.success('安全验证通过')

    router.push('/home')
  } catch (error: any) {
    console.error(error)
    const msg = error.response?.data?.message || '登录失败，请检查账号密码'
    BaseMessage.error(msg)
  } finally {
    loading.value = false
  }
}

const removeHistory = (acc: string) => {
  userStore.removeHistoryAccount(acc)
  // 如果删除的正是当前输入的账号，触发清空联动
  if (loginForm.account === acc) {
    loginForm.account = ''
    loginForm.password = ''
  }
}

watch(
  () => loginForm.account,
  (newAccount) => {
    // 当账号被手动清空，或者点击删除按钮导致账号不存在时
    if (!newAccount) {
      loginForm.password = ''
    }
  },
)

onMounted(() => {
  // 回填逻辑
  if (userStore.lastAccount) {
    loginForm.account = userStore.lastAccount
  }
  if (userStore.rememberMe && userStore.savedPassword) {
    loginForm.password = '******'
  }

  // 自动登录逻辑：确保有 Token 且开启了开关
  if (userStore.autoLogin && userStore.token) {
    handleLogin()
  }
})
</script>

<style scoped lang="scss">
/* --- 登录大容器 --- */
.login_container {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $bg-1; // 使用最底层背景
}

/* --- 登录卡片外框 --- */
.login_box {
  display: flex;
  width: 720px;
  height: 420px;
  background: $bg-3; // 提升至浮层背景色
  overflow: hidden;
  box-shadow: $s-3; // 使用深度投影
  border-radius: $radius-l;
  border: 1px solid $b-1;
}

/* --- 左侧品牌区 --- */
.login_left {
  flex: 1.2;
  background: $p-grad; // 使用 Store 动态生成的品牌渐变
  display: flex;
  align-items: center;
  justify-content: center;
  color: $t-w;
  position: relative;

  // 增加一个微弱的叠加层，防止背景过亮导致文字看不清
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1));
  }
}

.brand_content {
  text-align: center;
  z-index: 1;
}

.brand_title {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 4px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.brand_subtitle {
  font-size: 16px;
  font-weight: 300;
  margin-top: 8px;
  opacity: 0.85;
}

.brand_decor {
  margin-top: 40px;
  font-size: 12px;
  opacity: 0.7;
  letter-spacing: 1px;
}

/* --- 右侧表单区 --- */
.login_right {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: $bg-3;
}

.form_header {
  margin-bottom: 32px;

  h3 {
    font-size: 22px;
    color: $t-1; // 一级文字
    margin: 0;
    font-weight: 600;
  }

  p {
    font-size: 13px;
    color: $t-3; // 辅助文字
    margin-top: 8px;
  }
}

.form_item {
  margin-bottom: 24px;
  position: relative;

  input {
    color: $t-1;
    width: 100%;
    padding: 12px 0;
    border: none;
    border-bottom: 1px solid $b-2; // 强对比边框线
    background: transparent;
    outline: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 15px;

    &::placeholder {
      color: $t-dis; // 禁用/占位文字
    }

    &:focus {
      border-bottom-color: $p; // 聚焦时变为品牌色
      transform: translateY(-1px);
    }
  }
}

.login_options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 28px;
}

.option_label {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: $t-2;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;

  input {
    margin-right: 8px;
    cursor: pointer;
    accent-color: $p; // 自动匹配品牌色
  }

  &:hover {
    color: $p;
  }
}

/* --- 历史记录下拉框 --- */
.history_dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: -8px;
  right: -8px;
  background: $bg-3;
  backdrop-filter: blur(12px);
  border: 1px solid $b-1;
  border-radius: $radius-m;
  box-shadow: $s-2; // 中等投影
  z-index: $z-popover;
  max-height: 160px;
  overflow-y: auto;
  padding: 4px 0;
}

.history_item {
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: $t-2;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: $bg-h; // 中性悬浮背景
    color: $p; // 悬浮时文字变色
  }
}

.delete_btn {
  font-size: 12px;
  color: $t-dis;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-full;
  transition: all 0.2s;

  &:hover {
    background: $f-1;
    color: $danger; // 使用系统危险色
  }
}

/* --- 登录按钮 --- */
.login_btn {
  width: 100%;
  padding: 12px;
  background: $p; // 品牌主色
  color: $p-text; // 品牌背景上的文字色
  border: none;
  border-radius: $radius-m;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 10px $p-shadow;

  &:hover:not(:disabled) {
    background: $p-hover; // 品牌悬浮色
    transform: translateY(-1px);
    box-shadow: 0 6px 15px $p-shadow;
  }

  &:active:not(:disabled) {
    background: $p-active; // 品牌点击态
    transform: translateY(0);
  }

  &:disabled {
    background: $f-2; // 交互填充色（灰色）
    color: $t-dis;
    cursor: not-allowed;
    box-shadow: none;
  }
}

.login_footer {
  margin-top: 30px;
  font-size: 13px;
  color: $t-3;
  text-align: center;

  span {
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: $p;
    }
  }
}

.divider {
  margin: 0 12px;
  color: $b-1;
  cursor: default !important;
}

/* --- 动画 --- */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

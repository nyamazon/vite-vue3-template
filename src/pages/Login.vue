<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
      <div class="decoration-grid"></div>
    </div>

    <!-- 主要内容 -->
    <div class="login-container">
      <!-- 左侧信息区域 -->
      <div class="login-info">
        <div class="info-content">
          <div class="logo-section">
            <div class="logo">
              <el-icon size="48"><Setting /></el-icon>
            </div>
            <h1>项目管理系统</h1>
            <p class="subtitle">技术策划部 · 项目全生命周期管理平台</p>
          </div>

          <div class="features">
            <div class="feature-item">
              <el-icon class="feature-icon"><TrendCharts /></el-icon>
              <div class="feature-text">
                <h3>项目全景看板</h3>
                <p>实时掌控项目进度，智能预警风险</p>
              </div>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><FolderOpened /></el-icon>
              <div class="feature-text">
                <h3>分类项目管理</h3>
                <p>五大系统、特色体系、部门项目分类管理</p>
              </div>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><List /></el-icon>
              <div class="feature-text">
                <h3>任务协作跟踪</h3>
                <p>任务拆解执行，团队协作无缝对接</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-form-section">
        <el-card class="login-card" shadow="always">
          <div class="form-header">
            <h2>欢迎登录</h2>
            <p>请登录您的账户以继续使用系统</p>
          </div>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            size="large"
            @submit.prevent="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                :prefix-icon="User"
                clearable
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                show-password
                clearable
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <el-form-item>
              <div class="form-options">
                <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
                <el-link type="primary" :underline="'never'" @click="handleForgetPassword">
                  忘记密码？
                </el-link>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                class="login-button"
                :loading="loading"
                @click="handleLogin"
              >
                <span v-if="!loading">登录</span>
                <span v-else>登录中...</span>
              </el-button>
            </el-form-item>
          </el-form>

          <div class="form-footer">
            <p class="footer-text">首次使用？请联系系统管理员开通账户</p>
            <div class="system-info">
              <el-tag effect="plain" size="small">技术策划部</el-tag>
              <el-tag effect="plain" size="small">v1.0.0</el-tag>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="login-footer">
      <div class="footer-content">
        <div class="copyright">© 2025 技术策划部项目管理系统. All rights reserved.</div>
        <div class="footer-links">
          <el-link type="info" :underline="'never'">使用帮助</el-link>
          <el-divider direction="vertical" />
          <el-link type="info" :underline="'never'">系统状态</el-link>
          <el-divider direction="vertical" />
          <el-link type="info" :underline="'never'">联系支持</el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { User, Lock, Setting, TrendCharts, FolderOpened, List } from '@element-plus/icons-vue';
  import { loginReq } from '@/api/index';

  const router = useRouter();
  const loginFormRef = ref();
  const loading = ref(false);

  // 登录表单数据
  const loginForm = reactive({
    username: '',
    password: '',
    token: '',
  });

  const handleForgetPassword = () => {
    ElMessageBox.alert('请联系系统管理员重置密码', '提示', {
      confirmButtonText: '好的',
      callback: (action) => {
        console.log(action);
      },
    });
  };

  // 表单验证规则
  const loginRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' },
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    ],
  };

  // 登录处理
  const handleLogin = async () => {
    if (!loginFormRef.value) return;
    try {
      await loginFormRef.value.validate();
      loading.value = true;

      const res = await loginReq(loginForm);
      console.log(res);
      if (res.code === 200) {
        ElMessage.success('登录成功！正在跳转中...');

        // 存储用户信息
        const userInfo = res.result || {
          nickName: 'admin',
          role: '系统管理员',
          token: '',
          userId: 666,
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        // 跳转到主页
        setTimeout(() => {
          router.push('/projects');
        }, 500);
      } else {
        ElMessage.error('用户名或密码错误');
      }
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 快速登录
  const quickLogin = (user) => {
    loginForm.username = user.username;
    loginForm.password = user.password;
    handleLogin();
  };
</script>

<style lang="scss" scoped>
  .login-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #395c9b 100%);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  .background-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 1;

    .decoration-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);

      &.circle-1 {
        width: 300px;
        height: 300px;
        top: -150px;
        right: -150px;
        animation: float 6s ease-in-out infinite;
      }

      &.circle-2 {
        width: 200px;
        height: 200px;
        bottom: -100px;
        left: -100px;
        animation: float 8s ease-in-out infinite reverse;
      }

      &.circle-3 {
        width: 150px;
        height: 150px;
        top: 50%;
        left: 10%;
        animation: float 10s ease-in-out infinite;
      }
    }

    .decoration-grid {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: grid-move 20s linear infinite;
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
    }
  }

  @keyframes grid-move {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(50px, 50px);
    }
  }

  .login-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    position: relative;
    z-index: 2;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .login-info {
    flex: 1;
    max-width: 500px;
    margin-right: 60px;
    color: white;

    .info-content {
      .logo-section {
        margin-bottom: 48px;

        .logo {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        h1 {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 8px;
          background: linear-gradient(45deg, #fff, #e0e7ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 16px;
          opacity: 0.9;
          line-height: 1.6;
        }
      }

      .features {
        margin-bottom: 48px;

        .feature-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 24px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s;

          &:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateX(8px);
          }

          .feature-icon {
            font-size: 24px;
            margin-right: 16px;
            margin-top: 4px;
            opacity: 0.9;
          }

          .feature-text {
            h3 {
              font-size: 16px;
              margin-bottom: 4px;
            }

            p {
              font-size: 14px;
              opacity: 0.8;
              line-height: 1.5;
            }
          }
        }
      }

      .stats {
        display: flex;
        gap: 32px;

        .stat-item {
          text-align: center;

          .stat-number {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 4px;
            background: linear-gradient(45deg, #fff, #e0e7ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .stat-label {
            font-size: 14px;
            opacity: 0.8;
          }
        }
      }
    }
  }

  .login-form-section {
    width: 520px;
    flex-shrink: 0;
  }

  .login-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);

    :deep(.el-card__body) {
      padding: 40px;
    }

    .form-header {
      text-align: center;
      margin-bottom: 32px;

      h2 {
        font-size: 28px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
      }

      p {
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
    }

    .login-form {
      .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      .login-button {
        width: 100%;
        height: 48px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 8px;
      }
    }

    .quick-login {
      margin: 24px 0;

      .divider-text {
        color: var(--el-text-color-placeholder);
        font-size: 14px;
      }

      .quick-login-buttons {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 16px;

        .quick-user-btn {
          width: 100%;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
          padding: 0 16px;
          border: 1px solid var(--el-border-color-light);
          background: var(--el-fill-color-lighter);
          transition: all 0.3s;

          &:hover {
            background: var(--el-color-primary-light-9);
            border-color: var(--el-color-primary-light-5);
          }

          .user-avatar {
            background: var(--el-color-primary);
          }

          span {
            flex: 1;
            text-align: left;
            font-weight: 500;
          }
        }
      }
    }

    .form-footer {
      text-align: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--el-border-color-lighter);

      .footer-text {
        color: var(--el-text-color-placeholder);
        font-size: 14px;
        margin-bottom: 12px;
      }

      .system-info {
        display: flex;
        justify-content: center;
        gap: 8px;
      }
    }
  }

  .login-footer {
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 20px;
    position: relative;
    z-index: 2;

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;

      .footer-links {
        display: flex;
        align-items: center;
        gap: 8px;

        .el-link {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;

          &:hover {
            color: white;
          }
        }

        .el-divider {
          border-color: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 1024px) {
    .login-container {
      flex-direction: column;
      padding: 20px;

      .login-info {
        margin-right: 0;
        margin-bottom: 40px;
        max-width: 100%;
        text-align: center;

        .features {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .stats {
          justify-content: center;
        }
      }

      .login-form-section {
        width: 100%;
        max-width: 420px;
      }
    }
  }

  @media (max-width: 768px) {
    .login-info {
      .info-content {
        .logo-section {
          h1 {
            font-size: 28px;
          }
        }

        .features {
          .feature-item {
            padding: 12px;

            .feature-icon {
              font-size: 20px;
            }
          }
        }

        .stats {
          gap: 20px;

          .stat-item {
            .stat-number {
              font-size: 24px;
            }
          }
        }
      }
    }

    .login-card {
      :deep(.el-card__body) {
        padding: 24px;
      }
    }

    .login-footer {
      .footer-content {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }
    }
  }
</style>

<template>
  <el-aside :width="isCollapsed ? '64px' : '256px'" class="sidebar">
    <!-- Header -->
    <div class="sidebar-header">
      <div v-if="!isCollapsed" class="header-info">
        <h1>项目管理系统</h1>
        <p>技术策划部</p>
      </div>
      <el-button :icon="isCollapsed ? Expand : Fold" circle size="small" @click="toggleCollapse" />
    </div>

    <!-- Navigation -->
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :collapse="isCollapsed"
      :collapse-transition="false"
      router
    >
      <el-menu-item
        v-for="item in navigation"
        :key="item.name"
        :index="item.href"
        class="menu-item"
      >
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <template #title>
          <div class="menu-content">
            <span class="menu-title">{{ item.name }}</span>
            <span class="menu-desc">{{ item.description }}</span>
          </div>
        </template>
      </el-menu-item>
    </el-menu>

    <!-- Footer -->
    <div v-if="!isCollapsed" class="sidebar-footer">
      <el-card class="user-card" shadow="never">
        <div class="user-info">
          <el-avatar size="small" :icon="UserFilled" />
          <div class="user-details">
            <p class="user-name">{{ userInfo.name }}</p>
            <p class="user-role">{{ userInfo.role }}</p>
          </div>
        </div>
      </el-card>
    </div>
  </el-aside>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import {
    Expand,
    Fold,
    UserFilled,
    Odometer,
    FolderOpened,
    List,
    TrendCharts,
    Setting,
  } from '@element-plus/icons-vue';

  const route = useRoute();
  const isCollapsed = ref(false);

  const navigation = [
    {
      name: '项目全景看板',
      href: '/',
      icon: Odometer,
      description: '部门项目全局掌控中心',
    },
    {
      name: '项目管理',
      href: '/projects',
      icon: FolderOpened,
      description: '项目全生命周期管理',
    },
    {
      name: '任务管理',
      href: '/tasks',
      icon: List,
      description: '任务拆解与执行跟踪',
    },
  ];

  const activeMenu = computed(() => {
    return route.path;
  });

  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
  };

  const userInfo = ref({
    name: '张三',
    role: '技术策划部 - 项目经理',
  });

  onMounted(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const user = JSON.parse(storedUserInfo);
      console.log(user);
      userInfo.value = {
        name: user.nickName,
        role: `技术策划部 - 超级管理员`,
      };
    }
  });
</script>

<style lang="scss" scoped>
  .sidebar {
    background: white;
    border-right: 1px solid var(--el-border-color-light);
    display: flex;
    flex-direction: column;
    transition: width 0.3s;
    height: 100vh;

    &-header {
      padding: 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 64px;

      .header-info {
        h1 {
          font-size: 18px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 2px;
        }

        p {
          font-size: 12px;
          color: var(--el-text-color-regular);
          margin: 0;
        }
      }
    }

    &-menu {
      flex: 1;
      border-right: none;

      :deep(.el-menu-item) {
        height: 56px;
        line-height: 56px;

        &.is-active {
          background-color: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
          border-right: 3px solid var(--el-color-primary);

          .el-icon {
            color: var(--el-color-primary);
          }
        }

        &:hover {
          background-color: var(--el-fill-color-light);
        }
      }

      .menu-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .menu-title {
          font-size: 14px;
          font-weight: 500;
          line-height: 1.2;
        }

        .menu-desc {
          font-size: 12px;
          color: var(--el-text-color-placeholder);
          line-height: 1.2;
          margin-top: 2px;
        }
      }
    }

    &-footer {
      padding: 16px;
      border-top: 1px solid var(--el-border-color-lighter);

      .user-card {
        :deep(.el-card__body) {
          padding: 12px;
        }
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .user-details {
          flex: 1;

          .user-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin: 0 0 2px 0;
          }

          .user-role {
            font-size: 12px;
            color: var(--el-text-color-regular);
            margin: 0;
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      height: 100vh;
      box-shadow: var(--el-box-shadow);
    }
  }
</style>

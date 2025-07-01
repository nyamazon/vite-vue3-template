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
      :default-openeds="defaultOpeneds"
    >
      <template v-for="item in navigation" :key="item.name">
        <!-- 单级菜单项 -->
        <el-menu-item v-if="!item.children" :index="item.href" class="menu-item">
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

        <!-- 多级菜单项 -->
        <el-sub-menu v-else :index="item.name" class="sub-menu">
          <template #title>
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <div v-if="!isCollapsed" class="menu-content">
              <span class="menu-title">{{ item.name }}</span>
              <span class="menu-desc">{{ item.description }}</span>
            </div>
          </template>

          <!-- 子菜单项 -->
          <el-menu-item
            v-for="child in item.children"
            :key="child.name"
            :index="child.href"
            class="sub-menu-item"
          >
            <el-icon class="sub-icon">
              <component :is="child.icon" />
            </el-icon>
            <template #title>
              <div class="sub-menu-content">
                <span class="sub-menu-title">{{ child.name }}</span>
                <span class="sub-menu-desc">{{ child.description }}</span>
              </div>
            </template>
          </el-menu-item>
        </el-sub-menu>
      </template>
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
    Plus,
    Document,
    View,
    Edit,
    DataAnalysis,
    PieChart,
    Monitor,
    Tools,
    User,
    Lock,
    Bell,
    Files,
  } from '@element-plus/icons-vue';

  const route = useRoute();
  const isCollapsed = ref(false);

  const navigation = [
    // {
    //   name: '项目全景看板',
    //   href: '/dashboard',
    //   icon: Odometer,
    //   description: '部门项目全局掌控中心',
    // },
    {
      name: '项目管理',
      icon: FolderOpened,
      href: '/projects',
      description: '项目全生命周期管理',
    },
    {
      name: '任务管理',
      icon: List,
      href: '/tasks/kanban',
      description: '任务拆解与执行跟踪',
      children: [
        {
          name: '任务看板',
          href: '/tasks/kanban',
          icon: View,
          description: '以看板/表格的形式查看所有任务',
        },
        {
          name: '任务流程',
          href: '/tasks/flow',
          icon: Bell,
          description: '以流程图的形式查看任务依赖关系',
        },
      ],
    },

    {
      name: '系统设置',
      icon: Setting,
      description: '系统配置管理',
      children: [
        {
          name: '项目配置',
          href: '/settings/projects',
          icon: Tools,
          description: '对所属项目配置管理',
        },
        {
          name: '用户管理',
          href: '/settings/users',
          icon: User,
          description: '对人员配置管理',
        },
      ],
    },
  ];

  // 计算当前激活的菜单项
  const activeMenu = computed(() => {
    return route.path;
  });

  // 计算默认展开的子菜单
  const defaultOpeneds = computed(() => {
    const openeds = [];
    navigation.forEach((item) => {
      if (item.children) {
        // 检查当前路由是否在子菜单中
        const hasActiveChild = item.children.some((child) => child.href === route.path);
        if (hasActiveChild) {
          openeds.push(item.name);
        }
      }
    });
    return openeds;
  });

  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
  };

  const userInfo = ref({
    name: '',
    role: '',
  });

  onMounted(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const user = JSON.parse(storedUserInfo);
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
          font-size: 14px;
          color: var(--el-text-color-regular);
          margin: 0;
        }
      }
    }

    &-menu {
      flex: 1;
      border-right: none;

      // 主菜单项样式
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

      // 子菜单样式
      :deep(.el-sub-menu) {
        .el-sub-menu__title {
          height: 56px;
          line-height: 56px;

          &:hover {
            background-color: var(--el-fill-color-light);
          }
        }

        // 子菜单项样式
        .el-menu-item {
          height: 48px;
          line-height: 48px;
          background-color: var(--el-fill-color-blank);
          border-left: 2px solid var(--el-border-color-lighter);
          margin-right: 8px;
          border-radius: 0 6px 6px 0;

          &.is-active {
            background-color: var(--el-color-primary-light-9);
            color: var(--el-color-primary);
            border-left-color: var(--el-color-primary);
            border-right: none;

            .el-icon {
              color: var(--el-color-primary);
            }
          }

          &:hover {
            background-color: var(--el-fill-color-light);
          }

          .sub-icon {
            font-size: 14px;
            margin-right: 8px;
          }
        }
      }

      // 菜单内容样式
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
          font-size: 14px;
          color: var(--el-text-color-placeholder);
          line-height: 1.2;
          margin-top: 2px;
        }
      }

      // 子菜单内容样式
      .sub-menu-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .sub-menu-title {
          font-size: 13px;
          font-weight: 500;
          line-height: 1.2;
        }

        .sub-menu-desc {
          font-size: 11px;
          color: var(--el-text-color-placeholder);
          line-height: 1.2;
          margin-top: 1px;
        }
      }

      // 折叠状态下的样式调整
      &.el-menu--collapse {
        :deep(.el-sub-menu) {
          .el-sub-menu__title {
            padding: 0 20px;
          }
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
            font-size: 14px;
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

<template>
  <div class="projects">
    <div class="projects-content">
      <!-- 项目分类标签页 -->
      <el-tabs v-model="activeCategory" class="category-tabs">
        <el-tab-pane
          v-for="category in projectCategoryOptions"
          :key="category.value"
          :label="category.label"
          :name="category.value"
        ></el-tab-pane>
      </el-tabs>

      <!-- 搜索和筛选 -->
      <!-- <div class="filters">
        <el-input
          v-model="searchTerm"
          placeholder="搜索项目名称或负责人..."
          :prefix-icon="Search"
          class="search-input"
          clearable
        />

        <div class="filter-controls">
          <el-select v-model="filterType" placeholder="任务类型" style="width: 160px">
            <el-option label="所有类型" value="all" />
            <el-option label="需求分析" value="需求分析" />
            <el-option label="技术方案设计" value="技术方案设计" />
            <el-option label="原型验证" value="原型验证" />
            <el-option label="测试支持" value="测试支持" />
            <el-option label="上线复盘" value="上线复盘" />
          </el-select>

          <el-select v-model="filterStatus" placeholder="状态" style="width: 120px">
            <el-option label="所有状态" value="all" />
            <el-option label="进行中" value="进行中" />
            <el-option label="即将完成" value="即将完成" />
            <el-option label="已完成" value="已完成" />
            <el-option label="延期" value="延期" />
          </el-select>
        </div>
      </div> -->
      <!-- 项目列表 -->
      <div class="projects-main">
        <!-- <div class="project-headline">
          <h2>五大系统</h2>
          <hr />
        </div> -->
        <div class="projects-list">
          <el-card
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-card"
            shadow="hover"
            @click="goToProject(project.id)"
          >
            <div class="project-content">
              <div class="project-header">
                <div class="project-title">
                  <h3>{{ project.name }}</h3>
                  <div class="project-badges">
                    <el-tag size="small" :type="getCategoryTagType(project.category)" effect="dark">
                      {{ project.category }}
                    </el-tag>
                  </div>
                </div>

                <!-- <el-dropdown @command="handleCommand" trigger="click">
                  <el-button :icon="MoreFilled" circle size="small" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="`view-${project.id}`" :icon="View">
                        查看详情
                      </el-dropdown-item>
                      <el-dropdown-item :command="`edit-${project.id}`" :icon="Edit">
                        编辑项目
                      </el-dropdown-item>
                      <el-dropdown-item :command="`archive-${project.id}`" :icon="Delete">
                        归档项目
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown> -->
              </div>

              <p class="project-description">{{ project.description }}</p>
              <div class="project-btn">
                <el-button @click="jumpToProject(project)">访问项目</el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <el-empty
        v-if="filteredProjects.length === 0"
        :description="getEmptyDescription()"
        :image-size="120"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    Plus,
    Search,
    MoreFilled,
    View,
    Edit,
    Delete,
    User,
    Calendar,
    Clock,
    TrendCharts,
    Grid,
    Setting,
    Star,
    OfficeBuilding,
    CircleCheck,
    DataAnalysis,
  } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const router = useRouter();

  const activeCategory = ref('all');
  const searchTerm = ref('');
  const filterType = ref('all');
  const filterStatus = ref('all');

  const projectCategoryOptions = ref([
    { label: '全部项目', value: 'all' },
    // { label: '技术策划部', value: '技术策划部' },
    // { label: '五大系统', value: '五大系统' },
    // { label: '四大平台', value: '四大平台' },
    // { label: '特色体系', value: '特色体系' },
  ]);

  const projects = ref([
    {
      id: 7,
      name: '训练平台',
      category: '技术策划部',
      startDate: '2024-01-16',
      endDate: '2024-02-16',
      description:
        '把指数测试和股票荐股逐步形成公司技术研究的训练平台，验证日常技术，验证静态主观的研究在动态客观下的表现。',
      url: 'http://dz.szdjct.com:5208/train-platform/home',
    },
    {
      id: 8,
      name: '文档平台前台',
      category: '技术策划部',
      startDate: '2024-01-16',
      endDate: '2024-02-16',
      description: '文档平台前台',
      url: 'http://dz.szdjct.com:5208/technical-document/',
    },
    {
      id: 9,
      name: '文档平台后台',
      category: '技术策划部',
      startDate: '2024-01-16',
      endDate: '2024-02-16',
      description: '文档平台后台',
      url: 'http://dz.szdjct.com:5208/manage-system/',
    },
    {
      id: 10,
      name: '工具集合',
      category: '技术策划部',
      startDate: '2024-01-16',
      endDate: '2024-02-16',
      description: '奇妙小工具',
      url: 'http://dz.szdjct.com:5208/tools',
    },
    {
      id: 215,
      name: '大类资产案例',
      category: '技术策划部',
      startDate: '2024-01-16',
      endDate: '2024-02-16',
      description: '大类资产案例',
      url: 'http://dz.szdjct.com:5208/dlzc',
    },
    {
      id: 11,
      name: '🚀 六分区策略优化',
      category: '技术策划部',
      startDate: '2024-01-16',
      endDate: '2024-02-16',
      description: '奇妙小工具',
      url: 'http://dz.szdjct.com:5208/deepseekoptimize',
    },
    {
      id: 12,
      name: '🚀 日内总览',
      category: '技术策划部',
      startDate: '2024-01-16',
      endDate: '2024-02-16',
      description: '奇妙小工具',
      url: 'http://dz.szdjct.com:5208/sixquarterstrategy',
    },
    {
      id: 13,
      name: '🚀 模拟交易平台-掘金模拟策略信号',
      category: '技术策划部',
      startDate: '2024-01-16',
      endDate: '2024-02-16',
      description: '掘金模拟策略信号',
      url: 'http://dz.szdjct.com:5208/mnjystrategy/',
    },
    // {
    //   id: 1,
    //   name: '动态右侧系统',
    //   category: '五大系统',
    //   startDate: '2024-01-15',
    //   endDate: '2024-02-15',
    //   description: '动态右侧系统的描述',
    //   url: 'https://dz.szdjct.com/dynamic-right-side-sys/#/',
    // },
    // {
    //   id: 2,
    //   name: '历史数据系统',
    //   category: '五大系统',
    //   startDate: '2024-01-10',
    //   endDate: '2024-01-25',
    //   description: '历史数据系统的描述',
    //   url: 'https://dz.szdjct.com/dzkj-static2/#/',
    // },
    // {
    //   id: 3,
    //   name: '趋势等级应用平台',
    //   category: '四大平台',
    //   startDate: '2024-01-05',
    //   endDate: '2024-01-20',
    //   description: '趋势等级应用平台的描述',
    //   url: 'https://dz.szdjct.com/trendlevel-click/#/',
    // },
    // {
    //   id: 4,
    //   name: '股指应用平台',
    //   category: '四大平台',
    //   startDate: '2023-12-20',
    //   endDate: '2024-01-10',
    //   description: '股指应用平台的描述',
    //   url: 'https://dz.szdjct.com/strategy-click/#/',
    // },
    // {
    //   id: 5,
    //   name: '智能对冲系统',
    //   category: '特色体系',
    //   startDate: '2024-01-12',
    //   endDate: '2024-02-20',
    //   description: '智能对冲系统的描述',
    //   url: 'https://dz.szdjct.com/hedging-click/#/',
    // },
    // {
    //   id: 6,
    //   name: 'IM分段应用平台系统',
    //   category: '特色体系',
    //   startDate: '2024-01-08',
    //   endDate: '2024-02-08',
    //   description: 'IM分段应用平台系统的描述',
    //   url: 'https://dz.szdjct.com/im-time-slice/#/',
    // },
  ]);

  const filteredProjects = computed(() => {
    return projects.value.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        project.responsible.toLowerCase().includes(searchTerm.value.toLowerCase());

      const matchesType = filterType.value === 'all' || project.type === filterType.value;
      const matchesStatus = filterStatus.value === 'all' || project.status === filterStatus.value;
      const matchesCategory =
        activeCategory.value === 'all' || project.category === activeCategory.value;

      return matchesSearch && matchesType && matchesStatus && matchesCategory;
    });
  });

  // 获取分类标签类型
  const getCategoryTagType = (category) => {
    const types = {
      五大系统: 'primary',
      特色体系: 'success',
      四大平台: 'warning',
      技术策划部: 'danger',
    };
    return types[category] || 'info';
  };

  const getEmptyDescription = () => {
    if (activeCategory.value === 'all') {
      return '暂无项目数据';
    }
    return `暂无${activeCategory.value}项目`;
  };

  const createProject = () => {
    ElMessage.success('创建项目功能开发中...');
  };

  const goToProject = (projectId) => {
    // router.push(`/projects/${projectId}`);
  };

  const handleCommand = (command) => {
    const [action, id] = command.split('-');
    const projectId = parseInt(id);

    switch (action) {
      case 'view':
        router.push(`/projects/${projectId}`);
        break;
      case 'edit':
        ElMessage.info(`编辑项目 ${projectId}`);
        break;
      case 'archive':
        ElMessage.warning(`归档项目 ${projectId}`);
        break;
    }
  };

  const jumpToProject = (item) => {
    let tokenParamsName = item.name === '训练平台' ? 'token' : 'authorization';
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const authorization = userInfo.token || '';
    const userId = userInfo.userId || '';
    let url = item.url;
    if (item.name === '训练平台') {
      url = item.url + `?${tokenParamsName}=${authorization}&userId=${userId}`;
    }
    // const url = item.url + `?${tokenParamsName}=${authorization}&userId=${userId}`;
    // console.log(url);
    window.open(url, '_blank');
  };
</script>

<style lang="scss" scoped>
  .projects {
    min-height: 100vh;

    &-header {
      background: white;
      border-bottom: 1px solid var(--el-border-color-light);
      padding: 24px;

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header-info {
        h1 {
          font-size: 28px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        p {
          color: var(--el-text-color-regular);
          font-size: 14px;
        }
      }
    }

    &-content {
      padding: 24px;
    }
  }

  .category-tabs {
    margin-bottom: 24px;

    :deep(.el-tabs__header) {
      margin-bottom: 0;
      background: white;
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    :deep(.el-tabs__nav-wrap) {
      &::after {
        display: none;
      }
    }

    :deep(.el-tabs__item) {
      border-radius: 6px;
      margin-right: 8px;
      transition: all 0.3s;
      padding: 0 20px !important;

      &.is-active {
        .tab-badge {
          :deep(.el-badge__content) {
            background: white;
            color: var(--el-color-primary);
          }
        }
      }

      &:hover:not(.is-active) {
        background: var(--el-fill-color-light);
      }
    }

    .tab-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;

      .tab-badge {
        :deep(.el-badge__content) {
          background: var(--el-color-primary);
          border: none;
          font-size: 12px;
          height: 16px;
          line-height: 16px;
          min-width: 16px;
          padding: 0 4px;
        }
      }
    }
  }

  .filters {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;

    .search-input {
      flex: 1;
      min-width: 300px;
    }

    .filter-controls {
      display: flex;
      gap: 12px;
    }
  }

  .projects-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
  .project-headline {
    display: flex;
    align-items: center;
    padding-bottom: 10px;
    h2 {
      font-size: 24px;
      font-weight: bold;
      line-height: 36px;
      letter-spacing: normal;
      color: #8676ff;
      padding-right: 10px;
    }
    hr {
      flex: 1;
    }
  }

  .project-card {
    width: 24%;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
    }

    :deep(.el-card__body) {
      height: 100%;
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .project-title {
        flex: 1;

        h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 8px;
          cursor: pointer;

          &:hover {
            color: var(--el-color-primary);
          }
        }

        .project-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
      }
    }

    .project-description {
      height: 76px;
      color: var(--el-text-color-regular);
      margin-bottom: 12px;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .project-btn {
      display: flex;
      justify-content: flex-end;
    }

    .project-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .project-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 16px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }

    .project-progress {
      margin-bottom: 12px;

      .progress-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
      }
    }

    .project-collaborators {
      font-size: 14px;
      color: var(--el-text-color-regular);

      .collaborators-label {
        font-weight: 500;
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .projects-header {
      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }
    }

    .category-tabs {
      :deep(.el-tabs__item) {
        padding: 8px 12px;
        margin-right: 4px;

        .tab-label {
          gap: 4px;
          font-size: 14px;
        }
      }
    }

    .filters {
      flex-direction: column;

      .search-input {
        min-width: auto;
      }

      .filter-controls {
        flex-wrap: wrap;
      }
    }

    .category-overview {
      .el-col {
        margin-bottom: 12px;
      }
    }

    .project-meta {
      grid-template-columns: 1fr;
    }
  }
</style>

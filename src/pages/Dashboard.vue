<template>
  <div class="dashboard">
    <div class="dashboard-content">
      <!-- 实时数据概览 -->
      <div class="overview-section">
        <h2>实时数据概览</h2>
        <el-row :gutter="16" class="metrics-row">
          <el-col :xs="12" :sm="6" :md="6" :lg="6">
            <el-card class="metric-card">
              <div class="metric-header">
                <span class="metric-title">项目总数</span>
                <el-icon class="metric-icon"><TrendCharts /></el-icon>
              </div>
              <div class="metric-value">23</div>
              <div class="metric-desc">进行中: 15个</div>
            </el-card>
          </el-col>

          <el-col :xs="12" :sm="6" :md="6" :lg="6">
            <el-card class="metric-card">
              <div class="metric-header">
                <span class="metric-title">任务完成率</span>
                <el-icon class="metric-icon"><CircleCheck /></el-icon>
              </div>
              <div class="metric-value">68%</div>
              <div class="metric-desc success">
                <el-icon><Top /></el-icon>
                较昨日 +5%
              </div>
            </el-card>
          </el-col>

          <el-col :xs="12" :sm="6" :md="6" :lg="6">
            <el-card class="metric-card">
              <div class="metric-header">
                <span class="metric-title">延期任务</span>
                <el-icon class="metric-icon danger"><Warning /></el-icon>
              </div>
              <div class="metric-value danger">5</div>
              <div class="metric-desc">需要立即关注</div>
            </el-card>
          </el-col>

          <el-col :xs="12" :sm="6" :md="6" :lg="6">
            <el-card class="metric-card">
              <div class="metric-header">
                <span class="metric-title">今日待跟进</span>
                <el-icon class="metric-icon"><Clock /></el-icon>
              </div>
              <div class="metric-value">12</div>
              <div class="metric-desc">任务数量</div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 图表区域 -->
        <el-row :gutter="16" class="charts-row">
          <el-col :xs="24" :sm="12" :md="12" :lg="12">
            <el-card class="chart-card">
              <template #header>
                <div class="chart-header">
                  <h3>任务完成率趋势</h3>
                  <p>近7天完成率变化</p>
                </div>
              </template>
              <div class="chart-content">
                <div ref="trendChart" class="chart-container"></div>
              </div>
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="12" :md="12" :lg="12">
            <el-card class="chart-card">
              <template #header>
                <div class="chart-header">
                  <h3>任务状态分布</h3>
                  <p>当前所有任务的状态占比</p>
                </div>
              </template>
              <div class="chart-content">
                <div ref="pieChart" class="chart-container"></div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 重点任务聚焦 -->
      <div class="key-tasks-section">
        <h2>重点任务聚焦</h2>
        <div class="tasks-list">
          <el-card
            v-for="task in keyTasks"
            :key="task.id"
            class="task-card"
            :class="{ followed: followedTasks.has(task.id) }"
            shadow="hover"
          >
            <div class="task-content">
              <div class="task-header">
                <h3>{{ task.name }}</h3>
                <div class="task-badges">
                  <el-tag :type="getDifficultyType(task.difficulty)" size="small">
                    {{ task.difficulty }}难度
                  </el-tag>
                  <el-tag v-for="tag in task.tags" :key="tag" size="small" effect="plain">
                    {{ tag }}
                  </el-tag>
                </div>
              </div>

              <div class="task-meta">
                <div class="meta-item">
                  <el-icon><User /></el-icon>
                  负责人: {{ task.responsible }}
                </div>
                <div class="meta-item">
                  <el-icon><Clock /></el-icon>
                  剩余: {{ task.remainingDays }}天
                </div>
                <div class="meta-item" :class="getProgressChangeClass(task.progressChange)">
                  <el-icon>
                    <Top v-if="task.progressChange > 0" />
                    <Bottom v-else />
                  </el-icon>
                  较昨日 {{ task.progressChange > 0 ? '+' : '' }}{{ task.progressChange }}%
                </div>
              </div>

              <div class="task-progress">
                <div class="progress-info">
                  <span>进度</span>
                  <span>{{ task.progress }}%</span>
                </div>
                <el-progress :percentage="task.progress" :stroke-width="8" :show-text="false" />
              </div>
            </div>

            <div class="task-actions">
              <el-button
                size="small"
                :type="followedTasks.has(task.id) ? 'primary' : 'default'"
                :icon="View"
                @click="toggleFollow(task.id)"
              >
                {{ followedTasks.has(task.id) ? '已跟进' : '跟进' }}
              </el-button>
              <el-button size="small" :icon="Document">详情</el-button>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 风险自动预警 -->
      <div class="risk-section">
        <h2>风险自动预警</h2>
        <div class="risk-alerts">
          <el-alert
            v-for="risk in riskTasks"
            :key="risk.id"
            :title="`${risk.name} - ${risk.riskType}`"
            type="error"
            :description="`负责人: ${risk.responsible} | 剩余时间: ${risk.remainingDays}天 | 当前进度: ${risk.progress}%`"
            show-icon
            :closable="false"
          >
            <template #default>
              <div class="alert-actions">
                <el-button size="small" type="default">分配资源</el-button>
                <el-button size="small" type="danger">立即跟进</el-button>
              </div>
            </template>
          </el-alert>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, nextTick } from 'vue';
  import * as echarts from 'echarts';
  import {
    Plus,
    ChatDotRound,
    TrendCharts,
    CircleCheck,
    Warning,
    Clock,
    User,
    Top,
    Bottom,
    View,
    Document,
  } from '@element-plus/icons-vue';

  const followedTasks = ref(new Set());
  const trendChart = ref(null);
  const pieChart = ref(null);

  const keyTasks = reactive([
    {
      id: 1,
      name: 'XX产品V2.0需求分析与技术方案设计',
      responsible: '张三',
      progress: 75,
      progressChange: 5,
      remainingDays: 3,
      difficulty: '高',
      tags: ['需求变更', '资源不足'],
    },
    {
      id: 2,
      name: '用户登录模块技术方案设计',
      responsible: '李四',
      progress: 45,
      progressChange: -5,
      remainingDays: 7,
      difficulty: '中',
      tags: ['接口对接'],
    },
    {
      id: 3,
      name: '数据库优化方案评审',
      responsible: '王五',
      progress: 90,
      progressChange: 10,
      remainingDays: 1,
      difficulty: '高',
      tags: ['性能优化'],
    },
  ]);

  const riskTasks = reactive([
    {
      id: 1,
      name: '支付接口集成测试',
      responsible: '赵六',
      riskType: '即将延期',
      remainingDays: 1,
      progress: 30,
    },
    {
      id: 2,
      name: '移动端适配开发',
      responsible: '钱七',
      riskType: '进度滞后',
      remainingDays: 5,
      progress: 20,
    },
  ]);

  // 图表数据
  const trendData = [
    { name: '周一', value: 65 },
    { name: '周二', value: 72 },
    { name: '周三', value: 68 },
    { name: '周四', value: 78 },
    { name: '周五', value: 82 },
    { name: '周六', value: 85 },
    { name: '周日', value: 88 },
  ];

  const pieData = [
    { name: '已完成', value: 68 },
    { name: '进行中', value: 25 },
    { name: '未开始', value: 7 },
  ];

  const toggleFollow = (taskId) => {
    if (followedTasks.value.has(taskId)) {
      followedTasks.value.delete(taskId);
    } else {
      followedTasks.value.add(taskId);
    }
  };

  const getDifficultyType = (difficulty) => {
    const types = {
      低: 'success',
      中: 'warning',
      高: 'danger',
    };
    return types[difficulty] || 'info';
  };

  const getProgressChangeClass = (change) => {
    return change > 0 ? 'success' : 'danger';
  };

  // 初始化趋势图表
  const initTrendChart = () => {
    const chart = echarts.init(trendChart.value);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: trendData.map((item) => item.name),
        axisLine: {
          lineStyle: {
            color: '#e4e7ed',
          },
        },
        axisLabel: {
          color: '#606266',
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#e4e7ed',
          },
        },
        axisLabel: {
          color: '#606266',
        },
        splitLine: {
          lineStyle: {
            color: '#f5f7fa',
          },
        },
      },
      series: [
        {
          name: '完成率',
          type: 'line',
          data: trendData.map((item) => item.value),
          smooth: true,
          lineStyle: {
            color: '#409eff',
            width: 3,
          },
          itemStyle: {
            color: '#409eff',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(64, 158, 255, 0.3)',
                },
                {
                  offset: 1,
                  color: 'rgba(64, 158, 255, 0.05)',
                },
              ],
            },
          },
        },
      ],
    };
    chart.setOption(option);

    // 响应式
    window.addEventListener('resize', () => {
      chart.resize();
    });
  };

  // 初始化饼图
  const initPieChart = () => {
    const chart = echarts.init(pieChart.value);
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: '#606266',
        },
      },
      series: [
        {
          name: '任务状态',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            {
              value: pieData[0].value,
              name: pieData[0].name,
              itemStyle: { color: '#67c23a' },
            },
            {
              value: pieData[1].value,
              name: pieData[1].name,
              itemStyle: { color: '#e6a23c' },
            },
            {
              value: pieData[2].value,
              name: pieData[2].name,
              itemStyle: { color: '#909399' },
            },
          ],
        },
      ],
    };
    chart.setOption(option);

    // 响应式
    window.addEventListener('resize', () => {
      chart.resize();
    });
  };

  onMounted(() => {
    nextTick(() => {
      initTrendChart();
      initPieChart();
    });
  });
</script>

<style lang="scss" scoped>
  .dashboard {
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

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    &-content {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
  }

  .overview-section {
    margin-bottom: 32px;

    h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--el-text-color-primary);
    }
  }

  .metrics-row {
    margin-bottom: 24px;
  }

  .metric-card {
    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .metric-title {
        font-size: 14px;
        color: var(--el-text-color-regular);
        font-weight: 500;
      }

      .metric-icon {
        color: var(--el-color-info);
        font-size: 16px;

        &.danger {
          color: var(--el-color-danger);
        }
      }
    }

    .metric-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;

      &.danger {
        color: var(--el-color-danger);
      }
    }

    .metric-desc {
      font-size: 14px;
      color: var(--el-text-color-regular);

      &.success {
        color: var(--el-color-success);
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .charts-row {
    margin-bottom: 32px;
  }

  .chart-card {
    .chart-header {
      h3 {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
      }

      p {
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }

    .chart-content {
      height: 300px;
    }

    .chart-container {
      width: 100%;
      height: 100%;
    }
  }

  .key-tasks-section {
    margin-bottom: 32px;

    h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--el-text-color-primary);
    }
  }

  .tasks-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .task-card {
    &.followed {
      border-left: 4px solid var(--el-color-primary);
    }

    :deep(.el-card__body) {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px;
    }

    .task-content {
      flex: 1;
    }

    .task-header {
      margin-bottom: 12px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
      }

      .task-badges {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }

    .task-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      flex-wrap: wrap;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: var(--el-text-color-regular);

        &.success {
          color: var(--el-color-success);
        }

        &.danger {
          color: var(--el-color-danger);
        }
      }
    }

    .task-progress {
      .progress-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
      }
    }

    .task-actions {
      display: flex;
      gap: 8px;
      margin-left: 16px;
      flex-direction: column;
    }
  }

  .risk-section {
    h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--el-text-color-primary);
    }
  }

  .risk-alerts {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .alert-actions {
      margin-top: 12px;
      display: flex;
      gap: 8px;
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .dashboard-header {
      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }
    }

    .task-card {
      :deep(.el-card__body) {
        flex-direction: column;
        gap: 16px;
      }

      .task-actions {
        margin-left: 0;
        flex-direction: row;
      }
    }

    .task-meta {
      flex-direction: column;
      gap: 8px;
    }
  }
</style>

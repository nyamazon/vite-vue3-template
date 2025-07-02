<template>
  <div class="task-node" :class="nodeClass">
    <div class="node-header">
      <div class="task-title">{{ nodeData.name || '未命名任务' }}</div>
      <div class="task-status" :class="`status-${nodeData.status}`">
        {{ nodeData.status || '未开始' }}
      </div>
    </div>

    <div class="node-body">
      <div class="task-info">
        <div class="info-row" v-if="nodeData.assignee">
          <span class="label">负责人:</span>
          <span class="value">{{ nodeData.assignee }}</span>
        </div>
        <div class="info-row" v-if="nodeData.projectParentName">
          <span class="label">项目:</span>
          <span class="value">{{ nodeData.projectParentName }}</span>
        </div>
        <div class="info-row">
          <span class="label">进度:</span>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (nodeData.progress || 0) + '%' }"></div>
            </div>
            <span class="progress-text">{{ nodeData.progress || 0 }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, inject, ref, onMounted, onUnmounted } from 'vue';

  // 通过inject获取节点实例
  const getNode = inject('getNode');
  const node = getNode?.();

  // 节点数据
  const nodeData = ref({});

  // 初始化数据
  if (node) {
    nodeData.value = node.getData() || {};

    // 监听数据变化
    const handleDataChange = ({ current }) => {
      nodeData.value = current || {};
    };

    node.on('change:data', handleDataChange);

    // 清理函数
    onUnmounted(() => {
      node.off('change:data', handleDataChange);
    });
  }

  // 计算节点样式类
  const nodeClass = computed(() => {
    const status = nodeData.value.status || '未开始';
    return [`node-status-${status}`, nodeData.value.isSelected ? 'selected' : ''].filter(Boolean);
  });
</script>

<style lang="scss" scoped>
  .task-node {
    width: 300px;
    min-height: 120px;
    background: #fff;
    border: 2px solid #e4e7ed;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;

    &.selected {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }

    // 不同状态的样式
    &.node-status-未开始 {
      border-left: 4px solid #909399;
    }

    &.node-status-进行中 {
      border-left: 4px solid #67c23a;
    }

    &.node-status-即将完成 {
      border-left: 4px solid #e6a23c;
    }

    &.node-status-已完成 {
      border-left: 4px solid #409eff;
    }
  }

  .node-header {
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;

    .task-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .task-status {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;

      &.status-未开始 {
        background: #f4f4f5;
        color: #909399;
      }

      &.status-进行中 {
        background: #f0f9ff;
        color: #67c23a;
      }

      &.status-即将完成 {
        background: #fdf6ec;
        color: #e6a23c;
      }

      &.status-已完成 {
        background: #ecf5ff;
        color: #409eff;
      }
    }
  }

  .node-body {
    padding: 12px;

    .task-info {
      .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        font-size: 14px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          color: #909399;
          margin-right: 8px;
          min-width: 50px;
        }

        .value {
          color: #606266;
          flex: 1;
        }

        .progress-container {
          display: flex;
          align-items: center;
          flex: 1;
          gap: 8px;

          .progress-bar {
            flex: 1;
            height: 6px;
            background: #f0f0f0;
            border-radius: 3px;
            overflow: hidden;

            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #409eff, #67c23a);
              border-radius: 3px;
              transition: width 0.3s ease;
            }
          }

          .progress-text {
            font-size: 14px;
            color: #909399;
            min-width: 35px;
          }
        }
      }
    }
  }

  .node-footer {
    padding: 8px 12px;
    border-top: 1px solid #f0f0f0;
    background: #fafafa;
    border-radius: 0 0 6px 6px;

    .date-info {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #909399;

      .start-date,
      .due-date {
        flex: 1;
      }

      .due-date {
        text-align: right;
      }
    }
  }
</style>

<template>
  <div class="task-flow">
    <!-- Header -->
    <div class="task-flow-header">
      <div class="header-content">
        <div class="header-info">
          <h1>任务流程图</h1>
          <p>基于任务依赖关系的可视化流程图</p>
        </div>
        <div class="header-actions">
          <el-button-group>
            <el-button :icon="ZoomIn" @click="zoomIn">放大</el-button>
            <el-button :icon="ZoomOut" @click="zoomOut">缩小</el-button>
            <el-button :icon="Refresh" @click="resetZoom">重置</el-button>
          </el-button-group>
          <el-button :icon="FullScreen" @click="toggleFullscreen">全屏</el-button>
          <el-button type="primary" :icon="Download" @click="exportImage">导出图片</el-button>
        </div>
      </div>
    </div>

    <div class="task-flow-content">
      <div class="flow-container">
        <!-- 控制面板 -->
        <div class="control-panel">
          <div class="panel-section">
            <h4>筛选条件</h4>
            <el-select
              v-model="selectedProject"
              placeholder="选择项目"
              size="small"
              style="width: 100%; margin-bottom: 12px"
              @change="loadTaskDependencies"
            >
              <el-option label="所有项目" value="all" />
              <el-option
                v-for="project in availableProjects"
                :key="project.value"
                :label="project.name"
                :value="project.value"
              />
            </el-select>

            <el-select
              v-model="selectedAssignee"
              placeholder="选择负责人"
              size="small"
              style="width: 100%; margin-bottom: 12px"
              @change="loadTaskDependencies"
            >
              <el-option label="所有人员" value="all" />
              <el-option
                v-for="user in availableUsers"
                :key="user.value"
                :label="user.label"
                :value="user.value"
              />
            </el-select>

            <el-select
              v-model="selectedStatus"
              placeholder="选择状态"
              size="small"
              style="width: 100%; margin-bottom: 12px"
              @change="loadTaskDependencies"
            >
              <el-option label="所有状态" value="all" />
              <el-option label="未开始" value="未开始" />
              <el-option label="进行中" value="进行中" />
              <el-option label="即将完成" value="即将完成" />
              <el-option label="已完成" value="已完成" />
            </el-select>
          </div>

          <div class="panel-section">
            <h4>布局选项</h4>
            <el-radio-group v-model="layoutType" size="small" @change="applyLayout">
              <el-radio-button label="dagre">层次布局</el-radio-button>
              <el-radio-button label="force">力导向</el-radio-button>
            </el-radio-group>
          </div>

          <div class="panel-section">
            <h4>显示选项</h4>
            <el-checkbox v-model="showProgress" @change="updateNodeStyles">显示进度</el-checkbox>
            <el-checkbox v-model="showAssignee" @change="updateNodeStyles">显示负责人</el-checkbox>
            <el-checkbox v-model="showDates" @change="updateNodeStyles">显示日期</el-checkbox>
          </div>

          <div class="panel-section">
            <h4>操作</h4>
            <el-button
              type="primary"
              size="small"
              style="width: 100%; margin-bottom: 8px"
              @click="loadTaskDependencies"
              :loading="loading"
            >
              {{ loading ? '生成中...' : '生成流程图' }}
            </el-button>
            <el-button size="small" style="width: 100%" @click="clearGraph">清空画布</el-button>
          </div>

          <div class="panel-section" v-if="taskStats.total > 0">
            <h4>统计信息</h4>
            <div class="stats-item">
              <span>总任务数：</span>
              <span class="stats-value">{{ taskStats.total }}</span>
            </div>
            <div class="stats-item">
              <span>依赖关系：</span>
              <span class="stats-value">{{ taskStats.dependencies }}</span>
            </div>
            <div class="stats-item">
              <span>关键路径：</span>
              <span class="stats-value">{{ taskStats.criticalPath }}</span>
            </div>
          </div>

          <div class="panel-section">
            <h4>连线说明</h4>
            <div class="legend">
              <div class="legend-item">
                <div class="legend-line">
                  <div class="line-demo"></div>
                  <div class="arrow-demo">→</div>
                </div>
                <span class="legend-text">依赖关系</span>
              </div>
              <p class="legend-desc">
                箭头从前置任务指向后续任务
                <br />
                例如：A → B 表示B依赖A，A完成后B才能开始
              </p>
            </div>
          </div>
        </div>

        <!-- 画布区域 -->
        <div class="canvas-container" ref="containerRef">
          <div id="graph-container" ref="graphContainer"></div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-overlay">
            <el-icon class="is-loading"><Loading /></el-icon>
            <p>正在生成任务流程图...</p>
          </div>

          <!-- 空状态 -->
          <div v-if="!loading && taskStats.total === 0" class="empty-state">
            <el-icon><DocumentCopy /></el-icon>
            <p>暂无任务数据</p>
            <p class="empty-desc">请先创建任务并设置依赖关系</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务详情对话框 -->
    <el-dialog v-model="showTaskDialog" :title="selectedTask?.name || '任务详情'" width="600px">
      <div v-if="selectedTask" class="task-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务名称" :span="2">
            {{ selectedTask.name }}
          </el-descriptions-item>
          <el-descriptions-item label="负责人">
            {{ selectedTask.assignee }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedTask.status)">
              {{ selectedTask.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="进度">
            <el-progress :percentage="selectedTask.progress" :stroke-width="8" :show-text="true" />
          </el-descriptions-item>
          <el-descriptions-item label="项目">
            {{ selectedTask.projectParentName }}
          </el-descriptions-item>
          <el-descriptions-item label="开始日期">
            {{ selectedTask.startDate }}
          </el-descriptions-item>
          <el-descriptions-item label="截止日期">
            {{ selectedTask.dueDate }}
          </el-descriptions-item>
          <el-descriptions-item label="前置任务" :span="2">
            <el-tag
              v-for="depId in selectedTask.dependencies"
              :key="depId"
              size="small"
              style="margin-right: 8px"
            >
              {{ getTaskNameById(depId) }}
            </el-tag>
            <span v-if="!selectedTask.dependencies?.length">无</span>
          </el-descriptions-item>
          <el-descriptions-item label="后续任务" :span="2">
            <el-tag
              v-for="nextTask in getNextTasks(selectedTask.id)"
              :key="nextTask.id"
              size="small"
              type="success"
              style="margin-right: 8px"
            >
              {{ nextTask.name }}
            </el-tag>
            <span v-if="getNextTasks(selectedTask.id).length === 0">无</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
  import { Graph } from '@antv/x6';
  import { DagreLayout, ForceLayout } from '@antv/layout';
  import { ElMessage } from 'element-plus';
  import {
    ZoomIn,
    ZoomOut,
    Refresh,
    FullScreen,
    Download,
    Loading,
    DocumentCopy,
  } from '@element-plus/icons-vue';
  import { taskApi } from '@/api/tasks';

  const containerRef = ref();
  const graphContainer = ref();

  let graph = null;

  // 状态管理
  const loading = ref(false);
  const selectedProject = ref('all');
  const selectedAssignee = ref('all');
  const selectedStatus = ref('all');
  const layoutType = ref('dagre');
  const showProgress = ref(true);
  const showAssignee = ref(true);
  const showDates = ref(false);

  // 对话框状态
  const showTaskDialog = ref(false);
  const selectedTask = ref(null);

  // 数据
  const allTasks = ref([]);
  const taskMap = ref(new Map());
  const taskStats = ref({
    total: 0,
    dependencies: 0,
    criticalPath: 0,
  });

  // 选项数据
  const availableProjects = ref([
    { name: '训练平台-股指', value: '训练平台-股指' },
    { name: '训练平台-股票', value: '训练平台-股票' },
    { name: '五大系统', value: '五大系统' },
    { name: '四大平台', value: '四大平台' },
    { name: '模拟交易平台', value: '模拟交易平台' },
    { name: '日常任务', value: '日常任务' },
  ]);

  const availableUsers = ref([
    { value: '张星', label: '张星' },
    { value: '唐硕', label: '唐硕' },
    { value: '何也', label: '何也' },
    { value: '章魏康', label: '章魏康' },
    { value: '黄骏雄', label: '黄骏雄' },
    { value: '钟远金', label: '钟远金' },
    { value: '张经凡', label: '张经凡' },
    { value: '郭俊', label: '郭俊' },
  ]);

  // 初始化图形编辑器
  const initGraph = () => {
    graph = new Graph({
      container: graphContainer.value,
      width: 1200,
      height: 800,
      background: {
        color: '#f8f9fa',
      },
      grid: {
        size: 20,
        visible: true,
        type: 'dot',
        args: {
          color: '#e5e5e5',
          thickness: 1,
        },
      },
      scroller: {
        enabled: true,
        pageVisible: false,
        pageBreak: false,
        pannable: true,
      },
      mousewheel: {
        enabled: true,
        modifiers: ['ctrl', 'meta'],
        factor: 1.1,
        maxScale: 3,
        minScale: 0.3,
      },
      selecting: {
        enabled: true,
        multiple: true,
        rubberband: true,
        movable: true,
        showNodeSelectionBox: true,
      },
      connecting: {
        allowBlank: false,
        allowLoop: false,
        allowNode: false,
        allowEdge: false,
      },
    });

    // 绑定事件
    bindEvents();
  };

  // 绑定事件
  const bindEvents = () => {
    // 节点点击事件
    graph.on('node:click', ({ node }) => {
      const taskData = node.getData();
      if (taskData) {
        selectedTask.value = taskData;
        showTaskDialog.value = true;
      }
    });

    // 节点悬停事件
    graph.on('node:mouseenter', ({ node }) => {
      node.attr('body/stroke', '#409eff');
      node.attr('body/strokeWidth', 3);

      // 高亮相关的连接线
      const nodeId = node.id;
      graph.getEdges().forEach((edge) => {
        if (edge.getSourceCellId() === nodeId || edge.getTargetCellId() === nodeId) {
          edge.attr('line/stroke', '#409eff');
          edge.attr('line/strokeWidth', 3);
        }
      });
    });

    graph.on('node:mouseleave', ({ node }) => {
      const taskData = node.getData();
      node.attr('body/stroke', getNodeColor(taskData?.status).border);
      node.attr('body/strokeWidth', 2);

      // 恢复连接线样式
      graph.getEdges().forEach((edge) => {
        edge.attr('line/stroke', '#a2b1c3');
        edge.attr('line/strokeWidth', 2);
      });
    });

    // 连接线悬停事件
    graph.on('edge:mouseenter', ({ edge }) => {
      edge.attr('line/stroke', '#409eff');
      edge.attr('line/strokeWidth', 3);

      // 高亮连接的节点
      const sourceNode = edge.getSourceNode();
      const targetNode = edge.getTargetNode();
      if (sourceNode) {
        sourceNode.attr('body/stroke', '#67c23a');
        sourceNode.attr('body/strokeWidth', 3);
      }
      if (targetNode) {
        targetNode.attr('body/stroke', '#e6a23c');
        targetNode.attr('body/strokeWidth', 3);
      }
    });

    graph.on('edge:mouseleave', ({ edge }) => {
      edge.attr('line/stroke', '#a2b1c3');
      edge.attr('line/strokeWidth', 2);

      // 恢复节点样式
      const sourceNode = edge.getSourceNode();
      const targetNode = edge.getTargetNode();
      if (sourceNode) {
        const sourceData = sourceNode.getData();
        sourceNode.attr('body/stroke', getNodeColor(sourceData?.status).border);
        sourceNode.attr('body/strokeWidth', 2);
      }
      if (targetNode) {
        const targetData = targetNode.getData();
        targetNode.attr('body/stroke', getNodeColor(targetData?.status).border);
        targetNode.attr('body/strokeWidth', 2);
      }
    });
  };

  // 获取节点颜色
  const getNodeColor = (status) => {
    const colors = {
      未开始: { bg: '#f5f7fa', border: '#909399', text: '#606266' },
      进行中: { bg: '#e1f3d8', border: '#67c23a', text: '#529b2e' },
      即将完成: { bg: '#fdf6ec', border: '#e6a23c', text: '#b88230' },
      已完成: { bg: '#f0f9ff', border: '#409eff', text: '#337ecc' },
    };
    return colors[status] || colors['未开始'];
  };

  // 获取状态类型
  const getStatusType = (status) => {
    const types = {
      未开始: 'info',
      进行中: 'success',
      即将完成: 'warning',
      已完成: 'primary',
    };
    return types[status] || 'info';
  };

  // 根据ID获取任务名称
  const getTaskNameById = (id) => {
    const task = taskMap.value.get(id);
    return task ? task.name : `任务${id}`;
  };

  // 获取后续任务
  const getNextTasks = (taskId) => {
    const nextTasks = [];
    allTasks.value.forEach((task) => {
      if (task.dependencies && task.dependencies.includes(taskId)) {
        nextTasks.push(task);
      }
    });
    return nextTasks;
  };

  // 创建任务节点
  const createTaskNode = (task, position) => {
    const colors = getNodeColor(task.status);

    let label = task.name;
    if (showAssignee.value) {
      label += `\n负责人: ${task.assignee}`;
    }
    if (showProgress.value) {
      label += `\n进度: ${task.progress}%`;
    }
    if (showDates.value) {
      label += `\n${task.startDate} ~ ${task.dueDate}`;
    }

    return graph.addNode({
      id: `task-${task.id}`,
      shape: 'rect',
      position,
      size: { width: 160, height: showDates.value ? 100 : 80 },
      label,
      attrs: {
        body: {
          stroke: colors.border,
          strokeWidth: 2,
          fill: colors.bg,
          rx: 8,
          ry: 8,
        },
        text: {
          fontSize: 12,
          fill: colors.text,
          textWrap: {
            width: 140,
            height: showDates.value ? 80 : 60,
            ellipsis: true,
          },
        },
      },
      data: task,
    });
  };

  // 创建连接线 - 从前置任务指向当前任务
  const createEdge = (sourceTaskId, targetTaskId) => {
    return graph.addEdge({
      source: `task-${sourceTaskId}`,
      target: `task-${targetTaskId}`,
      attrs: {
        line: {
          stroke: '#a2b1c3',
          strokeWidth: 2,
          targetMarker: {
            name: 'block',
            width: 10,
            height: 8,
            fill: '#a2b1c3',
          },
        },
      },
      connector: {
        name: 'rounded',
        args: { radius: 8 },
      },
      router: {
        name: 'manhattan',
        args: { padding: 10 },
      },
      labels: [
        {
          attrs: {
            text: {
              text: '依赖',
              fontSize: 10,
              fill: '#666',
            },
            rect: {
              fill: 'white',
              stroke: '#a2b1c3',
              strokeWidth: 1,
              rx: 3,
              ry: 3,
            },
          },
          position: 0.5,
        },
      ],
    });
  };

  // 应用布局
  const applyLayout = () => {
    if (!graph || graph.getNodes().length === 0) return;

    const nodes = graph.getNodes().map((node) => ({
      id: node.id,
      size: node.getSize(),
    }));

    const edges = graph.getEdges().map((edge) => ({
      source: edge.getSourceCellId(),
      target: edge.getTargetCellId(),
    }));

    let layout;
    if (layoutType.value === 'dagre') {
      layout = new DagreLayout({
        type: 'dagre',
        rankdir: 'TB', // 从上到下
        align: 'UL',
        ranksep: 80, // 层级间距
        nodesep: 50, // 节点间距
        controlPoints: true,
      });
    } else {
      layout = new ForceLayout({
        type: 'force',
        center: [400, 300],
        linkDistance: 150,
        nodeStrength: -300,
        edgeStrength: 0.2,
        preventOverlap: true,
        nodeSize: 80,
      });
    }

    const model = {
      nodes,
      edges,
    };

    const newModel = layout.layout(model);

    // 应用新位置
    newModel.nodes.forEach((node) => {
      const graphNode = graph.getCellById(node.id);
      if (graphNode) {
        graphNode.setPosition(node.x - node.size.width / 2, node.y - node.size.height / 2);
      }
    });

    // 如果是力导向布局，应用边的控制点
    if (layoutType.value === 'force' && newModel.edges) {
      newModel.edges.forEach((edge) => {
        const graphEdge = graph
          .getEdges()
          .find((e) => e.getSourceCellId() === edge.source && e.getTargetCellId() === edge.target);
        if (graphEdge && edge.controlPoints) {
          graphEdge.setVertices(edge.controlPoints);
        }
      });
    }
  };

  // 更新节点样式
  const updateNodeStyles = () => {
    graph.getNodes().forEach((node) => {
      const task = node.getData();
      if (task) {
        let label = task.name;
        if (showAssignee.value) {
          label += `\n负责人: ${task.assignee}`;
        }
        if (showProgress.value) {
          label += `\n进度: ${task.progress}%`;
        }
        if (showDates.value) {
          label += `\n${task.startDate} ~ ${task.dueDate}`;
        }

        node.setLabel(label);
        node.setSize({
          width: 160,
          height: showDates.value ? 100 : 80,
        });
      }
    });
  };

  // 加载任务依赖关系
  const loadTaskDependencies = async () => {
    loading.value = true;
    try {
      const result = await taskApi.getAllTasks();
      if (result.code === 200) {
        allTasks.value = result.data;

        // 筛选任务
        let filteredTasks = allTasks.value;

        if (selectedProject.value !== 'all') {
          filteredTasks = filteredTasks.filter(
            (task) => task.projectParentName === selectedProject.value
          );
        }

        if (selectedAssignee.value !== 'all') {
          filteredTasks = filteredTasks.filter((task) => task.assignee === selectedAssignee.value);
        }

        if (selectedStatus.value !== 'all') {
          filteredTasks = filteredTasks.filter((task) => task.status === selectedStatus.value);
        }

        if (filteredTasks.length === 0) {
          ElMessage.warning('没有找到符合条件的任务');
          clearGraph();
          return;
        }

        // 构建任务映射
        taskMap.value.clear();
        filteredTasks.forEach((task) => {
          taskMap.value.set(task.id, task);
        });

        // 生成流程图
        generateFlowChart(filteredTasks);

        ElMessage.success(`成功生成 ${filteredTasks.length} 个任务的流程图`);
      }
    } catch (error) {
      ElMessage.error('加载任务数据失败');
      console.error(error);
    } finally {
      loading.value = false;
    }
  };

  // 生成流程图
  const generateFlowChart = (tasks) => {
    // 清空现有画布
    graph.clearCells();

    if (tasks.length === 0) return;

    // 创建节点
    const nodeMap = new Map();
    tasks.forEach((task) => {
      const node = createTaskNode(task, { x: 0, y: 0 });
      nodeMap.set(task.id, node);
    });

    // 创建连接线 - 重要：从前置任务指向当前任务
    let edgeCount = 0;
    tasks.forEach((task) => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach((depId) => {
          // 检查依赖的任务是否在当前筛选结果中
          if (nodeMap.has(depId)) {
            // 从依赖任务(depId)指向当前任务(task.id)
            createEdge(depId, task.id);
            edgeCount++;
          }
        });
      }
    });

    // 计算关键路径长度
    const criticalPath = calculateCriticalPath(tasks);

    // 更新统计信息
    taskStats.value = {
      total: tasks.length,
      dependencies: edgeCount,
      criticalPath: criticalPath,
    };

    // 应用布局
    setTimeout(() => {
      applyLayout();
      resetZoom();
    }, 100);
  };

  // 计算关键路径
  const calculateCriticalPath = (tasks) => {
    const taskMap = new Map();
    tasks.forEach((task) => taskMap.set(task.id, task));

    const visited = new Set();
    const memo = new Map();

    const dfs = (taskId) => {
      if (visited.has(taskId)) return 0;
      if (memo.has(taskId)) return memo.get(taskId);

      visited.add(taskId);
      const task = taskMap.get(taskId);
      if (!task) return 0;

      let maxPath = 1;
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach((depId) => {
          if (taskMap.has(depId)) {
            maxPath = Math.max(maxPath, 1 + dfs(depId));
          }
        });
      }

      memo.set(taskId, maxPath);
      return maxPath;
    };

    let longestPath = 0;
    tasks.forEach((task) => {
      longestPath = Math.max(longestPath, dfs(task.id));
    });

    return longestPath;
  };

  // 缩放控制
  const zoomIn = () => {
    graph.zoom(0.1);
  };

  const zoomOut = () => {
    graph.zoom(-0.1);
  };

  const resetZoom = () => {
    graph.zoomToFit({ padding: 50, maxScale: 1 });
  };

  // 全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.value.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // 导出图片
  const exportImage = () => {
    graph.toPNG((dataUri) => {
      const link = document.createElement('a');
      link.download = `task-flow-${new Date().getTime()}.png`;
      link.href = dataUri;
      link.click();
    });
  };

  // 清空画布
  const clearGraph = () => {
    graph.clearCells();
    taskStats.value = {
      total: 0,
      dependencies: 0,
      criticalPath: 0,
    };
  };

  onMounted(() => {
    nextTick(() => {
      initGraph();
      loadTaskDependencies();
    });
  });

  onUnmounted(() => {
    if (graph) {
      graph.dispose();
    }
  });
</script>

<style lang="scss" scoped>
  .task-flow {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;

    &-header {
      background: white;
      border-bottom: 1px solid var(--el-border-color-light);
      padding: 16px 24px;
      flex-shrink: 0;

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header-info {
        h1 {
          font-size: 24px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        p {
          color: var(--el-text-color-regular);
          font-size: 14px;
          margin: 0;
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }

    &-content {
      flex: 1;
      overflow: hidden;
    }
  }

  .flow-container {
    display: flex;
    height: 100%;
  }

  .control-panel {
    width: 280px;
    background: white;
    border-right: 1px solid var(--el-border-color-light);
    padding: 16px;
    overflow-y: auto;
    flex-shrink: 0;

    .panel-section {
      margin-bottom: 24px;

      h4 {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--el-border-color-lighter);
      }

      .stats-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 13px;

        .stats-value {
          font-weight: 600;
          color: var(--el-color-primary);
        }
      }

      .legend {
        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;

          .legend-line {
            display: flex;
            align-items: center;
            margin-right: 8px;

            .line-demo {
              width: 20px;
              height: 2px;
              background: #a2b1c3;
              margin-right: 4px;
            }

            .arrow-demo {
              color: #a2b1c3;
              font-size: 12px;
              font-weight: bold;
            }
          }

          .legend-text {
            font-size: 12px;
            color: var(--el-text-color-regular);
          }
        }

        .legend-desc {
          font-size: 11px;
          color: var(--el-text-color-secondary);
          line-height: 1.4;
          margin: 8px 0 0 0;
          padding: 8px;
          background: var(--el-fill-color-light);
          border-radius: 4px;
        }
      }
    }
  }

  .canvas-container {
    flex: 1;
    position: relative;
    overflow: hidden;

    #graph-container {
      width: 100%;
      height: 100%;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10;

      .el-icon {
        font-size: 32px;
        color: var(--el-color-primary);
        margin-bottom: 16px;
      }

      p {
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
    }

    .empty-state {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: var(--el-text-color-placeholder);

      .el-icon {
        font-size: 64px;
        margin-bottom: 16px;
      }

      p {
        margin: 8px 0;
        font-size: 16px;

        &.empty-desc {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .task-detail {
    .el-descriptions {
      :deep(.el-descriptions__body) {
        .el-descriptions__table {
          .el-descriptions__cell {
            padding: 12px;
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 1200px) {
    .control-panel {
      width: 240px;
    }
  }

  @media (max-width: 768px) {
    .task-flow-header {
      .header-content {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-start;
        flex-wrap: wrap;
      }
    }

    .control-panel {
      width: 200px;
    }
  }
</style>

<template>
  <div class="task-flow-page">
    <!-- 头部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-right">
        <el-button-group>
          <el-button :icon="ZoomIn" @click="zoomIn">放大</el-button>
          <el-button :icon="ZoomOut" @click="zoomOut">缩小</el-button>
          <el-button :icon="Refresh" @click="resetView">重置</el-button>
        </el-button-group>
        <el-button
          type="success"
          :icon="Check"
          @click="saveDependencies"
          :disabled="!hasChanges"
          :loading="saving"
        >
          保存依赖关系
        </el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 侧边栏 -->
      <div class="sidebar" v-if="showSidebar">
        <!-- 筛选器 -->
        <div class="filter-section">
          <h4>筛选条件</h4>
          <div class="filter-item">
            <label>项目:</label>
            <el-select v-model="filters.project" @change="loadTasks" size="small">
              <el-option label="全部项目" value="" />
              <el-option
                v-for="project in projects"
                :key="project"
                :label="project"
                :value="project"
              />
            </el-select>
          </div>
          <div class="filter-item">
            <label>负责人:</label>
            <el-select v-model="filters.assignee" @change="loadTasks" size="small">
              <el-option label="全部人员" value="" />
              <el-option v-for="user in users" :key="user" :label="user" :value="user" />
            </el-select>
          </div>
          <div class="filter-item">
            <label>状态:</label>
            <el-select v-model="filters.status" @change="loadTasks" size="small">
              <el-option label="全部状态" value="" />
              <el-option label="未开始" value="未开始" />
              <el-option label="进行中" value="进行中" />
              <el-option label="即将完成" value="即将完成" />
              <el-option label="已完成" value="已完成" />
            </el-select>
          </div>
        </div>

        <!-- 依赖编辑器 -->
        <div class="dependency-section">
          <h4>依赖关系编辑</h4>
          <div class="dependency-editor">
            <div class="editor-item">
              <label>选择任务:</label>
              <el-select
                v-model="selectedTaskId"
                @change="onTaskSelect"
                placeholder="选择要编辑的任务"
                size="small"
              >
                <el-option
                  v-for="task in tasks"
                  :key="task.id"
                  :label="task.name"
                  :value="task.id"
                />
              </el-select>
            </div>

            <div class="editor-item" v-if="selectedTaskId">
              <label>前置任务:</label>
              <el-select
                v-model="editingDependencies"
                @change="onDependencyChange"
                multiple
                placeholder="选择前置任务"
                size="small"
              >
                <el-option
                  v-for="task in availableDependencies"
                  :key="task.id"
                  :label="task.name"
                  :value="task.id"
                />
              </el-select>
            </div>

            <div class="editor-actions" v-if="selectedTaskId">
              <el-button
                type="primary"
                size="small"
                @click="applyDependencyChanges"
                :disabled="!dependencyChanged"
              >
                应用修改
              </el-button>
              <el-button size="small" @click="resetDependencyEditor">重置</el-button>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="stats-section">
          <h4>统计信息</h4>
          <div class="stat-item">
            <span>任务总数:</span>
            <span class="stat-value">{{ tasks.length }}</span>
          </div>
          <div class="stat-item">
            <span>依赖关系:</span>
            <span class="stat-value">{{ totalDependencies }}</span>
          </div>
          <div class="stat-item">
            <span>关键路径:</span>
            <span class="stat-value">{{ criticalPathLength }}</span>
          </div>
        </div>

        <!-- 操作说明 -->
        <div class="help-section">
          <h4>操作说明</h4>
          <ul class="help-list">
            <li>双击节点查看任务详情</li>
            <li>拖拽连接桩创建依赖关系</li>
            <li>右键连接线删除依赖</li>
            <li>使用左侧编辑器批量编辑依赖</li>
          </ul>
        </div>
      </div>

      <!-- 画布区域 -->
      <div class="canvas-area">
        <div class="canvas-container" ref="containerRef">
          <div id="graph-container" ref="graphContainer"></div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-overlay">
            <el-icon class="is-loading"><Loading /></el-icon>
            <p>正在加载任务数据...</p>
          </div>

          <!-- 空状态 -->
          <div v-if="!loading && tasks.length === 0" class="empty-state">
            <el-icon><DocumentCopy /></el-icon>
            <p>暂无任务数据</p>
            <el-button type="primary" @click="loadTasks">重新加载</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务详情对话框 -->
    <el-dialog
      v-model="showTaskDetail"
      :title="currentTask?.name || '任务详情'"
      width="600px"
      destroy-on-close
    >
      <div v-if="currentTask" class="task-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务名称" :span="2" width="100px">
            {{ currentTask.name }}
          </el-descriptions-item>
          <el-descriptions-item label="负责人">
            {{ currentTask.assignee || '未分配' }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentTask.status)" disable-transitions>
              {{ currentTask.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="协作成员" :span="2" width="100px">
            {{ currentTask.collaborators.join(',') || '未分配' }}
          </el-descriptions-item>
          <el-descriptions-item label="进度">
            <el-progress :percentage="currentTask.progress || 0" />
          </el-descriptions-item>
          <el-descriptions-item label="项目">
            {{ currentTask.projectParentName || '未分配' }}
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{ currentTask.startDate || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="截止时间">
            {{ currentTask.dueDate || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="4">
            {{ currentTask.description || '无描述' }}
          </el-descriptions-item>
          <el-descriptions-item label="前置任务" :span="4">
            <div v-if="currentTask.dependencies && currentTask.dependencies.length > 0">
              <el-tag
                v-for="depId in currentTask.dependencies"
                :key="depId"
                size="small"
                disable-transitions
                style="margin-right: 8px; margin-bottom: 4px"
              >
                {{ getTaskNameById(depId) }}
              </el-tag>
            </div>
            <span v-else class="text-muted">无前置任务</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 删除依赖确认对话框 -->
    <el-dialog v-model="showDeleteConfirm" title="删除依赖关系" width="400px">
      <p>确定要删除这个依赖关系吗？</p>
      <p v-if="deleteEdgeInfo">
        <strong>{{ deleteEdgeInfo.source }}</strong>
        →
        <strong>{{ deleteEdgeInfo.target }}</strong>
      </p>
      <template #footer>
        <el-button @click="showDeleteConfirm = false">取消</el-button>
        <el-button type="danger" @click="confirmDeleteEdge">确定删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
  import { Graph } from '@antv/x6';
  import { register } from '@antv/x6-vue-shape';
  import { Export } from '@antv/x6-plugin-export';
  import { ElMessage } from 'element-plus';
  import {
    ZoomIn,
    ZoomOut,
    Refresh,
    Download,
    Check,
    Loading,
    DocumentCopy,
  } from '@element-plus/icons-vue';
  import { taskApi } from '@/api/tasks';
  import TaskNode from '@/components/TaskNode.vue';

  const showSidebar = ref(false);

  // 注册自定义节点
  register({
    shape: 'task-node',
    width: 300,
    height: 187,
    component: TaskNode,
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: '#409eff',
              strokeWidth: 2,
              fill: '#fff',
              style: { visibility: 'visible' },
            },
          },
          zIndex: 10,
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: '#409eff',
              strokeWidth: 2,
              fill: '#fff',
              style: { visibility: 'visible' },
            },
          },
          zIndex: 10,
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: '#409eff',
              strokeWidth: 2,
              fill: '#fff',
              style: { visibility: 'visible' },
            },
          },
          zIndex: 10,
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: '#409eff',
              strokeWidth: 2,
              fill: '#fff',
              style: { visibility: 'visible' },
            },
          },
          zIndex: 10,
        },
      },
    },
  });

  // 响应式数据
  const containerRef = ref();
  const graphContainer = ref();
  const loading = ref(false);
  const saving = ref(false);
  const hasChanges = ref(false);

  // 任务数据
  const tasks = ref([]);
  const taskMap = ref(new Map());

  // 筛选器
  const filters = reactive({
    project: '',
    assignee: '',
    status: '',
  });

  // 依赖编辑器
  const selectedTaskId = ref(null);
  const editingDependencies = ref([]);
  const originalDependencies = ref([]);
  const dependencyChanged = ref(false);

  // 对话框状态
  const showTaskDetail = ref(false);
  const currentTask = ref(null);
  const showDeleteConfirm = ref(false);
  const deleteEdgeInfo = ref(null);
  const edgeToDelete = ref(null);

  // 图形实例
  let graph = null;

  // 计算属性
  const projects = computed(() => {
    const projectSet = new Set();
    tasks.value.forEach((task) => {
      if (task.projectParentName) {
        projectSet.add(task.projectParentName);
      }
    });
    return Array.from(projectSet);
  });

  const users = computed(() => {
    const userSet = new Set();
    tasks.value.forEach((task) => {
      if (task.assignee) {
        userSet.add(task.assignee);
      }
    });
    return Array.from(userSet);
  });

  const availableDependencies = computed(() => {
    if (!selectedTaskId.value) return [];
    return tasks.value.filter((task) => task.id !== selectedTaskId.value);
  });

  const totalDependencies = computed(() => {
    return tasks.value.reduce((total, task) => {
      return total + (task.dependencies ? task.dependencies.length : 0);
    }, 0);
  });

  const criticalPathLength = computed(() => {
    return calculateCriticalPath();
  });

  // 初始化图形
  const initGraph = async () => {
    graph = new Graph({
      container: graphContainer.value,
      autoResize: true, //自动适应容器大小
      background: {
        color: '#f8f9fa',
      },
      panning: true,
      mousewheel: {
        enabled: true,
        modifiers: ['ctrl', 'meta'],
        factor: 1.1,
        maxScale: 2,
        minScale: 0.5,
      },
      selecting: {
        enabled: true,
        multiple: false,
        rubberband: false,
        movable: true,
        showNodeSelectionBox: true,
      },
      connecting: {
        snap: true, //是否自动吸附
        router: 'manhattan',
        connector: {
          name: 'rounded',
          args: { radius: 8 },
        },
        allowBlank: false,
        allowLoop: false,
        allowNode: false,
        allowEdge: false,
        allowPort: true,
        snap: { radius: 20 },
        createEdge() {
          return graph.createEdge({
            attrs: {
              line: {
                stroke: '#409eff',
                strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                  width: 8,
                  height: 6,
                  fill: '#409eff',
                },
              },
            },
            connector: {
              name: 'rounded',
              args: { radius: 8 },
            },
            router: 'manhattan',
          });
        },
        validateConnection({ sourceView, targetView }) {
          // 不能连接到自己
          if (sourceView === targetView) {
            return false;
          }

          // 检查是否已存在连接
          const sourceId = sourceView.cell.id;
          const targetId = targetView.cell.id;
          const existingEdge = graph
            .getEdges()
            .find(
              (edge) => edge.getSourceCellId() === sourceId && edge.getTargetCellId() === targetId
            );

          return !existingEdge;
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#5F95FF',
              stroke: '#5F95FF',
            },
          },
        },
      },
    });
    // 绑定事件
    bindEvents();
    graph.use(new Export());
    return true;
  };

  // 绑定事件
  const bindEvents = () => {
    // 双击节点查看详情
    graph.on('node:dblclick', ({ node }) => {
      const taskData = node.getData();
      if (taskData) {
        currentTask.value = taskData;
        showTaskDetail.value = true;
      }
    });

    // 节点选择
    graph.on('node:click', ({ node }) => {
      const taskData = node.getData();
      if (taskData) {
        selectedTaskId.value = taskData.id;
        onTaskSelect();

        // 更新节点选中状态
        graph.getNodes().forEach((n) => {
          const data = n.getData();
          n.setData({ ...data, isSelected: n.id === node.id });
        });
      }
    });

    // 连接线创建
    graph.on('edge:connected', ({ edge }) => {
      const sourceNode = edge.getSourceNode();
      const targetNode = edge.getTargetNode();

      if (sourceNode && targetNode) {
        const sourceTask = sourceNode.getData();
        const targetTask = targetNode.getData();

        // 添加依赖关系
        if (!targetTask.dependencies) {
          targetTask.dependencies = [];
        }

        if (!targetTask.dependencies.includes(sourceTask.id)) {
          targetTask.dependencies.push(sourceTask.id);
          targetNode.setData(targetTask);

          // 更新任务映射
          taskMap.value.set(targetTask.id, targetTask);

          hasChanges.value = true;
          ElMessage.success(`已添加依赖: ${targetTask.name} 依赖于 ${sourceTask.name}`);
        }
      }
    });

    // 右键删除连接线
    graph.on('edge:contextmenu', ({ edge, e }) => {
      e.preventDefault();

      const sourceNode = edge.getSourceNode();
      const targetNode = edge.getTargetNode();

      if (sourceNode && targetNode) {
        deleteEdgeInfo.value = {
          source: sourceNode.getData().name,
          target: targetNode.getData().name,
        };
        edgeToDelete.value = edge;
        showDeleteConfirm.value = true;
      }
    });

    // 节点移动
    graph.on('node:moved', () => {
      hasChanges.value = true;
    });
  };

  // 加载任务数据
  const loadTasks = async () => {
    loading.value = true;
    try {
      const result = await taskApi.getAllTasks();
      if (result.code === 200) {
        let filteredTasks = result.data;

        // 应用筛选器
        if (filters.project) {
          filteredTasks = filteredTasks.filter(
            (task) => task.projectParentName === filters.project
          );
        }
        if (filters.assignee) {
          filteredTasks = filteredTasks.filter((task) => task.assignee === filters.assignee);
        }
        if (filters.status) {
          filteredTasks = filteredTasks.filter((task) => task.status === filters.status);
        }

        tasks.value = filteredTasks;

        // 构建任务映射
        taskMap.value.clear();
        filteredTasks.forEach((task) => {
          taskMap.value.set(task.id, task);
        });

        ElMessage.success(`加载了 ${filteredTasks.length} 个任务`);
      }
    } catch (error) {
      ElMessage.error('加载任务失败');
      console.error(error);
    } finally {
      loading.value = false;
    }
  };

  // 生成流程图
  const generateFlowChart = () => {
    if (!graph) return;

    // 清空画布
    graph.clearCells();

    if (tasks.value.length === 0) return;

    // 创建节点
    const nodeMap = new Map();
    tasks.value.forEach((task, index) => {
      const node = graph.addNode({
        id: `task-${task.id}`,
        shape: 'task-node',
        position: { x: 100 + (index % 4) * 250, y: 100 + Math.floor(index / 4) * 180 },
        data: { ...task, isSelected: false },
        ports: [
          { id: 'top', group: 'top' },
          { id: 'right', group: 'right' },
          { id: 'bottom', group: 'bottom' },
          { id: 'left', group: 'left' },
        ],
      });
      nodeMap.set(task.id, node);
    });

    // 创建连接线
    tasks.value.forEach((task) => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach((depId) => {
          const sourceNode = nodeMap.get(depId);
          const targetNode = nodeMap.get(task.id);

          if (sourceNode && targetNode) {
            graph.addEdge({
              source: sourceNode.id,
              target: targetNode.id,
              attrs: {
                line: {
                  stroke: '#409eff',
                  strokeWidth: 2,
                  targetMarker: {
                    name: 'block',
                    width: 8,
                    height: 6,
                    fill: '#409eff',
                  },
                },
              },
            });
          }
        });
      }
    });

    // 自动布局
    setTimeout(() => {
      autoLayout();
    }, 100);
  };

  // 自动布局
  const autoLayout = () => {
    const nodes = graph.getNodes();
    const edges = graph.getEdges();

    // 简单的层次布局
    const layers = [];
    const visited = new Set();
    const inDegree = new Map();

    // 计算入度
    nodes.forEach((node) => {
      const taskId = parseInt(node.id.replace('task-', ''));
      inDegree.set(taskId, 0);
    });

    edges.forEach((edge) => {
      const targetId = parseInt(edge.getTargetCellId().replace('task-', ''));
      inDegree.set(targetId, (inDegree.get(targetId) || 0) + 1);
    });

    // 拓扑排序分层
    const queue = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    let layer = 0;
    while (queue.length > 0) {
      const layerSize = queue.length;
      layers[layer] = [];

      for (let i = 0; i < layerSize; i++) {
        const nodeId = queue.shift();
        layers[layer].push(nodeId);
        visited.add(nodeId);

        // 处理后续节点
        edges.forEach((edge) => {
          const sourceId = parseInt(edge.getSourceCellId().replace('task-', ''));
          const targetId = parseInt(edge.getTargetCellId().replace('task-', ''));

          if (sourceId === nodeId) {
            const newDegree = inDegree.get(targetId) - 1;
            inDegree.set(targetId, newDegree);
            if (newDegree === 0) {
              queue.push(targetId);
            }
          }
        });
      }
      layer++;
    }

    // 处理剩余节点
    nodes.forEach((node) => {
      const taskId = parseInt(node.id.replace('task-', ''));
      if (!visited.has(taskId)) {
        if (!layers[layer]) layers[layer] = [];
        layers[layer].push(taskId);
      }
    });

    // 应用布局
    const layerHeight = 240;
    const nodeSpacing = 350;

    layers.forEach((layerNodes, layerIndex) => {
      const y = 100 + layerIndex * layerHeight;
      const startX = Math.max(100, (1200 - (layerNodes.length - 1) * nodeSpacing) / 2);

      layerNodes.forEach((nodeId, nodeIndex) => {
        const node = graph.getCellById(`task-${nodeId}`);
        if (node) {
          node.setPosition(startX + nodeIndex * nodeSpacing, y);
        }
      });
    });
  };

  // 任务选择处理
  const onTaskSelect = () => {
    if (!selectedTaskId.value) {
      editingDependencies.value = [];
      originalDependencies.value = [];
      dependencyChanged.value = false;
      return;
    }

    const task = taskMap.value.get(selectedTaskId.value);
    if (task) {
      originalDependencies.value = [...(task.dependencies || [])];
      editingDependencies.value = [...(task.dependencies || [])];
      dependencyChanged.value = false;
    }
  };

  // 依赖关系变化处理
  const onDependencyChange = () => {
    dependencyChanged.value =
      JSON.stringify(originalDependencies.value.sort()) !==
      JSON.stringify(editingDependencies.value.sort());
  };

  // 应用依赖关系修改
  const applyDependencyChanges = () => {
    if (!selectedTaskId.value || !dependencyChanged.value) return;

    const task = taskMap.value.get(selectedTaskId.value);
    if (!task) return;

    // 更新任务依赖
    task.dependencies = [...editingDependencies.value];
    taskMap.value.set(selectedTaskId.value, task);

    // 更新节点数据
    const node = graph.getCellById(`task-${selectedTaskId.value}`);
    if (node) {
      node.setData(task);
    }

    // 重新生成流程图
    generateFlowChart();

    hasChanges.value = true;
    dependencyChanged.value = false;
    originalDependencies.value = [...editingDependencies.value];

    ElMessage.success('依赖关系已更新');
  };

  // 重置依赖编辑器
  const resetDependencyEditor = () => {
    editingDependencies.value = [...originalDependencies.value];
    dependencyChanged.value = false;
  };

  // 确认删除连接线
  const confirmDeleteEdge = () => {
    if (!edgeToDelete.value) return;

    const sourceNode = edgeToDelete.value.getSourceNode();
    const targetNode = edgeToDelete.value.getTargetNode();

    if (sourceNode && targetNode) {
      const sourceTask = sourceNode.getData();
      const targetTask = targetNode.getData();

      // 移除依赖关系
      if (targetTask.dependencies) {
        const index = targetTask.dependencies.indexOf(sourceTask.id);
        if (index > -1) {
          targetTask.dependencies.splice(index, 1);
          targetNode.setData(targetTask);
          taskMap.value.set(targetTask.id, targetTask);

          hasChanges.value = true;
          ElMessage.success('依赖关系已删除');
        }
      }
    }

    // 删除连接线
    graph.removeCell(edgeToDelete.value);

    showDeleteConfirm.value = false;
    edgeToDelete.value = null;
    deleteEdgeInfo.value = null;
  };

  // 保存依赖关系
  const saveDependencies = async () => {
    if (!hasChanges.value) {
      ElMessage.info('没有需要保存的更改');
      return;
    }

    saving.value = true;
    try {
      const updates = [];

      // 收集所有需要更新的任务
      taskMap.value.forEach((task) => {
        updates.push({
          id: task.id,
          dependencies: task.dependencies || [],
        });
      });

      // 批量更新
      for (const update of updates) {
        await taskApi.updateTask(update.id, { dependencies: update.dependencies });
      }

      hasChanges.value = false;
      ElMessage.success(`成功保存 ${updates.length} 个任务的依赖关系`);
    } catch (error) {
      ElMessage.error('保存失败');
      console.error(error);
    } finally {
      saving.value = false;
    }
  };

  // 计算关键路径
  const calculateCriticalPath = () => {
    const memo = new Map();

    const dfs = (taskId) => {
      if (memo.has(taskId)) return memo.get(taskId);

      const task = taskMap.value.get(taskId);
      if (!task) return 0;

      let maxPath = 1;
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach((depId) => {
          maxPath = Math.max(maxPath, 1 + dfs(depId));
        });
      }

      memo.set(taskId, maxPath);
      return maxPath;
    };

    let longestPath = 0;
    tasks.value.forEach((task) => {
      longestPath = Math.max(longestPath, dfs(task.id));
    });

    return longestPath;
  };

  // 工具函数
  const getTaskNameById = (id) => {
    const task = taskMap.value.get(id);
    return task ? task.name : `任务${id}`;
  };

  const getStatusType = (status) => {
    const types = {
      未开始: 'info',
      进行中: 'success',
      即将完成: 'warning',
      已完成: 'primary',
    };
    return types[status] || 'info';
  };

  // 画布操作
  const zoomIn = () => graph?.zoom(0.1);
  const zoomOut = () => graph?.zoom(-0.1);
  const resetView = () => {
    graph?.zoomToFit({ padding: 50, maxScale: 1 });
  };

  // 生命周期
  onMounted(() => {
    nextTick(async () => {
      await loadTasks();
      await initGraph();
      // 生成流程图
      generateFlowChart();
      setTimeout(() => {
        resetView();
      }, 100);
    });
  });

  onUnmounted(() => {
    if (graph) {
      graph.dispose();
    }
  });
</script>

<style lang="scss" scoped>
  .task-flow-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
  }

  .toolbar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 16px 24px;
    background: white;
    height: 83px;
    border-bottom: 1px solid #e4e7ed;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    .toolbar-right {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .sidebar {
    width: 260px;
    background: white;
    border-right: 1px solid #e4e7ed;
    padding: 20px;
    overflow-y: auto;

    h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: bold;
      color: #303133;
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 8px;
    }

    .filter-section,
    .dependency-section,
    .stats-section,
    .help-section {
      margin-bottom: 32px;
    }

    .filter-item,
    .editor-item {
      margin-bottom: 16px;

      label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }

      .el-select {
        width: 100%;
      }
    }

    .editor-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 14px;

      .stat-value {
        font-weight: 600;
        color: #409eff;
      }
    }

    .help-list {
      margin: 0;
      padding-left: 16px;
      font-size: 14px;
      color: #606266;

      li {
        margin-bottom: 8px;
        line-height: 1.5;
      }
    }
  }

  .canvas-area {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .canvas-container {
    width: 100%;
    height: 100%;
    position: relative;

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
        color: #409eff;
        margin-bottom: 16px;
      }

      p {
        color: #606266;
        font-size: 14px;
      }
    }

    .empty-state {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #909399;

      .el-icon {
        font-size: 64px;
        margin-bottom: 16px;
      }

      p {
        margin: 16px 0;
        font-size: 16px;
      }
    }
  }

  .task-detail {
    .text-muted {
      color: #909399;
      font-style: italic;
    }
  }

  // 响应式设计
  @media (max-width: 1200px) {
    .sidebar {
      width: 280px;
    }
  }

  @media (max-width: 768px) {
    .toolbar {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;

      .toolbar-right {
        width: 100%;
        justify-content: flex-start;
        flex-wrap: wrap;
      }
    }

    .main-content {
      flex-direction: column;
    }

    .sidebar {
      width: 100%;
      height: 300px;
      border-right: none;
      border-bottom: 1px solid #e4e7ed;
    }
  }
</style>

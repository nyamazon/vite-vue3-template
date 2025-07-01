<template>
  <div class="tasks">
    <el-dialog
      v-model="editDialog"
      title=""
      width="95%"
      top="3vh"
      @close="closeDialog"
      destroy-on-close
    >
      <TaskDetail
        :taskItem="taskItem"
        @update-progress="updateProgress"
        @add-subtask="addSubtask"
        @delete-subtask="deleteSubtask"
        @add-comment="addComment"
        @updateTask="updateTask"
      />
    </el-dialog>
    <el-dialog v-model="addDialog" title="" width="95%" top="3vh">
      <AddTasks @addTaskFinish="addTaskFinish" />
    </el-dialog>

    <div class="tasks-content">
      <!-- 搜索和筛选 -->
      <div class="filters">
        <div class="filter-controls">
          <el-radio-group v-model="dataViewType">
            <el-radio-button value="看板">看板</el-radio-button>
            <el-radio-button value="表格">表格</el-radio-button>
          </el-radio-group>
          <el-input
            v-model="searchTerm"
            placeholder="搜索任务名称或内容..."
            :prefix-icon="Search"
            class="search-input"
            clearable
          />
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator=" - "
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 200px"
          />
          <el-select
            v-model="activeTab"
            placeholder="视图状态"
            style="width: 160px"
            v-if="dataViewType === '看板'"
          >
            <el-option label="按任务状态" value="all" />
            <el-option label="按人员" value="person" />
          </el-select>
          <el-checkbox v-model="onlyMyTasks" label="只看我" />
        </div>
        <div class="add-btn">
          <el-button type="primary" @click="clearData">清空数据重新来</el-button>
          <el-button :icon="Plus" type="primary" @click="addDialog = true">添加任务</el-button>
        </div>
      </div>

      <!-- 看板视图 -->
      <div class="kanban-board" v-if="dataViewType === '看板'">
        <div
          v-for="column in kanbanColumns"
          :key="column.status"
          class="kanban-column"
          @drop="handleDrop($event, column.status)"
          @dragover.prevent
        >
          <el-card class="column-card" shadow="never">
            <template #header>
              <div class="column-header">
                <h3>{{ column.title }}</h3>
                <el-badge :value="getTasksByStatus(column.status).length" class="task-count" />
              </div>
            </template>
            <el-scrollbar height="710px">
              <div class="column-content">
                <el-card
                  v-for="task in getTasksByStatus(column.status)"
                  :key="task.id"
                  class="task-card"
                  shadow="hover"
                  :draggable="activeTab !== 'person'"
                  @dragstart="handleDragStart($event, task.id)"
                  @click="goToTaskDetail(task.id)"
                >
                  <div class="task-header">
                    <h4>{{ task.name }}</h4>
                    <el-dropdown @command="handleTaskCommand" trigger="hover">
                      <el-button :icon="MoreFilled" circle size="small" />
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item :command="`view-${task.id}`" :icon="View">
                            查看详情
                          </el-dropdown-item>
                          <el-dropdown-item :command="`delete-${task.id}`" :icon="Delete">
                            删除任务
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>

                  <p class="task-content">{{ task.description }}</p>
                  <div class="task-meta">
                    <div class="meta-item">
                      <el-icon><User /></el-icon>
                      <span>{{ task.assignee }}</span>
                    </div>
                    <el-tag size="small" :type="getStatusType(task.status)">
                      {{ task.status }}
                    </el-tag>
                  </div>
                  <div class="task-time">
                    <div class="meta-item">
                      开始时间：
                      <el-icon><Calendar /></el-icon>
                      <span>{{ task.startDate }}</span>
                    </div>
                    <div class="meta-item">
                      结束时间：
                      <el-icon><Calendar /></el-icon>
                      <span>{{ task.dueDate }}</span>
                    </div>
                  </div>

                  <div class="task-badges">
                    <el-tag size="small" :type="getDifficultyType(task.difficulty)">
                      难度:{{ task.difficulty }}
                    </el-tag>
                    <el-tag size="small" type="primary">
                      {{ task.projectParentName }}
                    </el-tag>
                    <el-tag size="small" type="primary">
                      {{ task.projectTypeName }}
                    </el-tag>
                  </div>

                  <div class="task-progress">
                    <el-progress
                      :percentage="task.progress"
                      :stroke-width="4"
                      :show-text="false"
                      style="flex: 1"
                    />
                    <span class="progress-badge">{{ task.progress }}%</span>
                  </div>
                </el-card>
              </div>
            </el-scrollbar>
          </el-card>
        </div>
      </div>
      <div v-if="dataViewType === '表格'">
        <el-table :data="allTasks" style="width: 100%" border>
          <el-table-column prop="name" label="任务名称" />
          <el-table-column prop="status" label="任务状态">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="assignee" label="负责人" />
          <el-table-column prop="collaborators" label="协作成员" width="200">
            <template #default="{ row }">
              <div class="flex gap-2 flex-wrap">
                <el-tag v-for="collaborator in row.collaborators" :key="collaborator">
                  {{ collaborator }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="进度">
            <template #default="{ row }">
              <el-progress :percentage="row.progress" />
            </template>
          </el-table-column>
          <el-table-column prop="startDate" label="开始时间" />
          <el-table-column prop="dueDate" label="结束时间" />
          <el-table-column prop="difficulty" label="难度">
            <template #default="{ row }">
              <el-tag :type="getDifficultyType(row.difficulty)">{{ row.difficulty }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="projectParentName" label="所属项目" />
          <el-table-column prop="projectTypeName" label="任务类型" />
          <el-table-column prop="isFollowed" label="是否关注">
            <template #default="{ row }">
              <el-tag :type="row.isFollowed ? 'success' : 'info'">
                {{ row.isFollowed ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="blockedTasks" label="阻塞任务" /> -->
          <!-- <el-table-column prop="subtasks" label="子任务" /> -->
          <!-- <el-table-column prop="comments" label="评论" /> -->
          <!-- <el-table-column prop="attachments" label="附件" /> -->
          <el-table-column prop="createTime" label="创建时间" />
          <el-table-column prop="updateTime" label="更新时间" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import {
    Plus,
    Search,
    MoreFilled,
    Edit,
    View,
    Delete,
    User,
    Calendar,
    Link,
  } from '@element-plus/icons-vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { useRouter } from 'vue-router';
  import TaskDetail from './TaskDetail.vue';
  import AddTasks from './AddTasks.vue';
  import { taskApi } from '@/api/tasks';

  const router = useRouter();

  const addDialog = ref(false);

  const activeTab = ref('all');
  const searchTerm = ref('');
  const filterType = ref('all');
  const filterStatus = ref('all');
  const filterResponsible = ref('all');
  const onlyMyTasks = ref(false);
  const dataViewType = ref('看板');
  const dateRange = ref([]);

  const currentUser = JSON.parse(localStorage.getItem('userInfo'))?.nickName;

  // 统一的任务数据结构
  // const allTasks = ref([
  //   {
  //     id: 1,
  //     name: '用户登录JWT鉴权方案设计',
  //     description:
  //       '设计用户登录的JWT鉴权方案，包含token生成、校验、过期机制。需要考虑安全性、性能和用户体验，确保系统的安全性和稳定性。',
  //     status: '进行中',
  //     difficulty: '高',
  //     assignee: '张三',
  //     collaborators: ['李四', '王五'],
  //     startDate: '2024-01-15',
  //     dueDate: '2024-01-25',
  //     progress: 60,
  //     projectName: '用户登录模块技术方案设计',
  //     projectParentId: 1,
  //     projectParentName: '训练平台-荐股',
  //     projectTypeName: '部门自发',
  //     projectTypeId: 2,
  //     isFollowed: false,
  //     blockedTasks: [
  //       {
  //         id: 4,
  //         name: '前端登录页面开发',
  //       },
  //     ],
  //     subtasks: [
  //       {
  //         id: 1,
  //         title: 'JWT库选型和集成',
  //         description: '调研并选择合适的JWT库，完成项目集成',
  //         assignee: '张三',
  //         dueDate: '2024-01-18',
  //         completed: true,
  //       },
  //       {
  //         id: 2,
  //         title: 'token生成逻辑实现',
  //         description: '实现用户登录后的token生成逻辑',
  //         assignee: '李四',
  //         dueDate: '2024-01-20',
  //         completed: false,
  //       },
  //     ],
  //     comments: [
  //       {
  //         id: 1,
  //         user: '李四',
  //         content: '建议在token中加入用户角色信息，方便权限控制',
  //         timestamp: '2024-01-19 09:30',
  //       },
  //     ],
  //     attachments: [
  //       {
  //         id: 1,
  //         name: 'JWT技术方案.pdf',
  //         type: 'document',
  //         size: '2.3MB',
  //         uploadDate: '2024-01-16',
  //       },
  //     ],
  //     progressHistory: [
  //       {
  //         id: 1,
  //         timestamp: '2024-01-20 14:30',
  //         user: '张三',
  //         action: '更新进度',
  //         description: '完成JWT基础架构设计，开始实现token生成逻辑',
  //         progress: 60,
  //         type: 'progress',
  //       },
  //     ],
  //   },
  //   {
  //     id: 5,
  //     name: '前端登录页面开发',
  //     description:
  //       '开发用户登录页面，包含表单验证、错误提示、记住密码等功能。需要适配移动端和桌面端。',
  //     status: '已完成',
  //     difficulty: '中',
  //     projectTypeName: '总经办下发',
  //     projectTypeId: 1,
  //     assignee: '钱七',
  //     collaborators: ['孙八'],
  //     startDate: '2024-01-18',
  //     dueDate: '2024-01-28',
  //     estimatedHours: 40,
  //     actualHours: 38,
  //     progress: 100,
  //     projectName: '用户登录模块技术方案设计',
  //     projectParentId: 1,
  //     projectParentName: '日常',
  //     isFollowed: true,
  //     dependencies: [],
  //     blockedTasks: [],
  //     tags: ['前端', '页面开发', 'UI'],
  //     subtasks: [
  //       {
  //         id: 4,
  //         title: '登录表单组件开发',
  //         description: '开发可复用的登录表单组件',
  //         assignee: '钱七',
  //         dueDate: '2024-01-22',
  //         completed: true,
  //       },
  //       {
  //         id: 5,
  //         title: '表单验证逻辑实现',
  //         description: '实现前端表单验证逻辑',
  //         assignee: '孙八',
  //         dueDate: '2024-01-25',
  //         completed: true,
  //       },
  //     ],
  //     comments: [
  //       {
  //         id: 2,
  //         user: '孙八',
  //         content: '登录页面已完成开发，测试通过',
  //         timestamp: '2024-01-28 16:30',
  //       },
  //     ],
  //     attachments: [
  //       {
  //         id: 2,
  //         name: '登录页面设计稿.png',
  //         type: 'image',
  //         size: '1.2MB',
  //         uploadDate: '2024-01-18',
  //       },
  //     ],
  //     progressHistory: [
  //       {
  //         id: 2,
  //         timestamp: '2024-01-28 16:30',
  //         user: '钱七',
  //         action: '任务完成',
  //         description: '前端登录页面开发完成，所有功能测试通过',
  //         progress: 100,
  //         type: 'complete',
  //       },
  //     ],
  //   },
  // ]);
  const allTasks = ref([]);

  const kanbanColumns = computed(() => {
    if (activeTab.value === 'person') {
      // 按人员分类
      const persons = [...new Set(allTasks.value.map((task) => task.assignee))];
      return persons.map((person) => ({
        status: person,
        title: person,
        isPerson: true,
      }));
    } else {
      return [
        { status: '未开始', title: '未开始' },
        { status: '进行中', title: '进行中' },
        { status: '即将完成', title: '即将完成' },
        { status: '已完成', title: '已完成' },
      ];
    }
  });

  const loadTasks = async () => {
    try {
      // loading.value = true
      const result = await taskApi.getAllTasks();
      console.log(result);
      if (result.code === 200) {
        allTasks.value = result.data;
      } else {
        ElMessage.error(result.message);
      }
    } catch (error) {
      ElMessage.error('加载任务列表失败');
    } finally {
      // loading.value = false
    }
  };

  const tasksByUpdateTime = computed(() => {
    return allTasks.value.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime));
  });

  const getFilteredTasks = (viewType) => {
    let tasks = allTasks.value;

    // 根据视图类型筛选
    if (viewType === 'my') {
      tasks = tasks.filter((task) => task.assignee === currentUser);
    }

    // 应用其他筛选条件
    return tasks.filter((task) => {
      const matchesSearch =
        task.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.value.toLowerCase());
      const matchesType = filterType.value === 'all' || task.type === filterType.value;
      const matchesStatus = filterStatus.value === 'all' || task.status === filterStatus.value;
      const matchesResponsible =
        filterResponsible.value === 'all' || task.assignee === filterResponsible.value;

      return matchesSearch && matchesType && matchesStatus && matchesResponsible;
    });
  };

  const getTasksByStatus = (status) => {
    const filteredTasks = getFilteredTasks(activeTab.value);
    let result = [];
    if (activeTab.value === 'person') {
      // 按人员分类时，status实际是人员姓名
      result = filteredTasks.filter((task) => task.assignee === status);
    } else {
      // 按状态分类
      result = filteredTasks.filter((task) => task.status === status);
    }
    //如果勾选了只看我，那就只筛选出任务里的assignee等于当前用户
    if (onlyMyTasks.value) {
      result = result.filter((task) => task.assignee === currentUser);
    }
    return result;
  };

  const getDifficultyType = (difficulty) => {
    const types = {
      低: 'success',
      中: 'warning',
      高: 'danger',
    };
    return types[difficulty] || 'info';
  };

  const getStatusType = (status) => {
    const types = {
      未开始: 'info',
      进行中: 'success',
      即将完成: 'danger',
      已完成: 'warning',
    };
    return types[status] || 'info';
  };

  const handleDragStart = (e, taskId) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', taskId.toString());
    }
  };

  const updateTask = async (id, taskForm) => {
    const task = allTasks.value.find((t) => t.id === id);
    if (task) {
      const result = await taskApi.updateTask(id, taskForm);
      console.log(result);
      if (result.code === 200) {
        ElMessage.success('任务更新成功');
        loadTasks();
        editDialog.value = false;
      } else {
        ElMessage.error('任务更新失败');
      }
    }
  };

  const updateProgress = async (id, progressForm) => {
    const task = allTasks.value.find((t) => t.id === id);
    if (task) {
      const result = await taskApi.updateTaskProgress(
        id,
        progressForm.progress,
        progressForm.description,
        currentUser
      );
      if (result.code === 200) {
        ElMessage.success('任务进度更新成功');
        task.progress = progressForm.progress;
        task.progressHistory.push({
          id: task.progressHistory.length + 1,
          timestamp: new Date().toLocaleString(),
          user: currentUser,
          action: '更新进度',
          progress: progressForm.progress,
          description: progressForm.description,
        });
      } else {
        ElMessage.error('任务进度更新失败');
      }
      loadTasks();
    }
  };

  const addSubtask = (id, subtaskForm) => {
    const task = allTasks.value.find((t) => t.id === id);
    if (task) {
      task.subtasks.push({
        id: task.subtasks.length + 1,
        title: subtaskForm.title,
        description: subtaskForm.description,
        assignee: subtaskForm.assignee,
        dueDate: subtaskForm.dueDate,
        completed: subtaskForm.status,
      });
      ElMessage.success('子任务添加成功');
    }
  };

  const deleteSubtask = (subtaskId) => {
    const task = allTasks.value.find((t) => t.id === taskItem.value.id);
    if (task) {
      task.subtasks = task.subtasks.filter((s) => s.id !== subtaskId);
      ElMessage.success('子任务删除成功');
    }
  };

  const addComment = async (id, commentForm) => {
    const task = allTasks.value.find((t) => t.id === id);
    if (task) {
      const result = await taskApi.addTaskComment(id, commentForm);
      if (result.code === 200) {
        task.comments.push(commentForm);
        ElMessage.success('评论添加成功');
      } else {
        ElMessage.error('评论添加失败');
      }
      loadTasks();
    }
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();

    // 人员分类视图不支持拖拽改变状态
    if (activeTab.value === 'person') {
      ElMessage.warning('人员分类视图不支持拖拽改变任务状态');
      return;
    }

    if (e.dataTransfer) {
      const taskId = Number.parseInt(e.dataTransfer.getData('text/plain'));
      // 更新任务状态
      const task = allTasks.value.find((t) => t.id === taskId);
      if (task) {
        task.status = newStatus;
        await taskApi.updateTaskStatus(taskId, newStatus, currentUser);
        ElMessage.success(`任务已移动到"${newStatus}"`);
      }
    }
    loadTasks();
  };

  const handleTaskCommand = async (command) => {
    const [action, id] = command.split('-');
    const taskId = parseInt(id);

    switch (action) {
      case 'view':
        goToTaskDetail(taskId);
        break;
      case 'delete':
        ElMessageBox.confirm('确定要删除该任务吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(async () => {
            const result = await taskApi.deleteTask(taskId);
            if (result.code === 200) {
              ElMessage.success('任务删除成功');
              loadTasks();
            } else {
              ElMessage.error('任务删除失败');
            }
          })
          .catch(() => {
            ElMessage.info('已取消删除');
          });
        break;
    }
  };
  const taskItem = ref({});
  const editDialog = ref(false);
  const goToTaskDetail = (taskId) => {
    // router.push(`/tasksDetail/${taskId}`);
    console.log(taskId);
    taskItem.value = {};
    taskItem.value = allTasks.value.find((t) => t.id === taskId);
    if (taskItem.value) {
      editDialog.value = true;
    }
  };

  const closeDialog = () => {
    editDialog.value = false;
    taskItem.value = {};
  };

  const addTaskFinish = async (task) => {
    addDialog.value = false;
    const result = await taskApi.createTask(task);
    if (result.code === 200) {
      ElMessage.success('任务创建成功');
      loadTasks();
    } else {
      ElMessage.error('任务创建失败');
    }
    // allTasks.value.push(task);
    // taskApi;
  };

  const clearData = () => {
    localStorage.clear();
    ElMessage.success('数据已清空,即将自动刷新页面...');
    setTimeout(() => {
      location.reload();
    }, 3000);
  };

  onMounted(() => {
    loadTasks();
  });
</script>

<style lang="scss" scoped>
  .tasks {
    height: calc(100vh - 40px);
    .tasks-content {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

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

    &-tabs {
      margin-bottom: 24px;

      :deep(.el-tabs__header) {
        margin-bottom: 0;
      }
    }
  }

  .filters {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    justify-content: space-between;

    .search-input {
      width: 200px;
    }

    .filter-controls {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }

  .kanban-board {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    flex: 1;
  }

  .kanban-column {
    width: 24%;
    .column-card {
      height: 100%;

      :deep(.el-card__header) {
        padding: 16px 20px;
        background-color: var(--el-fill-color-lighter);
      }

      :deep(.el-card__body) {
        padding: 16px;
      }
    }

    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0;
      }

      .task-count {
        :deep(.el-badge__content) {
          background-color: var(--el-color-primary);
        }
      }
    }

    .column-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 500px;
    }
  }

  .task-card {
    cursor: move;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
    }

    :deep(.el-card__body) {
      padding: 16px;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;

      h4 {
        font-size: 20px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        line-height: 1.4;
        flex: 1;
        margin: 0;
      }
    }

    .task-content {
      font-size: 14px;
      color: var(--el-text-color-regular);
      line-height: 1.4;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .task-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }
    .task-time {
      display: flex;
      flex-direction: column;
      margin-bottom: 12px;
      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }

    .task-badges {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 8px;
    }

    .task-progress {
      display: flex;
      .progress-badge {
        text-align: center;
        width: 50px;
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .task-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .tasks-header {
      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
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

    .kanban-board {
      grid-template-columns: 1fr;
    }
  }
</style>

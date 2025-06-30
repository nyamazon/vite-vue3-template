<template>
  <div class="task-create">
    <!-- Header -->
    <div class="task-header">
      <div class="header-content">
        <div class="header-left"></div>
        <div class="header-actions">
          <el-button @click="resetForm">重置表单</el-button>
          <el-button type="primary" :loading="submitting" @click="submitTask">
            {{ submitting ? '创建中...' : '创建任务' }}
          </el-button>
        </div>
      </div>
    </div>

    <div class="task-content">
      <el-form
        ref="taskFormRef"
        :model="taskForm"
        :rules="taskRules"
        label-width="120px"
        class="task-form"
      >
        <el-row :gutter="24">
          <!-- 左侧主要表单 -->
          <el-col :span="16">
            <!-- 基础信息 -->
            <el-card class="form-card" shadow="never">
              <template #header>
                <h3>基础信息</h3>
              </template>

              <el-form-item label="任务名称" prop="name" required>
                <el-input
                  v-model="taskForm.name"
                  placeholder="请输入任务名称"
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="任务描述" prop="description" required>
                <el-input
                  v-model="taskForm.description"
                  type="textarea"
                  :rows="4"
                  placeholder="请详细描述任务内容、目标和要求..."
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>

              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="任务状态" prop="status">
                    <el-select v-model="taskForm.status" style="width: 100%">
                      <el-option label="未开始" value="未开始" />
                      <el-option label="进行中" value="进行中" />
                      <el-option label="即将完成" value="即将完成" />
                      <el-option label="已完成" value="已完成" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="难度等级" prop="difficulty">
                    <el-select v-model="taskForm.difficulty" style="width: 100%">
                      <el-option label="低" value="低" />
                      <el-option label="中" value="中" />
                      <el-option label="高" value="高" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="初始进度" prop="progress">
                    <el-input-number
                      v-model="taskForm.progress"
                      :min="0"
                      :max="100"
                      style="width: 70%"
                    />
                    <span class="input-suffix">%</span>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-card>

            <!-- 人员分配 -->
            <el-card class="form-card" shadow="never">
              <template #header>
                <h3>人员分配</h3>
              </template>

              <el-form-item label="负责人" prop="assignee" required>
                <el-select
                  v-model="taskForm.assignee"
                  placeholder="选择任务负责人"
                  style="width: 100%"
                >
                  <el-option
                    v-for="user in availableUsers"
                    :key="user.value"
                    :label="user.label"
                    :value="user.value"
                  >
                    <div class="user-option">
                      <el-avatar :size="24">{{ user.label.charAt(0) }}</el-avatar>
                      <span>{{ user.label }}</span>
                      <el-tag size="small" effect="plain">{{ user.role }}</el-tag>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="协作成员" prop="collaborators">
                <el-select
                  v-model="taskForm.collaborators"
                  multiple
                  placeholder="选择协作成员"
                  style="width: 100%"
                >
                  <el-option
                    v-for="user in availableCollaborators"
                    :key="user.value"
                    :label="user.label"
                    :value="user.value"
                  >
                    <div class="user-option">
                      <el-avatar :size="24">{{ user.label.charAt(0) }}</el-avatar>
                      <span>{{ user.label }}</span>
                      <el-tag size="small" effect="plain">{{ user.role }}</el-tag>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-card>

            <!-- 子任务管理 -->
            <el-card class="form-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <h3>子任务管理</h3>
                  <el-button type="primary" :icon="Plus" size="small" @click="addSubtask">
                    添加子任务
                  </el-button>
                </div>
              </template>

              <div class="subtasks-list">
                <div
                  v-for="(subtask, index) in taskForm.subtasks"
                  :key="index"
                  class="subtask-item"
                >
                  <div class="subtask-form">
                    <el-row :gutter="12">
                      <el-col :span="8">
                        <el-input v-model="subtask.title" placeholder="子任务标题" size="small" />
                      </el-col>
                      <el-col :span="8">
                        <el-input
                          v-model="subtask.description"
                          placeholder="子任务描述"
                          size="small"
                        />
                      </el-col>
                      <el-col :span="4">
                        <el-select
                          v-model="subtask.assignee"
                          placeholder="负责人"
                          size="small"
                          style="width: 100%"
                        >
                          <el-option
                            v-for="user in availableUsers"
                            :key="user.value"
                            :label="user.label"
                            :value="user.value"
                          />
                        </el-select>
                      </el-col>
                      <el-col :span="3">
                        <el-date-picker
                          v-model="subtask.dueDate"
                          type="date"
                          placeholder="截止时间"
                          size="small"
                          style="width: 100%"
                          value-format="YYYY/MM/DD"
                          format="YYYY/MM/DD"
                        />
                      </el-col>
                      <el-col :span="1">
                        <el-button
                          type="danger"
                          :icon="Delete"
                          size="small"
                          circle
                          @click="removeSubtask(index)"
                        />
                      </el-col>
                    </el-row>
                  </div>
                </div>

                <el-empty
                  v-if="taskForm.subtasks.length === 0"
                  description="暂无子任务"
                  :image-size="80"
                />
              </div>
            </el-card>
          </el-col>

          <!-- 右侧辅助信息 -->
          <el-col :span="8">
            <!-- 时间安排 -->
            <el-card class="form-card" shadow="never">
              <template #header>
                <h3>时间安排</h3>
              </template>

              <el-form-item label="开始时间" prop="startDate" required label-width="auto">
                <el-date-picker
                  v-model="taskForm.startDate"
                  type="date"
                  placeholder="选择开始时间"
                  style="width: 100%"
                  :disabled-date="disabledStartDate"
                  value-format="YYYY/MM/DD"
                  format="YYYY/MM/DD"
                />
              </el-form-item>
              <el-form-item label="截止时间" prop="dueDate" required label-width="auto">
                <el-date-picker
                  v-model="taskForm.dueDate"
                  type="date"
                  placeholder="选择截止时间"
                  style="width: 100%"
                  :disabled-date="disabledEndDate"
                  value-format="YYYY/MM/DD"
                  format="YYYY/MM/DD"
                />
              </el-form-item>
            </el-card>

            <!-- 项目关联 -->
            <el-card class="form-card" shadow="never">
              <template #header>
                <h3>项目关联</h3>
              </template>

              <el-form-item label="所属项目" prop="projectParentId" required label-width="auto">
                <el-select
                  v-model="taskForm.projectParentId"
                  placeholder="选择所属项目"
                  style="width: 100%"
                  filterable
                  @change="handleProjectChange"
                >
                  <el-option
                    v-for="project in availableProjects"
                    :key="project.id"
                    :label="project.name"
                    :value="project.value"
                  >
                    <div class="project-option">
                      <span class="project-name">{{ project.name }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="任务类型" prop="projectTypeId" required label-width="auto">
                <el-select
                  v-model="taskForm.projectTypeId"
                  placeholder="选择任务类型"
                  style="width: 100%"
                  filterable
                  @change="handleProjectTypeChange"
                >
                  <el-option
                    v-for="project in availableProjectsType"
                    :key="project.id"
                    :label="project.name"
                    :value="project.value"
                  >
                    <div class="project-option">
                      <span class="project-name">{{ project.name }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-card>

            <!-- 操作预览 -->
            <el-card class="form-card" shadow="never">
              <template #header>
                <h3>创建预览</h3>
              </template>

              <div class="preview-info">
                <div class="preview-item">
                  <label>任务名称:</label>
                  <span>{{ taskForm.name || '未填写' }}</span>
                </div>
                <div class="preview-item">
                  <label>负责人:</label>
                  <span>{{ taskForm.assignee || '未选择' }}</span>
                </div>
                <div class="preview-item">
                  <label>所属项目:</label>
                  <span>{{ getprojectParentName(taskForm.projectParentId) || '未选择' }}</span>
                </div>
                <div class="preview-item">
                  <label>任务类型:</label>
                  <span>{{ getProjectTypeName(taskForm.projectTypeId) || '未选择' }}</span>
                </div>
                <div class="preview-item">
                  <label>时间范围:</label>
                  <span>
                    {{ taskForm.startDate ? taskForm.startDate : '未设置' }} ~
                    {{ taskForm.dueDate ? taskForm.dueDate : '未设置' }}
                  </span>
                </div>
                <div class="preview-item">
                  <label>子任务数量:</label>
                  <span>{{ taskForm.subtasks.length }} 个</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { ArrowLeft, Plus, Delete, UploadFilled } from '@element-plus/icons-vue';

  const emit = defineEmits(['addTaskFinish']);

  const router = useRouter();
  const taskFormRef = ref();
  const submitting = ref(false);

  // 表单数据
  const taskForm = ref({
    name: '',
    description: '',
    status: '未开始',
    difficulty: '中',
    assignee: '',
    collaborators: [],
    startDate: null,
    dueDate: null,
    progress: 0,
    projectParentId: null,
    isFollowed: false,
    subtasks: [],
    projectTypeId: null,
  });

  // 辅助数据
  const initialComment = ref('');
  const selectedBlockedTasks = ref([]);
  const fileList = ref([]);

  // 表单验证规则
  const taskRules = {
    name: [
      { required: true, message: '请输入任务名称', trigger: 'blur' },
      { min: 2, max: 100, message: '任务名称长度在 2 到 100 个字符', trigger: 'blur' },
    ],
    description: [
      { required: true, message: '请输入任务描述', trigger: 'blur' },
      { min: 0, max: 500, message: '任务描述长度在 0 到 500 个字符', trigger: 'blur' },
    ],
    assignee: [{ required: true, message: '请选择任务负责人', trigger: 'change' }],
    projectParentId: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
    projectTypeId: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
    startDate: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
    dueDate: [{ required: true, message: '请选择截止时间', trigger: 'change' }],
  };

  // 模拟数据
  const availableUsers = ref([
    { value: '张星', label: '张星', role: '后端开发工程师' },
    { value: '唐硕', label: '唐硕', role: 'UI设计' },
    { value: '何也', label: '何也', role: 'UI设计' },
    { value: '章魏康', label: '章魏康', role: '技术策划部主管' },
    { value: '黄骏雄', label: '黄骏雄', role: '前端开发工程师' },
    { value: '钟远金', label: '钟远金', role: '编程技术员' },
    { value: '张经凡', label: '张经凡', role: '编程技术员' },
    { value: '郭俊', label: '郭俊', role: '编程技术员' },
  ]);

  const availableProjects = ref([
    { id: 1, name: '训练平台-股指', value: '训练平台-股指' },
    { id: 2, name: '训练平台-股票', value: '训练平台-股票' },
    { id: 3, name: '五大系统', value: '五大系统' },
    { id: 4, name: '四大平台', value: '四大平台' },
    { id: 5, name: '模拟交易平台', value: '模拟交易平台' },
    { id: 6, name: '日常任务', value: '日常任务' },
    { id: 7, name: '六分区平台', value: '六分区平台' },
    { id: 8, name: '回测框架', value: '回测框架' },
    { id: 9, name: '大类资产平台', value: '大类资产平台' },
    { id: 10, name: '商品期货平台', value: '商品期货平台' },
    { id: 11, name: '沙盘推演平台', value: '沙盘推演平台' },
    { id: 12, name: '游资监控平台', value: '游资监控平台' },
  ]);
  const availableProjectsType = ref([
    { id: 1, name: '总经办下发', value: '总经办下发' },
    { id: 2, name: '部门自发', value: '部门自发' },
  ]);

  // 计算属性
  const availableCollaborators = computed(() => {
    return availableUsers.value.filter((user) => user.value !== taskForm.value.assignee);
  });

  // 方法
  const goBack = () => {
    if (hasFormChanges()) {
      ElMessageBox.confirm('表单内容尚未保存，确定要离开吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          router.push('/tasks');
        })
        .catch(() => {
          // 用户取消
        });
    } else {
      router.push('/tasks');
    }
  };

  const hasFormChanges = () => {
    return (
      taskForm.value.name ||
      taskForm.value.description ||
      taskForm.value.assignee ||
      taskForm.value.projectParentId ||
      taskForm.value.subtasks.length > 0
    );
  };

  const resetForm = () => {
    ElMessageBox.confirm('确定要重置表单吗？所有填写的内容将被清空。', '重置确认', {
      confirmButtonText: '确定重置',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        taskFormRef.value.resetFields();
        taskForm.value.subtasks = [];
        selectedBlockedTasks.value = [];
        fileList.value = [];
        initialComment.value = '';
        ElMessage.success('表单已重置');
      })
      .catch(() => {
        // 用户取消
      });
  };

  const disabledStartDate = (time) => {
    // 不能选择今天之前的日期
    return time.getTime() < Date.now() - 8.64e7;
  };

  const disabledEndDate = (time) => {
    // 截止时间不能早于开始时间
    if (taskForm.value.startDate) {
      return time.getTime() < new Date(taskForm.value.startDate).getTime();
    }
    return time.getTime() < Date.now() - 8.64e7;
  };

  const addSubtask = () => {
    taskForm.value.subtasks.push({
      id: Date.now(), // 临时ID
      title: '',
      description: '',
      assignee: '',
      dueDate: null,
      completed: false,
    });
  };

  const removeSubtask = (index) => {
    taskForm.value.subtasks.splice(index, 1);
  };

  const handleProjectChange = (projectParentId) => {
    const project = availableProjects.value.find((p) => p.id === projectParentId);
    if (project) {
      // 可以根据项目自动设置一些默认值
      ElMessage.info(`已选择项目: ${project.name}`);
    }
  };

  const handleProjectTypeChange = (projectParentId) => {
    const project = availableProjects.value.find((p) => p.id === projectParentId);
    if (project) {
      // 可以根据项目自动设置一些默认值
      ElMessage.info(`已选择项目: ${project.name}`);
    }
  };

  const getprojectParentName = (projectParentId) => {
    const project = availableProjects.value.find((p) => p.value === projectParentId);
    return project ? project.name : '';
  };

  const getProjectTypeName = (projectTypeId) => {
    const projectType = availableProjectsType.value.find((p) => p.value === projectTypeId);
    return projectType ? projectType.name : '';
  };

  const submitTask = async () => {
    if (!taskFormRef.value) return;

    try {
      await taskFormRef.value.validate();

      submitting.value = true;

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));

      // 构建任务数据
      const newTask = {
        id: Date.now(), // 实际应用中应该由后端生成
        name: taskForm.value.name,
        description: taskForm.value.description,
        status: taskForm.value.status,
        difficulty: taskForm.value.difficulty,
        assignee: taskForm.value.assignee,
        collaborators: taskForm.value.collaborators,
        startDate: taskForm.value.startDate,
        dueDate: taskForm.value.dueDate,
        progress: taskForm.value.progress,
        projectParentName: getprojectParentName(taskForm.value.projectParentId),
        projectParentId: taskForm.value.projectParentId,
        projectTypeName: getProjectTypeName(taskForm.value.projectTypeId),
        projectTypeId: taskForm.value.projectTypeId,
        isFollowed: taskForm.value.isFollowed,
        blockedTasks: taskForm.value.blockedTasks,
        subtasks: taskForm.value.subtasks.map((subtask) => ({
          ...subtask,
          dueDate: subtask.dueDate,
        })),
        comments: [], // 默认先置空
        attachments: [], // 默认先置空
        progressHistory: [
          {
            id: 1,
            timestamp: new Date().toLocaleString(),
            user: userInfo.nickName || '默认名字',
            action: '创建任务',
            description: '任务创建完成',
            progress: taskForm.value.progress,
            type: 'create',
          },
        ],
      };

      // 跳转到任务详情页
      // router.push(`/tasks/${newTask.id}`);
      emit('addTaskFinish', newTask);
    } catch (error) {
      console.error('表单验证失败:', error);
      ElMessage.error('请检查表单填写是否完整');
    } finally {
      submitting.value = false;
    }
  };

  onMounted(() => {
    // 设置默认开始时间为今天
    taskForm.value.startDate = new Date();
  });
</script>

<style lang="scss" scoped>
  .task-create {
    min-height: 100vh;
    background: #f5f7fa;
  }

  .task-header {
    background: white;
    border-bottom: 1px solid var(--el-border-color-light);
    padding: 24px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .header-left {
      display: flex;
      align-items: flex-start;
      gap: 16px;

      .back-btn {
        margin-top: 8px;
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
        }
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .task-content {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }
  .user-option {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .task-form {
    .form-card {
      margin-bottom: 24px;

      :deep(.el-card__header) {
        padding: 16px 20px;
        border-bottom: 1px solid var(--el-border-color-lighter);

        h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      }

      :deep(.el-card__body) {
        padding: 20px;
      }
    }

    .input-suffix {
      margin-left: 8px;
      color: var(--el-text-color-regular);
    }

    .user-option,
    .project-option {
      display: flex;
      align-items: center;
      gap: 16px;

      .project-name {
        flex: 1;
      }
    }

    .subtasks-list {
      .subtask-item {
        margin-bottom: 12px;
        padding: 16px;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 8px;
        background: var(--el-fill-color-lighter);

        .subtask-form {
          .el-row {
            align-items: center;
          }
        }
      }
    }

    .upload-demo {
      :deep(.el-upload-dragger) {
        width: 100%;
        height: 120px;
      }
    }

    .preview-info {
      .preview-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 8px 0;
        border-bottom: 1px solid var(--el-border-color-lighter);

        &:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        label {
          font-weight: 500;
          color: var(--el-text-color-regular);
          min-width: 80px;
        }

        span {
          color: var(--el-text-color-primary);
          text-align: right;
          flex: 1;
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .task-header {
      .header-content {
        flex-direction: column;
        gap: 16px;
      }

      .header-left {
        flex-direction: column;
        gap: 12px;

        .back-btn {
          margin-top: 0;
          align-self: flex-start;
        }
      }
    }

    .task-content {
      padding: 16px;

      .el-row {
        flex-direction: column;

        .el-col {
          width: 100% !important;
          max-width: 100% !important;
        }
      }
    }

    .subtask-form {
      .el-row {
        flex-direction: column;

        .el-col {
          width: 100% !important;
          margin-bottom: 8px;
        }
      }
    }
  }
</style>

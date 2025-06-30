<template>
  <div class="task-detail">
    <!-- 加载状态 -->
    <div v-if="!isTaskLoaded" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 任务详情内容 -->
    <template v-else>
      <!-- Header -->
      <div class="task-header">
        <div class="header-content">
          <div class="header-left">
            <div class="header-info">
              <h1>{{ taskDetail.name }}</h1>
              <div class="task-meta">
                <el-tag :type="getStatusType(taskDetail.status)" size="small">
                  {{ taskDetail.status }}
                </el-tag>
                <el-tag :type="getDifficultyType(taskDetail.difficulty)" size="small">
                  {{ taskDetail.difficulty }}难度
                </el-tag>
              </div>
            </div>
          </div>
          <div class="header-actions items-center">
            <el-button
              :type="taskDetail.isFollowed ? 'primary' : 'default'"
              :icon="taskDetail.isFollowed ? Star : StarFilled"
              @click="toggleFollow"
            >
              {{ taskDetail.isFollowed ? '已关注' : '关注' }}
            </el-button>
            <el-button type="primary" @click="updateTask">提交更新数据</el-button>
          </div>
        </div>
      </div>

      <div class="task-content" v-if="isTaskLoaded">
        <el-row :gutter="24">
          <!-- 左侧主要内容 -->
          <el-col :span="16">
            <!-- 任务描述 -->
            <el-card class="description-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <h3>任务描述</h3>
                  <el-button :icon="Edit" size="small" @click="startEditDescription">
                    编辑
                  </el-button>
                </div>
              </template>
              <div class="description-content" v-if="!editDescriptionVisible">
                <p>{{ taskDetail.description }}</p>
              </div>
              <div v-else>
                <el-input
                  v-model="taskDetail.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入任务描述"
                />
                <div class="description-actions pt-2 flex justify-end">
                  <el-button size="small" @click="cancelEditDescription">取消</el-button>
                  <el-button type="primary" size="small" @click="editDescriptionVisible = false">
                    保存
                  </el-button>
                </div>
              </div>
            </el-card>

            <!-- 进度跟踪 -->
            <el-card class="progress-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <h3>进度跟踪</h3>
                  <el-button :icon="Refresh" size="small" @click="refreshProgress">刷新</el-button>
                </div>
              </template>
              <div class="progress-content">
                <div class="progress-overview">
                  <div class="progress-main">
                    <div class="progress-info">
                      <span>任务进度</span>
                      <span class="progress-value">{{ taskDetail.progress }}%</span>
                    </div>
                    <el-progress
                      :percentage="taskDetail.progress"
                      :stroke-width="12"
                      :show-text="false"
                      :color="getProgressColor(taskDetail.progress)"
                    />
                    <div class="progress-actions">
                      <el-button size="small" @click="showProgressDialog = true">
                        更新进度
                      </el-button>
                    </div>
                  </div>
                </div>

                <div class="progress-timeline">
                  <h4>进度记录</h4>
                  <el-timeline>
                    <el-timeline-item
                      v-for="record in taskDetail.progressHistory"
                      :key="record.id"
                      :timestamp="record.timestamp"
                      :type="getTimelineType(record.type)"
                      placement="top"
                    >
                      <div class="timeline-content">
                        <div class="timeline-header">
                          <span class="action">{{ record.action }}</span>
                          <span class="user">{{ record.user }}</span>
                        </div>
                        <div class="timeline-detail">描述:{{ record.description }}</div>
                        <div v-if="record.progress !== undefined" class="timeline-progress">
                          进度: {{ record.progress }}%
                        </div>
                      </div>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </div>
            </el-card>

            <!-- 子任务 -->
            <el-card class="subtasks-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <h3>子任务 ({{ taskDetail.subtasks.length }})</h3>
                  <el-button
                    type="primary"
                    :icon="Plus"
                    size="small"
                    @click="showSubtaskDialog = true"
                  >
                    添加子任务
                  </el-button>
                </div>
              </template>
              <div class="subtasks-content">
                <div v-for="subtask in taskDetail.subtasks" :key="subtask.id" class="subtask-item">
                  <div class="subtask-content">
                    <div class="subtask-header">
                      <span class="subtask-title" :class="{ completed: subtask.completed }">
                        {{ subtask.title }}
                      </span>
                      <div class="subtask-meta">
                        <el-tag v-if="subtask.assignee" size="small" effect="plain">
                          {{ subtask.assignee }}
                        </el-tag>
                        <span v-if="subtask.dueDate" class="due-date">
                          {{ subtask.dueDate }}
                        </span>
                      </div>
                    </div>
                    <div v-if="subtask.description" class="subtask-description">
                      {{ subtask.description }}
                    </div>
                  </div>
                  <div class="subtask-actions">
                    <el-button :icon="Edit" size="small">编辑</el-button>
                    <el-button :icon="Delete" size="small" @click="deleteSubtask(subtask.id)">
                      删除
                    </el-button>
                  </div>
                </div>

                <el-empty
                  v-if="taskDetail.subtasks.length === 0"
                  description="暂无子任务"
                  :image-size="80"
                />
              </div>
            </el-card>

            <!-- 评论 -->
            <el-card class="comments-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <h3>评论 ({{ taskDetail.comments.length }})</h3>
                </div>
              </template>
              <div class="comments-content">
                <!-- 添加评论 -->
                <div class="add-comment">
                  <el-input
                    v-model="newComment"
                    type="textarea"
                    :rows="3"
                    placeholder="添加评论..."
                    class="comment-input"
                  />
                  <div class="comment-actions">
                    <el-button size="small" @click="newComment = ''">取消</el-button>
                    <el-button
                      type="primary"
                      size="small"
                      :disabled="!newComment.trim()"
                      @click="addComment"
                    >
                      发表评论
                    </el-button>
                  </div>
                </div>

                <!-- 评论列表 -->
                <div class="comments-list">
                  <div
                    v-for="comment in taskDetail.comments"
                    :key="comment.id"
                    class="comment-item"
                  >
                    <el-avatar :size="36" class="comment-avatar">
                      {{ comment.user.charAt(0) }}
                    </el-avatar>
                    <div class="comment-content">
                      <div class="comment-header">
                        <span class="comment-user">{{ comment.user }}</span>
                        <span class="comment-time">{{ comment.timestamp }}</span>
                      </div>
                      <div class="comment-text">{{ comment.content }}</div>
                      <div class="comment-actions">
                        <el-button size="small">回复</el-button>
                        <el-button size="small">点赞</el-button>
                      </div>
                    </div>
                  </div>
                </div>

                <el-empty
                  v-if="taskDetail.comments.length === 0"
                  description="暂无评论"
                  :image-size="80"
                />
              </div>
            </el-card>
          </el-col>

          <!-- 右侧信息面板 -->
          <el-col :span="8">
            <!-- 基本信息 -->
            <el-card class="info-card" shadow="never">
              <template #header>
                <div class="flex justify-between">
                  <h3>基本信息</h3>
                  <el-button :icon="Edit" type="primary" size="small">编辑</el-button>
                </div>
              </template>
              <div class="info-content">
                <div class="info-item">
                  <label>任务状态</label>
                  <el-select
                    v-model="taskDetail.status"
                    @change="updateTaskStatus"
                    style="width: 100%"
                  >
                    <el-option label="未开始" value="未开始" />
                    <el-option label="进行中" value="进行中" />
                    <el-option label="即将完成" value="即将完成" />
                    <el-option label="已完成" value="已完成" />
                  </el-select>
                </div>

                <div class="info-item">
                  <label>负责人</label>
                  <div class="assignee-info">
                    <MyAvatar :user="taskDetail.assignee" :size="24" />
                    <span>{{ taskDetail.assignee }}</span>
                    <!-- <el-button :icon="Edit" size="small">更改</el-button> -->
                  </div>
                </div>

                <div class="info-item">
                  <label>协作成员</label>
                  <div class="collaborators-info">
                    <div class="flex gap-2" v-if="!addCollaboratorVisible">
                      <MyAvatar
                        v-for="member in taskDetail.collaborators"
                        :key="member"
                        :user="member"
                        :size="24"
                      />
                    </div>
                    <div v-else>
                      <el-select
                        v-model="taskDetail.collaborators"
                        multiple
                        placeholder="选择协作成员"
                        style="width: 260px"
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
                    </div>
                    <el-button :icon="Plus" size="small" @click="addCollaborator">
                      {{ addCollaboratorVisible ? '确定更改' : '添加成员' }}
                    </el-button>
                  </div>
                </div>

                <div class="info-item">
                  <label>开始时间</label>
                  <div class="date-info">
                    <el-icon><Calendar /></el-icon>
                    <span>{{ taskDetail.startDate }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <label>截止时间</label>
                  <div class="date-info" :class="{ overdue: isOverdue }">
                    <el-icon><Calendar /></el-icon>
                    <span>{{ taskDetail.dueDate }}</span>
                    <el-tag v-if="isOverdue" type="danger" size="small">已逾期</el-tag>
                  </div>
                </div>

                <div class="info-item">
                  <label>所属项目</label>
                  <div class="date-info">
                    <span>{{ taskDetail.projectParentName }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <label>任务类型</label>
                  <div class="date-info">
                    <span>{{ taskDetail.projectTypeName }}</span>
                  </div>
                </div>
              </div>
            </el-card>

            <el-card class="attachments-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <h3>附件文档</h3>
                  <el-button
                    type="primary"
                    :icon="Plus"
                    size="small"
                    @click="showUploadDialog = true"
                  >
                    上传
                  </el-button>
                </div>
              </template>
              <div class="attachments-content">
                <div v-for="file in taskDetail.attachments" :key="file.id" class="attachment-item">
                  <el-icon class="file-icon">
                    <Document v-if="file.type === 'document'" />
                    <Picture v-else-if="file.type === 'image'" />
                    <VideoPlay v-else-if="file.type === 'video'" />
                    <Folder v-else />
                  </el-icon>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-meta">
                      <span class="file-size">{{ file.size }}</span>
                      <span class="file-date">{{ file.uploadDate }}</span>
                    </div>
                  </div>
                  <div class="file-actions">
                    <el-button :icon="Download" size="small">下载</el-button>
                    <el-button :icon="Delete" size="small">删除</el-button>
                  </div>
                </div>

                <el-empty
                  v-if="taskDetail.attachments.length === 0"
                  description="暂无附件"
                  :image-size="60"
                />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <el-empty v-else description="任务不存在" :image-size="100" />

      <!-- 进度更新对话框 -->
      <el-dialog v-model="showProgressDialog" title="更新任务进度" width="400px">
        <el-form :model="progressForm" label-width="80px">
          <el-form-item label="当前进度">
            <el-slider
              v-model="progressForm.progress"
              :min="0"
              :max="100"
              show-input
              :format-tooltip="(val) => `${val}%`"
            />
          </el-form-item>
          <el-form-item label="进度说明">
            <el-input
              v-model="progressForm.description"
              type="textarea"
              :rows="3"
              placeholder="请描述本次进度更新的具体内容..."
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showProgressDialog = false">取消</el-button>
          <el-button type="primary" @click="updateProgress">确定</el-button>
        </template>
      </el-dialog>

      <!-- 添加子任务对话框 -->
      <el-dialog v-model="showSubtaskDialog" title="添加子任务" width="500px">
        <el-form :model="subtaskForm" label-width="80px">
          <el-form-item label="任务标题" required>
            <el-input v-model="subtaskForm.title" placeholder="请输入子任务标题" />
          </el-form-item>
          <el-form-item label="任务描述">
            <el-input
              v-model="subtaskForm.description"
              type="textarea"
              :rows="2"
              placeholder="请输入子任务描述"
            />
          </el-form-item>
          <el-form-item label="负责人">
            <el-select v-model="subtaskForm.assignee" placeholder="选择负责人">
              <el-option label="张三" value="张三" />
              <el-option label="李四" value="李四" />
              <el-option label="王五" value="王五" />
            </el-select>
          </el-form-item>
          <el-form-item label="截止时间">
            <el-date-picker
              v-model="subtaskForm.dueDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="选择截止时间"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="任务状态">
            <el-select v-model="subtaskForm.status" placeholder="选择子任务状态">
              <el-option label="未开始" :value="false" />
              <el-option label="已完成" :value="true" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showSubtaskDialog = false">取消</el-button>
          <el-button type="primary" @click="addSubtask">确定</el-button>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import MyAvatar from '@/components/MyAvatar.vue';
  import {
    ArrowLeft,
    Edit,
    Star,
    StarFilled,
    MoreFilled,
    CopyDocument,
    Download,
    Delete,
    Refresh,
    Plus,
    Calendar,
    Clock,
    FolderOpened,
    Link,
    Warning,
    Document,
    Picture,
    VideoPlay,
    Folder,
  } from '@element-plus/icons-vue';

  const props = defineProps({
    taskItem: {
      type: Object,
      default: () => {},
    },
  });
  const emit = defineEmits([
    'update-progress',
    'add-subtask',
    'delete-subtask',
    'add-comment',
    'update-task',
  ]);
  const router = useRouter();
  const route = useRoute();

  // 描述数据编辑
  const editDescriptionVisible = ref(false);
  let lastDescription = '';
  const startEditDescription = () => {
    lastDescription = taskDetail.value.description;
    editDescriptionVisible.value = !editDescriptionVisible.value;
  };
  //点击取消按钮 框去掉 值还原
  const cancelEditDescription = () => {
    taskDetail.value.description = lastDescription;
    editDescriptionVisible.value = false;
  };

  // 添加协作成员数据编辑
  const addCollaboratorVisible = ref(false);
  //成员opations
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
  const availableCollaborators = computed(() => {
    return availableUsers.value.filter((user) => user.value !== taskDetail.value.assignee);
  });
  const addCollaborator = () => {
    addCollaboratorVisible.value = !addCollaboratorVisible.value;
  };

  // 对话框状态
  const showProgressDialog = ref(false);
  const showSubtaskDialog = ref(false);
  const showUploadDialog = ref(false);

  // 表单数据
  const progressForm = ref({
    progress: 0,
    description: '',
  });

  const subtaskForm = ref({
    title: '',
    description: '',
    assignee: '',
    dueDate: null,
  });

  const newComment = ref('');

  const getTaskData = (taskId) => {
    console.log(props.taskItem);
    return props.taskItem;
  };

  // 更新taskDetail的初始化，添加错误处理
  const taskDetail = ref(null);

  const toggleFollow = () => {
    if (taskDetail.value) {
      taskDetail.value.isFollowed = !taskDetail.value.isFollowed;
    }
  };

  const refreshProgress = () => {
    console.log('刷新进度');
  };

  const updateProgress = () => {
    console.log('更新进度');
    emit('update-progress', props.taskItem.id, progressForm.value);
    showProgressDialog.value = false;
  };

  const addSubtask = () => {
    console.log('添加子任务');
    emit('add-subtask', props.taskItem.id, subtaskForm.value);
    showSubtaskDialog.value = false;
  };

  const deleteSubtask = (subtaskId) => {
    console.log('删除子任务', subtaskId);
    emit('delete-subtask', subtaskId);
  };

  const addComment = () => {
    if (newComment.value.trim() === '') {
      ElMessage.error('评论不能为空');
      return;
    }
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const commentForm = {
      id: Date.now(),
      user: userInfo.nickName,
      content: newComment.value,
      timestamp: new Date().toLocaleString(),
    };
    emit('add-comment', props.taskItem.id, commentForm);
    newComment.value = '';
  };

  const goToProject = () => {
    console.log('跳转到项目');
  };

  const goToTask = (taskId) => {
    console.log('跳转到任务', taskId);
  };

  const getStatusType = (status) => {
    switch (status) {
      case '未开始':
        return 'info';
      case '进行中':
        return 'warning';
      case '待审核':
        return 'primary';
      case '已完成':
        return 'success';
      case '已取消':
        return 'danger';
      default:
        return '';
    }
  };

  const getPriorityType = (priority) => {
    switch (priority) {
      case '低':
        return 'success';
      case '中':
        return 'warning';
      case '高':
        return 'danger';
      case '紧急':
        return 'danger';
      default:
        return '';
    }
  };

  const getDifficultyType = (difficulty) => {
    switch (difficulty) {
      case '低':
        return 'success';
      case '中':
        return 'warning';
      case '高':
        return 'danger';
      default:
        return '';
    }
  };

  const getProgressColor = (progress) => {
    if (progress < 30) {
      return '#f56c6c';
    } else if (progress < 70) {
      return '#e6a23c';
    } else {
      return '#67c23a';
    }
  };

  const getTimelineType = (type) => {
    switch (type) {
      case 'progress':
        return 'primary';
      case 'comment':
        return 'success';
      case 'create':
        return 'info';
      case 'start':
        return 'warning';
      case 'complete':
        return 'success';
      default:
        return '';
    }
  };

  const isOverdue = computed(() => {
    return new Date(taskDetail.value.dueDate) < new Date();
  });

  const updateTask = () => {
    const updateData = {
      ...taskDetail.value,
    };
    delete updateData.comment;
    delete updateData.subtasks;
    delete updateData.progressHistory;
    emit('update-task', props.taskItem.id, updateData);
    console.log(updateData);
  };
  const updateTaskStatus = () => {};

  onMounted(() => {
    const taskId = parseInt(route.params.id);
    const foundTask = getTaskData(taskId);

    if (foundTask) {
      // taskDetail.value = foundTask;
      taskDetail.value = JSON.parse(JSON.stringify(foundTask));
      lastDescription = taskDetail.value.description;
      progressForm.value.progress = foundTask.progress;
    } else {
      ElMessage.error('任务不存在');
      router.push('/tasks');
    }
  });

  // 添加任务不存在时的处理
  const isTaskLoaded = computed(() => {
    return taskDetail.value !== null;
  });
</script>

<style lang="scss" scoped>
  .task-detail {
    min-height: 100vh;
    background: #f5f7fa;
  }

  // 在style中添加加载容器的样式

  .loading-container {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
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
          margin-bottom: 8px;
        }

        .task-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
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

  // 卡片通用样式
  .el-card {
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

  // 任务描述卡片
  .description-content {
    p {
      line-height: 1.6;
      color: var(--el-text-color-primary);
      margin-bottom: 20px;
    }

    .requirements-section,
    .acceptance-section {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--el-border-color-lighter);

      h4 {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 12px;
      }
    }

    .requirements-list {
      list-style: none;
      padding: 0;

      li {
        padding: 8px 0;
        border-bottom: 1px solid var(--el-border-color-lighter);
        position: relative;
        padding-left: 20px;

        &:before {
          content: '•';
          color: var(--el-color-primary);
          font-weight: bold;
          position: absolute;
          left: 0;
        }

        &:last-child {
          border-bottom: none;
        }
      }
    }

    .acceptance-list {
      .acceptance-item {
        margin-bottom: 8px;

        :deep(.el-checkbox__label) {
          line-height: 1.5;
        }
      }
    }
  }

  // 进度跟踪卡片
  .progress-content {
    .progress-overview {
      margin-bottom: 32px;

      .progress-main {
        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .progress-value {
            font-size: 24px;
            font-weight: 600;
            color: var(--el-color-primary);
          }
        }

        .progress-actions {
          margin-top: 12px;
          text-align: right;
        }
      }
    }

    .progress-timeline {
      h4 {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 16px;
      }

      .timeline-content {
        .timeline-header {
          display: flex;
          gap: 8px;
          margin-bottom: 4px;

          .action {
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .user {
            color: var(--el-color-primary);
          }
        }

        .timeline-detail {
          color: var(--el-text-color-regular);
          line-height: 1.5;
          margin-bottom: 4px;
        }

        .timeline-progress {
          font-size: 12px;
          color: var(--el-color-success);
          font-weight: 500;
        }
      }
    }
  }

  // 子任务卡片
  .subtasks-content {
    .subtask-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
      margin-bottom: 12px;
      transition: all 0.3s;

      &:hover {
        border-color: var(--el-color-primary-light-5);
        background: var(--el-color-primary-light-9);
      }

      .subtask-checkbox {
        margin-top: 2px;
      }

      .subtask-content {
        flex: 1;

        .subtask-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;

          .subtask-title {
            font-weight: 500;
            color: var(--el-text-color-primary);

            &.completed {
              text-decoration: line-through;
              color: var(--el-text-color-placeholder);
            }
          }

          .subtask-meta {
            display: flex;
            align-items: center;
            gap: 8px;

            .due-date {
              font-size: 12px;
              color: var(--el-text-color-regular);
            }
          }
        }

        .subtask-description {
          font-size: 12px;
          color: var(--el-text-color-regular);
          line-height: 1.4;
        }
      }

      .subtask-actions {
        display: flex;
        gap: 4px;
      }
    }
  }

  // 评论卡片
  .comments-content {
    .add-comment {
      margin-bottom: 24px;

      .comment-input {
        margin-bottom: 12px;
      }

      .comment-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    }

    .comments-list {
      .comment-item {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--el-border-color-lighter);

        &:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .comment-avatar {
          flex-shrink: 0;
          background: var(--el-color-primary);
        }

        .comment-content {
          flex: 1;

          .comment-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;

            .comment-user {
              font-weight: 500;
              color: var(--el-text-color-primary);
            }

            .comment-time {
              font-size: 12px;
              color: var(--el-text-color-placeholder);
            }
          }

          .comment-text {
            line-height: 1.5;
            color: var(--el-text-color-regular);
            margin-bottom: 8px;
          }

          .comment-actions {
            display: flex;
            gap: 8px;
          }
        }
      }
    }
  }

  // 右侧信息面板
  .info-content {
    .info-item {
      margin-bottom: 20px;

      label {
        display: block;
        font-size: 12px;
        color: var(--el-text-color-regular);
        margin-bottom: 8px;
        font-weight: 500;
      }

      .assignee-info,
      .date-info,
      .time-info {
        display: flex;
        align-items: center;
        gap: 8px;

        &.overdue {
          color: var(--el-color-danger);
        }
      }

      .collaborators-info {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }
    }
  }

  .related-content {
    .related-item {
      margin-bottom: 20px;

      label {
        display: block;
        font-size: 12px;
        color: var(--el-text-color-regular);
        margin-bottom: 8px;
        font-weight: 500;
      }

      .project-link,
      .dependency-item,
      .blocked-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .tags-list {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }
  }

  .attachments-content {
    .attachment-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
      margin-bottom: 12px;
      transition: all 0.3s;

      &:hover {
        border-color: var(--el-color-primary-light-5);
        background: var(--el-color-primary-light-9);
      }

      .file-icon {
        font-size: 24px;
        color: var(--el-color-primary);
      }

      .file-info {
        flex: 1;

        .file-name {
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .file-meta {
          display: flex;
          gap: 8px;
          font-size: 12px;
          color: var(--el-text-color-placeholder);
        }
      }

      .file-actions {
        display: flex;
        gap: 4px;
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

    .subtask-item {
      flex-direction: column;
      gap: 8px;

      .subtask-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }

    .comment-item {
      flex-direction: column;
      gap: 8px;
    }
  }
  .user-option {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>

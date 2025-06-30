import Mock from 'mockjs';

// 模拟任务数据存储
let taskStorage = JSON.parse(localStorage.getItem('tasks')) || [];
let taskIdCounter = taskStorage.length > 0 ? Math.max(...taskStorage.map((t) => t.id)) + 1 : 1;

// 初始化示例数据
if (taskStorage.length === 0) {
  taskStorage = [
    {
      id: 1,
      name: '用户登录JWT鉴权方案设计',
      description:
        '设计用户登录的JWT鉴权方案，包含token生成、校验、过期机制。需要考虑安全性、性能和用户体验，确保系统的安全性和稳定性。',
      status: '进行中',
      difficulty: '高',
      assignee: '张星',
      collaborators: ['唐硕', '何也'],
      startDate: '2024-01-15',
      dueDate: '2024-01-25',
      progress: 60,
      projectParentName: '五大系统',
      projectParentId: '五大系统',
      projectTypeName: '总经办下发',
      projectTypeId: '总经办下发',
      isFollowed: false,
      blockedTasks: [],
      subtasks: [
        {
          id: 1,
          title: 'JWT库选型和集成',
          description: '调研并选择合适的JWT库，完成项目集成',
          assignee: '张星',
          dueDate: '2024-01-18',
          completed: true,
        },
        {
          id: 2,
          title: 'token生成逻辑实现',
          description: '实现用户登录后的token生成逻辑',
          assignee: '唐硕',
          dueDate: '2024-01-20',
          completed: false,
        },
      ],
      comments: [
        {
          id: 1,
          user: '唐硕',
          content: '建议在token中加入用户角色信息，方便权限控制',
          timestamp: '2024-01-19 09:30',
        },
      ],
      attachments: [
        {
          id: 1,
          name: 'JWT技术方案.pdf',
          type: 'document',
          size: '2.3MB',
          uploadDate: '2024-01-16',
        },
      ],
      progressHistory: [
        {
          id: 1,
          timestamp: '2024-01-20 14:30',
          user: '张星',
          action: '创建任务',
          description: '任务创建完成',
          progress: 60,
          type: 'create',
        },
      ],
    },
    {
      id: 2,
      name: '训练平台UI界面优化',
      description:
        '优化训练平台的用户界面，提升用户体验和视觉效果。包含页面布局调整、色彩搭配优化、交互体验改进等。',
      status: '未开始',
      difficulty: '中',
      assignee: '何也',
      collaborators: ['唐硕'],
      startDate: '2024-01-22',
      dueDate: '2024-02-05',
      progress: 0,
      projectParentName: '训练平台-股指',
      projectParentId: '训练平台-股指',
      projectTypeName: '部门自发',
      projectTypeId: '部门自发',
      isFollowed: true,
      blockedTasks: [],
      subtasks: [],
      comments: [],
      attachments: [],
      progressHistory: [
        {
          id: 1,
          timestamp: '2024-01-21 16:30',
          user: '何也',
          action: '创建任务',
          description: '任务创建完成',
          progress: 0,
          type: 'create',
        },
      ],
    },
    {
      id: 3,
      name: '模拟交易功能开发',
      description:
        '开发模拟交易核心功能，包含下单、撤单、持仓管理等基础交易功能。需要确保数据准确性和系统稳定性。',
      status: '即将完成',
      difficulty: '高',
      assignee: '黄骏雄',
      collaborators: ['钟远金', '张经凡'],
      startDate: '2024-01-08',
      dueDate: '2024-01-25',
      progress: 85,
      projectParentName: '模拟交易平台',
      projectParentId: '模拟交易平台',
      projectTypeName: '总经办下发',
      projectTypeId: '总经办下发',
      isFollowed: false,
      blockedTasks: [],
      subtasks: [
        {
          id: 3,
          title: '下单功能实现',
          description: '实现股票下单功能',
          assignee: '黄骏雄',
          dueDate: '2024-01-15',
          completed: true,
        },
        {
          id: 4,
          title: '持仓管理功能',
          description: '实现持仓查询和管理功能',
          assignee: '钟远金',
          dueDate: '2024-01-20',
          completed: true,
        },
        {
          id: 5,
          title: '交易记录查询',
          description: '实现交易历史记录查询功能',
          assignee: '张经凡',
          dueDate: '2024-01-24',
          completed: false,
        },
      ],
      comments: [
        {
          id: 2,
          user: '章魏康',
          content: '功能开发进度良好，注意代码质量和测试覆盖',
          timestamp: '2024-01-20 11:15',
        },
      ],
      attachments: [],
      progressHistory: [
        {
          id: 2,
          timestamp: '2024-01-20 15:45',
          user: '黄骏雄',
          action: '更新进度',
          description: '完成核心交易功能开发，开始测试阶段',
          progress: 85,
          type: 'progress',
        },
      ],
    },
  ];
  localStorage.setItem('tasks', JSON.stringify(taskStorage));
  taskIdCounter = 4;
}

// 保存数据到 localStorage
const saveToStorage = () => {
  localStorage.setItem('tasks', JSON.stringify(taskStorage));
};

// 工具函数：模拟延迟
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// 工具函数：生成响应
const createResponse = (code, data = null, message = '') => ({
  code: code ? 200 : 500,
  data,
  message,
  timestamp: new Date().toISOString(),
});

// 工具函数：查找任务
const findTaskById = (id) => {
  return taskStorage.find((task) => task.id === Number.parseInt(id));
};

// 工具函数：查找任务索引
const findTaskIndexById = (id) => {
  return taskStorage.findIndex((task) => task.id === Number.parseInt(id));
};

// Mock配置
Mock.setup({
  timeout: '200-800', // 模拟网络延迟
});

// 获取所有任务
Mock.mock(/\/api\/tasks$/, 'get', (options) => {
  console.log('Mock: 获取所有任务');
  const tasks = [...taskStorage];
  // 按创建时间排序
  tasks.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  return createResponse(true, tasks, '获取任务列表成功');
});

// 根据ID获取单个任务
Mock.mock(/\/api\/tasks\/(\d+)$/, 'get', (options) => {
  const id = options.url.match(/\/api\/tasks\/(\d+)$/)[1];
  console.log('Mock: 获取任务详情', id);

  const task = findTaskById(id);
  if (task) {
    return createResponse(true, { ...task }, '获取任务详情成功');
  } else {
    return createResponse(false, null, '任务不存在');
  }
});

// 创建新任务
Mock.mock(/\/api\/tasks$/, 'post', (options) => {
  console.log('Mock: 创建任务');
  const taskData = JSON.parse(options.body);

  const newTask = {
    id: taskIdCounter++,
    ...taskData,
    // 确保必要字段存在
    blockedTasks: taskData.blockedTasks || [],
    comments: taskData.comments || [],
    attachments: taskData.attachments || [],
    progressHistory: taskData.progressHistory || [
      {
        id: 1,
        timestamp: new Date().toLocaleString(),
        user: taskData.assignee || '系统',
        action: '创建任务',
        description: '任务创建完成',
        progress: taskData.progress || 0,
        type: 'create',
      },
    ],
  };

  taskStorage.push(newTask);
  saveToStorage();

  return createResponse(true, { ...newTask }, '任务创建成功');
});

// 更新任务
Mock.mock(/\/api\/tasks\/(\d+)$/, 'put', (options) => {
  const id = options.url.match(/\/api\/tasks\/(\d+)$/)[1];
  const updateData = JSON.parse(options.body);
  console.log('Mock: 更新任务', id, updateData);

  const taskIndex = findTaskIndexById(id);
  if (taskIndex === -1) {
    return createResponse(false, null, '任务不存在');
  }

  const oldTask = { ...taskStorage[taskIndex] };
  const updatedTask = {
    ...oldTask,
    ...updateData,
    id: Number.parseInt(id), // 确保ID不被覆盖
  };

  // 如果进度有变化，添加进度历史记录
  if (updateData.progress !== undefined && updateData.progress !== oldTask.progress) {
    const newProgressRecord = {
      id: (updatedTask.progressHistory?.length || 0) + 1,
      timestamp: new Date().toLocaleString(),
      user: updateData.updatedBy || updatedTask.assignee || '系统',
      action: '更新进度',
      description:
        updateData.progressDescription ||
        `进度从 ${oldTask.progress}% 更新至 ${updateData.progress}%`,
      progress: updateData.progress,
      type: 'progress',
    };
    updatedTask.progressHistory = [...(updatedTask.progressHistory || []), newProgressRecord];
  }

  taskStorage[taskIndex] = updatedTask;
  saveToStorage();

  return createResponse(true, { ...updatedTask }, '任务更新成功');
});

// 删除任务
Mock.mock(/\/api\/tasks\/(\d+)$/, 'delete', (options) => {
  const id = options.url.match(/\/api\/tasks\/(\d+)$/)[1];
  console.log('Mock: 删除任务', id);

  const taskIndex = findTaskIndexById(id);
  if (taskIndex === -1) {
    return createResponse(false, null, '任务不存在');
  }

  const deletedTask = taskStorage.splice(taskIndex, 1)[0];
  saveToStorage();

  return createResponse(true, { ...deletedTask }, '任务删除成功');
});

// 批量删除任务
Mock.mock(/\/api\/tasks\/batch$/, 'delete', (options) => {
  const { ids } = JSON.parse(options.body);
  console.log('Mock: 批量删除任务', ids);

  const deletedTasks = [];
  const notFoundIds = [];

  ids.forEach((id) => {
    const taskIndex = findTaskIndexById(id);
    if (taskIndex !== -1) {
      deletedTasks.push(taskStorage.splice(taskIndex, 1)[0]);
    } else {
      notFoundIds.push(id);
    }
  });

  saveToStorage();

  return createResponse(
    true,
    {
      deletedTasks,
      notFoundIds,
      deletedCount: deletedTasks.length,
    },
    `成功删除 ${deletedTasks.length} 个任务${
      notFoundIds.length > 0 ? `，${notFoundIds.length} 个任务不存在` : ''
    }`
  );
});

// 更新任务状态
Mock.mock(/\/api\/tasks\/(\d+)\/status$/, 'post', (options) => {
  const id = options.url.match(/\/api\/tasks\/(\d+)\/status$/)[1];
  const { status, updatedBy = '系统' } = JSON.parse(options.body);
  console.log('Mock: 更新任务状态', id, status);

  const taskIndex = findTaskIndexById(id);
  if (taskIndex === -1) {
    return createResponse(false, null, '任务不存在');
  }

  const oldTask = { ...taskStorage[taskIndex] };
  taskStorage[taskIndex].status = status;

  // 添加状态更新历史记录
  const statusHistory = {
    id: (taskStorage[taskIndex].progressHistory?.length || 0) + 1,
    timestamp: new Date().toLocaleString(),
    user: updatedBy,
    action: '状态更新',
    description: `任务状态更新为：${status}`,
    type: 'status',
  };
  taskStorage[taskIndex].progressHistory = [
    ...(taskStorage[taskIndex].progressHistory || []),
    statusHistory,
  ];

  saveToStorage();

  return createResponse(true, { ...taskStorage[taskIndex] }, '任务状态更新成功');
});

// 更新任务进度
Mock.mock(/\/api\/tasks\/(\d+)\/progress$/, 'post', (options) => {
  const id = options.url.match(/\/api\/tasks\/(\d+)\/progress$/)[1];
  const { progress, description = '', updatedBy = '系统' } = JSON.parse(options.body);
  console.log('Mock: 更新任务进度', id, progress);

  const taskIndex = findTaskIndexById(id);
  if (taskIndex === -1) {
    return createResponse(false, null, '任务不存在');
  }

  const oldProgress = taskStorage[taskIndex].progress;
  taskStorage[taskIndex].progress = progress;

  // 添加进度更新历史记录
  const progressHistory = {
    id: (taskStorage[taskIndex].progressHistory?.length || 0) + 1,
    timestamp: new Date().toLocaleString(),
    user: updatedBy,
    action: '更新进度',
    description: description || `进度从 ${oldProgress}% 更新至 ${progress}%`,
    progress: progress,
    type: 'progress',
  };
  taskStorage[taskIndex].progressHistory = [
    ...(taskStorage[taskIndex].progressHistory || []),
    progressHistory,
  ];

  saveToStorage();

  return createResponse(true, { ...taskStorage[taskIndex] }, '任务进度更新成功');
});

// 添加任务评论
Mock.mock(/\/api\/tasks\/(\d+)\/comments$/, 'post', (options) => {
  const id = options.url.match(/\/api\/tasks\/(\d+)\/comments$/)[1];
  const commentData = JSON.parse(options.body);
  console.log('Mock: 添加任务评论', id, commentData);

  const task = findTaskById(id);
  if (!task) {
    return createResponse(false, null, '任务不存在');
  }

  const newComment = {
    id: (task.comments?.length || 0) + 1,
    user: commentData.user || '匿名用户',
    content: commentData.content,
    timestamp: new Date().toLocaleString(),
  };

  task.comments = [...(task.comments || []), newComment];

  // 添加评论历史记录
  const commentHistory = {
    id: (task.progressHistory?.length || 0) + 1,
    timestamp: new Date().toLocaleString(),
    user: commentData.user || '匿名用户',
    action: '添加评论',
    description: `添加了新评论：${commentData.content.substring(0, 50)}${
      commentData.content.length > 50 ? '...' : ''
    }`,
    type: 'comment',
  };
  task.progressHistory = [...(task.progressHistory || []), commentHistory];

  saveToStorage();

  return createResponse(true, { ...newComment }, '评论添加成功');
});

// 添加子任务
Mock.mock(/\/api\/tasks\/(\d+)\/subtasks$/, 'post', (options) => {
  const id = options.url.match(/\/api\/tasks\/(\d+)\/subtasks$/)[1];
  const subtaskData = JSON.parse(options.body);
  console.log('Mock: 添加子任务', id, subtaskData);

  const task = findTaskById(id);
  if (!task) {
    return createResponse(false, null, '任务不存在');
  }

  const newSubtask = {
    id: (task.subtasks?.length || 0) + 1,
    title: subtaskData.title,
    description: subtaskData.description || '',
    assignee: subtaskData.assignee || task.assignee,
    dueDate: subtaskData.dueDate || null,
    completed: false,
  };

  task.subtasks = [...(task.subtasks || []), newSubtask];
  saveToStorage();

  return createResponse(true, { ...newSubtask }, '子任务添加成功');
});

// 更新子任务状态
Mock.mock(/\/api\/tasks\/(\d+)\/subtasks\/(\d+)\/status$/, 'patch', (options) => {
  const matches = options.url.match(/\/api\/tasks\/(\d+)\/subtasks\/(\d+)\/status$/);
  const taskId = matches[1];
  const subtaskId = matches[2];
  const { completed } = JSON.parse(options.body);
  console.log('Mock: 更新子任务状态', taskId, subtaskId, completed);

  const task = findTaskById(taskId);
  if (!task) {
    return createResponse(false, null, '任务不存在');
  }

  const subtask = task.subtasks?.find((st) => st.id === Number.parseInt(subtaskId));
  if (!subtask) {
    return createResponse(false, null, '子任务不存在');
  }

  subtask.completed = completed;
  saveToStorage();

  return createResponse(true, { ...subtask }, '子任务状态更新成功');
});

// 搜索任务
Mock.mock(/\/api\/tasks\/search\?(.*)$/, 'get', (options) => {
  const urlParams = new URLSearchParams(options.url.split('?')[1]);
  const query = urlParams.get('q') || '';
  console.log('Mock: 搜索任务', query);

  const filteredTasks = taskStorage.filter(
    (task) =>
      task.name.toLowerCase().includes(query.toLowerCase()) ||
      task.description.toLowerCase().includes(query.toLowerCase()) ||
      task.assignee.toLowerCase().includes(query.toLowerCase()) ||
      task.projectParentName.toLowerCase().includes(query.toLowerCase())
  );

  return createResponse(true, filteredTasks, `找到 ${filteredTasks.length} 个相关任务`);
});

// 筛选任务
Mock.mock(/\/api\/tasks\/filter$/, 'post', (options) => {
  const filters = JSON.parse(options.body);
  console.log('Mock: 筛选任务', filters);

  let filteredTasks = [...taskStorage];

  // 按状态筛选
  if (filters.status && filters.status !== 'all') {
    filteredTasks = filteredTasks.filter((task) => task.status === filters.status);
  }

  // 按难度筛选
  if (filters.difficulty && filters.difficulty !== 'all') {
    filteredTasks = filteredTasks.filter((task) => task.difficulty === filters.difficulty);
  }

  // 按负责人筛选
  if (filters.assignee && filters.assignee !== 'all') {
    filteredTasks = filteredTasks.filter((task) => task.assignee === filters.assignee);
  }

  // 按项目筛选
  if (filters.projectParentId && filters.projectParentId !== 'all') {
    filteredTasks = filteredTasks.filter(
      (task) => task.projectParentId === filters.projectParentId
    );
  }

  // 按项目类型筛选
  if (filters.projectTypeId && filters.projectTypeId !== 'all') {
    filteredTasks = filteredTasks.filter((task) => task.projectTypeId === filters.projectTypeId);
  }

  // 按时间范围筛选
  if (filters.startDate) {
    filteredTasks = filteredTasks.filter(
      (task) => new Date(task.startDate) >= new Date(filters.startDate)
    );
  }

  if (filters.endDate) {
    filteredTasks = filteredTasks.filter(
      (task) => new Date(task.dueDate) <= new Date(filters.endDate)
    );
  }

  return createResponse(true, filteredTasks, `筛选出 ${filteredTasks.length} 个任务`);
});

// 获取任务统计信息
Mock.mock(/\/api\/tasks\/stats$/, 'get', (options) => {
  console.log('Mock: 获取任务统计信息');

  const stats = {
    total: taskStorage.length,
    byStatus: {},
    byDifficulty: {},
    byAssignee: {},
    byProject: {},
    byProjectType: {},
    overdueTasks: 0,
    completedThisWeek: 0,
    avgProgress: 0,
  };

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  taskStorage.forEach((task) => {
    // 按状态统计
    stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;

    // 按难度统计
    stats.byDifficulty[task.difficulty] = (stats.byDifficulty[task.difficulty] || 0) + 1;

    // 按负责人统计
    stats.byAssignee[task.assignee] = (stats.byAssignee[task.assignee] || 0) + 1;

    // 按项目统计
    stats.byProject[task.projectParentName] = (stats.byProject[task.projectParentName] || 0) + 1;

    // 按项目类型统计
    stats.byProjectType[task.projectTypeName] =
      (stats.byProjectType[task.projectTypeName] || 0) + 1;

    // 逾期任务统计
    if (new Date(task.dueDate) < now && task.status !== '已完成') {
      stats.overdueTasks++;
    }

    // 本周完成任务统计
    if (task.status === '已完成') {
      const completedHistory = task.progressHistory?.find(
        (h) => h.action === '任务完成' || (h.action === '更新进度' && h.progress === 100)
      );
      if (completedHistory && new Date(completedHistory.timestamp) >= weekAgo) {
        stats.completedThisWeek++;
      }
    }
  });

  // 平均进度
  stats.avgProgress =
    taskStorage.length > 0
      ? Math.round(taskStorage.reduce((sum, task) => sum + task.progress, 0) / taskStorage.length)
      : 0;

  return createResponse(true, stats, '统计信息获取成功');
});

console.log('Mock.js 已初始化，任务管理API已配置完成');

export default Mock;

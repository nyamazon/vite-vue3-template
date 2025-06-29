import requests from '@/utils/mockRequest';

let api = requests;

// 任务 API 接口
export const taskApi = {
  // 获取所有任务
  async getAllTasks() {
    return await api.get("/tasks")
  },

  // 根据ID获取单个任务
  async getTaskById(id) {
    return await api.get(`/tasks/${id}`)
  },

  // 创建新任务
  async createTask(taskData) {
    return await api.post("/tasks", taskData)
  },

  // 更新任务
  async updateTask(id, updateData) {
    return await api.put(`/tasks/${id}`, updateData)
  },

  // 删除任务
  async deleteTask(id) {
    return await api.delete(`/tasks/${id}`)
  },

  // 批量删除任务
  async batchDeleteTasks(ids) {
    return await api.delete("/tasks/batch", { data: { ids } })
  },

  // 更新任务状态
  async updateTaskStatus(id, status, updatedBy = "系统") {
    return await api.patch(`/tasks/${id}/status`, { status, updatedBy })
  },

  // 更新任务进度
  async updateTaskProgress(id, progress, description = "", updatedBy = "系统") {
    return await api.patch(`/tasks/${id}/progress`, { progress, description, updatedBy })
  },

  // 添加任务评论
  async addTaskComment(id, comment) {
    return await api.post(`/tasks/${id}/comments`, comment)
  },

  // 添加子任务
  async addSubtask(id, subtask) {
    return await api.post(`/tasks/${id}/subtasks`, subtask)
  },

  // 更新子任务状态
  async updateSubtaskStatus(taskId, subtaskId, completed) {
    return await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/status`, { completed })
  },

  // 搜索任务
  async searchTasks(query) {
    return await api.get(`/tasks/search?q=${encodeURIComponent(query)}`)
  },

  // 按条件筛选任务
  async filterTasks(filters) {
    return await api.post("/tasks/filter", filters)
  },

  // 获取任务统计信息
  async getTaskStats() {
    return await api.get("/tasks/stats")
  },
}

// 导出单个方法以便直接使用
export const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  batchDeleteTasks,
  updateTaskStatus,
  updateTaskProgress,
  addTaskComment,
  addSubtask,
  updateSubtaskStatus,
  searchTasks,
  filterTasks,
  getTaskStats,
} = taskApi

export default taskApi

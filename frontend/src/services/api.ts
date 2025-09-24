import axios from 'axios'
import { Project, ProjectWithTasks, Task } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
})

export const projectsApi = {
  // Complete endpoints
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get('/api/projects')
    return response.data
  },

  getProject: async (id: string): Promise<ProjectWithTasks> => {
    const response = await api.get(`/api/projects/${id}`)
    return response.data
  },

  // Stub endpoints - TODO for candidates to implement
  createProject: async (name: string): Promise<Project> => {
    const response = await api.post('/api/projects', { projects: [{ name }] })
    return response.data[0] // Return the first (and only) project from the batch
  },

  updateProject: async (id: string, data: { name?: string; completed?: boolean }): Promise<Project> => {
    const response = await api.put(`/api/projects/${id}`, data)
    return response.data
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/api/projects/${id}`)
  },

  createTask: async (projectId: string, title: string): Promise<Task> => {
    const response = await api.post(`/api/projects/${projectId}/tasks`, { tasks: [{ title }] })
    return response.data[0] // Return the first (and only) task from the batch
  },

  updateTask: async (id: string, data: { title?: string; completed?: boolean }): Promise<Task> => {
    const response = await api.put(`/api/tasks/${id}`, data)
    return response.data
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/api/tasks/${id}`)
  },
}
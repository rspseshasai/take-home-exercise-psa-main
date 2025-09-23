export interface Project {
  id: string
  name: string
  completed: boolean
  createdAt: string
  _count?: {
    tasks: number
  }
}

export interface ProjectWithTasks extends Project {
  tasks: Task[]
}

export interface Task {
  id: string
  title: string
  completed: boolean
  projectId: string
  createdAt: string
}
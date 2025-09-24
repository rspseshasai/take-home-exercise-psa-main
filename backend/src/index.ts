import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// GET /api/projects - Get all projects (COMPLETE)
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// GET /api/projects/:id - Get project with tasks (COMPLETE)
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    res.json(project)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' })
  }
})

// POST /api/projects - Create new projects (STUB - TODO for candidates)
app.post('/api/projects', async (req, res) => {
  try {
    const { projects } = req.body

    if (!Array.isArray(projects) || projects.length === 0) {
      return res.status(400).json({ error: 'projects must be a non-empty array' })
    }

    // Validate each project entry
    const invalid = projects.find((p: any) => !p || typeof p.name !== 'string' || p.name.trim() === '')
    if (invalid) {
      return res.status(400).json({ error: 'Each project must have a non-empty name string' })
    }

    // Prepare data for batch insertion; enforce completed: false
    const now = new Date()
    const data = projects.map((p: any) => ({
      name: p.name.trim(),
      completed: false,
      createdAt: now,
    }))

    // Batch insert
    await prisma.project.createMany({
      data
    })

    // Retrieve created projects. We filter by createdAt >= now to return the inserted rows.
    const createdProjects = await prisma.project.findMany({
      where: {
        createdAt: {
          gte: now,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.status(201).json(createdProjects)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create projects' })
  }
})

// PUT /api/projects/:id - Update project (STUB - TODO for candidates)
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, completed } = req.body

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
      include: { tasks: true }
    })
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // If trying to mark as completed, ensure all tasks are completed
    if (completed === true) {
      const hasIncompleteTasks = project.tasks.some(task => !task.completed)
      if (hasIncompleteTasks) {
        return res.status(400).json({ error: 'Cannot mark project as completed while it has incomplete tasks' })
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (typeof name === 'string' && name.trim() !== '') updateData.name = name.trim()
    if (typeof completed === 'boolean') updateData.completed = completed

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' })
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData
    })

    res.json(updatedProject)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' })
  }
})

// DELETE /api/projects/:id - Delete project (only if completed)
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id }
    })

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    if (!project.completed) {
      return res.status(400).json({ error: 'Only completed projects can be deleted' })
    }

    // Delete the project (tasks should be deleted via cascade or manually if needed)
    await prisma.project.delete({
      where: { id }
    })

    res.status(204).send() // 204 No Content
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' })
  }
})

// POST /api/projects/:id/tasks - Create tasks in project (STUB - TODO for candidates)
app.post('/api/projects/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params
    const { tasks } = req.body

    // Validate tasks array
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'tasks must be a non-empty array' })
    }

    // Validate each task entry
    const invalid = tasks.find((t: any) => !t || typeof t.title !== 'string' || t.title.trim() === '')
    if (invalid) {
      return res.status(400).json({ error: 'Each task must have a non-empty title string' })
    }

    // Check if project exists and is not completed
    const project = await prisma.project.findUnique({
      where: { id }
    })
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    if (project.completed) {
      return res.status(400).json({ error: 'Cannot add tasks to a completed project' })
    }

    // Prepare data for batch insertion
    const now = new Date()
    const data = tasks.map((t: any) => ({
      title: t.title.trim(),
      completed: false,
      projectId: id,
      createdAt: now,
    }))

    // Batch insert
    await prisma.task.createMany({
      data
    })

    // Retrieve created tasks (by createdAt and projectId)
    const createdTasks = await prisma.task.findMany({
      where: {
        projectId: id,
        createdAt: {
          gte: now,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.status(201).json(createdTasks)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tasks' })
  }
})

// PUT /api/tasks/:id - Update task (COMPLETE)
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, completed } = req.body

    // Check if task exists first
    const existingTask = await prisma.task.findUnique({
      where: { id }
    })

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed })
      }
    })

    res.json(updatedTask)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' })
  }
})

// DELETE /api/tasks/:id - Delete task (COMPLETE)
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Check if task exists first
    const existingTask = await prisma.task.findUnique({
      where: { id }
    })

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Delete the task
    await prisma.task.delete({
      where: { id }
    })

    res.status(204).send() // 204 No Content for successful deletion
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

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
  // TODO: Implement batch project creation
  // Expected body: { projects: Array<{ name: string }> }
  // Business rules:
  // - New projects should have completed: false by default
  // - Use batch insertion for efficiency
  // Response: Array of created project objects
  res.status(501).json({ error: 'Not implemented - TODO for candidate' })
})

// PUT /api/projects/:id - Update project (STUB - TODO for candidates)
app.put('/api/projects/:id', async (req, res) => {
  // TODO: Implement project update
  // Expected body: { name?: string, completed?: boolean }
  // Business rules:
  // - Cannot mark project as completed if it has incomplete tasks
  res.status(501).json({ error: 'Not implemented - TODO for candidate' })
})

// POST /api/projects/:id/tasks - Create tasks in project (STUB - TODO for candidates)
app.post('/api/projects/:id/tasks', async (req, res) => {
  // TODO: Implement batch task creation
  // Expected body: { tasks: Array<{ title: string }> }
  // Business rules:
  // - Cannot add tasks to completed projects
  // - Use batch insertion for efficiency
  // Response: Array of created task objects
  res.status(501).json({ error: 'Not implemented - TODO for candidate' })
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

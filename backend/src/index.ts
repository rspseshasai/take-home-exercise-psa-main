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

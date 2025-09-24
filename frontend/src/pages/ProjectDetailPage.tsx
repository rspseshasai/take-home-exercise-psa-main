import React, { useEffect, useState } from 'react'
import {
  Card,
  Typography,
  Tag,
  Button,
  List,
  Space,
  Breadcrumb,
  notification,
  Checkbox,
  Popconfirm,
  Modal,
  Form,
  Input,
} from 'antd'
import {
  PlusOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { projectsApi } from '../services/api'
import { ProjectWithTasks, Task } from '../types'

const { Title, Text } = Typography

const ProjectDetailPage: React.FC = () => {
  const [project, setProject] = useState<ProjectWithTasks | null>(null)
  const [loading, setLoading] = useState(true)
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false)
  const [addTaskForm] = Form.useForm()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const fetchProject = async () => {
    if (!id) return

    try {
      setLoading(true)
      const data = await projectsApi.getProject(id)
      setProject(data)
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch project details',
      })
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProject()
  }, [id])

  const handleAddTask = () => {
    setAddTaskModalVisible(true)
  }

  const handleAddTaskOk = async () => {
    try {
      const values = await addTaskForm.validateFields()
      if (!id) return
      // Create a single task
      await projectsApi.createTask(id, values.title)
      notification.success({
        message: 'Success',
        description: 'Task added successfully',
      })
      setAddTaskModalVisible(false)
      addTaskForm.resetFields()
      fetchProject()
    } catch (error: any) {
      if (error.errorFields) return // Validation error
      notification.error({
        message: 'Error',
        description: error?.response?.data?.error || 'Failed to add task',
      })
    }
  }

  const handleAddTaskCancel = () => {
    setAddTaskModalVisible(false)
    addTaskForm.resetFields()
  }

  const handleTaskToggle = async (task: Task) => {
    if (!project) return

    // Optimistic update - update UI immediately
    const updatedTasks = project.tasks.map(t =>
      t.id === task.id ? { ...t, completed: !t.completed } : t
    )
    setProject({ ...project, tasks: updatedTasks })

    try {
      // Call API to update task
      await projectsApi.updateTask(task.id, { completed: !task.completed })

      notification.success({
        message: 'Success',
        description: `Task ${!task.completed ? 'completed' : 'reopened'} successfully`,
      })
    } catch (error) {
      // Rollback optimistic update on error
      const rolledBackTasks = project.tasks.map(t =>
        t.id === task.id ? { ...t, completed: task.completed } : t
      )
      setProject({ ...project, tasks: rolledBackTasks })

      notification.error({
        message: 'Error',
        description: 'Failed to update task. Please try again.',
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Call API to delete task
      await projectsApi.deleteTask(taskId)

      // Refresh project data to remove deleted task
      await fetchProject()

      notification.success({
        message: 'Success',
        description: 'Task deleted successfully',
      })
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to delete task. Please try again.',
      })
    }
  }

  if (loading || !project) {
    return <div>Loading...</div>
  }

  const completedTasks = project.tasks.filter(task => task.completed).length
  const totalTasks = project.tasks.length

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          {
            title: <a onClick={() => navigate('/')}>Projects</a>,
          },
          {
            title: project.name,
          },
        ]}
      />

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
          <div>
            <Title level={2} style={{ margin: 0, marginBottom: 10 }}>
              {project.name}
            </Title>
            <Space size="middle">
              <Tag color={project.completed ? 'green' : 'orange'}>
                {project.completed ? 'Completed' : 'In Progress'}
              </Tag>
              <Text type="secondary">
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </Text>
              <Text type="secondary">
                Tasks: {completedTasks}/{totalTasks} completed
              </Text>
            </Space>
          </div>
          <Button onClick={() => navigate('/')} icon={<ArrowLeftOutlined />}>
            Back to Projects
          </Button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Title level={4} style={{ margin: 0 }}>
            Tasks ({totalTasks})
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddTask}
            disabled={project.completed}
          >
            Add Task
          </Button>
        </div>

        <List
          dataSource={project.tasks}
          renderItem={(task) => (
            <List.Item
              actions={[
                <Popconfirm
                  title="Are you sure you want to delete this task?"
                  onConfirm={() => handleDeleteTask(task.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Checkbox
                    checked={task.completed}
                    onChange={() => handleTaskToggle(task)}
                  />
                }
                title={
                  <Text delete={task.completed} style={{ opacity: task.completed ? 0.6 : 1 }}>
                    {task.title}
                  </Text>
                }
                description={
                  <Text type="secondary">
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </Text>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: 'No tasks yet. Add your first task!' }}
        />
      </Card>

      <Modal
        title="Add Task"
        open={addTaskModalVisible}
        onOk={handleAddTaskOk}
        onCancel={handleAddTaskCancel}
        okText="Add"
        destroyOnClose
      >
        <Form form={addTaskForm} layout="vertical" name="add_task_form">
          <Form.Item
            label="Task Title"
            name="title"
            rules={[
              { required: true, message: 'Please enter a task title' },
              { min: 2, message: 'Task title must be at least 2 characters' },
            ]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProjectDetailPage
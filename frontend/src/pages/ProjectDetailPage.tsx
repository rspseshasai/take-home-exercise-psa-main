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
  EditOutlined
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
  const [editMode, setEditMode] = useState(false)
  const [editForm] = Form.useForm()
  const [deleting, setDeleting] = useState(false)
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
    let updatedProject = { ...project, tasks: updatedTasks }

    // If unchecking a task and project is completed, set project to in progress
    if (project.completed && task.completed) {
      updatedProject = { ...updatedProject, completed: false }
    }

    setProject(updatedProject)

    try {
      // Call API to update task
      await projectsApi.updateTask(task.id, { completed: !task.completed })

      // If unchecking a task and project is completed, update project status as well
      if (project.completed && task.completed) {
        await projectsApi.updateProject(project.id, { completed: false })
        notification.info({
          message: 'Project status updated',
          description: 'Project marked as In Progress because a task was reopened.',
        })
        fetchProject()
      } else {
        notification.success({
          message: 'Success',
          description: `Task ${!task.completed ? 'completed' : 'reopened'} successfully`,
        })
      }
    } catch (error) {
      // Rollback optimistic update on error
      setProject(project)
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

  const handleEditClick = () => {
    if (project) {
      editForm.setFieldsValue({
        name: project.name,
        completed: project.completed,
      })
      setEditMode(true)
    }
  }

  const handleEditCancel = () => {
    setEditMode(false)
    editForm.resetFields()
  }

  const handleEditUpdate = async () => {
    try {
      const values = await editForm.validateFields()
      if (!id) return
      await projectsApi.updateProject(id, {
        name: values.name,
        completed: values.completed,
      })
      notification.success({
        message: 'Success',
        description: 'Project updated successfully',
      })
      setEditMode(false)
      fetchProject()
    } catch (error: any) {
      if (error.errorFields) return
      notification.error({
        message: 'Error',
        description: error?.response?.data?.error || 'Failed to update project',
      })
    }
  } 

  const handleDeleteProject = async () => {
    if (!project) return
    Modal.confirm({
      title: 'Delete Project',
      content: 'Are you sure you want to delete this project? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setDeleting(true)
        try {
          await projectsApi.deleteProject(project.id)
          notification.success({
            message: 'Deleted',
            description: 'Project deleted successfully',
          })
          navigate('/')
        } catch (error: any) {
          notification.error({
            message: 'Error',
            description:
              error?.response?.data?.error ||
              'Failed to delete project. Only completed projects can be deleted.',
          })
        } finally {
          setDeleting(false)
        }
      },
    })
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
            {!editMode ? (
              <>
                <Title level={2} style={{ margin: 0, marginBottom: 10 }}>
                  {project.name}
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    style={{ marginLeft: 8 }}
                    onClick={handleEditClick}
                  />
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    danger
                    style={{ marginLeft: 4 }}
                    loading={deleting}
                    onClick={handleDeleteProject}
                  />
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
              </>
          ) : (
            <Form
              form={editForm}
              layout="inline"
              onFinish={handleEditUpdate}
              style={{ marginBottom: 10 }}
            >
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Please enter a project name' },
                  { min: 2, message: 'Project name must be at least 2 characters' },
                ]}
                style={{ marginRight: 8 }}
              >
                <Input placeholder="Project Name" />
              </Form.Item>
              <Form.Item
                name="completed"
                valuePropName="checked"
                style={{ marginRight: 8 }}
              >
                <Checkbox>Completed</Checkbox>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update
                </Button>
              </Form.Item>
              <Form.Item>
                <Button onClick={handleEditCancel}>
                  Cancel
                </Button>
              </Form.Item>
            </Form>
)}      
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
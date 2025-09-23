import React, { useEffect, useState } from 'react'
import { Table, Button, Tag, Space, Typography, Card, notification, Modal, Form, Input } from 'antd'
import { PlusOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { projectsApi } from '../services/api'
import { Project } from '../types'

const { Title } = Typography
const { Column } = Table

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await projectsApi.getProjects()
      setProjects(data)
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch projects',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCreateProject = () => {
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      // API expects a single project name
      await projectsApi.createProject(values.name)
      notification.success({
        message: 'Success',
        description: 'Project created successfully',
      })
      setModalVisible(false)
      form.resetFields()
      fetchProjects()
    } catch (error: any) {
      if (error.errorFields) return // Validation error
      notification.error({
        message: 'Error',
        description: error?.response?.data?.error || 'Failed to create project',
      })
    }
  }

  const handleModalCancel = () => {
    setModalVisible(false)
    form.resetFields()
  }

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Title level={2} style={{ margin: 0 }}>
            Projects
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateProject}
          >
            New Project
          </Button>
        </div>

        <Table
          dataSource={projects}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        >
          <Column
            title="Name"
            dataIndex="name"
            key="name"
            sorter={(a: Project, b: Project) => a.name.localeCompare(b.name)}
          />
          <Column
            title="Status"
            dataIndex="completed"
            key="completed"
            render={(completed: boolean) => (
              <Tag color={completed ? 'green' : 'orange'}>
                {completed ? 'Completed' : 'In Progress'}
              </Tag>
            )}
            filters={[
              { text: 'Completed', value: true },
              { text: 'In Progress', value: false },
            ]}
            onFilter={(value: boolean | string, record: Project) => record.completed === value}
          />
          <Column
            title="Tasks"
            dataIndex="_count"
            key="taskCount"
            render={(count: { tasks: number }) => count?.tasks || 0}
            sorter={(a: Project, b: Project) => (a._count?.tasks || 0) - (b._count?.tasks || 0)}
          />
          <Column
            title="Created"
            dataIndex="createdAt"
            key="createdAt"
            render={(date: string) => new Date(date).toLocaleDateString()}
            sorter={(a: Project, b: Project) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()}
          />
          <Column
            title="Actions"
            key="actions"
            render={(_, record: Project) => (
              <Space size="middle">
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/projects/${record.id}`)}
                >
                  View Details
                </Button>
              </Space>
            )}
          />
        </Table>
      </Card>

      <Modal
        title="Create New Project"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Create"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" name="create_project_form">
          <Form.Item
            label="Project Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter a project name' },
              { min: 2, message: 'Project name must be at least 2 characters' },
            ]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProjectsPage
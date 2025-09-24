import React from 'react'
import { Layout, Menu, Typography, Button } from 'antd'
import { ProjectOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Header, Content } = Layout
const { Title } = Typography

interface AppLayoutProps {
  children: React.ReactNode
  darkMode: boolean
  onToggleDarkMode: () => void
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, darkMode, onToggleDarkMode }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/',
      icon: <ProjectOutlined />,
      label: 'Projects',
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          Project Manager
        </Title>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, minWidth: 0 }}
        />
        <Button
          shape="circle"
          size="large"
          icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
          onClick={onToggleDarkMode}
        />
      </Header>
      <Content style={{ padding: '20px' }}>{children}</Content>
    </Layout>
  )
}

export default AppLayout

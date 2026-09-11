import { Layout, Menu } from 'antd'
import { ShoppingOutlined } from '@ant-design/icons'
import ItemsPage from './pages/ItemsPage'

const { Header, Content, Footer } = Layout

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['items']}
          items={[{ key: 'items', icon: <ShoppingOutlined />, label: 'Прайс-лист' }]}
        />
      </Header>
      <Content style={{ padding: '24px 48px' }}>
        <ItemsPage />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Laundry App ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  )
}

export default App
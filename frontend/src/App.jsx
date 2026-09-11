import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Spin, Typography } from 'antd';
import {
    FileTextOutlined,
    SettingOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import CardsPage from './pages/CardsPage';
import CardFormPage from './pages/CardFormPage';
import SettingsPage from './pages/SettingsPage';
import InstallButton from './components/InstallButton';

const { Header, Content, Footer } = Layout;

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <Spin style={{ marginTop: 200, display: 'flex', justifyContent: 'center' }} />;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: '/cards',
            icon: <FileTextOutlined />,
            label: 'Карточки'
        },
        ...(user?.role === 'ADMIN' ? [{
            key: '/settings',
            icon: <SettingOutlined />,
            label: 'Настройки'
        }] : [])
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header className="app-header" style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
                <div className="app-header-logo" style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginRight: 48, whiteSpace: 'nowrap' }}>
                    Прачечная
                </div>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={[location.pathname.startsWith('/cards') ? '/cards' : location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{ flex: 1, minWidth: 0 }}
                />
                <InstallButton />
                <Typography.Text className="app-header-user" style={{ color: 'rgba(255,255,255,0.65)', marginRight: 16, whiteSpace: 'nowrap' }}>
                    {user?.username} ({user?.role === 'ADMIN' ? 'Админ' : 'Менеджер'})
                </Typography.Text>
                <LogoutOutlined
                    style={{ color: '#fff', fontSize: 16, cursor: 'pointer' }}
                    onClick={handleLogout}
                />
            </Header>
            <Content className="app-content" style={{ padding: '24px 48px' }}>
                <Routes>
                    <Route path="/cards" element={<CardsPage />} />
                    <Route path="/cards/new" element={<CardFormPage />} />
                    <Route path="/cards/:id/edit" element={<CardFormPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/cards" replace />} />
                </Routes>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                Laundry App ©{new Date().getFullYear()}
            </Footer>
        </Layout>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    } />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;

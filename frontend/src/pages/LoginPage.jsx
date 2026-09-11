import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/cards', { replace: true });
        }
    }, [user, navigate]);

    const onFinish = async (values) => {
        setError('');
        setLoading(true);
        try {
            await login(values.username, values.password);
            navigate('/cards', { replace: true });
        } catch (e) {
            setError(e.response?.data?.error || 'Неверное имя пользователя или пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f2f5'
        }}>
            <Card style={{ width: '100%', maxWidth: 400, margin: '0 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
                    Прачечная — Вход
                </Title>
                {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
                <Form onFinish={onFinish} autoComplete="off" size="large">
                    <Form.Item name="username" rules={[{ required: true, message: 'Введите имя пользователя' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Логин" disabled={loading} />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Пароль" disabled={loading} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default LoginPage;
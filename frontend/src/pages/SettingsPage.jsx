import { useEffect, useState } from 'react';
import {
    Button, Card, Table, Modal, Form, Input, Select, Space, Typography,
    Popconfirm, Tabs, message
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title } = Typography;

function SettingsPage() {
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userForm] = Form.useForm();
    const [saving, setSaving] = useState(false);

    const [laundries, setLaundries] = useState([]);
    const [loadingLaundries, setLoadingLaundries] = useState(false);
    const [laundryModalOpen, setLaundryModalOpen] = useState(false);
    const [laundryForm] = Form.useForm();

    const loadUsers = async () => {
        setLoadingUsers(true);
        try {
            const { data } = await api.get('/users');
            setUsers(data || []);
        } catch (e) {
            message.error('Не удалось загрузить пользователей');
        } finally {
            setLoadingUsers(false);
        }
    };

    const loadLaundries = async () => {
        setLoadingLaundries(true);
        try {
            const { data } = await api.get('/laundries');
            setLaundries(data || []);
        } catch (e) {
            message.error('Не удалось загрузить прачечные');
        } finally {
            setLoadingLaundries(false);
        }
    };

    useEffect(() => {
        loadUsers();
        loadLaundries();
    }, []);

    // ---- Users ----
    const openUserModal = (user = null) => {
        setEditingUser(user);
        if (user) {
            userForm.setFieldsValue({ username: user.username, role: user.role, password: '' });
        } else {
            userForm.resetFields();
        }
        setUserModalOpen(true);
    };

    const saveUser = async () => {
        try {
            const values = await userForm.validateFields();
            setSaving(true);
            if (editingUser) {
                const payload = {};
                if (values.password) payload.newPassword = values.password;
                if (values.role) payload.role = values.role;
                await api.put(`/users/${editingUser.id}`, payload);
                message.success('Пользователь обновлён');
            } else {
                await api.post('/users', {
                    username: values.username,
                    password: values.password,
                    role: values.role || 'MANAGER'
                });
                message.success('Пользователь создан');
            }
            setUserModalOpen(false);
            loadUsers();
        } catch (e) {
            if (e?.errorFields) return;
            message.error(e.response?.data?.error || 'Не удалось сохранить пользователя');
        } finally {
            setSaving(false);
        }
    };

    const deleteUser = async (id) => {
        try {
            await api.delete(`/users/${id}`);
            message.success('Пользователь удалён');
            loadUsers();
        } catch (e) {
            message.error('Не удалось удалить пользователя');
        }
    };

    // ---- Laundries ----
    const saveLaundry = async () => {
        try {
            const values = await laundryForm.validateFields();
            setSaving(true);
            await api.post('/laundries', { name: values.name });
            message.success('Прачечная добавлена');
            setLaundryModalOpen(false);
            laundryForm.resetFields();
            loadLaundries();
        } catch (e) {
            if (e?.errorFields) return;
            message.error('Не удалось добавить прачечную');
        } finally {
            setSaving(false);
        }
    };

    const deleteLaundry = async (id) => {
        try {
            await api.delete(`/laundries/${id}`);
            message.success('Прачечная удалена');
            loadLaundries();
        } catch (e) {
            message.error('Не удалось удалить прачечную');
        }
    };

    const userColumns = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: 'Логин', dataIndex: 'username' },
        {
            title: 'Роль',
            dataIndex: 'role',
            width: 120,
            render: (role) => role === 'ADMIN' ? 'Администратор' : 'Менеджер'
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openUserModal(record)} />
                    <Popconfirm title="Удалить пользователя?" onConfirm={() => deleteUser(record.id)}>
                        <Button danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const laundryColumns = [
        { title: 'Название', dataIndex: 'name' },
        {
            title: 'Действия',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Popconfirm title="Удалить прачечную?" onConfirm={() => deleteLaundry(record.id)}>
                    <Button danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
            )
        }
    ];

    const tabItems = [
        {
            key: 'users',
            label: 'Пользователи',
            children: (
                <>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openUserModal()} style={{ marginBottom: 16 }}>
                        Добавить пользователя
                    </Button>
                    <Table rowKey="id" loading={loadingUsers} dataSource={users} columns={userColumns} pagination={false} scroll={{ x: 'max-content' }} />
                </>
            )
        },
        {
            key: 'laundries',
            label: 'Прачечные',
            children: (
                <>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { laundryForm.resetFields(); setLaundryModalOpen(true); }} style={{ marginBottom: 16 }}>
                        Добавить прачечную
                    </Button>
                    <Table rowKey="id" loading={loadingLaundries} dataSource={laundries} columns={laundryColumns} pagination={false} scroll={{ x: 'max-content' }} />
                </>
            )
        }
    ];

    return (
        <Card>
            <Title level={4}>Настройки</Title>
            <Tabs items={tabItems} />

            <Modal
                title={editingUser ? 'Редактировать пользователя' : 'Новый пользователь'}
                open={userModalOpen}
                onOk={saveUser}
                onCancel={() => setUserModalOpen(false)}
                confirmLoading={saving}
                okText="Сохранить"
                cancelText="Отмена"
            >
                <Form form={userForm} layout="vertical">
                    <Form.Item
                        name="username"
                        label="Логин"
                        rules={[{ required: !editingUser, message: 'Введите логин' }]}
                    >
                        <Input placeholder="Логин" disabled={!!editingUser} />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label={editingUser ? 'Новый пароль (оставьте пустым для сохранения)' : 'Пароль'}
                        rules={editingUser ? [] : [{ required: true, message: 'Введите пароль' }]}
                    >
                        <Input.Password placeholder="Пароль" />
                    </Form.Item>
                    <Form.Item name="role" label="Роль" initialValue="MANAGER">
                        <Select options={[
                            { value: 'ADMIN', label: 'Администратор' },
                            { value: 'MANAGER', label: 'Менеджер' }
                        ]} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Новая прачечная"
                open={laundryModalOpen}
                onOk={saveLaundry}
                onCancel={() => setLaundryModalOpen(false)}
                confirmLoading={saving}
                okText="Сохранить"
                cancelText="Отмена"
            >
                <Form form={laundryForm} layout="vertical">
                    <Form.Item name="name" label="Название" rules={[{ required: true, message: 'Введите название' }]}>
                        <Input placeholder="Название прачечной" />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
}

export default SettingsPage;

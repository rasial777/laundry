import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Form, Input, Select, DatePicker, Button, Card, Upload, Space, Typography,
    message, Row, Col, Popconfirm, Empty, Image
} from 'antd';
import { UploadOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title } = Typography;
const { TextArea } = Input;

function CardFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [laundries, setLaundries] = useState([]);
    const [saving, setSaving] = useState(false);
    const [loadingCard, setLoadingCard] = useState(false);
    const [existingPhotos, setExistingPhotos] = useState([]);
    const [newPhotos, setNewPhotos] = useState([]);
    const [photosToDelete, setPhotosToDelete] = useState([]);
    const newPhotosRef = useRef([]);
    const isEdit = !!id;

    useEffect(() => {
        loadLaundries();
        form.setFieldsValue({ createdAt: dayjs() });
        if (isEdit) {
            loadCard();
        }
    }, [id]);

    useEffect(() => {
        return () => {
            newPhotosRef.current.forEach(p => URL.revokeObjectURL(p.url));
        };
    }, []);

    const loadLaundries = async () => {
        try {
            const { data } = await api.get('/laundries');
            setLaundries(data || []);
        } catch (e) {
            // silent
        }
    };

    const loadCard = async () => {
        setLoadingCard(true);
        try {
            const { data } = await api.get(`/cards/${id}`);
            form.setFieldsValue({
                orderNumber: data.orderNumber,
                createdAt: data.createdAt ? dayjs(data.createdAt) : dayjs(),
                description: data.description,
                wearLevel: data.wearLevel,
                defects: data.defects,
                laundryId: data.laundry?.id
            });
            setExistingPhotos(data.photos || []);
        } catch (e) {
            message.error('Не удалось загрузить карточку');
            navigate('/cards');
        } finally {
            setLoadingCard(false);
        }
    };

    const beforeUpload = (file) => {
        const item = { file, url: URL.createObjectURL(file) };
        newPhotosRef.current.push(item);
        setNewPhotos(prev => [...prev, item]);
        return false;
    };

    const removeNewPhoto = (url) => {
        URL.revokeObjectURL(url);
        newPhotosRef.current = newPhotosRef.current.filter(p => p.url !== url);
        setNewPhotos(prev => prev.filter(p => p.url !== url));
    };

    const removeExistingPhoto = (photo) => {
        setExistingPhotos(prev => prev.filter(p => p.id !== photo.id));
        setPhotosToDelete(prev => [...prev, photo.id]);
    };

    const onFinish = async (values) => {
        setSaving(true);
        try {
            const payload = {
                orderNumber: values.orderNumber,
                createdAt: values.createdAt ? values.createdAt.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
                description: values.description || '',
                wearLevel: values.wearLevel || '',
                defects: values.defects || '',
                laundryId: values.laundryId
            };

            let cardId;
            if (isEdit) {
                await api.put(`/cards/${id}`, payload);
                cardId = id;
            } else {
                const { data } = await api.post('/cards', payload);
                cardId = data.id;
            }

            for (const photoId of photosToDelete) {
                await api.delete(`/cards/${cardId}/photos/${photoId}`);
            }

            for (const photo of newPhotos) {
                const formData = new FormData();
                formData.append('file', photo.file);
                await api.post(`/cards/${cardId}/photos`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            message.success(isEdit ? 'Карточка сохранена' : 'Карточка создана');
            navigate('/cards');
        } catch (e) {
            message.error(e.response?.data?.error || 'Не удалось сохранить карточку');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card loading={loadingCard}>
            <Space style={{ marginBottom: 16 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/cards')}>Назад</Button>
                <Title level={4} style={{ margin: 0 }}>
                    {isEdit ? 'Редактирование карточки' : 'Новая карточка'}
                </Title>
            </Space>
            <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 600 }}>
                <Form.Item
                    name="orderNumber"
                    label="Номер заказа"
                    rules={[{ required: true, message: 'Введите номер заказа' }]}
                >
                    <Input placeholder="Например: ЗК-00123" />
                </Form.Item>

                <Form.Item name="createdAt" label="Дата создания">
                    <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                </Form.Item>

                <Form.Item
                    name="laundryId"
                    label="Прачечная"
                    rules={[{ required: true, message: 'Выберите прачечную' }]}
                >
                    <Select
                        placeholder="Выберите прачечную"
                        options={laundries.map(l => ({ value: l.id, label: l.name }))}
                    />
                </Form.Item>

                <Form.Item name="description" label="Описание изделия">
                    <TextArea rows={3} placeholder="Описание вещи" />
                </Form.Item>

                <Form.Item name="wearLevel" label="Степень износа">
                    <TextArea rows={2} placeholder="Описание степени износа" />
                </Form.Item>

                <Form.Item name="defects" label="Дефекты">
                    <TextArea rows={2} placeholder="Описание дефектов" />
                </Form.Item>
            </Form>

            <div style={{ maxWidth: 600, marginTop: 24 }}>
                <Space align="center" style={{ marginBottom: 16 }}>
                    <Title level={5} style={{ margin: 0 }}>
                        Фото ({existingPhotos.length + newPhotos.length})
                    </Title>
                    <Upload
                        multiple
                        showUploadList={false}
                        beforeUpload={beforeUpload}
                        accept="image/*"
                    >
                        <Button icon={<UploadOutlined />}>Добавить фото</Button>
                    </Upload>
                </Space>

                {(existingPhotos.length === 0 && newPhotos.length === 0) ? (
                    <Empty description="Фотографии не добавлены" style={{ margin: '24px 0' }} />
                ) : (
                    <Row gutter={[16, 16]}>
                        {[...existingPhotos, ...newPhotos.map(p => ({ _new: true, url: p.url }))].map((photo, idx) => (
                            <Col key={photo.id || photo.url} xs={12} sm={8} md={6}>
                                <Card
                                    hoverable
                                    size="small"
                                    cover={
                                        <Image
                                            alt="Фото заказа"
                                            src={photo._new ? photo.url : `/api/photos/${photo.filename}`}
                                            height={140}
                                            style={{ width: '100%', objectFit: 'cover' }}
                                            preview={{ src: photo._new ? photo.url : `/api/photos/${photo.filename}` }}
                                        />
                                    }
                                    actions={[
                                        <Popconfirm
                                            key="delete"
                                            title="Удалить фото?"
                                            onConfirm={() => photo._new
                                                ? removeNewPhoto(photo.url)
                                                : removeExistingPhoto(photo)}
                                        >
                                            <DeleteOutlined style={{ color: '#ff4d4f' }} />
                                        </Popconfirm>
                                    ]}
                                />
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            <div style={{ maxWidth: 600, marginTop: 24 }}>
                <Button type="primary" htmlType="button" size="large" loading={saving} onClick={() => form.submit()}>
                    {isEdit ? 'Сохранить' : 'Создать'}
                </Button>
            </div>
        </Card>
    );
}

export default CardFormPage;
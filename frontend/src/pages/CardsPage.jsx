import { useEffect, useState, useCallback } from 'react';
import { Button, Input, Select, Space, Table, Tag, DatePicker, Card, Typography, Popconfirm, message, Image, Pagination, Empty, Spin } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function CardsPage() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [laundries, setLaundries] = useState([]);
    const [search, setSearch] = useState('');
    const [filterLaundry, setFilterLaundry] = useState(null);
    const [dateRange, setDateRange] = useState(null);
    const [sortField, setSortField] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('descend');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { user } = useAuth();
    const navigate = useNavigate();
    const pageSize = 10;

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const loadCards = useCallback(async (pageNum = page) => {
        setLoading(true);
        try {
            const params = {
                search: search || '',
                laundryId: filterLaundry || '',
                page: pageNum - 1,
                size: pageSize,
                sort: `${sortField},${sortOrder === 'ascend' ? 'asc' : 'desc'}`
            };
            if (dateRange && dateRange[0] && dateRange[1]) {
                params.dateFrom = dateRange[0].format('YYYY-MM-DD');
                params.dateTo = dateRange[1].format('YYYY-MM-DD');
            }
            const { data } = await api.get('/cards', { params });
            setCards(data.content || []);
            setTotal(data.totalElements || 0);
        } catch (e) {
            message.error('Не удалось загрузить карточки');
        } finally {
            setLoading(false);
        }
    }, [search, filterLaundry, dateRange, sortField, sortOrder, page]);

    const loadLaundries = async () => {
        try {
            const { data } = await api.get('/laundries');
            setLaundries(data || []);
        } catch (e) {
            // silent
        }
    };

    useEffect(() => {
        loadLaundries();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search, filterLaundry, dateRange]);

    useEffect(() => {
        loadCards(1);
    }, [search, filterLaundry, dateRange, sortField, sortOrder]);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/cards/${id}`);
            message.success('Карточка удалена');
            loadCards();
        } catch (e) {
            message.error('Не удалось удалить карточку');
        }
    };

    const truncate = (text, max = 64) => {
        if (!text) return '';
        return text.length > max ? text.substring(0, max) + '...' : text;
    };

    const columns = [
        {
            title: 'Номер заказа',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
            width: 160,
            sorter: true,
            sortOrder: sortField === 'orderNumber' ? sortOrder : null,
            render: (text, record) => (
                <a onClick={() => navigate(`/cards/${record.id}/edit`)}>{text}</a>
            )
        },
        {
            title: 'Дата создания',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 140,
            sorter: true,
            sortOrder: sortField === 'createdAt' ? sortOrder : null,
            render: (date) => date ? dayjs(date).format('DD.MM.YYYY') : ''
        },
        {
            title: 'Прачечная',
            key: 'laundry',
            width: 180,
            render: (_, record) => record.laundry?.name || '-'
        },
        {
            title: 'Фото',
            key: 'photos',
            width: 120,
            render: (_, record) => {
                const photos = record.photos || [];
                if (photos.length === 0) return '-';
                return (
                    <Image.PreviewGroup>
                        <Space size={4}>
                            {photos.slice(0, 3).map(p => (
                                <Image
                                    key={p.id}
                                    src={`/api/photos/${p.filename}`}
                                    width={44}
                                    height={44}
                                    style={{ objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                                    preview={{ src: `/api/photos/${p.filename}` }}
                                />
                            ))}
                        </Space>
                    </Image.PreviewGroup>
                );
            }
        },
        {
            title: 'Описание',
            dataIndex: 'description',
            key: 'description',
            render: (text) => truncate(text)
        },
        ...(user?.role === 'ADMIN' ? [{
            title: 'Действия',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Popconfirm title="Удалить карточку?" onConfirm={() => handleDelete(record.id)}>
                    <Button danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
            )
        }] : [])
    ];

    const handleTableChange = (pagination, filters, sorter) => {
        if (sorter.field) {
            setSortField(sorter.field);
            setSortOrder(sorter.order || 'descend');
        }
        setPage(pagination.current);
    };

    return (
        <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
                    <Title level={4} style={{ margin: 0 }}>Карточки заказов</Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/cards/new')}>
                        Добавить карточку
                    </Button>
                </Space>
                <Space wrap style={{ width: '100%' }}>
                    <Input
                        className="app-filter"
                        placeholder="Поиск по номеру заказа или описанию"
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: 320 }}
                        allowClear
                    />
                    <Select
                        className="app-filter"
                        placeholder="Прачечная"
                        value={filterLaundry}
                        onChange={setFilterLaundry}
                        allowClear
                        style={{ width: 200 }}
                        options={laundries.map(l => ({ value: l.id, label: l.name }))}
                    />
                    <RangePicker
                        className="app-filter"
                        value={dateRange}
                        onChange={setDateRange}
                        format="DD.MM.YYYY"
                        placeholder={['От', 'До']}
                    />
                </Space>
                {isMobile ? (
                    <Spin spinning={loading}>
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            {cards.length === 0 && !loading ? (
                                <Empty description="Карточки не найдены" style={{ margin: '32px 0' }} />
                            ) : cards.map((c) => (
                                <Card key={c.id} size="small" style={{ width: '100%' }}>
                                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text strong style={{ fontSize: 16 }}>
                                                <a onClick={() => navigate(`/cards/${c.id}/edit`)}>{c.orderNumber}</a>
                                            </Text>
                                            {user?.role === 'ADMIN' && (
                                                <Popconfirm title="Удалить карточку?" onConfirm={() => handleDelete(c.id)}>
                                                    <Button danger size="small" icon={<DeleteOutlined />} />
                                                </Popconfirm>
                                            )}
                                        </div>
                                        <Text type="secondary">
                                            {dayjs(c.createdAt).format('DD.MM.YYYY')} • {c.laundry?.name || '-'}
                                        </Text>
                                        {c.description ? (
                                            <Text ellipsis style={{ maxWidth: '100%' }}>{truncate(c.description, 100)}</Text>
                                        ) : null}
                                        {c.photos?.length > 0 && (
                                            <Image.PreviewGroup>
                                                <Space size={4}>
                                                    {c.photos.slice(0, 3).map(p => (
                                                        <Image
                                                            key={p.id}
                                                            src={`/api/photos/${p.filename}`}
                                                            width={44}
                                                            height={44}
                                                            style={{ objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                                                            preview={{ src: `/api/photos/${p.filename}` }}
                                                        />
                                                    ))}
                                                </Space>
                                            </Image.PreviewGroup>
                                        )}
                                    </Space>
                                </Card>
                            ))}
                            <Pagination
                                simple
                                current={page}
                                pageSize={pageSize}
                                total={total}
                                onChange={(p) => {
                                    setPage(p);
                                    loadCards(p);
                                }}
                                style={{ alignSelf: 'center' }}
                            />
                        </Space>
                    </Spin>
                ) : (
                    <Table
                        rowKey="id"
                        loading={loading}
                        dataSource={cards}
                        columns={columns}
                        scroll={{ x: 'max-content' }}
                        pagination={{
                            current: page,
                            pageSize,
                            total,
                            onChange: (p) => {
                                setPage(p);
                                loadCards(p);
                            },
                            showTotal: (total) => `Всего: ${total}`
                        }}
                        onChange={handleTableChange}
                        size="middle"
                    />
                )}
            </Space>
        </Card>
    );
}

export default CardsPage;

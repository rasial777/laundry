import { useEffect, useState } from 'react'
import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Typography, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import api from '../services/api'

const { Title } = Typography

function ItemsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const loadItems = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/items')
      setItems(data)
    } catch (e) {
      message.error('Не удалось загрузить прайс-лист')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      await api.post('/items', values)
      message.success('Позиция добавлена')
      setModalOpen(false)
      form.resetFields()
      loadItems()
    } catch (e) {
      if (e?.errorFields) return
      message.error('Не удалось сохранить позицию')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/items/${id}`)
      message.success('Позиция удалена')
      loadItems()
    } catch (e) {
      message.error('Не удалось удалить позицию')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Наименование', dataIndex: 'name', key: 'name' },
    { title: 'Цена, руб.', dataIndex: 'price', key: 'price', width: 160 },
    {
      title: 'Действия',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Popconfirm title="Удалить позицию?" onConfirm={() => handleDelete(record.id)}>
          <Button danger size="small">Удалить</Button>
        </Popconfirm>
      )
    }
  ]

  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between' }} align="center">
        <Title level={4} style={{ margin: 0 }}>Прайс-лист</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Добавить позицию
        </Button>
      </Space>

      <Table
        style={{ marginTop: 16 }}
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Новая позиция"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Наименование"
            rules={[{ required: true, message: 'Введите наименование' }]}
          >
            <Input placeholder="Например: Рубашка" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Цена"
            rules={[{ required: true, message: 'Введите цену' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="0.00" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default ItemsPage
import { useEffect, useState } from 'react';
import { Button, Modal, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

const isIOS = () => {
    if (typeof navigator === 'undefined') return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
};

function InstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [iosHelp, setIosHelp] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        const onPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        const onInstalled = () => setDeferredPrompt(null);
        window.addEventListener('beforeinstallprompt', onPrompt);
        window.addEventListener('appinstalled', onInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', onPrompt);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    const install = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice.catch(() => ({ outcome: 'dismissed' }));
        setDeferredPrompt(null);
    };

    if (isIOS()) {
        return (
            <>
                <Button
                    type="text"
                    icon={<DownloadOutlined />}
                    style={{ color: '#fff' }}
                    title="Установить приложение"
                    onClick={() => setIosHelp(true)}
                >
                    {isMobile ? null : 'Установить приложение'}
                </Button>
                <Modal
                    title="Установить приложение"
                    open={iosHelp}
                    onCancel={() => setIosHelp(false)}
                    footer={null}
                >
                    <Paragraph>
                        1. Нажмите кнопку «Поделиться» (квадрат со стрелкой вверх).
                    </Paragraph>
                    <Paragraph>
                        2. Выберите «На экран «Домой»».
                    </Paragraph>
                    <Paragraph>
                        3. Нажмите «Добавить».
                    </Paragraph>
                    <Text type="secondary">
                        Приложение появится на главном экране отдельной иконкой.
                    </Text>
                </Modal>
            </>
        );
    }

    if (!deferredPrompt) return null;

    return (
        <Button
            type="text"
            icon={<DownloadOutlined />}
            style={{ color: '#fff' }}
            title="Установить приложение"
            onClick={install}
        >
            {isMobile ? null : 'Установить приложение'}
        </Button>
    );
}

export default InstallButton;
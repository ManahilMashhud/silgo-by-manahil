const express = require('express');
const amqp = require('amqplib');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/silgo', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/order', async (req, res) => {
    try {
        const orderData = req.body;
        console.log("Received order:", orderData);
        
        const rabbitmqUrl = fs.readFileSync('/vault/secrets/rabbitmq', 'utf8').trim();
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        
        const queue = 'silgo-orders';
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(orderData)), { persistent: true });
        
        await channel.close();
        await connection.close();
        
        res.status(200).send({ success: true, message: 'Order sent to RabbitMQ successfully!' });
    } catch (error) {
        console.error('RabbitMQ Error:', error);
        res.status(500).send({ success: false, error: 'Failed to process order' });
    }
});

app.post('/silgo/api/order', async (req, res) => {
    try {
        const orderData = req.body;
        console.log("Received order (silgo prefix):", orderData);
        
        const rabbitmqUrl = fs.readFileSync('/vault/secrets/rabbitmq', 'utf8').trim();
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        
        const queue = 'silgo-orders';
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(orderData)), { persistent: true });
        
        await channel.close();
        await connection.close();
        
        res.status(200).send({ success: true, message: 'Order sent to RabbitMQ successfully!' });
    } catch (error) {
        console.error('RabbitMQ Error:', error);
        res.status(500).send({ success: false, error: 'Failed to process order' });
    }
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(`Silgo backend running on port ${PORT}`));

        
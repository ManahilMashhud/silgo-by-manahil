const express = require('express');
const amqp = require('amqplib');
const path = require('path');
const app = express();

app.use(express.json());

// Sabhi static files (CSS, JS, Images) ko seedha serve karne ke liye
app.use(express.static(path.join(__dirname)));

// Chahe user / par aaye ya /silgo par, index.html hi dikhegi
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/silgo', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Order API waisi hi rahegi
app.post('/api/order', async (req, res) => {
    try {
        const orderData = req.body;
        console.log("Received order:", orderData);
        
        const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
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

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Silgo backend running on port ${PORT}`));
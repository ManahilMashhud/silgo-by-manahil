const express = require('express');
const amqp = require('amqplib');
const path = require('path');
const app = express();

app.use(express.json());

// Ye static website (HTML/CSS/Images) ko serve karega jo aapne pehle banayi hai
app.use('/silgo', express.static(path.join(__dirname)));

// Jab website se koi order aayega, ye API run hogi
app.post('/api/order', async (req, res) => {
    try {
        const orderData = req.body;
        console.log("Received order:", orderData);
        
        // Kubernetes ke andar chal rahe RabbitMQ ka URL (agar local hai toh localhost)
        const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
        
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        
        const queue = 'silgo-orders';
        await channel.assertQueue(queue, { durable: true });
        
        // Message ko RabbitMQ queue mein bhej dena
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(orderData)), { persistent: true });
        
        await channel.close();
        await connection.close();
        
        res.status(200).send({ success: true, message: 'Order sent to RabbitMQ successfully!' });
    } catch (error) {
        console.error('RabbitMQ Error:', error);
        res.status(500).send({ success: false, error: 'Failed to process order' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Silgo backend running on port ${PORT}`));
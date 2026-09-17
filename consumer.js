const amqp = require('amqplib');

async function startConsumer() {
    try {
        const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://user:PASSWORD_YAHAN@rabbitmq.rabbitmq.svc.cluster.local:5672';
        
        console.log("Connecting to RabbitMQ...");
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        
        const queue = 'silgo-orders';
        await channel.assertQueue(queue, { durable: true });
        
        console.log(`[*] Waiting for orders in queue '${queue}'. To exit press CTRL+C`);
        
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const orderData = JSON.parse(msg.content.toString());
                
                console.log("----------------------------------------");
                console.log("📦 NEW ORDER RECEIVED FROM QUEUE!");
                console.log(`Product Name : ${orderData.productName}`);
                console.log(`Price        : Rs. ${orderData.price}`);
                console.log(`Timestamp    : ${orderData.date}`);
                console.log("----------------------------------------");
                
                channel.ack(msg);
            }
        }, { noAck: false });

    } catch (error) {
        console.error('Consumer Connection Error:', error);
        setTimeout(startConsumer, 5000);
    }
}

startConsumer();
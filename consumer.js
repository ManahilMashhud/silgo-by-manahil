const amqp = require('amqplib');

async function startConsumer() {
    try {
        // Kubernetes ke andar RabbitMQ ki service URL
        const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq-svc:5672';
        
        console.log("Connecting to RabbitMQ...");
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        
        const queue = 'silgo-orders';
        await channel.assertQueue(queue, { durable: true });
        
        console.log(`[*] Waiting for orders in queue '${queue}'. To exit press CTRL+C`);
        
        // Queue se messages consume karna
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const orderData = JSON.parse(msg.content.toString());
                
                console.log("----------------------------------------");
                console.log("📦 NEW ORDER RECEIVED FROM QUEUE!");
                console.log(`Product Name : ${orderData.productName}`);
                console.log(`Price        : Rs. ${orderData.price}`);
                console.log(`Timestamp    : ${orderData.date}`);
                console.log("----------------------------------------");
                
                // Message successfully read hone ke baad queue ko confirm (acknowledge) karna
                channel.ack(msg);
            }
        }, { noAck: false });

    } catch (error) {
        console.error('Consumer Connection Error:', error);
        // Agar connection fail ho toh 5 second baad dobara koshish karein
        setTimeout(startConsumer, 5000);
    }
}

startConsumer();
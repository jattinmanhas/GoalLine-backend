import amqp, { Connection, Channel } from 'amqplib';

let connection : Connection | null = null;
let channel : Channel | null = null;

export const connectToRabbitMQ = async () => {
    try {
        connection = await amqp.connect('amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue("fileUploadQueue");
    } catch (error) {
        console.log('Error in connecting to RabbitMQ', error);
    }
}

export const getChannel = (): Channel => {
    if (!channel) {
        throw new Error('Channel not found');
    }
    return channel;
}

export const closeRabbitMQConnection = async (): Promise<void> => {
    try {
        if(channel) await channel.close();
        if(connection) await connection.close();
    } catch (error) {
        console.error("Error in closing RabbitMQ connection", error);
    }
}
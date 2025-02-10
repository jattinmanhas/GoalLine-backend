"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRabbitMQConnection = exports.getChannel = exports.connectToRabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
let connection = null;
let channel = null;
const connectToRabbitMQ = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        connection = yield amqplib_1.default.connect('amqp://localhost');
        channel = yield connection.createChannel();
        yield channel.assertQueue("fileUploadQueue");
    }
    catch (error) {
        console.log('Error in connecting to RabbitMQ', error);
    }
});
exports.connectToRabbitMQ = connectToRabbitMQ;
const getChannel = () => {
    if (!channel) {
        throw new Error('Channel not found');
    }
    return channel;
};
exports.getChannel = getChannel;
const closeRabbitMQConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (channel)
            yield channel.close();
        if (connection)
            yield connection.close();
    }
    catch (error) {
        console.error("Error in closing RabbitMQ connection", error);
    }
});
exports.closeRabbitMQConnection = closeRabbitMQConnection;

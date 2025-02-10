"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const cors_1 = __importDefault(require("cors"));
const index_route_1 = require("./routes/index.route");
const errorHandlingMiddleware_1 = require("./middleware/errorHandlingMiddleware");
const jwtUserStrategy_1 = __importDefault(require("./utils/Strategies/jwtUserStrategy"));
const passport_1 = __importDefault(require("passport"));
const jwtAdminStrategy_1 = __importDefault(require("./utils/Strategies/jwtAdminStrategy"));
const morgan_1 = __importDefault(require("morgan"));
const webhook_1 = require("./services/webhook");
const rabbitmq_1 = require("./config/rabbitmq");
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const fileUploadConsumer_1 = require("./utils/consumers/fileUploadConsumer");
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.post("/webhook", (0, express_1.raw)({ type: "application/json" }), webhook_1.stripeWebhook);
app.use((0, express_1.json)());
(0, rabbitmq_1.connectToRabbitMQ)().then(() => {
    console.log('RabbitMQ initialized');
    (0, fileUploadConsumer_1.startFileUploadConsumer)();
}).catch((err) => {
    console.error('Failed to initialize RabbitMQ', err);
});
const tempDir = path_1.default.join(__dirname, 'temp');
if (!(0, fs_1.existsSync)(tempDir)) {
    (0, fs_1.mkdirSync)(tempDir);
}
app.use((0, express_1.urlencoded)({ extended: true }));
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use((0, morgan_1.default)("dev"));
(0, jwtUserStrategy_1.default)(passport_1.default);
(0, jwtAdminStrategy_1.default)(passport_1.default);
app.use(index_route_1.router);
app.use(errorHandlingMiddleware_1.errorHandlerMiddleware);
app.listen(port, () => {
    console.log("Server is listening on port: " + port);
});

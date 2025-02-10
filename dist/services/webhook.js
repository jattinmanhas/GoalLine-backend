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
exports.stripeWebhook = void 0;
const shop_services_1 = require("./shop.services");
const stripe_1 = __importDefault(require("stripe"));
const apiError_1 = require("../utils/handlers/apiError");
if (!process.env.STRIPE_SECRET_KEY) {
    throw new apiError_1.ApiError(400, "Stripe Key not found.");
}
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const stripeWebhook = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log('⚡ Webhook received');
    console.log('Headers:', req.headers['stripe-signature']);
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.WEBHOOK_SECRET);
        console.log('✅ Webhook verified successfully');
        console.log('Event type:', event.type);
    }
    catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    try {
        switch (event.type) {
            case "payment_intent.succeeded":
                const paymentIntent = event.data.object;
                console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
                break;
            case "payment_intent.requires_action":
                const requiresActionIntent = event.data.object;
                console.log(`PaymentIntent for ${requiresActionIntent.amount} requires user action.`);
                break;
            case "payment_intent.created":
                const createdIntent = event.data.object;
                console.log(`PaymentIntent for ${createdIntent.amount} was created.`);
                break;
            case "checkout.session.completed":
                const checkoutSession = event.data.object;
                console.log('📦 Checkout Session Data:', {
                    customerId: (_a = checkoutSession.metadata) === null || _a === void 0 ? void 0 : _a.userId,
                    amount: checkoutSession.amount_total,
                    productIds: (_b = checkoutSession.metadata) === null || _b === void 0 ? void 0 : _b.productIds
                });
                const customerId = checkoutSession.metadata.userId;
                const order = yield (0, shop_services_1.createOrder)(customerId, checkoutSession.amount_total, "usd", "COMPLETED");
                console.log("Order created:", order);
                const productIdsWithQuantities = checkoutSession
                    .metadata.productIds.split(",")
                    .map((item) => {
                    const [productId, quantity] = item.split(":");
                    return { productId, quantity: quantity };
                });
                console.log(productIdsWithQuantities);
                for (const { productId, quantity } of productIdsWithQuantities) {
                    const orderItem = yield (0, shop_services_1.createOrderItem)(order.id, productId, Number(quantity));
                    console.log("Order Items Created Successfully", orderItem);
                }
                const paymentStatus = "succeeded";
                const payment = yield (0, shop_services_1.createPayment)(order.id, checkoutSession.payment_intent, "usd", paymentStatus);
                console.log("payment succeed", payment);
                const clearCart = yield (0, shop_services_1.clearCartForUser)(customerId);
                console.log("cart cleared successfully", clearCart);
                break;
            case "charge.succeeded":
                const charge = event.data.object;
                console.log(`Charge for ${charge.amount} was successful.`);
                break;
            case "charge.updated":
                const updatedCharge = event.data.object;
                console.log(`Charge for ${updatedCharge.amount} was updated.`);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    }
    catch (err) {
        console.error("Error processing Stripe webhook:", err.message);
        return res.status(500).send(`Webhook Error: ${err.message}`);
    }
    res.json({ received: true });
});
exports.stripeWebhook = stripeWebhook;

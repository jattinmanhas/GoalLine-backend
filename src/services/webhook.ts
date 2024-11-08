import {
  clearCartForUser,
  createOrder,
  createOrderItem,
  createPayment,
} from "./shop.services";
import Stripe from "stripe";
import { ApiError } from "../utils/handlers/apiError";
import { Request, Response, NextFunction } from "express";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new ApiError(400, "Stripe Key not found.");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"]!,
      "whsec_0edbb6ccc1cf023615885158b3362a781a4a414f27abfdb9adba2b3696e88b6b"
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`
        );
        break;

      case "payment_intent.requires_action":
        const requiresActionIntent = event.data.object as Stripe.PaymentIntent;
        console.log(
          `PaymentIntent for ${requiresActionIntent.amount} requires user action.`
        );
        break;

      case "payment_intent.created":
        const createdIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent for ${createdIntent.amount} was created.`);
        break;

      case "checkout.session.completed":
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        console.log(
          `Checkout session completed. Payment ID: ${checkoutSession.payment_intent}`
        );
        const customerId = checkoutSession.metadata!.userId;
        const order = await createOrder(
          customerId,
          checkoutSession.amount_total!,
          "usd",
          "COMPLETED"
        );
        console.log("Order created:", order);

        const productIdsWithQuantities = checkoutSession
          .metadata!.productIds.split(",")
          .map((item) => {
            const [productId, quantity] = item.split(":");
            return { productId, quantity: quantity };
          });

        console.log(productIdsWithQuantities);
        for (const { productId, quantity } of productIdsWithQuantities) {
          const orderItem = await createOrderItem(
            order.id,
            productId,
            Number(quantity)
          );
          console.log("Order Items Created Successfully", orderItem);
        }

        const paymentStatus = "succeeded";
        const payment = await createPayment(
          order.id,
          checkoutSession.payment_intent as string,
          "usd",
          paymentStatus
        );

        console.log("payment succeed", payment);

        const clearCart = await clearCartForUser(customerId);
        console.log("cart cleared successfully", clearCart);

        break;

      case "charge.succeeded":
        const charge = event.data.object as Stripe.Charge;
        console.log(`Charge for ${charge.amount} was successful.`);
        break;

      case "charge.updated":
        const updatedCharge = event.data.object as Stripe.Charge;
        console.log(`Charge for ${updatedCharge.amount} was updated.`);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (err: any) {
    console.error("Error processing Stripe webhook:", err.message);
    return res.status(500).send(`Webhook Error: ${err.message}`);
  }

  res.json({ received: true });
};

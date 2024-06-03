const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

class StripeService {
  async createCheckoutSession(
    amount,
    user,
    description,
    successUrl,
    cancelUrl
  ) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["UA"],
      },
      line_items: [
        {
          price_data: {
            currency: "uah",
            product_data: {
              name: description,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      billing_address_collection: "auto",
      mode: "payment",
      customer_email: user.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session;
  }

  async createPaymentIntent(amount, payment_method_id, customer, email) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "uah",
      payment_method: payment_method_id,
      customer: customer,
      receipt_email: email,
      confirm: true,
      return_url: "http://localhost:3000/",
    });

    return paymentIntent;
  }

  async createCustomer(fullName, email) {
    const customer = await stripe.customers.create({
      name: fullName,
      email: email,
    });

    return customer;
  }
}

module.exports = new StripeService();

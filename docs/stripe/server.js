require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Stripe = require('stripe');

const app = express();
const port = process.env.PORT || 4242;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.static('public'));

// Use raw body for webhook signature verification
app.post('/webhook', bodyParser.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try{
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  }catch(err){
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle completed checkout session
  if(event.type === 'checkout.session.completed'){
    const session = event.data.object;
    console.log('Payment successful for session:', session.id);
    // TODO: Forward the verified payment info to your Apps Script or DB
    // Example: fetch(APP_SCRIPT_URL, {method:'POST', body: JSON.stringify({type:'payment', session})})
  }

  res.json({received: true});
});

// Create a Checkout session (client posts desired amount and metadata)
app.use(bodyParser.json());
app.post('/create-checkout-session', async (req, res) => {
  const {amount, currency = 'USD', metadata = {}} = req.body;
  try{
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{price_data: {currency, product_data:{name:'Support the author'},unit_amount: amount},quantity:1}],
      success_url: (process.env.SUCCESS_URL || 'https://example.com') + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.CANCEL_URL || 'https://example.com/cancel',
      metadata
    });
    res.json({id: session.id});
  }catch(err){
    console.error(err);
    res.status(500).json({error: err.message});
  }
});

app.listen(port, () => console.log(`Stripe example server listening on ${port}`));

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Anthropic = require('@anthropic-ai/sdk');

admin.initializeApp();
const db = admin.firestore();

// Lazy initialization
let anthropic;
let stripe;

function getAnthropic() {
  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }
  return anthropic;
}

function getStripe() {
  if (!stripe) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

// Chat endpoint
exports.chat = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { message, systemPrompt, history } = req.body;
    
    if (!message || !systemPrompt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const messages = [];
    
    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }
    
    if (!history || history[history.length - 1]?.content !== message) {
      messages.push({
        role: 'user',
        content: message
      });
    }
    
    const response = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: messages
    });
    
    const assistantMessage = response.content[0].text;
    
    return res.status(200).json({
      response: assistantMessage,
      usage: response.usage
    });
    
  } catch (error) {
    console.error('Error en chat:', error);
    return res.status(500).json({ 
      error: 'Error al procesar la consulta',
      details: error.message 
    });
  }
});

// Create checkout endpoint
exports.createCheckout = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { planId, userId, userEmail, credits } = req.body;
    
    if (!planId || !userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const priceIds = {
      'basic': process.env.STRIPE_PRICE_BASIC,
      'mystic': process.env.STRIPE_PRICE_MYSTIC,
      'master': process.env.STRIPE_PRICE_MASTER
    };
    
    const priceId = priceIds[planId];
    
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      success_url: `${req.headers.origin || 'https://cambiatuyo.web.app'}/success`,
      cancel_url: `${req.headers.origin || 'https://cambiatuyo.web.app'}/`,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        planId: planId,
        credits: credits.toString()
      }
    });
    
    return res.status(200).json({ url: session.url });
    
  } catch (error) {
    console.error('Error creando checkout:', error);
    return res.status(500).json({ 
      error: 'Error al crear sesión de pago',
      details: error.message 
    });
  }
});

// Stripe webhook
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = getStripe().webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      const userId = session.client_reference_id || session.metadata.userId;
      const credits = parseInt(session.metadata.credits) || 0;
      const planId = session.metadata.planId || 'basic';
      
      if (!userId) {
        console.error('No userId in session');
        return res.status(400).send('No userId');
      }
      
      const userRef = db.collection('users').doc(userId);
      
      await userRef.update({
        credits: admin.firestore.FieldValue.increment(credits),
        plan: planId,
        lastPurchase: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Créditos actualizados para usuario ${userId}: +${credits}`);
      
    } catch (error) {
      console.error('Error actualizando créditos:', error);
      return res.status(500).send('Error updating credits');
    }
  }
  
  res.status(200).send('Webhook received');
});

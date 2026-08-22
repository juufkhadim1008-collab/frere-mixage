import { getServerSupabase } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
  }

  try {
    const { orderPayload, hostOrigin } = req.body;

    if (!orderPayload) {
      return res.status(400).json({ error: 'Données de commande manquantes.' });
    }

    const clientId = process.env.ORANGE_MONEY_CLIENT_ID;
    const clientSecret = process.env.ORANGE_MONEY_CLIENT_SECRET;
    const merchantKey = process.env.ORANGE_MONEY_MERCHANT_KEY;

    if (!clientId || !clientSecret || !merchantKey) {
      return res.status(503).json({
        error: 'Configuration Orange Money incomplète : Variables ORANGE_MONEY_CLIENT_ID, ORANGE_MONEY_CLIENT_SECRET ou ORANGE_MONEY_MERCHANT_KEY manquantes dans Vercel.'
      });
    }

    const orderNumber = orderPayload.orderNumber || `FM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = Math.round(Number(orderPayload.totalAmount) || 0);

    const origin = hostOrigin || req.headers.origin || 'https://frere-mixage.vercel.app';
    const returnUrl = `${origin}/order-return.html?status=success&order_id=${encodeURIComponent(orderNumber)}`;
    const cancelUrl = `${origin}/order-return.html?status=cancelled&order_id=${encodeURIComponent(orderNumber)}`;
    const notifUrl = `${origin}/api/payments/orange-money/webhook`;

    // 1. Enregistrement / synchronisation de la commande dans Supabase
    const supabase = getServerSupabase();
    if (supabase) {
      try {
        await supabase.rpc('process_order_atomic', {
          p_customer_name: orderPayload.customer?.name || `${orderPayload.customer?.firstName || ''} ${orderPayload.customer?.lastName || ''}`.trim() || 'Client Frère Mixage',
          p_customer_phone: orderPayload.customer?.phone || '',
          p_customer_email: orderPayload.customer?.email || null,
          p_delivery_address: orderPayload.customer?.address || 'Dakar',
          p_delivery_city: orderPayload.customer?.city || 'Dakar',
          p_payment_method: 'orange_money',
          p_notes: orderPayload.customer?.notes || null,
          p_items: (orderPayload.items || []).map(item => ({
            product_id: item.productId || null,
            product_slug: item.productSlug || item.productId || null,
            size: item.size || 'M',
            quantity: parseInt(item.quantity, 10) || 1
          }))
        });
      } catch (dbErr) {
        console.warn('[OrangeMoneyCreateCheckout] Avertissement insertion DB :', dbErr.message);
      }
    }

    // 2. Récupération du token OAuth2 Orange Developer
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await fetch('https://api.orange.com/oauth/v3/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[OrangeMoneyAPI] Erreur OAuth2 :', tokenData);
      return res.status(tokenRes.status).json({
        error: tokenData.message || tokenData.error_description || 'Authentification Orange Money échouée.'
      });
    }

    const accessToken = tokenData.access_token;

    // 3. Création de la transaction WebPayment Orange Money
    const omEndpoint = process.env.ORANGE_MONEY_ENV === 'production'
      ? 'https://api.orange.com/orange-money-webpay/sn/v1/webpayment'
      : 'https://api.orange.com/orange-money-webpay/dev/v1/webpayment';

    const omRes = await fetch(omEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchant_key: merchantKey,
        currency: 'OUV',
        order_id: orderNumber,
        amount: totalAmount,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        notif_url: notifUrl,
        lang: 'fr',
        reference: `Maison Frère Mixage - ${orderNumber}`
      })
    });

    const omData = await omRes.json();

    if (!omRes.ok || (!omData.payment_url && !omData.paymentUrl)) {
      console.error('[OrangeMoneyAPI] Erreur init webpayment :', omData);
      return res.status(omRes.status).json({
        error: omData.message || omData.description || 'Erreur lors de la création de la session Orange Money.'
      });
    }

    return res.status(200).json({
      success: true,
      checkoutUrl: omData.payment_url || omData.paymentUrl,
      payToken: omData.pay_token || omData.payToken,
      orderNumber,
      amount: totalAmount
    });

  } catch (error) {
    console.error('[OrangeMoneyCheckoutAPI] Erreur serveur :', error);
    return res.status(500).json({ error: error.message || 'Erreur interne du serveur Orange Money.' });
  }
}

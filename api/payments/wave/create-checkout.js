import { getServerSupabase } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  // CORS & Méthode POST
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

    const waveApiKey = process.env.WAVE_API_KEY;
    if (!waveApiKey) {
      return res.status(503).json({
        error: 'Configuration Wave incomplète : La variable WAVE_API_KEY est manquante dans les variables d\'environnement Vercel.'
      });
    }

    const orderNumber = orderPayload.orderNumber || `FM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = Math.round(Number(orderPayload.totalAmount) || 0);

    if (totalAmount <= 0) {
      return res.status(400).json({ error: 'Montant de commande invalide.' });
    }

    // Déterminer l'URL de base pour le retour client
    const origin = hostOrigin || req.headers.origin || 'https://frere-mixage.vercel.app';
    const successUrl = `${origin}/order-return.html?status=success&order_id=${encodeURIComponent(orderNumber)}`;
    const errorUrl = `${origin}/order-return.html?status=failed&order_id=${encodeURIComponent(orderNumber)}`;

    // 1. Enregistrement / synchronisation de la commande dans Supabase (statut initial : pending)
    const supabase = getServerSupabase();
    let dbOrderId = null;

    if (supabase) {
      try {
        // Enregistrer la commande via process_order_atomic si disponible
        const { data, error } = await supabase.rpc('process_order_atomic', {
          p_customer_name: orderPayload.customer?.name || `${orderPayload.customer?.firstName || ''} ${orderPayload.customer?.lastName || ''}`.trim() || 'Client Frère Mixage',
          p_customer_phone: orderPayload.customer?.phone || '',
          p_customer_email: orderPayload.customer?.email || null,
          p_delivery_address: orderPayload.customer?.address || 'Dakar',
          p_delivery_city: orderPayload.customer?.city || 'Dakar',
          p_payment_method: 'wave',
          p_notes: orderPayload.customer?.notes || null,
          p_items: (orderPayload.items || []).map(item => ({
            product_id: item.productId || null,
            product_slug: item.productSlug || item.productId || null,
            size: item.size || 'M',
            quantity: parseInt(item.quantity, 10) || 1
          }))
        });

        if (!error && data) {
          dbOrderId = data.order_id;
        }
      } catch (dbErr) {
        console.warn('[WaveCreateCheckout] Avertissement insertion commande DB :', dbErr.message);
      }
    }

    // 2. Appel à l'API officielle Wave Business Checkout
    const waveResponse = await fetch('https://api.wave.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${waveApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: String(totalAmount),
        currency: 'XOF',
        error_url: errorUrl,
        success_url: successUrl,
        client_reference: orderNumber,
        restricted: false
      })
    });

    const waveData = await waveResponse.json();

    if (!waveResponse.ok) {
      console.error('[WaveCheckoutAPI] Erreur API Wave :', waveData);
      return res.status(waveResponse.status).json({
        error: waveData.message || waveData.error || 'Erreur lors de la création de la session Wave.'
      });
    }

    return res.status(200).json({
      success: true,
      checkoutUrl: waveData.wave_launch_url,
      sessionId: waveData.id,
      orderNumber,
      amount: totalAmount,
      currency: 'XOF'
    });

  } catch (error) {
    console.error('[WaveCheckoutAPI] Erreur serveur :', error);
    return res.status(500).json({ error: error.message || 'Erreur interne du serveur lors de la création du paiement Wave.' });
  }
}

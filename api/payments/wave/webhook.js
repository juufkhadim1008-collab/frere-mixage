import crypto from 'crypto';
import { getServerSupabase } from '../../_lib/supabase.js';

// Configuration Vercel pour récupérer le body brut si nécessaire
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper pour lire le body brut en buffer
async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const webhookSecret = process.env.WAVE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[WaveWebhook] WAVE_WEBHOOK_SECRET non configuré sur Vercel.');
    return res.status(500).json({ error: 'Configuration serveur incomplète (WAVE_WEBHOOK_SECRET manquant).' });
  }

  try {
    const rawBodyBuffer = await getRawBody(req);
    const rawBody = rawBodyBuffer.toString('utf8');
    const signatureHeader = req.headers['wave-signature'];

    // 1. Validation de la signature Wave (HMAC SHA-256)
    if (signatureHeader) {
      const parts = signatureHeader.split(',');
      let timestamp = '';
      const signatures = [];

      for (const part of parts) {
        const [key, value] = part.trim().split('=');
        if (key === 't') timestamp = value;
        else if (key === 'v1' || key === 's') signatures.push(value);
      }

      const signedPayload = `${timestamp}.${rawBody}`;
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload)
        .digest('hex');

      const isSignatureValid = signatures.some(sig => sig === expectedSignature);
      if (!isSignatureValid) {
        // En mode direct sans timestamp spécifique
        const simpleExpected = crypto
          .createHmac('sha256', webhookSecret)
          .update(rawBody)
          .digest('hex');
        
        if (signatureHeader !== simpleExpected && !isSignatureValid) {
          console.warn('[WaveWebhook] Signature Wave invalide.');
          return res.status(401).json({ error: 'Signature Wave non valide.' });
        }
      }
    }

    const event = JSON.parse(rawBody);
    console.log('[WaveWebhook] Événement reçu :', event.type, event.id);

    // 2. Traitement de l'événement checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data || {};
      const orderNumber = session.client_reference;
      const amountPaid = session.amount;
      const transactionId = session.transaction_id || session.id || `TX-WAVE-${Date.now()}`;
      const paymentStatus = session.payment_status === 'succeeded' || session.checkout_status === 'complete' ? 'paid' : 'failed';

      if (orderNumber) {
        const supabase = getServerSupabase();
        if (supabase) {
          // Idempotence : vérifier si la commande est déjà marquée comme payée
          const { data: existingOrder } = await supabase
            .from('orders')
            .select('id, payment_status')
            .eq('order_number', orderNumber)
            .maybeSingle();

          if (existingOrder && existingOrder.payment_status === 'paid') {
            console.log(`[WaveWebhook] Commande ${orderNumber} déjà payée. Idempotence respectée.`);
            return res.status(200).json({ received: true, message: 'Déjà traitée' });
          }

          // Mise à jour du statut de paiement dans la base de données
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              payment_status: paymentStatus,
              status: paymentStatus === 'paid' ? 'confirmed' : 'cancelled',
              updated_at: new Date().toISOString(),
              notes: `Paiement Wave validé via Webhook. Transaction: ${transactionId} - Montant: ${amountPaid} XOF`
            })
            .eq('order_number', orderNumber);

          if (updateError) {
            console.error('[WaveWebhook] Erreur mise à jour commande Supabase :', updateError);
          } else {
            console.log(`[WaveWebhook] Commande ${orderNumber} passée avec succès à l'état ${paymentStatus}.`);
          }
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[WaveWebhook] Erreur traitement webhook :', error);
    return res.status(400).json({ error: error.message || 'Erreur webhook Wave' });
  }
}

import { getServerSupabase } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  try {
    const payload = req.body || {};
    console.log('[OrangeMoneyWebhook] Notification reçue :', payload);

    const orderNumber = payload.order_id || payload.orderId;
    const status = (payload.status || '').toUpperCase();
    const transactionId = payload.txnid || payload.notif_token || `TX-OM-${Date.now()}`;

    if (!orderNumber) {
      return res.status(400).json({ error: 'order_id manquant.' });
    }

    const supabase = getServerSupabase();
    if (supabase) {
      const isPaid = status === 'SUCCESS' || status === 'COMPLETED' || status === 'PAID';
      const paymentStatus = isPaid ? 'paid' : (status === 'FAILED' ? 'failed' : 'pending');

      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id, payment_status')
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (existingOrder && existingOrder.payment_status === 'paid') {
        return res.status(200).json({ received: true, message: 'Déjà traitée' });
      }

      await supabase
        .from('orders')
        .update({
          payment_status: paymentStatus,
          status: isPaid ? 'confirmed' : 'cancelled',
          updated_at: new Date().toISOString(),
          notes: `Paiement Orange Money : Statut ${status} - Réf: ${transactionId}`
        })
        .eq('order_number', orderNumber);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[OrangeMoneyWebhook] Erreur :', error);
    return res.status(400).json({ error: error.message });
  }
}

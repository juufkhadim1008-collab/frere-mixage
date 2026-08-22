import { getServerSupabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée. Utilisez GET.' });
  }

  try {
    const orderNumber = req.query.order_id;
    if (!orderNumber) {
      return res.status(400).json({ error: 'Paramètre order_id manquant.' });
    }

    const supabase = getServerSupabase();
    if (!supabase) {
      return res.status(200).json({
        success: true,
        orderNumber,
        paymentStatus: 'pending',
        message: 'Base de données en attente de synchronisation.'
      });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        payment_method,
        total,
        subtotal,
        delivery_fee,
        delivery_address,
        notes,
        created_at,
        customers (
          full_name,
          phone,
          email,
          city
        ),
        order_items (
          product_name_snapshot,
          size,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error) {
      console.error('[VerifyStatus] Erreur requête :', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération de la commande.' });
    }

    if (!order) {
      return res.status(404).json({ error: 'Commande introuvable.', orderNumber });
    }

    return res.status(200).json({
      success: true,
      orderNumber: order.order_number,
      paymentStatus: order.payment_status || 'pending',
      orderStatus: order.status || 'new',
      paymentMethod: order.payment_method,
      totalAmount: order.total,
      customer: order.customers,
      items: order.order_items,
      createdAt: order.created_at,
      notes: order.notes
    });

  } catch (error) {
    console.error('[VerifyStatus] Erreur serveur :', error);
    return res.status(500).json({ error: error.message || 'Erreur interne de vérification.' });
  }
}

const { MercadoPagoConfig, Payment } = require('mercadopago');
const Order = require('../models/Order');

let client;
let paymentClient;

if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
    client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
    paymentClient = new Payment(client);
}

// @desc    Create a PIX payment
// @route   POST /api/payments/pix
// @access  Private
const createPixPayment = async (req, res) => {
    const { orderId } = req.body;

    if (!paymentClient) {
        return res.status(503).json({ message: 'PIX payment is not configured (MERCADOPAGO_ACCESS_TOKEN missing)' });
    }

    try {
        const order = await Order.findById(orderId).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const payment_data = {
            transaction_amount: Number(order.totalPrice),
            description: `Order ${order._id}`,
            payment_method_id: 'pix',
            payer: {
                email: order.user.email,
                first_name: order.user.name.split(' ')[0],
                last_name: order.user.name.split(' ')[1] || '',
            },
            notification_url: `${req.protocol}://${req.get('host')}/api/payments/webhook`
            // For localhost testing, notification_url must be an ngrok URL in real usage.
        };

        const response = await paymentClient.create({ body: payment_data });

        const qrCode = response.point_of_interaction?.transaction_data?.qr_code || '';
        const qrCodeBase64 = response.point_of_interaction?.transaction_data?.qr_code_base64 || '';
        const paymentId = response.id;

        // Attach payment Intent Id to order
        order.pixTransactionId = paymentId;
        await order.save();

        res.json({
            qrCode,
            qrCodeBase64,
            paymentId,
            status: response.status
        });

    } catch (error) {
        console.error('PIX Error:', error);
        res.status(500).json({ message: 'Error processing PIX payment' });
    }
};

// @desc    Webhook to receive MercadoPago notifications
// @route   POST /api/payments/webhook
// @access  Public
const webhookNotification = async (req, res) => {
    const paymentId = req.query.id || req.body.data?.id;
    const type = req.query.type || req.body.type;

    if (!paymentClient) {
        return res.status(200).send('OK');
    }

    if (type === 'payment' && paymentId) {
        try {
            const response = await paymentClient.get({ id: paymentId });
            const paymentInfo = response;

            if (paymentInfo.status === 'approved') {
                const orderIdHex = paymentInfo.description.split(' ')[1]; // Extract order ID from description

                await Order.findOneAndUpdate(
                    { pixTransactionId: paymentId },
                    {
                        isPaid: true,
                        paymentStatus: 'paid',
                        paidAt: Date.now()
                    }
                );
                console.log(`Payment confirmed for Order: ${orderIdHex}`);
            }
        } catch (error) {
            console.error('Webhook error:', error);
        }
    }

    res.status(200).send('OK');
};

module.exports = { createPixPayment, webhookNotification };

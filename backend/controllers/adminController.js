const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get admin overview statistics
// @route   GET /api/admin/overview
// @access  Private/Admin
const getAdminOverview = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalProducts = await Product.countDocuments({});

        // Optimize getting orders count, total sales, and latest orders
        const orders = await Order.find({});
        const totalOrders = orders.length;

        const totalSales = orders.reduce((acc, order) => {
            return order.isPaid ? acc + order.totalPrice : acc;
        }, 0);

        const latestOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name');

        res.json({
            totalUsers,
            totalProducts,
            totalOrders,
            totalSales,
            latestOrders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching admin overview' });
    }
};

module.exports = { getAdminOverview };

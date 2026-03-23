const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    const products = await Product.find({}).populate('category', 'name slug');
    res.json(products);
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    // Find a default category to link
    const Category = require('../models/Category');
    const defaultCategory = await Category.findOne({});

    const product = new Product({
        name: 'Sample name',
        price: 0,
        description: 'Sample description',
        images: ['https://placehold.co/600x400?text=Image'],
        category: req.body.category || (defaultCategory ? defaultCategory._id : null),
        countInStock: 0,
        numReviews: 0,
        translations: {
            en: { name: 'Sample name EN', description: 'Sample description EN' },
            por: { name: 'Nome de exemplo POR', description: 'Descrição de exemplo POR' }
        }
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    const { name, price, description, images, category, countInStock, translations } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name;
        product.price = price;
        product.description = description;
        product.images = images;
        product.category = category;
        product.countInStock = countInStock;

        if (translations) {
            product.translations = translations;
        }

        await product.save();
        const updatedProduct = await Product.findById(req.params.id).populate('category', 'name slug');
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };

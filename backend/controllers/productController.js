/**
 * productController.js - Product Management Controller
 * CRUD operations for products
 */

const { readData, findById, createRecord, updateRecord, deleteRecord, searchData, paginateData } = require('../utils/db');
const { successResponse, errorResponse, notFoundResponse, paginatedResponse } = require('../utils/responseHelper');

// GET /api/products - List all products with search & pagination
const getProducts = (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 10 } = req.query;
    let products = readData('products');

    if (search) products = searchData(products, search, ['name', 'productId', 'category', 'description']);
    if (category) products = products.filter(p => p.category === category);
    if (status) products = products.filter(p => p.status === status);

    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return paginatedResponse(res, paginateData(products, page, limit), 'Products fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch products.', 500);
  }
};

// GET /api/products/:id
const getProduct = (req, res) => {
  try {
    const product = findById('products', req.params.id);
    if (!product) return notFoundResponse(res, 'Product');
    return successResponse(res, product, 'Product fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch product.', 500);
  }
};

// POST /api/products
const createProduct = (req, res) => {
  try {
    const { name, category, description, price, manufacturingCost, image, status, unit } = req.body;
    if (!name || !category) return errorResponse(res, 'Name and category are required.');

    const products = readData('products');
    const productId = `PRD-${String(products.length + 1).padStart(3, '0')}`;

    const newProduct = createRecord('products', {
      productId, name, category, description: description || '',
      price: parseFloat(price) || 0,
      manufacturingCost: parseFloat(manufacturingCost) || 0,
      image: image || '', status: status || 'active',
      unit: unit || 'units', stockQuantity: 0,
    });
    return successResponse(res, newProduct, 'Product created successfully.', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create product.', 500);
  }
};

// PUT /api/products/:id
const updateProduct = (req, res) => {
  try {
    const existing = findById('products', req.params.id);
    if (!existing) return notFoundResponse(res, 'Product');

    const updated = updateRecord('products', req.params.id, req.body);
    return successResponse(res, updated, 'Product updated successfully.');
  } catch (error) {
    return errorResponse(res, 'Failed to update product.', 500);
  }
};

// DELETE /api/products/:id
const deleteProduct = (req, res) => {
  try {
    const deleted = deleteRecord('products', req.params.id);
    if (!deleted) return notFoundResponse(res, 'Product');
    return successResponse(res, null, 'Product deleted successfully.');
  } catch (error) {
    return errorResponse(res, 'Failed to delete product.', 500);
  }
};

// GET /api/products/categories - Get distinct categories
const getCategories = (req, res) => {
  try {
    const products = readData('products');
    const categories = [...new Set(products.map(p => p.category))];
    return successResponse(res, categories, 'Categories fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch categories.', 500);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCategories };

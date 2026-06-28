/**
 * Products.jsx - Product Management Page
 * Full CRUD with search, filter, modal form, and export
 */

import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services';
import Breadcrumb from '../components/layout/Breadcrumb';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiBox, FiDownload, FiRefreshCw } from 'react-icons/fi';

const CATEGORIES = ['Fasteners', 'Structural', 'Pneumatics', 'Conveyor Systems', 'Electrical', 'Hydraulics', 'Piping', 'Mechanical', 'Safety', 'Bearings', 'Other'];

import QRCode from 'react-qr-code';

const initialForm = { name: '', category: '', description: '', price: '', manufacturingCost: '', status: 'active', unit: 'pieces' };

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({ search, category: categoryFilter, status: statusFilter, page, limit: 10 });
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => { setEditingProduct(null); setForm(initialForm); setModalOpen(true); };
  const openEdit = (p) => { setEditingProduct(p); setForm({ name: p.name, category: p.category, description: p.description || '', price: p.price, manufacturingCost: p.manufacturingCost, status: p.status, unit: p.unit || 'pieces' }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingProduct(null); setForm(initialForm); };
  
  const openQr = (p) => { setSelectedProduct(p); setQrModalOpen(true); };
  const closeQr = () => { setQrModalOpen(false); setSelectedProduct(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category) { toast.error('Name and category required'); return; }
    setFormLoading(true);
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, form);
        toast.success('Product updated!');
      } else {
        await productService.create(form);
        toast.success('Product created!');
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await productService.delete(deleteId);
      toast.success('Product deleted!');
      setDeleteId(null);
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  const margin = (p) => {
    if (!p.price || !p.manufacturingCost) return null;
    return Math.round(((p.price - p.manufacturingCost) / p.price) * 100);
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <Breadcrumb />
          <h1 className="page-title">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<FiRefreshCw />} onClick={fetchProducts}>Refresh</Button>
          <Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>Add Product</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="form-input pl-9"
            />
          </div>
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="form-select w-full sm:w-44">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="form-select w-full sm:w-36">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : products.length === 0 ? (
          <EmptyState title="No products found" description="Try a different search or add a new product" icon={<FiBox />}
            action={<Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>Add Product</Button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Cost</th>
                    <th>Margin</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="font-mono text-xs text-gray-500">{p.productId}</td>
                      <td>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.unit}</div>
                      </td>
                      <td><Badge variant="blue">{p.category}</Badge></td>
                      <td className="font-semibold">₹{parseFloat(p.price || 0).toFixed(2)}</td>
                      <td className="text-gray-500">₹{parseFloat(p.manufacturingCost || 0).toFixed(2)}</td>
                      <td>
                        {margin(p) !== null && (
                          <span className={`font-semibold ${margin(p) >= 30 ? 'text-green-600 dark:text-green-400' : margin(p) >= 15 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                            {margin(p)}%
                          </span>
                        )}
                      </td>
                      <td><Badge variant={p.status}>{p.status}</Badge></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openQr(p)} className="btn-icon btn-ghost text-purple-600 dark:text-purple-400 text-sm font-bold" title="QR Code">QR</button>
                          <button onClick={() => openEdit(p)} className="btn-icon btn-ghost text-blue-600 dark:text-blue-400 text-sm" title="Edit"><FiEdit2 /></button>
                          <button onClick={() => setDeleteId(p.id)} className="btn-icon btn-ghost text-red-600 dark:text-red-400 text-sm" title="Delete"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-dark-border text-sm">
                <span className="text-gray-500">
                  {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
                </span>
                <div className="flex gap-1">
                  <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)} className="btn btn-secondary btn-sm disabled:opacity-40">Prev</button>
                  <button disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)} className="btn btn-secondary btn-sm disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* QR Modal */}
      <Modal
        isOpen={qrModalOpen}
        onClose={closeQr}
        title="Product QR Code"
        size="sm"
        footer={<Button variant="secondary" onClick={closeQr}>Close</Button>}
      >
        {selectedProduct && (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
              <QRCode value={JSON.stringify({ id: selectedProduct.productId, name: selectedProduct.name, category: selectedProduct.category })} size={200} />
            </div>
            <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
            <p className="text-gray-500 font-mono text-sm">{selectedProduct.productId}</p>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" loading={formLoading} onClick={handleSubmit}>
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Product Name" name="name" placeholder="e.g. Steel Bolt M8" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          <div>
            <label className="form-label">Category <span className="text-red-500">*</span></label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="form-select" required>
              <option value="">Select Category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="form-input resize-none" placeholder="Product description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (₹)" name="price" type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
            <Input label="Manufacturing Cost (₹)" name="manufacturingCost" type="number" step="0.01" min="0" value={form.manufacturingCost} onChange={e => setForm(p => ({ ...p, manufacturingCost: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Unit</label>
              <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} className="form-select">
                {['pieces', 'units', 'kg', 'meters', 'assemblies', 'boxes', 'sets'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="form-select">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product?"
        message="This action cannot be undone. The product will be permanently removed."
        loading={deleteLoading}
      />
    </div>
  );
};

export default Products;

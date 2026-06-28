/**
 * Inventory.jsx - Inventory Management Page
 * Stock tracking with Stock In / Stock Out operations
 */
import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '../services';
import Breadcrumb from '../components/layout/Breadcrumb';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import StatCard from '../components/ui/StatCard';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPackage, FiArrowDown, FiArrowUp, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

import Barcode from 'react-barcode';

const INV_CATEGORIES = ['Raw Materials', 'Finished Goods', 'Spare Parts', 'Packaging', 'Safety Equipment', 'Consumables', 'Semi-Finished', 'Other'];

const initialForm = { name: '', category: '', quantity: '', unit: 'pieces', reorderLevel: '', reorderQuantity: '', unitCost: '', location: '' };

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catF, setCatF] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockModal, setStockModal] = useState(null); // { item, type: 'in'|'out' }
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [stockQty, setStockQty] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getAll({ search, category: catF, lowStock: lowStockOnly ? 'true' : '', page, limit: 10 });
      setItems(res.data.data);
      setPagination(res.data.pagination || {});
    } catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  }, [search, catF, lowStockOnly, page]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    inventoryService.getLowStock().then(r => setLowStockItems(r.data.data || [])).catch(() => {});
  }, []);

  const openCreate = () => { setEditItem(null); setForm(initialForm); setModalOpen(true); };
  const openEdit = (i) => { setEditItem(i); setForm({ name: i.name, category: i.category, quantity: i.quantity, unit: i.unit, reorderLevel: i.reorderLevel, reorderQuantity: i.reorderQuantity, unitCost: i.unitCost, location: i.location || '' }); setModalOpen(true); };

  const openBarcode = (i) => { setSelectedItem(i); setBarcodeModalOpen(true); };
  const closeBarcode = () => { setBarcodeModalOpen(false); setSelectedItem(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category) { toast.error('Name and category required'); return; }
    setFormLoading(true);
    try {
      if (editItem) { await inventoryService.update(editItem.id, form); toast.success('Item updated!'); }
      else { await inventoryService.create(form); toast.success('Item created!'); }
      setModalOpen(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setFormLoading(false); }
  };

  const handleStock = async () => {
    if (!stockQty || parseInt(stockQty) <= 0) { toast.error('Enter valid quantity'); return; }
    setFormLoading(true);
    try {
      if (stockModal.type === 'in') await inventoryService.stockIn(stockModal.item.id, { quantity: stockQty });
      else await inventoryService.stockOut(stockModal.item.id, { quantity: stockQty });
      toast.success(`Stock ${stockModal.type === 'in' ? 'In' : 'Out'} recorded!`);
      setStockModal(null); setStockQty(''); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await inventoryService.delete(deleteId); toast.success('Item deleted!'); setDeleteId(null); fetch(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  const totalValue = items.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><Breadcrumb /><h1 className="page-title">Inventory</h1><p className="text-sm text-gray-500 dark:text-gray-400">Track stock levels and manage inventory operations</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<FiRefreshCw />} onClick={fetch}>Refresh</Button>
          <Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>Add Item</Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard title="Total Items" value={pagination.total || items.length} icon={<FiPackage />} color="blue" />
        <StatCard title="Low Stock" value={lowStockItems.length} icon={<FiAlertCircle />} color="orange" />
        <StatCard title="Stock Value" value={`₹${totalValue.toLocaleString(undefined, {maximumFractionDigits:0})}`} icon={<FiPackage />} color="green" />
        <StatCard title="Out of Stock" value={items.filter(i => i.quantity === 0).length} icon={<FiAlertCircle />} color="red" />
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="search" placeholder="Search inventory..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input pl-9" /></div>
          <select value={catF} onChange={e => { setCatF(e.target.value); setPage(1); }} className="form-select w-full sm:w-44">
            <option value="">All Categories</option>
            {INV_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg cursor-pointer text-sm text-orange-700 dark:text-orange-400">
            <input type="checkbox" checked={lowStockOnly} onChange={e => { setLowStockOnly(e.target.checked); setPage(1); }} />
            Low Stock Only
          </label>
        </div>
      </div>

      <div className="card">
        {loading ? <TableSkeleton rows={8} cols={8} /> : items.length === 0 ? (
          <EmptyState title="No inventory items" icon={<FiPackage />} action={<Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>Add Item</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>ID</th><th>Item</th><th>Category</th><th>Quantity</th><th>Unit Cost</th><th>Reorder At</th><th>Location</th><th>Actions</th></tr></thead>
                <tbody>
                  {items.map(i => {
                    const isLow = i.quantity <= i.reorderLevel;
                    const isOut = i.quantity === 0;
                    return (
                      <tr key={i.id} className={isOut ? 'bg-red-50/30 dark:bg-red-900/5' : isLow ? 'bg-yellow-50/30 dark:bg-yellow-900/5' : ''}>
                        <td className="font-mono text-xs text-gray-500">{i.itemId}</td>
                        <td className="font-medium text-gray-900 dark:text-gray-100">{i.name}</td>
                        <td><Badge variant="blue">{i.category}</Badge></td>
                        <td>
                          <span className={`font-bold ${isOut ? 'text-red-600 dark:text-red-400' : isLow ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                            {i.quantity} {i.unit}
                          </span>
                          {isLow && <span className="ml-1 text-xs">⚠️</span>}
                        </td>
                        <td>₹{parseFloat(i.unitCost || 0).toFixed(2)}</td>
                        <td className="text-gray-500">{i.reorderLevel} {i.unit}</td>
                        <td className="text-gray-500 text-xs">{i.location || '–'}</td>
                        <td>
                          <div className="flex gap-1">
                            <button onClick={() => openBarcode(i)} className="btn-icon btn-ghost text-purple-600 dark:text-purple-400 text-sm font-bold" title="Barcode">BC</button>
                            <button onClick={() => setStockModal({ item: i, type: 'in' })} className="btn-icon btn-ghost text-green-600 dark:text-green-400 text-sm" title="Stock In"><FiArrowDown /></button>
                            <button onClick={() => setStockModal({ item: i, type: 'out' })} className="btn-icon btn-ghost text-red-600 dark:text-red-400 text-sm" title="Stock Out"><FiArrowUp /></button>
                            <button onClick={() => openEdit(i)} className="btn-icon btn-ghost text-blue-600 dark:text-blue-400 text-sm" title="Edit"><FiEdit2 /></button>
                            <button onClick={() => setDeleteId(i.id)} className="btn-icon btn-ghost text-red-600 dark:text-red-400 text-sm" title="Delete"><FiTrash2 /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-dark-border text-sm">
                <span className="text-gray-500">{((pagination.page-1)*pagination.limit)+1}–{Math.min(pagination.page*pagination.limit,pagination.total)} of {pagination.total}</span>
                <div className="flex gap-1">
                  <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p=>p-1)} className="btn btn-secondary btn-sm disabled:opacity-40">Prev</button>
                  <button disabled={!pagination.hasNextPage} onClick={() => setPage(p=>p+1)} className="btn btn-secondary btn-sm disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Barcode Modal */}
      <Modal
        isOpen={barcodeModalOpen}
        onClose={closeBarcode}
        title="Item Barcode"
        size="sm"
        footer={<Button variant="secondary" onClick={closeBarcode}>Close</Button>}
      >
        {selectedItem && (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
              <Barcode value={selectedItem.itemId || selectedItem.id} width={2} height={80} displayValue={true} />
            </div>
            <h3 className="font-bold text-lg">{selectedItem.name}</h3>
            <p className="text-gray-500 text-sm">Location: {selectedItem.location || 'Not Set'}</p>
          </div>
        )}
      </Modal>

      {/* Stock In/Out Modal */}
      <Modal isOpen={!!stockModal} onClose={() => { setStockModal(null); setStockQty(''); }} title={`Stock ${stockModal?.type === 'in' ? 'In ↓' : 'Out ↑'}: ${stockModal?.item?.name}`} size="sm"
        footer={<><Button variant="secondary" onClick={() => setStockModal(null)}>Cancel</Button><Button variant={stockModal?.type === 'in' ? 'success' : 'danger'} loading={formLoading} onClick={handleStock}>Confirm {stockModal?.type === 'in' ? 'Stock In' : 'Stock Out'}</Button></>}
      >
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl text-sm">
            <p className="text-gray-500 mb-1">Current Stock:</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stockModal?.item?.quantity} {stockModal?.item?.unit}</p>
          </div>
          <Input label={`Quantity to ${stockModal?.type === 'in' ? 'Add' : 'Remove'}`} type="number" min="1" value={stockQty} onChange={e => setStockQty(e.target.value)} placeholder="Enter quantity" />
        </div>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Item' : 'Add Inventory Item'} size="md"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button variant="primary" loading={formLoading} onClick={handleSubmit}>{editItem ? 'Update' : 'Create'}</Button></>}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Item Name" name="name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Steel Plate 5mm" />
          <div><label className="form-label">Category <span className="text-red-500">*</span></label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="form-select" required>
              <option value="">Select Category</option>
              {INV_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" name="quantity" type="number" min="0" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
            <div><label className="form-label">Unit</label>
              <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} className="form-select">
                {['pieces','kg','liters','meters','sheets','boxes','rolls','pairs'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Unit Cost (₹)" name="unitCost" type="number" step="0.01" value={form.unitCost} onChange={e => setForm(p => ({ ...p, unitCost: e.target.value }))} />
            <Input label="Reorder Level" name="reorderLevel" type="number" value={form.reorderLevel} onChange={e => setForm(p => ({ ...p, reorderLevel: e.target.value }))} />
          </div>
          <Input label="Location (Bay/Shelf)" name="location" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. A3-S2" />
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Item?" message="This inventory item will be permanently deleted." loading={deleteLoading} />
    </div>
  );
};

export default Inventory;

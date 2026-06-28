/**
 * usePageData.js - Generic hook for paginated, searchable data with CRUD
 * Reduces boilerplate across all module pages
 */
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const usePageData = ({
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  initialFilters = {},
  defaultLimit = 10,
  entityName = 'Record',
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchFn({ ...filters, page, limit: defaultLimit });
      setData(res.data.data || res.data.data?.data || []);
      setPagination(res.data.pagination || {});
    } catch {
      toast.error(`Failed to load ${entityName.toLowerCase()}s`);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const openCreate = () => { setEditingItem(null); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingItem(null); };

  const handleCreate = async (formData) => {
    setFormLoading(true);
    try {
      await createFn(formData);
      toast.success(`${entityName} created!`);
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to create ${entityName}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (id, formData) => {
    setFormLoading(true);
    try {
      await updateFn(id, formData);
      toast.success(`${entityName} updated!`);
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to update ${entityName}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteFn(deleteId);
      toast.success(`${entityName} deleted!`);
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error(`Failed to delete ${entityName}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    data, loading, pagination, filters, page, setPage,
    formLoading, deleteId, setDeleteId, deleteLoading,
    modalOpen, editingItem,
    updateFilter, openCreate, openEdit, closeModal,
    handleCreate, handleUpdate, handleDelete,
    fetchData,
  };
};

export default usePageData;

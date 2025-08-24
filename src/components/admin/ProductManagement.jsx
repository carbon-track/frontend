import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from '../../hooks/useTranslation';
import { adminAPI, productAPI } from '../../lib/api';
import { Loader2, Edit, Trash2, PlusCircle, Search, Filter, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert, AlertTitle, AlertDescription } from '../ui/Alert';
import { Pagination } from '../ui/Pagination';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export function ProductManagement() {
  const { t, formatNumber } = useTranslation();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    page: 1,
    limit: 10,
    sort: 'created_at_desc'
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const { data, isLoading, error, isFetching } = useQuery(
    ['adminProducts', filters],
    () => adminAPI.getProducts(filters),
    { keepPreviousData: true }
  );

  const { data: categoriesData } = useQuery('productCategories', () => productAPI.getCategories());

  const createProductMutation = useMutation(
    (newProduct) => adminAPI.createProduct(newProduct),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminProducts');
        toast.success(t('admin.products.createSuccess'));
        setIsModalOpen(false);
      },
      onError: (err) => {
        toast.error(t('admin.products.createFailed'));
        console.error('Product creation failed:', err);
      }
    }
  );

  const updateProductMutation = useMutation(
    ({ id, data }) => adminAPI.updateProduct(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminProducts');
        toast.success(t('admin.products.updateSuccess'));
        setIsModalOpen(false);
        setEditingProduct(null);
      },
      onError: (err) => {
        toast.error(t('admin.products.updateFailed'));
        console.error('Product update failed:', err);
      }
    }
  );

  const deleteProductMutation = useMutation(
    (id) => adminAPI.deleteProduct(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminProducts');
        toast.success(t('admin.products.deleteSuccess'));
      },
      onError: (err) => {
        toast.error(t('admin.products.deleteFailed'));
        console.error('Product deletion failed:', err);
      }
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (product) => {
    if (window.confirm(t('admin.products.confirmDelete', { name: product.name }))) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const products = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};
  const categories = categoriesData?.data?.data || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t('admin.products.title')}</h2>
      <p className="text-muted-foreground">{t('admin.products.description')}</p>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.search')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder={t('admin.products.searchPlaceholder')}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.products.category')}</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">{t('common.all')}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.products.status')}</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">{t('common.all')}</option>
                <option value="active">{t('admin.products.statusActive')}</option>
                <option value="inactive">{t('admin.products.statusInactive')}</option>
                <option value="out_of_stock">{t('admin.products.statusOutOfStock')}</option>
              </select>
            </div>
          </div>
          <Button onClick={handleAddProduct} className="ml-4 self-end">
            <PlusCircle className="h-4 w-4 mr-2" /> {t('admin.products.addProduct')}
          </Button>
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>{t('common.error')}</AlertTitle>
          <AlertDescription>{t('errors.loadFailed')}</AlertDescription>
        </Alert>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold">{t('admin.products.noProductsFound')}</h3>
          <p className="text-muted-foreground mt-2">{t('admin.products.tryDifferentFilters')}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.products.table.image')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.products.table.name')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.products.table.category')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.products.table.price')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.products.table.stock')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.products.table.status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.products.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-gray-300" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{formatNumber(product.price)} {t('common.points')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock === -1 ? t('admin.products.unlimited') : formatNumber(product.stock)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.status === 'active' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('admin.products.statusActive')}
                        </span>
                      ) : product.status === 'out_of_stock' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {t('admin.products.statusOutOfStock')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {t('admin.products.statusInactive')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)} className="mr-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            onPageChange={handlePageChange}
            itemsPerPage={pagination.per_page}
            totalItems={pagination.total_items}
          />
        </>
      )}

      {isModalOpen && (
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          categories={categories}
          onSubmit={editingProduct ? updateProductMutation.mutate : createProductMutation.mutate}
          isSubmitting={createProductMutation.isLoading || updateProductMutation.isLoading}
        />
      )}
    </div>
  );
}

function ProductFormModal({ isOpen, onClose, product, categories, onSubmit, isSubmitting }) {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: product || {
      name: '',
      description: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      price: 0,
      stock: -1,
      image_url: '',
      status: 'active',
      is_featured: false,
    }
  });

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        category_id: product.category_id || (categories.length > 0 ? categories[0].id : ''),
      });
    } else {
      reset({
        name: '',
        description: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        price: 0,
        stock: -1,
        image_url: '',
        status: 'active',
        is_featured: false,
      });
    }
  }, [product, categories, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(product ? { id: product.id, data } : data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">
            {product ? t('admin.products.editProduct') : t('admin.products.addProduct')}
          </h3>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('admin.products.form.name')}</label>
              <Input {...register('name', { required: t('validation.required') })} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('admin.products.form.description')}</label>
              <textarea {...register('description')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('admin.products.form.category')}</label>
              <select {...register('category_id', { required: t('validation.required') })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('admin.products.form.price')}</label>
              <Input type="number" {...register('price', { required: t('validation.required'), valueAsNumber: true, min: { value: 0, message: t('validation.min', { min: 0 }) } })} />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('admin.products.form.stock')}</label>
              <Input type="number" {...register('stock', { required: t('validation.required'), valueAsNumber: true, min: { value: -1, message: t('validation.min', { min: -1 }) } })} />
              <p className="text-xs text-gray-500 mt-1">{t('admin.products.form.stockHint')}</p>
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('admin.products.form.imageUrl')}</label>
              <Input {...register('image_url')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('admin.products.form.status')}</label>
              <select {...register('status')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
                <option value="active">{t('admin.products.statusActive')}</option>
                <option value="inactive">{t('admin.products.statusInactive')}</option>
                <option value="out_of_stock">{t('admin.products.statusOutOfStock')}</option>
              </select>
            </div>
            <div className="flex items-center">
              <input type="checkbox" {...register('is_featured')} className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
              <label className="ml-2 block text-sm text-gray-900">{t('admin.products.form.isFeatured')}</label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


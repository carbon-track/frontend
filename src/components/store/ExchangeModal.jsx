import React, { useState } from 'react';
import { X, ShoppingCart, Package, MapPin, Phone, MessageSquare } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { formatNumber } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import R2Image from '../common/R2Image';

export function ExchangeModal({ product, userPoints, isOpen, onClose, onConfirm, isLoading }) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  if (!isOpen || !product) return null;

  const totalPoints = product.points_required * quantity;
  const canAfford = userPoints >= totalPoints;
  const maxQuantity = product.stock === -1 ? 10 : Math.min(product.stock, Math.floor(userPoints / product.points_required));

  const validateForm = () => {
    const newErrors = {};

    if (quantity < 1 || quantity > maxQuantity) {
      newErrors.quantity = t('store.exchange.invalidQuantity');
    }

    if (!deliveryAddress.trim()) {
      newErrors.deliveryAddress = t('store.exchange.addressRequired');
    }

    if (!contactPhone.trim()) {
      newErrors.contactPhone = t('store.exchange.phoneRequired');
    } else if (!/^1[3-9]\d{9}$/.test(contactPhone.trim())) {
      newErrors.contactPhone = t('store.exchange.invalidPhone');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onConfirm({
      product_id: product.id,
      quantity,
      delivery_address: deliveryAddress.trim(),
      contact_phone: contactPhone.trim(),
      notes: notes.trim()
    });
  };

  const handleQuantityChange = (newQuantity) => {
    const qty = Math.max(1, Math.min(maxQuantity, parseInt(newQuantity) || 1));
    setQuantity(qty);
    if (errors.quantity) {
      setErrors(prev => ({ ...prev, quantity: null }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl">{t('store.exchange.title')}</CardTitle>
              <CardDescription>{t('store.exchange.subtitle')}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 商品信息 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start space-x-4">
                {product.images && product.images.length > 0 && (
                  <R2Image
                    src={/^https?:\/\//.test(product.images[0]) ? product.images[0] : undefined}
                    filePath={!/^https?:\/\//.test(product.images[0]) ? product.images[0] : undefined}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-lg font-bold text-green-600">
                        {formatNumber(product.points_required)}
                      </span>
                      <span className="text-sm text-gray-500">{t('common.points')}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Package className="h-4 w-4" />
                      <span>
                        {product.stock === -1 
                          ? t('store.unlimited') 
                          : t('store.stock', { count: product.stock })
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 数量选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('store.exchange.quantity')}
                </label>
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-20 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= maxQuantity}
                  >
                    +
                  </Button>
                  <span className="text-sm text-gray-500">
                    {t('store.exchange.maxQuantity', { max: maxQuantity })}
                  </span>
                </div>
                {errors.quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                )}
              </div>

              {/* 收货地址 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {t('store.exchange.deliveryAddress')}
                </label>
                <Input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => {
                    setDeliveryAddress(e.target.value);
                    if (errors.deliveryAddress) {
                      setErrors(prev => ({ ...prev, deliveryAddress: null }));
                    }
                  }}
                  placeholder={t('store.exchange.addressPlaceholder')}
                  className={errors.deliveryAddress ? 'border-red-500' : ''}
                />
                {errors.deliveryAddress && (
                  <p className="text-red-500 text-sm mt-1">{errors.deliveryAddress}</p>
                )}
              </div>

              {/* 联系电话 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  {t('store.exchange.contactPhone')}
                </label>
                <Input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => {
                    setContactPhone(e.target.value);
                    if (errors.contactPhone) {
                      setErrors(prev => ({ ...prev, contactPhone: null }));
                    }
                  }}
                  placeholder={t('store.exchange.phonePlaceholder')}
                  className={errors.contactPhone ? 'border-red-500' : ''}
                />
                {errors.contactPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>
                )}
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  {t('store.exchange.notes')} ({t('common.optional')})
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('store.exchange.notesPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              {/* 费用汇总 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>{t('store.exchange.unitPrice')}:</span>
                    <span>{formatNumber(product.points_required)} {t('common.points')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('store.exchange.quantity')}:</span>
                    <span>{quantity}</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>{t('store.exchange.totalCost')}:</span>
                    <span className="text-green-600">
                      {formatNumber(totalPoints)} {t('common.points')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{t('store.exchange.currentPoints')}:</span>
                    <span>{formatNumber(userPoints)} {t('common.points')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>{t('store.exchange.afterExchange')}:</span>
                    <span className={canAfford ? 'text-green-600' : 'text-red-600'}>
                      {formatNumber(userPoints - totalPoints)} {t('common.points')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={!canAfford || isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{t('store.exchange.processing')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span>{t('store.exchange.confirm')}</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


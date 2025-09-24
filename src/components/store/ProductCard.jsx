import React from 'react';
import { ShoppingCart, Star, Package, Clock } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { formatNumber } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import R2Image from '../common/R2Image';
import { Badge } from '../ui/badge';

export function ProductCard({ product, onExchange, userPoints = 0 }) {
  const { t } = useTranslation();

  const canAfford = userPoints >= product.points_required;
  const isAvailable = product.is_available;
  const isInStock = product.stock > 0 || product.stock === -1;

  const getStockStatus = () => {
    if (product.stock === -1) return t('store.unlimited');
    if (product.stock === 0) return t('store.outOfStock');
    if (product.stock <= 5) return t('store.lowStock', { count: product.stock });
    return t('store.inStock', { count: product.stock });
  };

  const getStockColor = () => {
    if (product.stock === -1) return 'text-green-600';
    if (product.stock === 0) return 'text-red-600';
    if (product.stock <= 5) return 'text-orange-600';
    return 'text-green-600';
  };

  const getCategoryIcon = () => {
    const iconMap = {
      'electronics': '📱',
      'books': '📚',
      'lifestyle': '🎁',
      'food': '🍎',
      'sports': '⚽',
      'travel': '✈️',
      'eco': '🌱',
      'default': '🎁'
    };
    return iconMap[product.category] || iconMap.default;
  };

  return (
    <Card className={`h-full transition-all duration-200 hover:shadow-lg ${
      !isAvailable || !canAfford ? 'opacity-75' : 'hover:scale-105'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getCategoryIcon()}</span>
            <div>
              <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {t(`store.categories.${product.category}`, product.category)}
              </CardDescription>
            </div>
          </div>
          {product.is_featured && (
            <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
              <Star className="h-3 w-3 fill-current" />
              <span>{t('store.featured')}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 商品图片 */}
        {product.images && product.images.length > 0 && (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <R2Image
              src={/^https?:\/\//.test(product.images[0]) ? product.images[0] : undefined}
              filePath={!/^https?:\/\//.test(product.images[0]) ? product.images[0] : undefined}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>

        {Array.isArray(product.tags) && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.map((tag, index) => (
              <Badge key={`product-tag-${product.id}-${tag.id ?? tag.slug ?? index}`} variant="secondary" className="text-xs uppercase">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        {/* 积分和库存信息 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-green-600">
                {formatNumber(product.points_required)}
              </span>
              <span className="text-sm text-gray-500">{t('common.points')}</span>
            </div>
            <div className={`flex items-center space-x-1 text-sm ${getStockColor()}`}>
              <Package className="h-4 w-4" />
              <span>{getStockStatus()}</span>
            </div>
          </div>

          {/* 兑换统计 */}
          {product.total_exchanged > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{t('store.exchangedCount', { count: product.total_exchanged })}</span>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="pt-2">
          {!isAvailable ? (
            <Button disabled className="w-full">
              {t('store.unavailable')}
            </Button>
          ) : !isInStock ? (
            <Button disabled className="w-full">
              {t('store.outOfStock')}
            </Button>
          ) : !canAfford ? (
            <Button disabled className="w-full">
              <span className="flex items-center justify-center space-x-2">
                <span>{t('store.insufficientPoints')}</span>
                <span className="text-xs">
                  ({t('store.need')} {formatNumber(product.points_required - userPoints)})
                </span>
              </span>
            </Button>
          ) : (
            <Button 
              onClick={() => onExchange(product)} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t('store.exchange.button')}
            </Button>
          )}
        </div>

        {/* 用户积分提示 */}
        {canAfford && isAvailable && isInStock && (
          <div className="text-xs text-center text-gray-500">
            {t('store.afterExchange')}: {formatNumber(userPoints - product.points_required)} {t('common.points')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

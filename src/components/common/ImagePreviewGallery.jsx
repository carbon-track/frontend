import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { getPresignedReadUrl } from '../../lib/fileAccess';

/**
 * 通用图片预览组件
 * props:
 *  images: Array<{url?:string, public_url?:string, file_path?:string, original_name?:string} | string>
 *  maxThumbnails?: number
 *  size?: 'sm'|'md'
 */
export function ImagePreviewGallery({ images, maxThumbnails = 3, size = 'sm', className = '' }) {
  const { t } = useTranslation();
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const isEmpty = !Array.isArray(images) || images.length === 0;
  const [resolved, setResolved] = useState([]);
  const [loadingMap, setLoadingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});

  useEffect(() => {
    let cancelled = false;
    async function resolveAll() {
      const tasks = (images || []).map(async (raw) => {
        if (typeof raw === 'string') {
          return { url: raw };
        }
        const base = raw || {};
        // 若已有明确的url(可能是公开)直接使用
        if (base.url || base.public_url) {
          return { url: base.url || base.public_url, original_name: base.original_name };
        }
        if (base.file_path) {
          try {
            setLoadingMap(m => ({ ...m, [base.file_path]: true }));
            const signed = await getPresignedReadUrl(base.file_path, 600);
            if (cancelled) return null;
            return { url: signed, original_name: base.original_name, file_path: base.file_path };
          } catch (e) {
            if (!cancelled) setErrorMap(err => ({ ...err, [base.file_path]: e.message || '加载失败' }));
            return null;
          } finally {
            if (!cancelled) setLoadingMap(m => ({ ...m, [base.file_path]: false }));
          }
        }
        return null;
      });
      const res = (await Promise.all(tasks)).filter(Boolean).filter(i => i.url);
      if (!cancelled) setResolved(res);
    }
    resolveAll();
    return () => { cancelled = true; };
  }, [JSON.stringify(images)]);

  const norm = resolved;

  if (isEmpty || norm.length === 0) {
    return (
      <div className={`text-xs text-gray-400 italic flex items-center gap-1 ${className}`}>
        <ImageIcon className="h-3 w-3" /> {t('images.none', 'No images')}
      </div>
    );
  }

  if (norm.length === 0) {
    return null;
  }

  const thumbSizeClass = size === 'sm' ? 'h-12 w-12' : 'h-20 w-20';
  const toDisplay = norm.slice(0, maxThumbnails);
  const overflow = norm.length - toDisplay.length;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {toDisplay.map((img, idx) => (
        <button
          key={idx}
          type="button"
            className={`relative border rounded-md overflow-hidden bg-gray-50 hover:ring-2 hover:ring-green-500 transition ${thumbSizeClass}`}
          onClick={() => setLightboxIndex(idx)}
          title={img.original_name || t('images.clickToPreview', 'Click to preview')}
        >
          {loadingMap[img.file_path] && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-500 bg-gray-100">...</div>
          )}
          {errorMap[img.file_path] && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-red-500 bg-gray-50 text-center px-1">ERR</div>
          )}
          <img
            src={img.url}
            alt={img.original_name || `image-${idx}`}
            className="object-cover w-full h-full"
            loading="lazy"
          />
          {overflow > 0 && idx === toDisplay.length - 1 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-semibold">
              +{overflow}
            </div>
          )}
        </button>
      ))}

      {lightboxIndex >= 0 && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col">
          <div className="flex justify-end p-3">
            <button
              onClick={() => setLightboxIndex(-1)}
              className="text-white/80 hover:text-white p-2"
              aria-label={t('common.close', 'Close')}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 pb-6 select-none">
            <button
              disabled={lightboxIndex === 0}
              onClick={() => setLightboxIndex(i => Math.max(0, i - 1))}
              className="p-3 text-white/70 hover:text-white disabled:opacity-30"
              aria-label={t('images.prev', 'Previous')}
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
            <img
              src={norm[lightboxIndex].url}
              alt={norm[lightboxIndex].original_name || `image-${lightboxIndex}`}
              className="max-h-[75vh] max-w-[85vw] object-contain shadow-2xl rounded-md"
            />
            <button
              disabled={lightboxIndex === norm.length - 1}
              onClick={() => setLightboxIndex(i => Math.min(norm.length - 1, i + 1))}
              className="p-3 text-white/70 hover:text-white disabled:opacity-30"
              aria-label={t('images.next', 'Next')}
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          </div>
          <div className="pb-4 text-center text-white text-xs opacity-80">
            {t('images.counter', '{{current}} / {{total}}', { current: lightboxIndex + 1, total: norm.length })}
          </div>
        </div>
      )}
    </div>
  );
}

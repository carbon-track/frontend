import React, { useState, useMemo } from 'react';
import { useSystemLogs, useSystemLogDetail } from '../../hooks/useSystemLogs';

function JsonViewer({ data }) {
  const json = useMemo(() => {
    try { return JSON.stringify(data, null, 2); } catch { return String(data); }
  }, [data]);
  return (
    <pre className="bg-gray-900 text-green-300 text-xs p-4 rounded overflow-auto max-h-96">
      {json}
    </pre>
  );
}

export default function SystemLogsPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [selectedId, setSelectedId] = useState(null);
  const { data, isLoading, error } = useSystemLogs(filters);
  const { data: detailData, isLoading: loadingDetail } = useSystemLogDetail(selectedId);

  const logs = data?.data?.logs || data?.data?.data?.logs || data?.data?.logs || [];
  const pagination = data?.data?.pagination || data?.data?.data?.pagination || {};

  const updateFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  const copy = (text) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">系统请求日志</h1>

      <div className="grid md:grid-cols-6 gap-2 text-sm">
        <input placeholder="方法" className="border p-2 rounded" onChange={e=>updateFilter('method', e.target.value)} />
        <input placeholder="状态码" className="border p-2 rounded" onChange={e=>updateFilter('status_code', e.target.value)} />
        <input placeholder="用户ID" className="border p-2 rounded" onChange={e=>updateFilter('user_id', e.target.value)} />
        <input placeholder="路径包含" className="border p-2 rounded" onChange={e=>updateFilter('path', e.target.value)} />
        <input placeholder="Request ID" className="border p-2 rounded" onChange={e=>updateFilter('request_id', e.target.value)} />
        <input type="date" className="border p-2 rounded" onChange={e=>updateFilter('date_from', e.target.value)} />
        <input type="date" className="border p-2 rounded" onChange={e=>updateFilter('date_to', e.target.value)} />
      </div>

      {isLoading && <div>加载中...</div>}
      {error && <div className="text-red-500">加载失败</div>}

      <div className="overflow-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">方法</th>
              <th className="p-2 text-left">路径</th>
              <th className="p-2 text-left">状态</th>
              <th className="p-2 text-left">用户</th>
              <th className="p-2 text-left">耗时(ms)</th>
              <th className="p-2 text-left">时间</th>
              <th className="p-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{log.id}</td>
                <td className="p-2">{log.method}</td>
                <td className="p-2 font-mono text-xs max-w-xs truncate" title={log.path}>{log.path}</td>
                <td className="p-2">{log.status_code}</td>
                <td className="p-2">{log.user_id || '-'}</td>
                <td className="p-2">{log.duration_ms}</td>
                <td className="p-2">{log.created_at}</td>
                <td className="p-2 space-x-2">
                  <button className="text-blue-600" onClick={()=>setSelectedId(log.id)}>详情</button>
                  <button className="text-gray-600" onClick={()=>copy(log.request_id)}>复制ReqID</button>
                </td>
              </tr>
            ))}
            {logs.length === 0 && !isLoading && (
              <tr><td colSpan={8} className="p-4 text-center text-gray-500">暂无数据</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center space-x-2 text-sm">
        <button disabled={filters.page <= 1} onClick={()=>setFilters(f=>({...f, page: f.page - 1}))} className="px-3 py-1 border rounded disabled:opacity-50">上一页</button>
        <div>第 {pagination.current_page || filters.page} / {pagination.total_pages || '?'} 页</div>
        <button disabled={pagination.current_page >= pagination.total_pages} onClick={()=>setFilters(f=>({...f, page: (f.page || 1) + 1}))} className="px-3 py-1 border rounded disabled:opacity-50">下一页</button>
      </div>

      {selectedId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-4xl p-6 space-y-4 relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={()=>setSelectedId(null)}>✕</button>
            <h2 className="text-xl font-semibold">日志详情 #{selectedId}</h2>
            {loadingDetail && <div>加载详情...</div>}
            {detailData?.data && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Request ID:</strong> {detailData.data.request_id}</div>
                  <div><strong>Method:</strong> {detailData.data.method}</div>
                  <div className="md:col-span-2"><strong>Path:</strong> {detailData.data.path}</div>
                  <div><strong>Status:</strong> {detailData.data.status_code}</div>
                  <div><strong>User:</strong> {detailData.data.user_id || '-'}</div>
                  <div><strong>Duration:</strong> {detailData.data.duration_ms} ms</div>
                  <div className="md:col-span-2"><strong>Created:</strong> {detailData.data.created_at}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Request Body</h3>
                    <button className="text-blue-600 text-xs" onClick={()=>copy(detailData.data.request_body)}>复制</button>
                  </div>
                  <JsonViewer data={detailData.data.request_body} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Response Body</h3>
                    <button className="text-blue-600 text-xs" onClick={()=>copy(detailData.data.response_body)}>复制</button>
                  </div>
                  <JsonViewer data={detailData.data.response_body} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

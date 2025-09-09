/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/prop-types */
import React, { useState, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { useSystemLogDetail } from '../../hooks/useSystemLogs';
import { useLogSearch } from '../../hooks/useLogSearch';

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
  const [q, setQ] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeTypes, setActiveTypes] = useState(['system','audit','error']);
  const [limitPerType, setLimitPerType] = useState(50);
  const [selectedSystemId, setSelectedSystemId] = useState(null);
  const { data, isLoading, error } = useLogSearch({ q, date_from: dateFrom, date_to: dateTo, types: activeTypes, limit_per_type: limitPerType });
  const { data: detailData, isLoading: loadingDetail } = useSystemLogDetail(selectedSystemId);

  const copy = (text) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
  };

  const system = data?.data?.system?.items || [];
  const audit = data?.data?.audit?.items || [];
  const errorLogs = data?.data?.error?.items || [];

  const toggleType = (t) => {
    setActiveTypes(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t]);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">统一日志中心</h1>

      <div className="flex flex-wrap gap-2 text-sm items-end">
        <div className="flex flex-col">
          <label htmlFor="log-q" className="text-xs text-gray-500">关键字</label>
          <input id="log-q" value={q} onChange={e=>setQ(e.target.value)} placeholder="关键字 (路径 / action / 错误信息)" className="border p-2 rounded w-64" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="date-from" className="text-xs text-gray-500">起始日期</label>
          <input id="date-from" type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="border p-2 rounded" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="date-to" className="text-xs text-gray-500">结束日期</label>
          <input id="date-to" type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="border p-2 rounded" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="limit-per" className="text-xs text-gray-500">每类条数</label>
            <input id="limit-per" type="number" value={limitPerType} min={1} max={200} onChange={e=>setLimitPerType(Number(e.target.value)||50)} className="border p-2 rounded w-28" />
        </div>
        <div className="flex items-center gap-2">
          {['system','audit','error'].map(t => (
            <label key={t} className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={activeTypes.includes(t)} onChange={()=>toggleType(t)} /> {t}
            </label>
          ))}
        </div>
      </div>

      {isLoading && <div>加载中...</div>}
      {error && <div className="text-red-500">加载失败</div>}

      <div className="space-y-8">
        <LogSection title="System Logs" items={system} emptyText="无系统日志" renderItem={(log) => (
          <tr key={log.id} className="border-t hover:bg-gray-50">
            <td className="p-2">{log.id}</td>
            <td className="p-2">{log.method}</td>
            <td className="p-2 font-mono text-xs max-w-xs truncate" title={log.path}>{log.path}</td>
            <td className="p-2">{log.status_code}</td>
            <td className="p-2">{log.user_id || '-'}</td>
            <td className="p-2">{log.duration_ms}</td>
            <td className="p-2">{log.created_at}</td>
            <td className="p-2 space-x-2">
              <button className="text-blue-600" onClick={()=>setSelectedSystemId(log.id)}>详情</button>
              <button className="text-gray-600" onClick={()=>copy(log.request_id)}>复制ReqID</button>
            </td>
          </tr>
        )} />

        <LogSection title="Audit Logs" items={audit} emptyText="无审计日志" renderItem={(log) => (
          <ExpandableRow key={`audit-${log.id}`} summaryCells={[
            log.id, log.actor_type, log.action, (log.operation_category || '-'), log.status, (log.user_id || '-'), (log.ip_address || '-'), log.created_at
          ]} detail={<AuditDetail log={log} />} />
        )} />

        <LogSection title="Error Logs" items={errorLogs} emptyText="无错误日志" renderItem={(log) => (
          <ExpandableRow key={`error-${log.id}`} summaryCells={[
            log.id, log.error_type, <span className="font-mono text-[10px] max-w-[240px] inline-block truncate" title={log.error_message}>{log.error_message}</span>, (log.error_file?.split('/').pop()), log.error_line, log.error_time
          ]} detail={<ErrorDetail log={log} />} />
        )} />
      </div>

  {selectedSystemId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-4xl p-6 space-y-4 relative">
    <button className="absolute top-2 right-2 text-gray-500" onClick={()=>setSelectedSystemId(null)}>✕</button>
    <h2 className="text-xl font-semibold">系统日志详情 #{selectedSystemId}</h2>
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
                {detailData.data.server_meta && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Server Meta</h3>
                      <button className="text-blue-600 text-xs" onClick={()=>copy(detailData.data.server_meta)}>复制</button>
                    </div>
                    <JsonViewer data={detailData.data.server_meta} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 简化: 这里不强制 PropTypes, 禁用校验告警
// eslint-disable-next-line react/prop-types
function LogSection({ title, items, emptyText, renderItem }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">{title} <span className="text-xs text-gray-500">({items.length})</span></h2>
      <div className="overflow-auto border rounded">
        <table className="w-full text-xs">
          <thead className="bg-gray-100">
            <tr>
              {title === 'System Logs' && <>
                <Th>ID</Th><Th>方法</Th><Th>路径</Th><Th>状态</Th><Th>用户</Th><Th>耗时</Th><Th>时间</Th><Th>操作</Th>
              </>}
              {title === 'Audit Logs' && <>
                <Th>ID</Th><Th>类型</Th><Th>Action</Th><Th>分类</Th><Th>状态</Th><Th>用户</Th><Th>IP</Th><Th>时间</Th>
              </>}
              {title === 'Error Logs' && <>
                <Th>ID</Th><Th>类型</Th><Th>信息</Th><Th>文件</Th><Th>行</Th><Th>时间</Th>
              </>}
            </tr>
          </thead>
          <tbody>
            {items.map(renderItem)}
            {items.length === 0 && (
              <tr><td colSpan={12} className="p-4 text-center text-gray-500">{emptyText}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// eslint-disable-next-line react/prop-types
function Th({ children }) { return <th className="p-2 text-left whitespace-nowrap">{children}</th>; }

// 可展开行组件
function ExpandableRow({ summaryCells, detail }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <tr className={`border-t hover:bg-gray-50 ${open ? 'bg-gray-50' : ''}`}> 
        {summaryCells.map((c,i)=>(<td key={i} className="p-2 align-top">{c}</td>))}
        <td className="p-2 text-right">
          <button className="text-xs text-blue-600" onClick={()=>setOpen(o=>!o)}>{open? '收起' : '展开'}</button>
        </td>
      </tr>
      {open && (
        <tr className="bg-gray-50/60">
          <td colSpan={summaryCells.length+1} className="p-3 border-t">
            {detail}
          </td>
        </tr>
      )}
    </>
  );
}

function AuditDetail({ log }) {
  return (
    <div className="space-y-2 text-xs">
      <KeyVal k="ID" v={log.id} />
      <KeyVal k="Action" v={log.action} />
      <KeyVal k="Category" v={log.operation_category || '-'} />
      <KeyVal k="Actor Type" v={log.actor_type} />
      <KeyVal k="Status" v={log.status} />
      {log.details_raw && <JsonBlock title="details_raw" data={log.details_raw} />}
      {log.summary && <JsonBlock title="summary" data={log.summary} />}
    </div>
  );
}

function ErrorDetail({ log }) {
  return (
    <div className="space-y-2 text-xs">
      <KeyVal k="ID" v={log.id} />
      <KeyVal k="Type" v={log.error_type} />
      <KeyVal k="File" v={log.error_file} />
      <KeyVal k="Line" v={log.error_line} />
      <JsonBlock title="message" data={log.error_message} />
      {log.stack_trace && <pre className="text-[10px] bg-black/80 text-green-300 p-2 rounded overflow-auto max-h-64 whitespace-pre-wrap">{log.stack_trace}</pre>}
      {log.context_json && <JsonBlock title="context" data={log.context_json} />}
    </div>
  );
}

function KeyVal({ k, v }) { return <div><span className="font-semibold mr-2">{k}:</span><span className="font-mono break-all">{String(v ?? '-')}</span></div>; }
function JsonBlock({ title, data }) { return <div><div className="font-semibold mb-1">{title}</div><JsonViewer data={data} /></div>; }

import api from '../api';

// Unified log search: system / audit / error
// params: { q, date_from, date_to, types, limit_per_type }
export async function searchLogs(params = {}) {
  const { q, date_from, date_to, types, limit_per_type } = params;
  const query = new URLSearchParams();
  if (q) query.append('q', q);
  if (date_from) query.append('date_from', date_from);
  if (date_to) query.append('date_to', date_to);
  if (types && types.length) query.append('types', types.join(','));
  if (limit_per_type) query.append('limit_per_type', limit_per_type);
  const res = await api.get(`/admin/logs/search?${query.toString()}`);
  return res.data;
}

'use client';

import { useEffect, useState } from 'react';

interface Asset {
  id: string;
  code: string;
  name: string;
  description: string;
  assetType: string;
  status: string;
  areaM2: string;
  currency: string;
  currentPrice: string;
  owner: string;
}

interface TimelineEvent {
  id: string;
  previousStatus: string;
  newStatus: string;
  actionType: string;
  details: string;
  createdAt: string;
}

export default function InventoryAdminPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Estados modal Timeline
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    assetType: 'LOT',
    areaM2: '',
    currentPrice: '',
    currency: 'USD',
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    async function loadAssets() {
      try {
        setLoading(true);
        const res = await fetch('/api/assets', { signal: controller.signal, cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        if (!isMounted) return;

        if (json.success) {
          setAssets(json.data);
          setError(null);
        } else {
          setError(json.error || 'Error reportado por la API');
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Fallo de conexión';
        setError(`Error al consultar inventario: ${msg}`);
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) setLoading(false);
      }
    }

    loadAssets();

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [refreshKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setIsOpen(false);
        setFormData({
          code: '',
          name: '',
          description: '',
          assetType: 'LOT',
          areaM2: '',
          currentPrice: '',
          currency: 'USD',
        });
        setRefreshKey((prev) => prev + 1);
      } else {
        alert(`Error al guardar: ${data.error}`);
      }
    } catch {
      alert('Error en la comunicación con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusTransition = async (id: string, nextStatus: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/assets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextStatus }),
      });
      const data = await res.json();

      if (data.success) {
        setRefreshKey((prev) => prev + 1);
      } else {
        alert(`Error en transición: ${data.error}`);
      }
    } catch {
      alert('Error al comunicar con la API de estados');
    } finally {
      setActionLoadingId(null);
    }
  };

  const viewTimeline = async (asset: Asset) => {
    setSelectedAsset(asset);
    setLoadingTimeline(true);
    try {
      const res = await fetch(`/api/assets/${asset.id}/timeline`);
      const json = await res.json();
      if (json.success) {
        setTimeline(json.data);
      }
    } catch {
      alert('Error al cargar la línea de tiempo');
    } finally {
      setLoadingTimeline(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'IN_REVIEW':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'DRAFT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'RESERVED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'SOLD':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Ola 1 · Sprint 2
              </span>
              <span className="text-xs text-slate-400">Célula Alpha</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              ZENPLUS OS — Catálogo de Inventario
            </h1>
            <p className="text-sm text-slate-400">
              Gestión del ciclo de vida, auditoría de estados y timeline
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Neon DB Conectado
            </span>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg font-semibold text-xs tracking-wide transition-colors cursor-pointer"
            >
              + Nuevo Inmueble (DRAFT)
            </button>
          </div>
        </header>

        {loading && (
          <div className="p-12 text-center text-slate-400 animate-pulse">
            Consultando base de datos Neon...
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-sm flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="underline hover:text-white text-xs cursor-pointer ml-4"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/60 text-slate-300 uppercase text-xs tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Código</th>
                    <th className="px-6 py-3.5">Inmueble / Descripción</th>
                    <th className="px-6 py-3.5">Tipo</th>
                    <th className="px-6 py-3.5">Área (m²)</th>
                    <th className="px-6 py-3.5">Precio Vigente</th>
                    <th className="px-6 py-3.5">Estado</th>
                    <th className="px-6 py-3.5 text-center">Acciones del Ciclo</th>
                    <th className="px-6 py-3.5 text-center">Auditoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-amber-400">
                        {asset.code}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{asset.name}</div>
                        <div className="text-xs text-slate-400 truncate max-w-xs">
                          {asset.description || 'Sin descripción'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                        {asset.assetType}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {asset.areaM2 ? `${asset.areaM2} m²` : '-'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {asset.currency}{' '}
                        {Number(asset.currentPrice).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                            asset.status
                          )}`}
                        >
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {actionLoadingId === asset.id ? (
                          <span className="text-xs text-slate-400 animate-pulse">
                            Actualizando...
                          </span>
                        ) : asset.status === 'DRAFT' ? (
                          <button
                            onClick={() => handleStatusTransition(asset.id, 'IN_REVIEW')}
                            className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1.5 rounded font-medium transition cursor-pointer shadow-sm"
                          >
                            Enviar a Revisión →
                          </button>
                        ) : asset.status === 'IN_REVIEW' ? (
                          <button
                            onClick={() => handleStatusTransition(asset.id, 'AVAILABLE')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded font-medium transition cursor-pointer shadow-sm"
                          >
                            Aprobar Disponible ✓
                          </button>
                        ) : asset.status === 'AVAILABLE' ? (
                          <span className="text-xs text-emerald-400 font-medium">
                            ● Listo para Venta
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => viewTimeline(asset)}
                          className="text-xs text-slate-300 hover:text-amber-400 bg-slate-800 border border-slate-700 hover:border-amber-500/50 px-2.5 py-1 rounded transition cursor-pointer"
                        >
                          Ver Timeline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Timeline / Auditoría INV-009 */}
        {selectedAsset && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white">Línea de Tiempo / Auditoría</h2>
                  <p className="text-xs text-slate-400">
                    Activo: <span className="font-mono text-amber-400">{selectedAsset.code}</span> — {selectedAsset.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="text-slate-400 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {loadingTimeline ? (
                <div className="p-6 text-center text-xs text-slate-400">Cargando eventos...</div>
              ) : timeline.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No hay transiciones registradas aún para este activo.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {timeline.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="font-semibold text-amber-400">{event.actionType}</span>
                        <span>{new Date(event.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-slate-200">
                        Cambio: <span className="text-slate-400 line-through">{event.previousStatus}</span> →{' '}
                        <span className="font-bold text-emerald-400">{event.newStatus}</span>
                      </div>
                      <p className="text-slate-400 italic">{event.details}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Registro INV-001 */}
        {isOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white">Registrar Activo (Ticket INV-001)</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Código Único *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. LOT-ZN-004"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Tipo de Activo *</label>
                    <select
                      value={formData.assetType}
                      onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="LOT">Lote (LOT)</option>
                      <option value="APARTMENT">Departamento (APARTMENT)</option>
                      <option value="COMMERCIAL">Local Comercial (COMMERCIAL)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Nombre Comercial *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Lote Residencial C-15"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Área (m²)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="120.00"
                      value={formData.areaM2}
                      onChange={(e) => setFormData({ ...formData, areaM2: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Precio (USD) *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      placeholder="38000.00"
                      value={formData.currentPrice}
                      onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    placeholder="Detalles sobre el lote, entorno o equipamiento..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded text-xs transition-colors cursor-pointer"
                  >
                    {submitting ? 'Guardando en DB...' : 'Crear en DRAFT'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
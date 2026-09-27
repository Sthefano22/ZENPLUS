'use client';

import { useEffect, useState } from 'react';

interface Asset {
  id: string;
  code: string;
  title?: string;
  name?: string;
  description: string | null;
  assetType?: string;
  price?: string | number;
  currentPrice?: string | number;
  area?: string | number;
  areaM2?: string | number;
  commercialStatus?: string;
  publicationStatus?: string;
  status?: string;
  holdExpiresAt?: string | null;
  currency?: string;
  owner?: string;
}

interface ProjectSummary {
  projectId: string;
  projectName: string;
  projectCode: string;
  district: string;
  city: string;
  totalUnits: number;
  availableUnits: number;
  reservedUnits: number;
  soldUnits: number;
  minPrice: string;
  maxPrice: string;
  availabilityPercentage: string;
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

  const [projects, setProjects] = useState<ProjectSummary[]>([]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    async function loadData() {
      try {
        setLoading(true);
        const [assetsRes, projectsRes] = await Promise.all([
          fetch('/api/assets', { signal: controller.signal, cache: 'no-store' }),
          fetch('/api/projects', { signal: controller.signal, cache: 'no-store' }),
        ]);

        if (!assetsRes.ok) throw new Error(`HTTP ${assetsRes.status}`);

        const assetsJson = await assetsRes.json();
        if (projectsRes.ok) {
          const projectsJson = await projectsRes.json();
          if (projectsJson.success && isMounted) {
            setProjects(projectsJson.data);
          }
        }

        if (!isMounted) return;

        if (assetsJson.success) {
          setAssets(assetsJson.data);
          setError(null);
        } else {
          setError(assetsJson.error || 'Error reportado por la API');
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

    loadData();

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
      case 'RESERVATION_HOLD':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse';
      case 'IN_REVIEW':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'DRAFT':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
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
                Fase 2 · Commercial Engine
              </span>
              <span className="text-xs text-slate-400">Célula Alpha · ALP2-005 al ALP2-010</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              ZENPLUS OS — Motor de Disponibilidad e Inventario
            </h1>
            <p className="text-sm text-slate-400">
              Proyección de reservas (Hold), concurrencia atómica, agregación de proyectos y eventos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Neon DB Conectado
            </span>
          </div>
        </header>

        {/* Sección de Proyectos y Disponibilidad Agregada (ALP2-006) */}
        {projects.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Disponibilidad Agregada por Proyecto (Ticket ALP2-006)
              </h2>
              <span className="text-xs text-slate-500">{projects.length} Proyectos Registrados</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => (
                <div
                  key={p.projectId}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-mono text-amber-400 font-semibold">{p.projectCode}</span>
                      <h3 className="text-base font-bold text-white mt-0.5">{p.projectName}</h3>
                      <p className="text-xs text-slate-400">
                        {p.district}, {p.city}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {p.availabilityPercentage}% Libre
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-center">
                    <div className="bg-slate-950/60 rounded p-2">
                      <div className="text-xs text-slate-500">Total</div>
                      <div className="text-sm font-bold text-white">{p.totalUnits}</div>
                    </div>
                    <div className="bg-slate-950/60 rounded p-2">
                      <div className="text-xs text-emerald-400">Disponibles</div>
                      <div className="text-sm font-bold text-emerald-400">{p.availableUnits}</div>
                    </div>
                    <div className="bg-slate-950/60 rounded p-2">
                      <div className="text-xs text-amber-400">Reservadas</div>
                      <div className="text-sm font-bold text-amber-400">{p.reservedUnits}</div>
                    </div>
                    <div className="bg-slate-950/60 rounded p-2">
                      <div className="text-xs text-rose-400">Vendidas</div>
                      <div className="text-sm font-bold text-rose-400">{p.soldUnits}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center text-xs text-slate-400">
                    <span>Rango de Precios:</span>
                    <span className="font-semibold text-white">
                      ${Number(p.minPrice).toLocaleString()} — ${Number(p.maxPrice).toLocaleString()} USD
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-sm font-bold text-white">
                Catálogo de Inmuebles y Proyección de Disponibilidad
              </h2>
              <span className="text-xs text-slate-400">{assets.length} Inmuebles en Neon DB</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/60 text-slate-300 uppercase text-xs tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Código</th>
                    <th className="px-6 py-3.5">Inmueble / Título</th>
                    <th className="px-6 py-3.5">Área (m²)</th>
                    <th className="px-6 py-3.5">Precio Vigente (USD)</th>
                    <th className="px-6 py-3.5">Estado Comercial</th>
                    <th className="px-6 py-3.5 text-center">Auditoría / Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {assets.map((asset) => {
                    const title = asset.title || asset.name || 'Sin título';
                    const price = Number(asset.price || asset.currentPrice || 0);
                    const area = asset.area || asset.areaM2;
                    const status = asset.commercialStatus || asset.status || 'DRAFT';

                    return (
                      <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-amber-400">
                          {asset.code}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{title}</div>
                          <div className="text-xs text-slate-400 truncate max-w-xs">
                            {asset.description || 'Sin descripción'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {area ? `${area} m²` : '-'}
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">
                          ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                                status
                              )}`}
                            >
                              {status === 'RESERVATION_HOLD' ? '⏳ RESERVATION HOLD' : status}
                            </span>
                            {asset.holdExpiresAt && (
                              <span className="text-[10px] text-amber-400/80 font-mono">
                                Hold activo hasta {new Date(asset.holdExpiresAt).toLocaleTimeString()}
                              </span>
                            )}
                          </div>
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
                    );
                  })}
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
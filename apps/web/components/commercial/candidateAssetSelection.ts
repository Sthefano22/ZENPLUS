import { trackEvent } from '@/lib/analytics'

// TODO(GAM2-003): conectar con el selector real de activos candidatos cuando
// Alpha publique GET /inventory/eligible. Por ahora solo se deja listo el
// evento de analytics que el selector deberá llamar al seleccionar un activo.
export function trackCandidateAssetSelected(opportunityId: string, propiedadSlug: string) {
  trackEvent('candidate_asset_selected', { opportunityId, propiedadSlug })
}
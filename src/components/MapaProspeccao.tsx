import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/useAppStore"
import { corMarcadorPorScore } from "@/lib/utils"

// Importação dinâmica do Leaflet para evitar problemas com SSR
let L: typeof import("leaflet") | null = null

function criarIconePersonalizado(cor: string) {
  if (!L) return undefined
  
  // SVG do marcador personalizado
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z" 
            fill="${cor}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
    </svg>
  `
  
  return L.divIcon({
    html: svgIcon,
    className: "",
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  })
}

export function MapaProspeccao() {
  const { empresasFiltradas, carregando } = useAppStore()
  const mapaRef = useRef<import("leaflet").Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Carrega Leaflet de forma assíncrona
    async function inicializarMapa() {
      if (!containerRef.current || mapaRef.current) return
      
      const leaflet = await import("leaflet")
      L = leaflet

      // Corrige ícone padrão do Leaflet (bug conhecido com Webpack/Vite)
      delete (leaflet.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      // Cria o mapa
      const mapa = leaflet.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      })

      // Tile layer escuro personalizado
      leaflet.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }
      ).addTo(mapa)

      // Posição inicial (Brasil)
      mapa.setView([-15.7801, -47.9292], 5)

      mapaRef.current = mapa
    }

    inicializarMapa()

    return () => {
      if (mapaRef.current) {
        mapaRef.current.remove()
        mapaRef.current = null
      }
    }
  }, [])

  // Atualiza marcadores quando as empresas mudam
  useEffect(() => {
    if (!mapaRef.current || !L) return

    const mapa = mapaRef.current

    // Remove camadas de marcadores existentes
    mapa.eachLayer((layer) => {
      if (layer instanceof L!.Marker) {
        mapa.removeLayer(layer)
      }
    })

    if (empresasFiltradas.length === 0) return

    const marcadores: import("leaflet").Marker[] = []

    empresasFiltradas.forEach((empresa) => {
      if (!empresa.latitude || !empresa.longitude) return
      if (!L) return

      const cor = corMarcadorPorScore(empresa.score)
      const icone = criarIconePersonalizado(cor)

      const estrelas = "★".repeat(Math.round(empresa.score)) + "☆".repeat(5 - Math.round(empresa.score))

      const popupConteudo = `
        <div style="min-width: 200px; font-family: system-ui, sans-serif;">
          <p style="font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #e2e8f0;">
            ${empresa.nome}
          </p>
          <p style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
            📍 ${empresa.bairro}, ${empresa.cidade}
          </p>
          ${empresa.telefone
            ? `<p style="font-size: 12px; color: #68d391; margin-bottom: 4px;">📞 ${empresa.telefone}</p>`
            : '<p style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Sem telefone</p>'
          }
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #34383f; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 14px; color: #d4b06a; letter-spacing: 1px;">${estrelas}</span>
            <span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; background: ${cor}22; color: ${cor}; border: 1px solid ${cor}44;">
              ${empresa.score}/5
            </span>
          </div>
        </div>
      `

      const marcador = icone
        ? L!.marker([empresa.latitude, empresa.longitude], { icon: icone })
        : L!.marker([empresa.latitude, empresa.longitude])

      marcador.bindPopup(popupConteudo, { maxWidth: 240 })
      marcador.addTo(mapa)
      marcadores.push(marcador)
    })

    // Centraliza o mapa nos marcadores
    if (marcadores.length > 0) {
      const grupo = L.featureGroup(marcadores)
      mapa.fitBounds(grupo.getBounds().pad(0.15), { maxZoom: 14 })
    }
  }, [empresasFiltradas])

  if (carregando) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Mapa */}
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-border/60 bg-[#0e0f12]"
        style={{
          height: "400px",
          backgroundImage: "radial-gradient(circle, hsl(var(--border)) 0.6px, transparent 0.6px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Estado vazio */}
      {empresasFiltradas.length === 0 && !carregando && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-xl pointer-events-none">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma empresa para exibir</p>
          </div>
        </div>
      )}
    </div>
  )
}

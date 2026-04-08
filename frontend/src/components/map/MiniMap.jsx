import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function MiniMap({ center, markers = [], zoom = 12, height = 280, onClick }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRefs = useRef([]);

  useEffect(() => {
    if (!center) return;

    if (map.current) {
      const lng = parseFloat(center?.lng);
      const lat = parseFloat(center?.lat);
      if (!isNaN(lng) && !isNaN(lat)) {
        map.current.flyTo({ center: [lng, lat], zoom });
      }
    } else {
      const lng = parseFloat(center?.lng);
      const lat = parseFloat(center?.lat);
      if (isNaN(lng) || isNaN(lat)) return;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [lng, lat],
        zoom: zoom,
        interactive: false,
      });

      map.current.on('click', () => {
        if (onClick) onClick();
      });
    }

    // Cleanup old markers
    markerRefs.current.forEach(m => m.remove());
    markerRefs.current = [];

    // Add new markers
    markers.filter(s => s && s.latitude && s.longitude).forEach(station => {
      const lng = parseFloat(station.longitude);
      const lat = parseFloat(station.latitude);
      if (isNaN(lng) || isNaN(lat)) return;

      const el = document.createElement('div');
      el.className = 'marker';

      const isOpen = station.isOpen;
      const pct = station.fuels?.[0]?.stockPercent || 0;
      let color = '#64748b'; // default gray
      if (!isOpen) color = '#ef4444'; // red if closed
      else if (pct > 60) color = '#22c55e'; // green if high stock
      else if (pct > 25) color = '#f59e0b'; // orange if low stock
      else color = '#ef4444'; // red if out of stock

      el.style.backgroundColor = color;
      el.style.width = '14px';
      el.style.height = '14px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid #fff';
      el.style.boxShadow = `0 0 6px ${color}`;

      const m = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(map.current);
      markerRefs.current.push(m);
    });

  }, [center, markers, zoom]);

  useEffect(() => {
    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ height, width: '100%', cursor: onClick ? 'pointer' : 'default' }}
    />
  );
}

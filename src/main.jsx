import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App.jsx'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

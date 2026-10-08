'use client'

import { useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  Bell,
  BookOpen,
  Boxes,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  CloudUpload,
  FileCheck2,
  FileText,
  Filter,
  Globe2,
  Grid2X2,
  LayoutDashboard,
  ListFilter,
  Map,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Table2,
  UserRound,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Documents', icon: FileText, count: '28' },
  { label: 'Processing', icon: Activity, count: '06' },
  { label: 'Land records', icon: Table2 },
  { label: 'Validation', icon: ShieldCheck, count: '12' },
  { label: 'Verification', icon: ClipboardCheck, count: '19' },
  { label: 'View your land', icon: Map, active: true },
  { label: 'GIS / Map', icon: Globe2 },
  { label: 'Exports', icon: Boxes },
  { label: 'Analytics', icon: Activity },
]

const parcels = [
  { id: '123/1', x: 10, y: 28, w: 26, h: 20, tone: 'light' },
  { id: '123/2', x: 37, y: 22, w: 20, h: 30, tone: 'selected' },
  { id: '123/3', x: 58, y: 17, w: 23, h: 25, tone: 'light' },
  { id: '124/1', x: 78, y: 44, w: 14, h: 22, tone: 'light' },
  { id: '122/4', x: 19, y: 51, w: 19, h: 23, tone: 'light' },
  { id: '122/5', x: 39, y: 55, w: 24, h: 20, tone: 'light' },
  { id: '125/2', x: 64, y: 49, w: 14, h: 26, tone: 'light' },
]

function StatusPill({ children, tone = 'green' }: { children: React.ReactNode; tone?: 'green' | 'amber' | 'slate' }) {
  return <span className={`status-pill status-${tone}`}><span className="status-dot" />{children}</span>
}

export function LandRecordApp() {
  const [collapsed, setCollapsed] = useState(false)
  const [showLayers, setShowLayers] = useState(false)
  const [view, setView] = useState<'2D' | '3D'>('2D')
  const [selected, setSelected] = useState(['123/2'])
  const [district, setDistrict] = useState('Anakapalli')
  const [mandal, setMandal] = useState('Nakkapalle')
  const [village, setVillage] = useState('Uddandapuram')

  function toggleParcel(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><span /><span /><span /></div>
          {!collapsed && <div><div className="brand-name">Bhumi</div><div className="brand-subtitle">Land intelligence</div></div>}
        </div>
        <button className="collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar"><PanelLeftClose /></button>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon, count, active }) => <button key={label} className={`nav-item ${active ? 'nav-active' : ''}`} title={collapsed ? label : undefined}><Icon />{!collapsed && <><span>{label}</span>{count && <b>{count}</b>}</>}</button>)}
        </nav>
        {!collapsed && <div className="sidebar-bottom"><div className="help-card"><CircleHelp /><div><strong>Need assistance?</strong><span>Read the field guide</span></div><ArrowUpRight /></div><button className="nav-item"><Settings2 /><span>Settings</span></button></div>}
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="mobile-brand"><button className="icon-button"><Menu /></button><strong>Bhumi</strong></div>
          <div className="global-search"><Search /><input placeholder="Search records, survey numbers..." aria-label="Global search" /><kbd>⌘ K</kbd></div>
          <div className="topbar-actions"><button className="icon-button"><Bell /><span className="notification-dot" /></button><div className="user-profile"><div className="avatar">RS</div><div className="user-copy"><strong>Ravi Sharma</strong><span>Survey officer</span></div><ChevronDown /></div></div>
        </header>

        <main className="page-content">
          <div className="page-heading"><div><div className="eyebrow"><LayoutDashboard /> Overview / Land viewer</div><h1>View your land</h1><p>Find, inspect and understand cadastral parcels across Andhra Pradesh.</p></div><div className="heading-actions"><button className="outline-button"><CloudUpload /> Upload record</button><button className="primary-button"><Plus /> New search</button></div></div>

          <section className="metric-grid" aria-label="Land record statistics">
            <div className="metric-card"><div className="metric-icon icon-moss"><Map /></div><span>Digitized parcels</span><strong>8,214</strong><small><span className="trend-up">↑ 12.8%</span> vs last month</small></div>
            <div className="metric-card"><div className="metric-icon icon-amber"><FileCheck2 /></div><span>Verified records</span><strong>9,842</strong><small><span className="trend-up">↑ 8.4%</span> this month</small></div>
            <div className="metric-card"><div className="metric-icon icon-slate"><ClipboardCheck /></div><span>Pending verification</span><strong>1,238</strong><small><span className="trend-down">↓ 4.2%</span> from last week</small></div>
            <div className="metric-card"><div className="metric-icon icon-coral"><Sparkles /></div><span>Low confidence</span><strong>342</strong><small><span className="trend-up">↑ 2.1%</span> needs review</small></div>
          </section>

          <section className="viewer-layout">
            <div className="search-card panel-card">
              <div className="panel-heading"><div><h2>Find a parcel</h2><p>Search with administrative details</p></div><button className="more-button"><MoreHorizontal /></button></div>
              <div className="breadcrumb"><span>Andhra Pradesh</span><b>›</b><span>{district}</span><b>›</b><span>{village}</span></div>
              <label>State<select defaultValue="Andhra Pradesh"><option>Andhra Pradesh</option><option>Telangana</option><option>Karnataka</option></select></label>
              <label>District<select value={district} onChange={(e) => setDistrict(e.target.value)}><option>Anakapalli</option><option>Visakhapatnam</option><option>Vizianagaram</option><option>East Godavari</option></select></label>
              <div className="field-grid"><label>Mandal<select value={mandal} onChange={(e) => setMandal(e.target.value)}><option>Nakkapalle</option><option>Payakaraopeta</option><option>Rambilli</option></select></label><label>Village<select value={village} onChange={(e) => setVillage(e.target.value)}><option>Uddandapuram</option><option>Rajayyapeta</option><option>Chinadoddigallu</option></select></label></div>
              <label>Survey number<div className="input-with-icon"><Search /><input defaultValue="123" placeholder="e.g. 123/2" /></div></label>
              <label>Subdivision <span className="optional">Optional</span><input placeholder="e.g. 1A" /></label>
              <button className="find-button"><Search /> Find land <span>↵</span></button>
              <div className="search-note"><ShieldCheck /><span>Search results are sourced from connected land-record datasets.</span></div>
            </div>

            <div className="map-card panel-card">
              <div className="map-header"><div><div className="map-kicker"><span className="live-dot" /> LIVE MAP VIEW</div><h2>Uddandapuram village</h2><p>{district} district · {mandal} mandal</p></div><div className="map-header-actions"><div className="view-toggle"><button className={view === '2D' ? 'toggle-active' : ''} onClick={() => setView('2D')}>2D</button><button className={view === '3D' ? 'toggle-active' : ''} onClick={() => setView('3D')}>3D</button></div><button className="icon-button"><SlidersHorizontal /></button></div></div>
              <div className={`map-canvas ${view === '3D' ? 'map-3d' : ''}`}>
                <div className="map-water" /><div className="map-road road-one" /><div className="map-road road-two" /><div className="map-label label-village">Uddandapuram</div><div className="map-label label-road">NH 16</div>
                <div className="parcel-grid">{parcels.map((parcel) => <button key={parcel.id} onClick={() => toggleParcel(parcel.id)} className={`parcel parcel-${parcel.tone} ${selected.includes(parcel.id) ? 'parcel-selected' : ''}`} style={{ left: `${parcel.x}%`, top: `${parcel.y}%`, width: `${parcel.w}%`, height: `${parcel.h}%` }}><span>{parcel.id}</span></button>)}</div>
                <div className="map-compass">N</div><div className="map-controls"><button><ZoomIn /></button><button><ZoomOut /></button><span /></div><div className="map-scale">500 m</div>
                <div className="map-toolbar"><button><Search /><span>Search</span></button><button><ListFilter /><span>Select</span></button><button onClick={() => setShowLayers(!showLayers)}><Grid2X2 /><span>Layers</span></button><button><SlidersHorizontal /><span>Measure</span></button></div>
                {showLayers && <div className="layers-popover"><strong>Map layers</strong><label><input type="checkbox" defaultChecked /> Cadastral parcels</label><label><input type="checkbox" defaultChecked /> Survey labels</label><label><input type="checkbox" defaultChecked /> Roads</label><label><input type="checkbox" /> Satellite imagery</label><label><input type="checkbox" defaultChecked /> Village boundary</label></div>}
              </div>
              <div className="map-footer"><div className="legend"><span><i className="legend-selected" /> Selected parcel</span><span><i className="legend-official" /> Official cadastral</span><span><i className="legend-reference" /> Reference layer</span></div><span className="map-source"><ShieldCheck /> AP Government dataset · verified</span></div>
            </div>

            <aside className="parcel-card panel-card"><div className="parcel-topline"><StatusPill>Verified</StatusPill><button className="more-button"><MoreHorizontal /></button></div><div className="parcel-title"><span className="parcel-number">123/2</span><span>Survey number</span></div><div className="area-block"><strong>1.24</strong><span>acres<br /><small>5,018 sq. m.</small></span></div><div className="parcel-details"><div><span>Village</span><strong>Uddandapuram</strong></div><div><span>Land use</span><strong>Agricultural</strong></div><div><span>Recorded holder</span><strong>R. Srinivasa Rao</strong></div><div><span>Last updated</span><strong>18 Aug 2024</strong></div></div><div className="provenance"><div className="provenance-icon"><ShieldCheck /></div><div><span>DATA PROVENANCE</span><strong>Official cadastral boundary</strong><small>AP Government dataset · Verified</small></div></div><div className="parcel-actions"><button className="outline-button">View full record <ArrowUpRight /></button><button className="text-button">View history</button></div></aside>
          </section>

          <section className="bottom-grid"><div className="activity-card panel-card"><div className="panel-heading"><div><h2>Recent activity</h2><p>Latest actions across your workspace</p></div><button className="text-button">View all <ArrowUpRight /></button></div><div className="activity-list"><div className="activity-row"><div className="activity-avatar avatar-moss"><Check /></div><div><strong>Parcel 123/2 verified</strong><span>Ravi Sharma · 12 minutes ago</span></div><StatusPill>Verified</StatusPill></div><div className="activity-row"><div className="activity-avatar avatar-amber"><Sparkles /></div><div><strong>AI extraction completed</strong><span>Land_Record_123.pdf · 42 minutes ago</span></div><StatusPill tone="amber">Review</StatusPill></div><div className="activity-row"><div className="activity-avatar avatar-slate"><CloudUpload /></div><div><strong>New document uploaded</strong><span>Mutation_register_08.pdf · 1 hour ago</span></div><StatusPill tone="slate">Processing</StatusPill></div></div></div><div className="progress-card panel-card"><div className="panel-heading"><div><h2>Digitization progress</h2><p>District-wise completion</p></div><button className="more-button"><Filter /></button></div><div className="progress-summary"><strong>74.8%</strong><span><b>+6.2%</b> this quarter</span></div><div className="progress-bars"><div><span>Anakapalli <b>86%</b></span><i><em style={{ width: '86%' }} /></i></div><div><span>Visakhapatnam <b>74%</b></span><i><em style={{ width: '74%' }} /></i></div><div><span>Vizianagaram <b>61%</b></span><i><em style={{ width: '61%' }} /></i></div><div><span>East Godavari <b>48%</b></span><i><em style={{ width: '48%' }} /></i></div></div></div></section>
        </main>
      </div>
    </div>
  )
}

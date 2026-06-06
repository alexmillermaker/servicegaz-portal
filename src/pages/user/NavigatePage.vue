<script setup lang="ts">
import { ref, computed } from 'vue'
import MobileNavigation from '@/widgets/MobileNavigation.vue'
import AppPageHeader from '@/shared/ui/AppPageHeader.vue'
import AppNotificationsDrawer from '@/shared/ui/AppNotificationsDrawer.vue'
import { useHaptic } from '@/shared/composables/useHaptic'
import { useSwipeDismiss } from '@/shared/composables/useSwipeDismiss'
import { useNotifications } from '@/shared/composables/useNotifications'

const haptic = useHaptic()
const sheetSwipe = useSwipeDismiss(() => { showPointsList.value = false })
const { unreadCount } = useNotifications()
const showNotifications = ref(false)

const buildings = [
  { id: 'b1', label: 'Корпус 1', sub: 'Главный корпус' },
  { id: 'b2', label: 'Корпус 2', sub: 'Производственный' },
]
const floors = [
  { id: 1, label: 'Этаж 1' },
  { id: 2, label: 'Этаж 2' },
]

const selectedBuilding = ref(buildings[0])
const selectedFloor = ref(floors[0])
const showBuildingPicker = ref(false)
const showFloorPicker = ref(false)
const showPointsList = ref(false)
const selectingStart = ref(false)

type PointCategory = 'office' | 'service' | 'wc' | 'shower' | 'locker' | 'stairs' | 'start' | 'storage' | 'corridor' | 'security'

interface MapPoint {
  id: string
  x: number
  y: number
  label: string
  room: string
  category: PointCategory
  floor: number
  building: string
}

// ── Корпус 1, Этаж 1. ViewBox 1190.55 × 841.89 ──────────────
// Планировка (слева → направо):
//
// ВЕРХНИЙ РЯД (y=228..387):
//   [12 Конструкторский | 11 Муж.раздевалка | WC/Душ 2×2 | 6 Жен.раздевалка | 4 Переговорная | 2 Мед кабинет]
//
// КОРИДОР (y=387..467)
//
// НИЖНИЙ РЯД (y=467..655):
//   [14 ОТиЗ | (лестница) | 13 Техдиректор | 15 Технологический | 5а Техн.пом | 5б Техн.пом | (лестница) | 3 Охрана | 1 Отдел кадров]
//
// Коридорные узлы (category='corridor') связывают всё через BFS

const allPoints: MapPoint[] = [
  // ── Верхний ряд (y=228..387, center y≈308) ──────────────────────
  { id: 'design',     x: 178,  y: 308, label: 'Конструкторский отдел', room: 'Каб. 103', category: 'office',   floor: 1, building: 'b1' },
  { id: 'locker_m',   x: 387,  y: 308, label: 'Мужская раздевалка',    room: 'Каб. 104', category: 'locker',   floor: 1, building: 'b1' },
  { id: 'wc_m',       x: 546,  y: 268, label: 'Санузел (М)',           room: 'WC',       category: 'wc',       floor: 1, building: 'b1' },
  { id: 'wc_f',       x: 592,  y: 268, label: 'Санузел (Ж)',           room: 'WC',       category: 'wc',       floor: 1, building: 'b1' },
  { id: 'shower_m',   x: 546,  y: 348, label: 'Душевая (М)',           room: 'Душ',      category: 'shower',   floor: 1, building: 'b1' },
  { id: 'shower_f',   x: 592,  y: 348, label: 'Душевая (Ж)',           room: 'Душ',      category: 'shower',   floor: 1, building: 'b1' },
  { id: 'locker_f',   x: 684,  y: 308, label: 'Женская раздевалка',    room: 'Каб. 106', category: 'locker',   floor: 1, building: 'b1' },
  { id: 'meeting',    x: 920,  y: 336, label: 'Переговорный кабинет',  room: 'Каб. 108', category: 'office',   floor: 1, building: 'b1' },
  { id: 'medic',      x: 1041, y: 307, label: 'Мед кабинет',          room: 'Каб. 109', category: 'service',  floor: 1, building: 'b1' },
  // ── Нижний ряд (y=467..655, center y≈561) ────────────────────
  { id: 'otiz',       x: 190,  y: 561, label: 'ОТиЗ',                 room: 'Каб. 101', category: 'office',   floor: 1, building: 'b1' },
  { id: 'techdir',    x: 432,  y: 561, label: 'Технический директор',  room: 'Каб. 102', category: 'office',   floor: 1, building: 'b1' },
  { id: 'tech_dept',  x: 603,  y: 561, label: 'Технологический отдел', room: 'Каб. 201', category: 'office',   floor: 1, building: 'b1' },
  { id: 'tech_room1', x: 710,  y: 561, label: 'Техническое помещение', room: 'Тех. 1',   category: 'storage',  floor: 1, building: 'b1' },
  { id: 'tech_room2', x: 766,  y: 561, label: 'Техническое помещение', room: 'Тех. 2',   category: 'storage',  floor: 1, building: 'b1' },
  { id: 'security',   x: 947,  y: 561, label: 'Пост охраны',           room: 'Охрана',   category: 'security', floor: 1, building: 'b1' },
  { id: 'hr',         x: 1031, y: 561, label: 'Отдел кадров',          room: 'Каб. 205', category: 'office',   floor: 1, building: 'b1' },
  // ── Коридорные узлы (y=427) ──────────────────────────────────
  { id: 'c_otiz',     x: 185,  y: 427, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_locker_m', x: 387,  y: 427, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_techdir',  x: 432,  y: 427, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_wcs',      x: 548,  y: 427, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_showers',  x: 592,  y: 427, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_design',   x: 603,  y: 427, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_locker_f', x: 684,  y: 427, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_tech1',    x: 710,  y: 427, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_tech2',    x: 766,  y: 427, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_security', x: 947,  y: 427, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_right',    x: 963,  y: 427, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_hr',       x: 1031, y: 427, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'start',      x: 595,  y: 427, label: 'Вход / Коридор',       room: 'Коридор',  category: 'start',    floor: 1, building: 'b1' },
]

const visiblePoints = computed(() =>
  allPoints.filter(p => p.floor === selectedFloor.value.id && p.building === selectedBuilding.value.id && p.category !== 'corridor')
)

// Единый коридорный хребет y=128 (x: 39→396), обе строки комнат подключены к ближайшему узлу
const edges: [string, string][] = [
  // Коридорный хребет (слева → направо, y=427)
  ['c_otiz',     'c_locker_m'],
  ['c_locker_m', 'c_techdir'],
  ['c_techdir',  'c_wcs'],
  ['c_wcs',      'c_showers'],
  ['c_showers',  'start'],
  ['start',      'c_design'],
  ['c_design',   'c_locker_f'],
  ['c_locker_f', 'c_tech1'],
  ['c_tech1',    'c_tech2'],
  ['c_tech2',    'c_security'],
  ['c_security', 'c_right'],
  ['c_right',    'c_hr'],
  // Верхний ряд → коридор
  ['design',     'c_otiz'],
  ['locker_m',   'c_locker_m'],
  ['wc_m',       'c_wcs'],
  ['shower_m',   'c_wcs'],
  ['wc_f',       'c_showers'],
  ['shower_f',   'c_showers'],
  ['locker_f',   'c_locker_f'],
  ['meeting',    'c_right'],
  ['medic',      'c_right'],
  // Нижний ряд → коридор
  ['otiz',       'c_otiz'],
  ['techdir',    'c_techdir'],
  ['tech_dept',  'c_design'],
  ['tech_room1', 'c_tech1'],
  ['tech_room2', 'c_tech2'],
  ['security',   'c_security'],
  ['hr',         'c_hr'],
]

function findPath(from: string, to: string): string[] {
  const adj: Record<string, string[]> = {}
  for (const [a, b] of edges) {
    ;(adj[a] ??= []).push(b)
    ;(adj[b] ??= []).push(a)
  }
  const queue = [[from]]
  const visited = new Set([from])
  while (queue.length) {
    const path = queue.shift()!
    if (path[path.length - 1] === to) return path
    for (const nb of adj[path[path.length - 1]] ?? []) {
      if (!visited.has(nb)) { visited.add(nb); queue.push([...path, nb]) }
    }
  }
  return []
}

const targetId  = ref<string | null>(null)
const startId   = ref('start')

const targetPoint = computed(() => allPoints.find(p => p.id === targetId.value))
const startPoint  = computed(() => allPoints.find(p => p.id === startId.value))

const routePath = computed<string[]>(() =>
  targetId.value ? findPath(startId.value, targetId.value) : []
)

function svgRoutePath(): string {
  if (routePath.value.length < 2) return ''
  const pts = routePath.value.map(id => allPoints.find(p => p.id === id)!).filter(Boolean)
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

function selectPoint(id: string) {
  haptic.tap()
  if (selectingStart.value) {
    startId.value = id
    selectingStart.value = false
    targetId.value = null
    showPointsList.value = false
    return
  }
  if (id === startId.value) return
  targetId.value = targetId.value === id ? null : id
  showPointsList.value = false
}

function changeBuilding(b: typeof buildings[0]) {
  selectedBuilding.value = b
  showBuildingPicker.value = false
  targetId.value = null
  startId.value = 'start'
}
function changeFloor(f: typeof floors[0]) {
  selectedFloor.value = f
  showFloorPicker.value = false
  targetId.value = null
  startId.value = 'start'
}

const zoom = ref(1)
function zoomIn()  { zoom.value = Math.min(zoom.value + 0.25, 2.5); haptic.tap() }
function zoomOut() { zoom.value = Math.max(zoom.value - 0.25, 0.6); haptic.tap() }

let pinchStartDist = 0, pinchStartZoom = 1
function getPinchDist(e: TouchEvent) {
  const [t1, t2] = [e.touches[0], e.touches[1]]
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
}
function onMapTouchStart(e: TouchEvent) { if (e.touches.length === 2) { pinchStartDist = getPinchDist(e); pinchStartZoom = zoom.value } }
function onMapTouchMove(e: TouchEvent) {
  if (e.touches.length === 2) { e.preventDefault(); zoom.value = Math.min(Math.max(pinchStartZoom * getPinchDist(e) / pinchStartDist, 0.6), 2.5) }
}
function onMapTouchEnd(e: TouchEvent) { if (e.touches.length < 2) pinchStartDist = 0 }

const categoryLabels: Record<string, string> = {
  office: 'Офис', service: 'Медицина', wc: 'Санузел', shower: 'Душевая',
  locker: 'Раздевалка', start: 'Вход', storage: 'Тех. помещение',
  security: 'Охрана',
}
const categoryColors: Record<string, { background: string; color: string }> = {
  office:   { background: '#dbeafe', color: '#1d4ed8' },
  service:  { background: '#d1fae5', color: '#065f46' },
  wc:       { background: '#f0fdf4', color: '#166534' },
  shower:   { background: '#e0f2fe', color: '#0369a1' },
  locker:   { background: '#ede9fe', color: '#6d28d9' },
  start:    { background: '#dcfce7', color: '#15803d' },
  storage:  { background: '#f8fafc', color: '#475569' },
  security: { background: '#fff7ed', color: '#c2410c' },
}

function pointIcon(cat: string): string {
  const icons: Record<string, string> = {
    office:   'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    service:  'M22 12h-4l-3 9L9 3l-3 9H2',
    wc:       'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    shower:   'M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2',
    locker:   'M20 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z',
    start:    'M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    storage:  'M5 8h14M5 8a2 2 0 1 0 0-4h14a2 2 0 1 0 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8',
    security: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  }
  return icons[cat] ?? icons.office
}

const hasMapForCurrentView = computed(() =>
  allPoints.some(p => p.floor === selectedFloor.value.id && p.building === selectedBuilding.value.id && p.category !== 'corridor')
)

function roomFill(id: string, _default: string): string {
  if (targetId.value === id) return 'rgba(59,130,246,0.22)'
  if (startId.value === id) return 'rgba(34,197,94,0.22)'
  return 'rgba(0,0,0,0)'
}
function roomStroke(id: string, _default: string): string {
  if (targetId.value === id) return '#3b82f6'
  if (startId.value === id) return '#22c55e'
  return 'rgba(0,0,0,0)'
}

function labelX(pt: MapPoint) { return Math.min(Math.max(pt.x - 80, 16), 1020) }
function labelY(pt: MapPoint) { return Math.max(pt.y - 100, 8) }
</script>

<template>
  <div class="nav-page">
    <AppPageHeader subtitle="UNITorg SG · СЕРВИСГАЗ" bell :badge-count="unreadCount" @bell-click="showNotifications = true" />
    <AppNotificationsDrawer :open="showNotifications" @close="showNotifications = false" />

    <div class="nav-page__top">
      <h1 class="nav-page__title">Навигация</h1>
      <div class="nav-page__selectors">
        <div class="nav-page__select-wrap" @click="showBuildingPicker = !showBuildingPicker; showFloorPicker = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
          <div class="nav-page__select-text">
            <span class="nav-page__select-main">{{ selectedBuilding.label }}</span>
            <span class="nav-page__select-sub">{{ selectedBuilding.sub }}</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="nav-page__select-wrap" @click="showFloorPicker = !showFloorPicker; showBuildingPicker = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          <div class="nav-page__select-text">
            <span class="nav-page__select-main">{{ selectedFloor.label }}</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <button class="nav-page__points-btn" @click="showPointsList = !showPointsList">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          Список
        </button>
      </div>
    </div>

    <Transition name="dropdown">
      <div v-if="showBuildingPicker" class="nav-page__picker">
        <button v-for="b in buildings" :key="b.id" class="nav-page__picker-item" :class="{ 'is-selected': selectedBuilding.id === b.id }" @click="changeBuilding(b)">
          <span>{{ b.label }}</span>
          <span class="nav-page__picker-sub">{{ b.sub }}</span>
          <svg v-if="selectedBuilding.id === b.id" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      </div>
    </Transition>

    <Transition name="dropdown">
      <div v-if="showFloorPicker" class="nav-page__picker">
        <button v-for="f in floors" :key="f.id" class="nav-page__picker-item" :class="{ 'is-selected': selectedFloor.id === f.id }" @click="changeFloor(f)">
          <span>{{ f.label }}</span>
          <svg v-if="selectedFloor.id === f.id" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      </div>
    </Transition>

    <!-- Карта -->
    <div class="nav-page__map-container" @touchstart="onMapTouchStart" @touchmove.prevent="onMapTouchMove" @touchend="onMapTouchEnd">

      <div v-if="!hasMapForCurrentView" class="nav-page__no-map">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
        <p>Схема для {{ selectedBuilding.label }}, {{ selectedFloor.label }} пока не загружена</p>
      </div>

      <div v-else class="nav-page__map-inner" :style="{ transform: `scale(${zoom})`, transformOrigin: 'top center' }">
        <!--
          ViewBox 420 × 270
          Верхний ряд: y=10..110   Коридор: y=110..148   Нижний ряд: y=148..258
        -->
        <svg viewBox="0 0 1190.55 841.89" class="nav-page__svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="rgba(0,0,0,0.13)"/>
            </filter>
          </defs>

          <!-- Архитектурный план (фон) -->
          <image href="/maps/b1_floor1.svg" x="0" y="0" width="1190.55" height="841.89"/>

          <!-- ═══ ВЕРХНИЙ РЯД (y=228..387) ═══ -->

          <!-- Конструкторский отдел (12) -->
          <rect x="107" y="228" width="143" height="159"
            :fill="roomFill('design','')" :stroke="roomStroke('design','')"
            stroke-width="3" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('design')"/>
          <text x="178" y="293" text-anchor="middle" font-size="18" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Конструктор-</text>
          <text x="178" y="313" text-anchor="middle" font-size="18" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">ский отдел</text>
          <text x="178" y="333" text-anchor="middle" font-size="14" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 103</text>

          <!-- Мужская раздевалка (11) -->
          <rect x="250" y="228" width="274" height="159"
            :fill="roomFill('locker_m','')" :stroke="roomStroke('locker_m','')"
            stroke-width="3" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('locker_m')"/>
          <text x="387" y="293" text-anchor="middle" font-size="20" fill="#6d28d9" font-family="sans-serif" font-weight="700" style="pointer-events:none">Мужская</text>
          <text x="387" y="315" text-anchor="middle" font-size="20" fill="#6d28d9" font-family="sans-serif" font-weight="700" style="pointer-events:none">раздевалка</text>
          <text x="387" y="336" text-anchor="middle" font-size="14" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 104</text>

          <!-- Кластер WC/Душевые 2×2 (x=524..616, y=228..387) -->
          <rect x="524" y="228" width="44" height="79"
            :fill="roomFill('wc_m','')" :stroke="roomStroke('wc_m','')"
            stroke-width="2" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('wc_m')"/>
          <text x="546" y="262" text-anchor="middle" font-size="14" fill="#166534" font-family="sans-serif" font-weight="700" style="pointer-events:none">WC М</text>

          <rect x="568" y="228" width="48" height="79"
            :fill="roomFill('wc_f','')" :stroke="roomStroke('wc_f','')"
            stroke-width="2" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('wc_f')"/>
          <text x="592" y="262" text-anchor="middle" font-size="14" fill="#166534" font-family="sans-serif" font-weight="700" style="pointer-events:none">WC Ж</text>

          <rect x="524" y="307" width="44" height="80"
            :fill="roomFill('shower_m','')" :stroke="roomStroke('shower_m','')"
            stroke-width="2" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('shower_m')"/>
          <text x="546" y="342" text-anchor="middle" font-size="13" fill="#0369a1" font-family="sans-serif" font-weight="700" style="pointer-events:none">Душ М</text>

          <rect x="568" y="307" width="48" height="80"
            :fill="roomFill('shower_f','')" :stroke="roomStroke('shower_f','')"
            stroke-width="2" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('shower_f')"/>
          <text x="592" y="342" text-anchor="middle" font-size="13" fill="#0369a1" font-family="sans-serif" font-weight="700" style="pointer-events:none">Душ Ж</text>

          <!-- Женская раздевалка (6) -->
          <rect x="616" y="228" width="137" height="159"
            :fill="roomFill('locker_f','')" :stroke="roomStroke('locker_f','')"
            stroke-width="3" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('locker_f')"/>
          <text x="684" y="293" text-anchor="middle" font-size="19" fill="#9d174d" font-family="sans-serif" font-weight="700" style="pointer-events:none">Женская</text>
          <text x="684" y="314" text-anchor="middle" font-size="19" fill="#9d174d" font-family="sans-serif" font-weight="700" style="pointer-events:none">раздевалка</text>
          <text x="684" y="334" text-anchor="middle" font-size="14" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 106</text>

          <!-- Правое крыло: Переговорный (4) и Мед кабинет (2) -->
          <rect x="842" y="285" width="156" height="102"
            :fill="roomFill('meeting','')" :stroke="roomStroke('meeting','')"
            stroke-width="3" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('meeting')"/>
          <text x="920" y="328" text-anchor="middle" font-size="17" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Переговорная</text>
          <text x="920" y="348" text-anchor="middle" font-size="14" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 108</text>

          <rect x="998" y="228" width="86" height="159"
            :fill="roomFill('medic','')" :stroke="roomStroke('medic','')"
            stroke-width="3" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('medic')"/>
          <text x="1041" y="295" text-anchor="middle" font-size="17" fill="#065f46" font-family="sans-serif" font-weight="700" style="pointer-events:none">Мед</text>
          <text x="1041" y="313" text-anchor="middle" font-size="17" fill="#065f46" font-family="sans-serif" font-weight="700" style="pointer-events:none">каб.</text>
          <text x="1041" y="330" text-anchor="middle" font-size="13" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 109</text>

          <!-- ═══ НИЖНИЙ РЯД (y=467..655) ═══ -->

          <!-- ОТиЗ (14) -->
          <rect x="107" y="467" width="165" height="188"
            :fill="roomFill('otiz','')" :stroke="roomStroke('otiz','')"
            stroke-width="3" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('otiz')"/>
          <text x="190" y="548" text-anchor="middle" font-size="20" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">ОТиЗ</text>
          <text x="190" y="569" text-anchor="middle" font-size="14" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 101</text>

          <!-- Технический директор (13), после левой лестницы x=272..340 -->
          <rect x="340" y="467" width="184" height="188"
            :fill="roomFill('techdir','')" :stroke="roomStroke('techdir','')"
            stroke-width="3" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('techdir')"/>
          <text x="432" y="541" text-anchor="middle" font-size="18" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Технический</text>
          <text x="432" y="561" text-anchor="middle" font-size="18" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">директор</text>
          <text x="432" y="581" text-anchor="middle" font-size="14" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 102</text>

          <!-- Технологический отдел (15) -->
          <rect x="524" y="467" width="157" height="188"
            :fill="roomFill('tech_dept','')" :stroke="roomStroke('tech_dept','')"
            stroke-width="3" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('tech_dept')"/>
          <text x="603" y="541" text-anchor="middle" font-size="18" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Технологи-</text>
          <text x="603" y="561" text-anchor="middle" font-size="18" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">ческий</text>
          <text x="603" y="581" text-anchor="middle" font-size="18" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">отдел</text>
          <text x="603" y="600" text-anchor="middle" font-size="14" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 201</text>

          <!-- Тех. помещение 1 (5а) -->
          <rect x="681" y="467" width="58" height="188"
            :fill="roomFill('tech_room1','')" :stroke="roomStroke('tech_room1','')"
            stroke-width="3" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('tech_room1')"/>
          <text x="710" y="546" text-anchor="middle" font-size="16" fill="#475569" font-family="sans-serif" font-weight="700" style="pointer-events:none">Тех.</text>
          <text x="710" y="564" text-anchor="middle" font-size="16" fill="#475569" font-family="sans-serif" font-weight="700" style="pointer-events:none">пом.</text>
          <text x="710" y="581" text-anchor="middle" font-size="14" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">5а</text>

          <!-- Тех. помещение 2 (5б) -->
          <rect x="739" y="467" width="54" height="188"
            :fill="roomFill('tech_room2','')" :stroke="roomStroke('tech_room2','')"
            stroke-width="3" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('tech_room2')"/>
          <text x="766" y="546" text-anchor="middle" font-size="16" fill="#475569" font-family="sans-serif" font-weight="700" style="pointer-events:none">Тех.</text>
          <text x="766" y="564" text-anchor="middle" font-size="16" fill="#475569" font-family="sans-serif" font-weight="700" style="pointer-events:none">пом.</text>
          <text x="766" y="581" text-anchor="middle" font-size="14" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">5б</text>

          <!-- Пост охраны (3), после правой лестницы x=793..915 -->
          <rect x="915" y="467" width="63" height="188"
            :fill="roomFill('security','')" :stroke="roomStroke('security','')"
            stroke-width="3" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('security')"/>
          <text x="947" y="546" text-anchor="middle" font-size="16" fill="#c2410c" font-family="sans-serif" font-weight="700" style="pointer-events:none">Пост</text>
          <text x="947" y="564" text-anchor="middle" font-size="16" fill="#c2410c" font-family="sans-serif" font-weight="700" style="pointer-events:none">охраны</text>

          <!-- Отдел кадров (1) -->
          <rect x="978" y="467" width="106" height="188"
            :fill="roomFill('hr','')" :stroke="roomStroke('hr','')"
            stroke-width="3" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('hr')"/>
          <text x="1031" y="544" text-anchor="middle" font-size="18" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Отдел</text>
          <text x="1031" y="564" text-anchor="middle" font-size="18" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">кадров</text>
          <text x="1031" y="583" text-anchor="middle" font-size="14" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 205</text>

          <!-- ═══ КОРИДОР ═══ -->
          <text x="500" y="432" text-anchor="middle" font-size="18" fill="#8592a8" font-family="sans-serif" letter-spacing="8" style="pointer-events:none">К О Р И Д О Р</text>

          <!-- ═══ МАРШРУТ ═══ -->
          <path v-if="routePath.length > 1"
            :d="svgRoutePath()"
            fill="none" stroke="#0079C2" stroke-width="8"
            stroke-linecap="round" stroke-linejoin="round"
            stroke-dasharray="16 8" class="route-anim"
          />

          <!-- ═══ МАРКЕР СТАРТА ═══ -->
          <circle :cx="startPoint!.x" :cy="startPoint!.y" r="20" fill="#0079C2" stroke="white" stroke-width="4"/>
          <circle :cx="startPoint!.x" :cy="startPoint!.y" r="8"  fill="white"/>
          <rect :x="startPoint!.x - 42" :y="startPoint!.y - 50" width="84" height="28" rx="14" fill="white" stroke="#c8d5e8" stroke-width="1.5"/>
          <text :x="startPoint!.x" :y="startPoint!.y - 30" text-anchor="middle" font-size="17" fill="#0079C2" font-family="sans-serif" font-weight="700" style="pointer-events:none">Старт</text>

          <!-- ═══ МАРКЕР ЦЕЛИ ═══ -->
          <template v-if="targetPoint">
            <circle :cx="targetPoint.x" :cy="targetPoint.y" r="36" fill="rgba(0,121,194,0.12)" class="pulse-anim"/>
            <path
              :transform="`translate(${targetPoint.x - 14}, ${targetPoint.y - 34})`"
              d="M14 0C6 0 0 6 0 14c0 10 14 24 14 24s14-14 14-24c0-8-6-14-14-14z"
              fill="#0079C2" stroke="white" stroke-width="2"
            />
            <circle :cx="targetPoint.x" :cy="targetPoint.y - 20" r="5.5" fill="white"/>
            <g :transform="`translate(${labelX(targetPoint)}, ${labelY(targetPoint)})`">
              <rect width="170" height="50" rx="12" fill="white" stroke="#c8d5e8" stroke-width="1.5" filter="url(#shadow)"/>
              <text x="85" y="22" text-anchor="middle" font-size="17" fill="#0d1117" font-family="sans-serif" font-weight="700">{{ targetPoint.label }}</text>
              <text x="85" y="40" text-anchor="middle" font-size="15" fill="#8592a8" font-family="sans-serif">{{ targetPoint.room }}</text>
            </g>
          </template>
        </svg>
      </div>

      <!-- Zoom -->
      <div class="nav-page__zoom">
        <button class="nav-page__zoom-btn" @click="zoomIn"  :disabled="zoom >= 2.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <div class="nav-page__zoom-sep" />
        <button class="nav-page__zoom-btn" @click="zoomOut" :disabled="zoom <= 0.6"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
      </div>
    </div>

    <!-- Информация о маршруте -->
    <div class="nav-page__route-info">
      <div class="nav-page__info-card">
        <span class="nav-page__info-label">Точка назначения</span>
        <div class="nav-page__info-row">
          <div class="nav-page__info-icon" :style="targetPoint ? categoryColors[targetPoint.category] : { background: '#f1f5f9', color: '#64748b' }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="targetPoint ? categoryColors[targetPoint.category].color : '#64748b'" stroke-width="1.8" stroke-linecap="round">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="nav-page__info-text">
            <p class="nav-page__info-name">{{ targetPoint?.label ?? 'Не выбрано' }}</p>
            <p class="nav-page__info-room">{{ targetPoint?.room ?? 'Нажмите на помещение или выберите из списка' }}</p>
          </div>
          <button v-if="targetId" class="nav-page__change-btn" @click="targetId = null">Сбросить</button>
        </div>
      </div>
      <div class="nav-page__info-card">
        <span class="nav-page__info-label">Стартовая точка</span>
        <div class="nav-page__info-row">
          <div class="nav-page__info-icon" style="background:#dcfce7">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="1.8" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="#15803d"/>
            </svg>
          </div>
          <div class="nav-page__info-text">
            <p class="nav-page__info-name">{{ startPoint?.label ?? 'Вход / Коридор' }}</p>
            <p class="nav-page__info-room">{{ startPoint?.room ?? 'Коридор' }}</p>
          </div>
          <button class="nav-page__change-btn" @click="showPointsList = true; selectingStart = true">Изменить</button>
        </div>
      </div>
    </div>

    <div v-if="targetId && routePath.length === 0" class="nav-page__no-route">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Прямой маршрут до этой точки не найден.
    </div>

    <div class="nav-page__btn-wrap">
      <button class="nav-page__build-btn" :disabled="!targetId" @click="targetId && (showPointsList = false, haptic.light())">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        {{ targetId ? `Маршрут: ${targetPoint?.label}` : 'Выберите точку назначения' }}
      </button>
    </div>

    <!-- Bottom sheet: Список точек -->
    <Teleport to="body">
    <Transition name="sheet">
      <div v-if="showPointsList" class="nav-page__sheet-overlay" @click.self="showPointsList = false; selectingStart = false">
        <div class="nav-page__sheet" :style="sheetSwipe.sheetStyle.value"
          @touchstart="sheetSwipe.onTouchStart" @touchmove="sheetSwipe.onTouchMove" @touchend="sheetSwipe.onTouchEnd">
          <div class="nav-page__sheet-handle" />
          <div class="nav-page__sheet-head">
            <h3>{{ selectingStart ? 'Выберите стартовую точку' : 'Все помещения' }}</h3>
            <button @click="showPointsList = false; selectingStart = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="nav-page__sheet-list">
            <button
              v-for="pt in visiblePoints.filter(p => selectingStart || p.category !== 'start')"
              :key="pt.id"
              class="nav-page__sheet-item"
              :class="{
                'is-target':  !selectingStart && targetId === pt.id,
                'is-start':   selectingStart  && startId  === pt.id,
              }"
              @click="selectPoint(pt.id)"
            >
              <div class="nav-page__sheet-icon" :style="categoryColors[pt.category]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="categoryColors[pt.category].color" stroke-width="1.8" stroke-linecap="round">
                  <path :d="pointIcon(pt.category)"/>
                </svg>
              </div>
              <div>
                <p class="nav-page__sheet-name">{{ pt.label }}</p>
                <p class="nav-page__sheet-room">{{ pt.room }} · {{ categoryLabels[pt.category] }}</p>
              </div>
              <svg v-if="(!selectingStart && targetId === pt.id) || (selectingStart && startId === pt.id)"
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-3)" stroke-width="1.8" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
    </Teleport>

    <div class="nav-spacer" />
    <MobileNavigation />
  </div>
</template>

<style scoped>
.nav-page { background: var(--c-bg); min-height: 100dvh; }

.nav-page__top { padding: var(--gap-md) var(--gap-md) var(--gap-sm); }
.nav-page__title { font-size: var(--fs-xl); font-weight: 700; margin-bottom: var(--gap-md); }

.nav-page__selectors { display: flex; gap: var(--gap-sm); align-items: stretch; }

.nav-page__select-wrap {
  display: flex; align-items: center; gap: var(--gap-sm);
  padding: 0 12px; min-height: var(--touch-min);
  background: var(--c-surface); border: 1.5px solid var(--c-border);
  border-radius: var(--r-lg); cursor: pointer; flex: 1; min-width: 0;
  transition: border-color var(--dur-fast), background var(--dur-fast);
  user-select: none;
}
.nav-page__select-wrap:active { border-color: var(--c-accent); background: var(--c-accent-dim); }
.nav-page__select-text { flex: 1; min-width: 0; }
.nav-page__select-main { display: block; font-size: var(--fs-sm); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nav-page__select-sub  { display: block; font-size: 10px; color: var(--c-text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.nav-page__points-btn {
  display: flex; align-items: center; gap: 5px; padding: 0 10px;
  min-height: var(--touch-min); background: var(--c-surface);
  border: 1.5px solid var(--c-border); border-radius: var(--r-lg);
  font-size: var(--fs-xs); font-weight: 600; color: var(--c-text-2);
  font-family: var(--font-body); cursor: pointer; white-space: nowrap;
  transition: border-color var(--dur-fast), background var(--dur-fast);
}
.nav-page__points-btn:active { background: var(--c-accent-dim); border-color: var(--c-accent); color: var(--c-accent); }

.nav-page__picker {
  margin: 0 var(--gap-md); background: var(--c-surface);
  border: 1.5px solid var(--c-border); border-radius: var(--r-lg);
  overflow: hidden; box-shadow: var(--shadow-md); z-index: 20; position: relative;
}
.nav-page__picker-item {
  display: flex; align-items: center; gap: var(--gap-sm);
  padding: 12px var(--gap-md); font-size: var(--fs-sm); font-weight: 500;
  font-family: var(--font-body); cursor: pointer;
  border-bottom: 1px solid var(--c-border); width: 100%;
  background: transparent; text-align: left; transition: background var(--dur-fast);
}
.nav-page__picker-item:last-child { border-bottom: none; }
.nav-page__picker-item.is-selected { color: var(--c-accent); font-weight: 700; }
.nav-page__picker-item:active { background: var(--c-bg-2); }
.nav-page__picker-sub { color: var(--c-text-3); font-size: var(--fs-xs); flex: 1; }

/* Карта */
.nav-page__map-container {
  margin: var(--gap-sm) var(--gap-md) 0;
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-xl); overflow: hidden; position: relative;
  box-shadow: var(--shadow-sm);
}
.nav-page__no-map {
  display: flex; flex-direction: column; align-items: center; gap: var(--gap-sm);
  padding: var(--gap-xl) var(--gap-md); color: var(--c-text-3); text-align: center;
  font-size: var(--fs-sm);
}
.nav-page__map-inner { transition: transform 0.25s var(--ease-out); transform-origin: top center; }
.nav-page__svg { width: 100%; display: block; touch-action: pan-x pan-y; }

.route-anim { animation: dashFlow 1.5s linear infinite; }
@keyframes dashFlow { to { stroke-dashoffset: -18; } }
.pulse-anim { animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

/* Zoom */
.nav-page__zoom {
  position: absolute; top: 10px; left: 10px;
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-md); box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; overflow: hidden;
}
.nav-page__zoom-btn {
  width: var(--touch-min); height: var(--touch-min);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--c-text-2); background: transparent;
  border: none; font-family: inherit;
  transition: background var(--dur-fast), transform var(--dur-fast);
}
.nav-page__zoom-btn:active:not(:disabled) { background: var(--c-bg-2); transform: scale(0.85); }
.nav-page__zoom-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.nav-page__zoom-sep { height: 1px; background: var(--c-border); }

/* Инфо маршрута */
.nav-page__route-info { padding: var(--gap-sm) var(--gap-md) 0; display: flex; flex-direction: column; gap: var(--gap-sm); }
.nav-page__info-card { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-xl); padding: var(--gap-md); box-shadow: var(--shadow-sm); }
.nav-page__info-label { font-size: var(--fs-xs); font-weight: 700; color: var(--c-accent); text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: var(--gap-sm); }
.nav-page__info-row { display: flex; align-items: center; gap: var(--gap-md); }
.nav-page__info-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nav-page__info-text { flex: 1; }
.nav-page__info-name { font-size: var(--fs-sm); font-weight: 600; }
.nav-page__info-room { font-size: var(--fs-xs); color: var(--c-text-3); }
.nav-page__change-btn {
  font-size: var(--fs-xs); font-weight: 600; color: var(--c-text-2);
  border: 1px solid var(--c-border); border-radius: var(--r-md);
  min-height: 36px; padding: 0 12px; cursor: pointer; font-family: var(--font-body);
  background: transparent; white-space: nowrap; display: flex; align-items: center;
  transition: background var(--dur-fast);
}
.nav-page__change-btn:active { background: var(--c-bg-2); }

/* Нет маршрута */
.nav-page__no-route {
  display: flex; align-items: center; gap: 8px;
  margin: var(--gap-sm) var(--gap-md) 0;
  background: #fff7ed; color: #c2410c;
  border: 1px solid #fed7aa; border-radius: var(--r-lg);
  padding: var(--gap-sm) var(--gap-md); font-size: var(--fs-sm); font-weight: 500;
}
.nav-page__no-route svg { flex-shrink: 0; }

/* Кнопка */
.nav-page__btn-wrap { padding: var(--gap-md); }
.nav-page__build-btn {
  width: 100%; min-height: 52px; background: var(--c-accent); color: #fff;
  font-size: var(--fs-base); font-weight: 700; border-radius: var(--r-lg);
  border: none; font-family: var(--font-body); cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: var(--gap-sm);
  transition: background var(--dur-fast), opacity var(--dur-fast);
}
.nav-page__build-btn:active:not(:disabled) { background: #0069aa; }
.nav-page__build-btn:disabled { background: var(--c-bg-2); color: var(--c-text-3); cursor: not-allowed; }

/* Bottom sheet */
.nav-page__sheet-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 200;
  display: flex; align-items: flex-end; justify-content: center; backdrop-filter: blur(2px);
}
.nav-page__sheet {
  width: 100%; max-width: 480px; background: var(--c-surface);
  border-radius: var(--r-xl) var(--r-xl) 0 0; max-height: 75dvh;
  display: flex; flex-direction: column; box-shadow: var(--shadow-lg);
}
.nav-page__sheet-handle { width: 36px; height: 4px; background: var(--c-border-2); border-radius: var(--r-full); margin: 10px auto 0; flex-shrink: 0; }
.nav-page__sheet-head { display: flex; align-items: center; justify-content: space-between; padding: var(--gap-md) var(--gap-md) var(--gap-sm); flex-shrink: 0; }
.nav-page__sheet-head h3 { font-size: var(--fs-md); font-weight: 700; }
.nav-page__sheet-head button { color: var(--c-text-3); }
.nav-page__sheet-list { overflow-y: auto; flex: 1; padding: 0 var(--gap-md) var(--gap-lg); display: flex; flex-direction: column; gap: 2px; }

.nav-page__sheet-item {
  display: flex; align-items: center; gap: var(--gap-md);
  padding: 12px var(--gap-sm); border-radius: var(--r-lg); cursor: pointer;
  font-family: var(--font-body); text-align: left; background: transparent; border: none; width: 100%;
  transition: background var(--dur-fast);
}
.nav-page__sheet-item:active { background: var(--c-bg-2); }
.nav-page__sheet-item.is-target { background: var(--c-accent-dim); }
.nav-page__sheet-item.is-start  { background: #dcfce7; }

.nav-page__sheet-icon { width: 38px; height: 38px; border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nav-page__sheet-name { font-size: var(--fs-sm); font-weight: 600; }
.nav-page__sheet-room { font-size: var(--fs-xs); color: var(--c-text-3); }

/* Анимации */
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s var(--ease-out); }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px); }
.sheet-enter-active, .sheet-leave-active { transition: all 0.3s var(--ease-out); }
.sheet-enter-from .nav-page__sheet, .sheet-leave-to .nav-page__sheet { transform: translateY(100%); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }

.nav-spacer { height: 80px; }
</style>

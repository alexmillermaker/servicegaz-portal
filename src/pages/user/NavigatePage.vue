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
// Формула из spec(2048×881) → SVG(1190.55×841.89):
//   svg_x = spec_x * 0.497 + 84
//   svg_y = spec_y * 0.498 + 220
// Якорь: MEETING spec(1525,130)→svg(842,285), spec(1839,335)→svg(998,387) — точное совпадение с path-данными SVG
//
// ВЕРХНИЙ РЯД (svg y≈228..387):
//   Конструкторский | Муж.раздевалка | WC/Душ кластер | Жен.раздевалка | Переговорная | Мед кабинет
//
// КОРИДОР (svg y≈387..443)
//
// НИЖНИЙ РЯД (svg y≈443..560):
//   ОТиЗ | Техдиректор | Технологический | Техн.пом×2 | Охрана | Отдел кадров
const allPoints: MapPoint[] = [
  // ── Верхний ряд ─────────────────────────────────────────────
  { id: 'design',       x: 182,  y: 307, label: 'Конструкторский отдел', room: 'Каб. 103', category: 'office',   floor: 1, building: 'b1' },
  { id: 'locker_m',     x: 395,  y: 307, label: 'Мужская раздевалка',    room: 'Каб. 104', category: 'locker',   floor: 1, building: 'b1' },
  { id: 'wc_m',         x: 546,  y: 306, label: 'Санузел (М)',           room: 'WC',       category: 'wc',       floor: 1, building: 'b1' },
  { id: 'shower_m',     x: 546,  y: 368, label: 'Душевая (М)',           room: 'Душ',      category: 'shower',   floor: 1, building: 'b1' },
  { id: 'wc_f',         x: 592,  y: 285, label: 'Санузел (Ж)',           room: 'WC',       category: 'wc',       floor: 1, building: 'b1' },
  { id: 'wc_f_bottom',  x: 592,  y: 325, label: 'Санузел (Ж) 2',        room: 'WC',       category: 'wc',       floor: 1, building: 'b1' },
  { id: 'shower_f',     x: 592,  y: 368, label: 'Душевая (Ж)',           room: 'Душ',      category: 'shower',   floor: 1, building: 'b1' },
  { id: 'locker_f',     x: 688,  y: 325, label: 'Женская раздевалка',    room: 'Каб. 106', category: 'locker',   floor: 1, building: 'b1' },
  { id: 'meeting',      x: 920,  y: 336, label: 'Переговорный кабинет',  room: 'Каб. 108', category: 'office',   floor: 1, building: 'b1' },
  { id: 'medic',        x: 1044, y: 310, label: 'Мед кабинет',           room: 'Каб. 109', category: 'service',  floor: 1, building: 'b1' },
  // ── Нижний ряд ──────────────────────────────────────────────
  { id: 'otiz',         x: 151,  y: 478, label: 'ОТиЗ',                  room: 'Каб. 101', category: 'office',   floor: 1, building: 'b1' },
  { id: 'techdir',      x: 388,  y: 499, label: 'Технический директор',   room: 'Каб. 102', category: 'office',   floor: 1, building: 'b1' },
  { id: 'tech_dept',    x: 584,  y: 498, label: 'Технологический отдел',  room: 'Каб. 201', category: 'office',   floor: 1, building: 'b1' },
  { id: 'tech_room1',   x: 760,  y: 464, label: 'Техн. помещение 1',      room: 'Тех. 1',   category: 'storage',  floor: 1, building: 'b1' },
  { id: 'tech_room2',   x: 810,  y: 464, label: 'Техн. помещение 2',      room: 'Тех. 2',   category: 'storage',  floor: 1, building: 'b1' },
  { id: 'security',     x: 1002, y: 464, label: 'Пост охраны',            room: 'Охрана',   category: 'security', floor: 1, building: 'b1' },
  { id: 'hr',           x: 1057, y: 500, label: 'Отдел кадров',           room: 'Каб. 205', category: 'office',   floor: 1, building: 'b1' },
  // ── Старт ───────────────────────────────────────────────────
  { id: 'start',        x: 951,  y: 522, label: 'Вход / Коридор',        room: 'Коридор',  category: 'start',    floor: 1, building: 'b1' },
  // ── Корпус 1, Этаж 2 (кабинеты будут добавлены) ─────────────
  { id: 'b1f2_start',   x: 596,  y: 421, label: 'Коридор / Лестница',    room: 'Коридор',  category: 'start',    floor: 2, building: 'b1' },
  // ── Коридорные и дверные узлы ────────────────────────────────
  { id: 'start_door',   x: 958,  y: 490, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_right',      x: 959,  y: 415, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_hr',         x: 1048, y: 415, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_sec',        x: 1006, y: 415, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_tr2',           x: 807,  y: 415, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'd_hall',          x: 815,  y: 387, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'd_meeting_entry', x: 842,  y: 336, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_med_jct',       x: 1001, y: 415, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'd_medic',         x: 1001, y: 387, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_tdept',      x: 718,  y: 415, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'd_tech_dept',  x: 720,  y: 443, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'd_tr1',        x: 760,  y: 443, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_left',       x: 407,  y: 415, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_top',        x: 523,  y: 323, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_far_left',   x: 213,  y: 415, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'd_otiz',       x: 151,  y: 415, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'c_design_jct', x: 242,  y: 415, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'd_design',     x: 248,  y: 387, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
]

const visiblePoints = computed(() =>
  allPoints.filter(p => p.floor === selectedFloor.value.id && p.building === selectedBuilding.value.id && p.category !== 'corridor')
)

const edges: [string, string][] = [
  // ── Коридорный хребет (горизонтальный, y=415 — центр коридора) ──
  ['c_far_left',   'c_design_jct'],
  ['c_design_jct', 'c_left'],
  ['c_left',       'c_tdept'],
  ['c_tdept',      'c_tr2'],
  ['c_tr2',        'c_right'],
  ['c_right',      'c_med_jct'],
  ['c_med_jct',    'c_sec'],
  ['c_sec',        'c_hr'],
  // ── Вертикальные ответвления ──────────────────────────────────
  ['c_far_left',   'd_otiz'],
  ['c_design_jct', 'd_design'],
  ['c_right',      'start_door'],
  ['c_left',       'c_top'],
  ['c_tr2',        'd_hall'],
  ['d_hall',       'd_meeting_entry'],
  ['c_med_jct',    'd_medic'],
  // ── Комнаты → узлы ───────────────────────────────────────────
  ['start',      'start_door'],
  ['otiz',       'd_otiz'],
  ['design',     'd_design'],
  ['meeting',    'd_meeting_entry'],
  ['medic',      'd_medic'],
  ['security',   'c_sec'],
  ['hr',         'c_hr'],
  ['tech_dept',  'd_tech_dept'],
  ['d_tech_dept','c_tdept'],
  ['tech_room2', 'c_tr2'],
  ['tech_room1', 'd_tr1'],
  ['d_tr1',      'c_tdept'],
  ['techdir',    'c_left'],
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

// Комнаты, доступные только со стороны Корпуса 2 — маршрут не строится
const BUILDING2_ACCESS = new Set(['locker_m', 'locker_f', 'wc_m', 'wc_f', 'wc_f_bottom', 'shower_m', 'shower_f'])

const targetId  = ref<string | null>(null)
const startId   = ref('start')

const targetPoint = computed(() => allPoints.find(p => p.id === targetId.value))
const startPoint  = computed(() => allPoints.find(p => p.id === startId.value))
const isBuilding2Target = computed(() => !!targetId.value && BUILDING2_ACCESS.has(targetId.value))

const routePath = computed<string[]>(() =>
  targetId.value && !isBuilding2Target.value ? findPath(startId.value, targetId.value) : []
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

function defaultStart(bId: string, fId: number): string {
  if (bId === 'b1' && fId === 2) return 'b1f2_start'
  return 'start'
}
function changeBuilding(b: typeof buildings[0]) {
  selectedBuilding.value = b
  selectedFloor.value = floors[0]
  showBuildingPicker.value = false
  targetId.value = null
  startId.value = defaultStart(b.id, floors[0].id)
  resetVB()
}
function changeFloor(f: typeof floors[0]) {
  selectedFloor.value = f
  showFloorPicker.value = false
  targetId.value = null
  startId.value = defaultStart(selectedBuilding.value.id, f.id)
  resetVB()
}


// ── ViewBox-зум: координатное пространство per-floor ──
const FLOOR_DIMS: Record<string, { w: number; h: number }> = {
  b1_1: { w: 1190.55, h: 841.89 },
  b1_2: { w: 1190.55, h: 841.89 },
}
const floorDims = computed(() => {
  const key = `${selectedBuilding.value.id}_${selectedFloor.value.id}`
  return FLOOR_DIMS[key] ?? { w: 1190.55, h: 841.89 }
})
const vbX = ref(0)
const vbY = ref(0)
const vbW = ref(1190.55)
const vbH = ref(841.89)
const zoom = computed(() => floorDims.value.w / vbW.value)
const isDragging = ref(false)
const mapContainerRef = ref<HTMLElement | null>(null)

const svgViewBox = computed(() => `${vbX.value} ${vbY.value} ${vbW.value} ${vbH.value}`)

function clampVB() {
  const { w, h } = floorDims.value
  if (vbX.value < 0) vbX.value = 0
  if (vbY.value < 0) vbY.value = 0
  if (vbX.value + vbW.value > w) vbX.value = w - vbW.value
  if (vbY.value + vbH.value > h) vbY.value = h - vbH.value
}
function resetVB() {
  const { w, h } = floorDims.value
  vbX.value = 0; vbY.value = 0; vbW.value = w; vbH.value = h
}

function getPinchDist(e: TouchEvent) {
  const [t1, t2] = [e.touches[0], e.touches[1]]
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
}
let pinchStartDist = 0, pinchStartZoom = 1

function zoomAround(newZoom: number, pivotX?: number, pivotY?: number) {
  const el = mapContainerRef.value
  if (!el) return
  const cW = el.clientWidth, cH = el.clientHeight
  const px = pivotX ?? cW / 2, py = pivotY ?? cH / 2
  const svgPx = vbX.value + px * vbW.value / cW
  const svgPy = vbY.value + py * vbH.value / cH
  const { w, h } = floorDims.value
  const cz = Math.min(Math.max(newZoom, 0.5), 3)
  const nW = w / cz, nH = h / cz
  if (cz <= 1) { resetVB() }
  else { vbX.value = svgPx - px * nW / cW; vbY.value = svgPy - py * nH / cH; vbW.value = nW; vbH.value = nH; clampVB() }
}
function zoomIn()  { zoomAround(zoom.value + 0.25); haptic.tap() }
function zoomOut() { zoomAround(zoom.value - 0.25); haptic.tap() }

// ── Mouse drag ────────────────────────────────────────────────
let _mp = { x: 0, y: 0 }
function onMapMouseDown(e: MouseEvent) {
  if (e.button !== 0) return
  isDragging.value = true; _mp = { x: e.clientX, y: e.clientY }; e.preventDefault()
}
function onMapMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  const el = mapContainerRef.value; if (!el) return
  const sx = vbW.value / el.clientWidth, sy = vbH.value / el.clientHeight
  vbX.value -= (e.clientX - _mp.x) * sx; vbY.value -= (e.clientY - _mp.y) * sy
  clampVB(); _mp = { x: e.clientX, y: e.clientY }
}
function onMapMouseUp() { isDragging.value = false }

// ── Touch ─────────────────────────────────────────────────────
let _tp = { x: 0, y: 0 }, _tDrag = false
function onMapTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    _tDrag = false; pinchStartDist = getPinchDist(e); pinchStartZoom = zoom.value
  } else if (e.touches.length === 1) {
    _tDrag = true; _tp = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
}
function onMapTouchMove(e: TouchEvent) {
  if (e.touches.length === 2) {
    _tDrag = false
    const nz = Math.min(Math.max(pinchStartZoom * getPinchDist(e) / pinchStartDist, 0.5), 3)
    const [t1, t2] = [e.touches[0], e.touches[1]]
    const rect = mapContainerRef.value?.getBoundingClientRect()
    const cx = rect ? (t1.clientX + t2.clientX) / 2 - rect.left : undefined
    const cy = rect ? (t1.clientY + t2.clientY) / 2 - rect.top  : undefined
    zoomAround(nz, cx, cy)
  } else if (e.touches.length === 1 && _tDrag) {
    const el = mapContainerRef.value; if (!el) return
    const sx = vbW.value / el.clientWidth, sy = vbH.value / el.clientHeight
    vbX.value -= (e.touches[0].clientX - _tp.x) * sx
    vbY.value -= (e.touches[0].clientY - _tp.y) * sy
    clampVB(); _tp = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
}
function onMapTouchEnd(e: TouchEvent) {
  if (e.touches.length < 2) pinchStartDist = 0
  if (e.touches.length === 0) _tDrag = false
}

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

const currentMapImage = computed(() => `${import.meta.env.BASE_URL}maps/${selectedBuilding.value.id}_floor${selectedFloor.value.id}.svg`)

function roomFill(id: string, _default: string): string {
  if (targetId.value === id) return 'rgba(59,130,246,0.22)'
  if (startId.value === id) return 'rgba(34,197,94,0.22)'
  return 'rgba(0,0,0,0)'
}
function roomStroke(id: string, _default: string): string {
  if (targetId.value === id) return '#3b82f6'
  if (startId.value === id) return '#22c55e'
  return 'none'
}
function roomStrokeWidth(id: string): number {
  if (targetId.value === id || startId.value === id) return 4
  return 1.5
}
function roomStrokeOpacity(id: string): number {
  if (targetId.value === id || startId.value === id) return 1
  return 0.45
}

</script>

<template>
  <div class="nav-page">
    <AppPageHeader subtitle="UNITorg SG · СЕРВИСГАЗ" bell :badge-count="unreadCount" @bell-click="showNotifications = true" />
    <AppNotificationsDrawer :open="showNotifications" @close="showNotifications = false" />

    <div class="nav-page__top">
      <h1 class="nav-page__title">Навигация</h1>
    </div>

    <div class="nav-page__buildings">
      <button
        v-for="b in buildings" :key="b.id"
        class="nav-page__bchip"
        :class="{ 'is-active': selectedBuilding.id === b.id }"
        @click="changeBuilding(b)"
      >
        <span class="nav-page__bchip-label">{{ b.label }}</span>
        <span class="nav-page__bchip-sub">{{ b.sub }}</span>
      </button>
    </div>

    <!-- Карта -->
    <div class="nav-page__map-container"
      ref="mapContainerRef"
      :class="{ 'is-dragging': isDragging }"
      @mousedown="onMapMouseDown" @mousemove="onMapMouseMove" @mouseup="onMapMouseUp" @mouseleave="onMapMouseUp"
      @touchstart="onMapTouchStart" @touchmove.prevent="onMapTouchMove" @touchend="onMapTouchEnd"
    >

      <!-- Floor pills (left overlay) -->
      <div class="nav-page__floors" @mousedown.stop @touchstart.stop>
        <button
          v-for="f in floors" :key="f.id"
          class="nav-page__fpill"
          :class="{ 'is-active': selectedFloor.id === f.id }"
          @click="changeFloor(f)"
        >{{ f.id }}</button>
      </div>

      <div v-if="!hasMapForCurrentView" class="nav-page__no-map">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
        <p>Схема для {{ selectedBuilding.label }}, {{ selectedFloor.label }} пока не загружена</p>
      </div>

      <div v-else class="nav-page__map-inner">
        <svg :viewBox="svgViewBox" class="nav-page__svg" xmlns="http://www.w3.org/2000/svg">
          <!-- Архитектурный план (фон) — рендерится в натуральном разрешении через viewBox -->
          <image :href="currentMapImage" x="0" y="0" :width="floorDims.w" :height="floorDims.h"/>

          <!-- ═══ КОРПУС 1 · ЭТАЖ 1 ═══ -->
          <template v-if="selectedBuilding.id === 'b1' && selectedFloor.id === 1">

          <!-- ═══ ВЕРХНИЙ РЯД ═══ -->

          <!-- Конструкторский отдел -->
          <polygon points="101,228 264,228 264,387 101,387"
            :fill="roomFill('design','')" :stroke="roomStroke('design','')"
            :stroke-width="roomStrokeWidth('design')" :stroke-opacity="roomStrokeOpacity('design')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('design')"/>
          <text x="182" y="292" text-anchor="middle" font-size="15" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Конструктор-</text>
          <text x="182" y="309" text-anchor="middle" font-size="15" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">ский отдел</text>
          <text x="182" y="324" text-anchor="middle" font-size="12" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 103</text>

          <!-- Мужская раздевалка -->
          <polygon points="269,228 520,228 520,387 269,387"
            :fill="roomFill('locker_m','')" :stroke="roomStroke('locker_m','')"
            :stroke-width="roomStrokeWidth('locker_m')" :stroke-opacity="roomStrokeOpacity('locker_m')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('locker_m')"/>
          <text x="395" y="293" text-anchor="middle" font-size="17" fill="#6d28d9" font-family="sans-serif" font-weight="700" style="pointer-events:none">Мужская</text>
          <text x="395" y="312" text-anchor="middle" font-size="17" fill="#6d28d9" font-family="sans-serif" font-weight="700" style="pointer-events:none">раздевалка</text>
          <text x="395" y="328" text-anchor="middle" font-size="12" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 104</text>

          <!-- Мужской санузел -->
          <polygon points="526,269 566,269 566,342 526,342"
            :fill="roomFill('wc_m','')" :stroke="roomStroke('wc_m','')"
            stroke-width="2" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('wc_m')"/>
          <text x="546" y="309" text-anchor="middle" font-size="11" fill="#166534" font-family="sans-serif" font-weight="700" style="pointer-events:none">WC М</text>

          <!-- Мужская душевая -->
          <polygon points="526,348 566,348 566,387 526,387"
            :fill="roomFill('shower_m','')" :stroke="roomStroke('shower_m','')"
            stroke-width="2" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('shower_m')"/>
          <text x="546" y="371" text-anchor="middle" font-size="10" fill="#0369a1" font-family="sans-serif" font-weight="700" style="pointer-events:none">Душ М</text>

          <!-- Женский санузел верхний -->
          <polygon points="572,268 613,268 613,302 572,302"
            :fill="roomFill('wc_f','')" :stroke="roomStroke('wc_f','')"
            stroke-width="2" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('wc_f')"/>
          <text x="592" y="288" text-anchor="middle" font-size="11" fill="#166534" font-family="sans-serif" font-weight="700" style="pointer-events:none">WC Ж</text>

          <!-- Женский санузел нижний -->
          <polygon points="572,308 613,308 613,342 572,342"
            :fill="roomFill('wc_f_bottom','')" :stroke="roomStroke('wc_f_bottom','')"
            stroke-width="2" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('wc_f_bottom')"/>
          <text x="592" y="328" text-anchor="middle" font-size="10" fill="#166534" font-family="sans-serif" font-weight="700" style="pointer-events:none">WC Ж2</text>

          <!-- Женская душевая -->
          <polygon points="572,348 613,348 613,387 572,387"
            :fill="roomFill('shower_f','')" :stroke="roomStroke('shower_f','')"
            stroke-width="2" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('shower_f')"/>
          <text x="592" y="371" text-anchor="middle" font-size="10" fill="#0369a1" font-family="sans-serif" font-weight="700" style="pointer-events:none">Душ Ж</text>

          <!-- Женская раздевалка -->
          <polygon points="618,263 757,263 757,387 618,387"
            :fill="roomFill('locker_f','')" :stroke="roomStroke('locker_f','')"
            :stroke-width="roomStrokeWidth('locker_f')" :stroke-opacity="roomStrokeOpacity('locker_f')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('locker_f')"/>
          <text x="688" y="312" text-anchor="middle" font-size="16" fill="#9d174d" font-family="sans-serif" font-weight="700" style="pointer-events:none">Женская</text>
          <text x="688" y="330" text-anchor="middle" font-size="16" fill="#9d174d" font-family="sans-serif" font-weight="700" style="pointer-events:none">раздевалка</text>
          <text x="688" y="345" text-anchor="middle" font-size="12" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 106</text>

          <!-- Переговорная -->
          <polygon points="842,285 998,285 998,387 842,387"
            :fill="roomFill('meeting','')" :stroke="roomStroke('meeting','')"
            :stroke-width="roomStrokeWidth('meeting')" :stroke-opacity="roomStrokeOpacity('meeting')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('meeting')"/>
          <text x="920" y="329" text-anchor="middle" font-size="15" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Переговорная</text>
          <text x="920" y="345" text-anchor="middle" font-size="12" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 108</text>

          <!-- Мед кабинет (L-образный) -->
          <polygon points="842,228 1085,228 1085,278 1096,278 1096,322 1085,322 1085,387 1004,387 1004,279 842,279"
            :fill="roomFill('medic','')" :stroke="roomStroke('medic','')"
            :stroke-width="roomStrokeWidth('medic')" :stroke-opacity="roomStrokeOpacity('medic')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('medic')"/>
          <text x="1044" y="248" text-anchor="middle" font-size="14" fill="#065f46" font-family="sans-serif" font-weight="700" style="pointer-events:none">Мед</text>
          <text x="1044" y="264" text-anchor="middle" font-size="14" fill="#065f46" font-family="sans-serif" font-weight="700" style="pointer-events:none">кабинет</text>
          <text x="1044" y="277" text-anchor="middle" font-size="11" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 109</text>

          <!-- ═══ НИЖНИЙ РЯД ═══ -->

          <!-- ОТиЗ -->
          <polygon points="101,399 200,399 200,556 101,556"
            :fill="roomFill('otiz','')" :stroke="roomStroke('otiz','')"
            :stroke-width="roomStrokeWidth('otiz')" :stroke-opacity="roomStrokeOpacity('otiz')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('otiz')"/>
          <text x="151" y="473" text-anchor="middle" font-size="16" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">ОТиЗ</text>
          <text x="151" y="490" text-anchor="middle" font-size="12" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 101</text>

          <!-- Технический директор -->
          <polygon points="347,443 430,443 430,554 347,554"
            :fill="roomFill('techdir','')" :stroke="roomStroke('techdir','')"
            :stroke-width="roomStrokeWidth('techdir')" :stroke-opacity="roomStrokeOpacity('techdir')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('techdir')"/>
          <text x="388" y="487" text-anchor="middle" font-size="13" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Технический</text>
          <text x="388" y="502" text-anchor="middle" font-size="13" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">директор</text>
          <text x="388" y="516" text-anchor="middle" font-size="11" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 102</text>

          <!-- Технологический отдел (L-образный) -->
          <polygon points="435,443 733,443 733,490 837,490 837,553 435,553"
            :fill="roomFill('tech_dept','')" :stroke="roomStroke('tech_dept','')"
            :stroke-width="roomStrokeWidth('tech_dept')" :stroke-opacity="roomStrokeOpacity('tech_dept')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('tech_dept')"/>
          <text x="584" y="487" text-anchor="middle" font-size="14" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Технологический</text>
          <text x="584" y="503" text-anchor="middle" font-size="14" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">отдел</text>
          <text x="584" y="517" text-anchor="middle" font-size="11" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 201</text>

          <!-- Техн. помещение 1 -->
          <polygon points="741,443 778,443 778,485 741,485"
            :fill="roomFill('tech_room1','')" :stroke="roomStroke('tech_room1','')"
            :stroke-width="roomStrokeWidth('tech_room1')" :stroke-opacity="roomStrokeOpacity('tech_room1')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('tech_room1')"/>
          <text x="760" y="467" text-anchor="middle" font-size="10" fill="#475569" font-family="sans-serif" font-weight="700" style="pointer-events:none">Тех.1</text>

          <!-- Техн. помещение 2 -->
          <polygon points="783,443 837,443 837,485 783,485"
            :fill="roomFill('tech_room2','')" :stroke="roomStroke('tech_room2','')"
            :stroke-width="roomStrokeWidth('tech_room2')" :stroke-opacity="roomStrokeOpacity('tech_room2')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('tech_room2')"/>
          <text x="810" y="467" text-anchor="middle" font-size="10" fill="#475569" font-family="sans-serif" font-weight="700" style="pointer-events:none">Тех.2</text>

          <!-- Пост охраны -->
          <polygon points="981,442 1023,442 1023,485 981,485"
            :fill="roomFill('security','')" :stroke="roomStroke('security','')"
            :stroke-width="roomStrokeWidth('security')" :stroke-opacity="roomStrokeOpacity('security')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('security')"/>
          <text x="1002" y="459" text-anchor="middle" font-size="12" fill="#c2410c" font-family="sans-serif" font-weight="700" style="pointer-events:none">Пост</text>
          <text x="1002" y="473" text-anchor="middle" font-size="12" fill="#c2410c" font-family="sans-serif" font-weight="700" style="pointer-events:none">охраны</text>

          <!-- Отдел кадров (L-образный) -->
          <polygon points="1029,442 1085,442 1085,479 1096,479 1096,518 1085,518 1085,553 1017,553 1017,563 987,563 981,553 981,491 1029,491"
            :fill="roomFill('hr','')" :stroke="roomStroke('hr','')"
            :stroke-width="roomStrokeWidth('hr')" :stroke-opacity="roomStrokeOpacity('hr')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('hr')"/>
          <text x="1057" y="490" text-anchor="middle" font-size="13" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Отдел</text>
          <text x="1057" y="505" text-anchor="middle" font-size="13" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">кадров</text>
          <text x="1057" y="518" text-anchor="middle" font-size="11" fill="#8592a8" font-family="sans-serif" style="pointer-events:none">Каб. 205</text>

          <!-- ═══ КОРИДОР ═══ -->
          <text x="580" y="415" text-anchor="middle" font-size="14" fill="#8592a8" font-family="sans-serif" letter-spacing="8" style="pointer-events:none">К О Р И Д О Р</text>

          </template>
          <!-- ═══ КОНЕЦ ЭТАЖ 1 ═══ -->

          <!-- ═══ КОРПУС 1 · ЭТАЖ 2 (кабинеты будут добавлены) ═══ -->
          <template v-if="selectedBuilding.id === 'b1' && selectedFloor.id === 2">
            <!-- помещения появятся после загрузки плана -->
          </template>

          <!-- ═══ МАРШРУТ ═══ -->
          <path v-if="routePath.length > 1"
            :d="svgRoutePath()"
            fill="none" stroke="#0079C2" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round"
            stroke-dasharray="10 6" class="route-anim"
          />

          <!-- ═══ МАРКЕР СТАРТА ═══ -->
          <template v-if="startPoint">
            <circle :cx="startPoint.x" :cy="startPoint.y" r="20" fill="#0079C2" stroke="white" stroke-width="4"/>
            <circle :cx="startPoint.x" :cy="startPoint.y" r="8"  fill="white"/>
            <rect :x="startPoint.x - 42" :y="startPoint.y - 50" width="84" height="28" rx="14" fill="white" stroke="#c8d5e8" stroke-width="1.5"/>
            <text :x="startPoint.x" :y="startPoint.y - 30" text-anchor="middle" font-size="17" fill="#0079C2" font-family="sans-serif" font-weight="700" style="pointer-events:none">Старт</text>
          </template>

          <!-- ═══ МАРКЕР ЦЕЛИ ═══ -->
          <template v-if="targetPoint">
            <circle :cx="targetPoint.x" :cy="targetPoint.y" r="36" fill="rgba(0,121,194,0.12)" class="pulse-anim"/>
            <path
              :transform="`translate(${targetPoint.x - 14}, ${targetPoint.y - 34})`"
              d="M14 0C6 0 0 6 0 14c0 10 14 24 14 24s14-14 14-24c0-8-6-14-14-14z"
              fill="#0079C2" stroke="white" stroke-width="2"
            />
            <circle :cx="targetPoint.x" :cy="targetPoint.y - 20" r="5.5" fill="white"/>
          </template>
        </svg>
      </div>

      <!-- Zoom -->
      <div class="nav-page__zoom" @mousedown.stop @touchstart.stop>
        <button class="nav-page__zoom-btn" @click="zoomIn"  :disabled="zoom >= 2.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <div class="nav-page__zoom-sep" />
        <button class="nav-page__zoom-btn" @click="zoomOut" :disabled="zoom <= 0.6"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
      </div>
    </div>

    <div class="nav-page__below-map">
      <button class="nav-page__points-btn" @click="showPointsList = !showPointsList">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        Список помещений
      </button>
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

    <div v-if="isBuilding2Target" class="nav-page__building2-notice">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <div>
        <p class="nav-page__b2-title">Вход через Корпус 2</p>
        <p class="nav-page__b2-sub">Это помещение доступно только со стороны Корпуса 2 — маршрут по данному этажу не строится.</p>
      </div>
    </div>

    <div v-else-if="targetId && routePath.length === 0" class="nav-page__no-route">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Прямой маршрут до этой точки не найден.
    </div>

    <div class="nav-page__btn-wrap">
      <button class="nav-page__build-btn" :disabled="!targetId || isBuilding2Target"
        @click="targetId && !isBuilding2Target && (showPointsList = false, haptic.light())">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        {{ isBuilding2Target ? 'Вход через Корпус 2' : targetId ? `Маршрут: ${targetPoint?.label}` : 'Выберите точку назначения' }}
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
.nav-page__title { font-size: var(--fs-xl); font-weight: 700; margin-bottom: var(--gap-sm); }

/* Buildings chips */
.nav-page__buildings {
  display: flex; gap: 8px;
  padding: 0 var(--gap-md) var(--gap-sm);
  overflow-x: auto; scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.nav-page__buildings::-webkit-scrollbar { display: none; }
.nav-page__bchip {
  display: flex; flex-direction: column; align-items: flex-start;
  gap: 1px; padding: 8px 14px; border-radius: var(--r-lg);
  border: 1.5px solid var(--c-border); background: var(--c-surface);
  cursor: pointer; white-space: nowrap; flex-shrink: 0;
  font-family: var(--font-body); min-height: var(--touch-min);
  transition: border-color .15s, background .15s, color .15s;
}
.nav-page__bchip.is-active { background: var(--c-accent); border-color: var(--c-accent); color: #fff; }
.nav-page__bchip-label { font-size: var(--fs-sm); font-weight: 600; display: block; }
.nav-page__bchip-sub { font-size: 10px; display: block; opacity: .7; }

/* Floor pills (left overlay) */
.nav-page__floors {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 5px; z-index: 10;
}
.nav-page__fpill {
  width: 38px; height: 38px; border-radius: var(--r-md);
  border: 1.5px solid rgba(200,215,232,.5);
  background: rgba(255,255,255,.35);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  font-family: var(--font-body); font-size: var(--fs-sm); font-weight: 700;
  cursor: pointer; color: var(--c-text-1);
  transition: background .2s, border-color .2s, color .2s, opacity .2s;
  box-shadow: 0 2px 6px rgba(0,0,0,.08);
  display: flex; align-items: center; justify-content: center;
  opacity: 0.45;
}
.nav-page__fpill:hover { opacity: 1; }
.nav-page__fpill.is-active { background: var(--c-accent); border-color: var(--c-accent); color: #fff; opacity: 1; box-shadow: 0 2px 8px rgba(8,116,186,.35); }

/* Points list button (below map) */
.nav-page__below-map { margin: var(--gap-sm) var(--gap-md) 0; }
.nav-page__points-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; height: 40px;
  background: var(--c-surface); border: 1.5px solid var(--c-border);
  border-radius: var(--r-lg); font-size: var(--fs-xs); font-weight: 600;
  color: var(--c-text-2); font-family: var(--font-body); cursor: pointer;
  transition: border-color .15s, background .15s, color .15s;
}
.nav-page__points-btn:active { background: var(--c-accent-dim); border-color: var(--c-accent); color: var(--c-accent); }

/* placeholder for removed picker — kept for structural clarity */
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
  cursor: grab; user-select: none;
  aspect-ratio: 1190.55 / 841.89;
}
.nav-page__map-container.is-dragging { cursor: grabbing; }
.nav-page__no-map {
  display: flex; flex-direction: column; align-items: center; gap: var(--gap-sm);
  padding: var(--gap-xl) var(--gap-md); color: var(--c-text-3); text-align: center;
  font-size: var(--fs-sm); height: 100%; box-sizing: border-box; justify-content: center;
}
.nav-page__map-inner { height: 100%; }
.nav-page__svg { width: 100%; height: 100%; display: block; touch-action: none; }

.route-anim { animation: dashFlow 1.5s linear infinite; }
@keyframes dashFlow { to { stroke-dashoffset: -18; } }
.pulse-anim { animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

/* Zoom (bottom-right overlay) */
.nav-page__zoom {
  position: absolute; bottom: 10px; right: 10px;
  background: rgba(255,255,255,.88);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  border: 1.5px solid rgba(200,215,232,.85);
  border-radius: var(--r-md); box-shadow: 0 2px 6px rgba(0,0,0,.12);
  display: flex; flex-direction: column; overflow: hidden;
}
.nav-page__zoom-btn {
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--c-text-1); background: transparent;
  border: none; font-family: inherit;
  transition: background var(--dur-fast);
}
.nav-page__zoom-btn:active:not(:disabled) { background: var(--c-accent-dim); }
.nav-page__zoom-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.nav-page__zoom-sep { height: 1px; background: rgba(200,215,232,.85); }

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

/* Корпус 2 */
.nav-page__building2-notice {
  display: flex; align-items: flex-start; gap: 10px;
  margin: var(--gap-sm) var(--gap-md) 0;
  background: #eff6ff; color: #1d4ed8;
  border: 1px solid #bfdbfe; border-radius: var(--r-lg);
  padding: var(--gap-md); font-size: var(--fs-sm);
}
.nav-page__building2-notice svg { flex-shrink: 0; margin-top: 2px; }
.nav-page__b2-title { font-weight: 700; margin-bottom: 2px; }
.nav-page__b2-sub { font-size: var(--fs-xs); color: #3b82f6; line-height: 1.4; }

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

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
const destinationSearch = ref('')

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
  // ── Корпус 1, Этаж 2 — подтверждённые помещения ─────────────
  { id: 'F2-R01', x: 300,  y: 284, label: 'Генеральный директор',                                      room: '2 этаж', category: 'office', floor: 2, building: 'b1' },
  { id: 'F2-R02', x: 545,  y: 284, label: 'Мужской туалет',                                            room: '2 этаж', category: 'wc',     floor: 2, building: 'b1' },
  { id: 'F2-R03', x: 640,  y: 284, label: 'Женский туалет',                                            room: '2 этаж', category: 'wc',     floor: 2, building: 'b1' },
  { id: 'F2-R04', x: 753,  y: 284, label: 'Комната питания и отдыха',                                  room: '2 этаж', category: 'office', floor: 2, building: 'b1' },
  { id: 'F2-R05', x: 960,  y: 284, label: 'Служба технического маркетинга',                            room: '2 этаж', category: 'office', floor: 2, building: 'b1' },
  { id: 'F2-R06', x: 178,  y: 477, label: 'Исполнительный директор',                                   room: '2 этаж', category: 'office', floor: 2, building: 'b1' },
  { id: 'F2-R07', x: 395,  y: 477, label: 'Руководитель юридического отдела, Директор по строительству', room: '2 этаж', category: 'office', floor: 2, building: 'b1' },
  { id: 'F2-R08', x: 487,  y: 477, label: 'Коммерческий директор',                                     room: '2 этаж', category: 'office', floor: 2, building: 'b1' },
  { id: 'F2-R09', x: 640,  y: 477, label: 'Коммерческий отдел и отдел закупок',                         room: '2 этаж', category: 'office', floor: 2, building: 'b1' },
  { id: 'F2-R10', x: 800,  y: 477, label: 'Финансовый директор',                                       room: '2 этаж', category: 'office', floor: 2, building: 'b1' },
  { id: 'F2-R11', x: 1005, y: 477, label: 'Бухгалтерия',                                               room: '2 этаж', category: 'office', floor: 2, building: 'b1' },
  { id: 'b1f2_start', x: 595, y: 370, label: 'Центральный коридор', room: '2 этаж', category: 'start', floor: 2, building: 'b1' },
  // ── Корпус 1, Этаж 2 — двери и служебные маршрутные узлы ───
  { id: 'F2-D01A', x: 240, y: 345, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-D02',  x: 522, y: 345, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-D03',  x: 660, y: 345, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-D04',  x: 793, y: 345, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-D05',  x: 950, y: 345, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-D06',  x: 183, y: 394, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-D07',  x: 404, y: 394, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-D08',  x: 465, y: 394, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-D09',  x: 725, y: 394, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-D10',  x: 791, y: 394, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-D11',  x: 985, y: 394, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-S01',  x: 306, y: 394, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-S02',  x: 883, y: 394, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-J01',  x: 183, y: 370, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-J02',  x: 240, y: 370, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-J03',  x: 306, y: 370, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-J04',  x: 404, y: 370, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-J05',  x: 465, y: 370, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-J06',  x: 522, y: 370, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-J08',  x: 660, y: 370, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-J09',  x: 725, y: 370, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-J10',  x: 792, y: 370, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-J11',  x: 883, y: 370, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-J12',  x: 950, y: 370, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
  { id: 'F2-J13',  x: 985, y: 370, label: '', room: '', category: 'corridor', floor: 2, building: 'b1' },
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
  // ── Корпус 1, Этаж 1 — подтверждённые переходные узлы ──────
  { id: 'F1-JS01', x: 306, y: 415, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'F1-S01',  x: 306, y: 500, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'F1-JS02', x: 883, y: 415, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'F1-S02',  x: 883, y: 500, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  { id: 'F1-B01',  x: 812, y: 228, label: '', room: '', category: 'corridor', floor: 1, building: 'b1' },
  // ── Корпус 2, Этаж 1 — временная схема до загрузки плана ───
  { id: 'B2-E01', x: 180, y: 420, label: 'Вход из Корпуса 1', room: 'Временная схема', category: 'start', floor: 1, building: 'b2' },
  { id: 'B2-C01', x: 595, y: 420, label: '', room: '', category: 'corridor', floor: 1, building: 'b2' },
  { id: 'B2-D01', x: 900, y: 420, label: '', room: '', category: 'corridor', floor: 1, building: 'b2' },
  { id: 'B2-P01', x: 900, y: 315, label: 'Условная точка Корпуса 2', room: 'Временная схема', category: 'office', floor: 1, building: 'b2' },
]

const visiblePoints = computed(() =>
  allPoints.filter(p => p.floor === selectedFloor.value.id && p.building === selectedBuilding.value.id && p.category !== 'corridor')
)

const edges: [string, string][] = [
  // ── Коридорный хребет (горизонтальный, y=415 — центр коридора) ──
  ['c_far_left',   'c_design_jct'],
  ['c_design_jct', 'F1-JS01'],
  ['F1-JS01',      'c_left'],
  ['c_left',       'c_tdept'],
  ['c_tdept',      'c_tr2'],
  ['c_tr2',        'F1-JS02'],
  ['F1-JS02',      'c_right'],
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
  ['d_hall',       'F1-B01'],
  ['c_med_jct',    'd_medic'],
  ['F1-JS01',      'F1-S01'],
  ['F1-JS02',      'F1-S02'],
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
  // ── Этаж 2: коридорный хребет ───────────────────────────────
  ['F2-J01',      'F2-J02'],
  ['F2-J02',      'F2-J03'],
  ['F2-J03',      'F2-J04'],
  ['F2-J04',      'F2-J05'],
  ['F2-J05',      'F2-J06'],
  ['F2-J06',      'b1f2_start'],
  ['b1f2_start',  'F2-J08'],
  ['F2-J08',      'F2-J09'],
  ['F2-J09',      'F2-J10'],
  ['F2-J10',      'F2-J11'],
  ['F2-J11',      'F2-J12'],
  ['F2-J12',      'F2-J13'],
  // ── Этаж 2: двери → коридор ─────────────────────────────────
  ['F2-D01A', 'F2-J02'],
  ['F2-D02',  'F2-J06'],
  ['F2-D03',  'F2-J08'],
  ['F2-D04',  'F2-J10'],
  ['F2-D05',  'F2-J12'],
  ['F2-D06',  'F2-J01'],
  ['F2-D07',  'F2-J04'],
  ['F2-D08',  'F2-J05'],
  ['F2-D09',  'F2-J09'],
  ['F2-D10',  'F2-J10'],
  ['F2-D11',  'F2-J13'],
  ['F2-S01',  'F2-J03'],
  ['F2-S02',  'F2-J11'],
  // ── Этаж 2: помещения → двери ───────────────────────────────
  ['F2-R01', 'F2-D01A'],
  ['F2-R02', 'F2-D02'],
  ['F2-R03', 'F2-D03'],
  ['F2-R04', 'F2-D04'],
  ['F2-R05', 'F2-D05'],
  ['F2-R06', 'F2-D06'],
  ['F2-R07', 'F2-D07'],
  ['F2-R08', 'F2-D08'],
  ['F2-R09', 'F2-D09'],
  ['F2-R10', 'F2-D10'],
  ['F2-R11', 'F2-D11'],
  // ── Межэтажные и межкорпусные переходы ─────────────────────
  ['F1-S01', 'F2-S01'],
  ['F1-S02', 'F2-S02'],
  ['F1-B01', 'B2-E01'],
  // ── Корпус 2: временный маршрут первого этажа ──────────────
  ['B2-E01', 'B2-C01'],
  ['B2-C01', 'B2-D01'],
  ['B2-D01', 'B2-P01'],
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

interface RouteSegment {
  key: string
  building: string
  floor: number
  pointIds: string[]
}

function pointMapKey(point: MapPoint): string {
  return `${point.building}_${point.floor}`
}

const routeSegments = computed<RouteSegment[]>(() => {
  const segments: RouteSegment[] = []
  for (const id of routePath.value) {
    const point = allPoints.find(item => item.id === id)
    if (!point) continue
    const key = pointMapKey(point)
    const current = segments[segments.length - 1]
    if (!current || current.key !== key) {
      segments.push({ key, building: point.building, floor: point.floor, pointIds: [id] })
    } else {
      current.pointIds.push(id)
    }
  }
  return segments
})

const currentRouteSegment = computed(() =>
  routeSegments.value.find(segment => segment.key === `${selectedBuilding.value.id}_${selectedFloor.value.id}`)
)

const currentRoutePoints = computed(() =>
  (currentRouteSegment.value?.pointIds ?? [])
    .map(id => allPoints.find(point => point.id === id))
    .filter((point): point is MapPoint => !!point)
)

const routeBoundaryPoints = computed(() => {
  const points = currentRoutePoints.value
  if (points.length < 2) return []
  return [points[0], points[points.length - 1]].filter(point => point.id !== startId.value && point.id !== targetId.value)
})

function pointIsOnCurrentMap(point: MapPoint | undefined): boolean {
  return !!point && point.building === selectedBuilding.value.id && point.floor === selectedFloor.value.id
}

function buildingLabel(id: string): string {
  return buildings.find(building => building.id === id)?.label ?? id
}

function segmentInstruction(segment: RouteSegment, index: number): string {
  const next = routeSegments.value[index + 1]
  if (!next) return targetPoint.value?.label ?? 'Точка назначения'
  if (segment.building !== next.building) return `Переход в ${buildingLabel(next.building)}`
  if (segment.floor !== next.floor) return `Лестница → этаж ${next.floor}`
  return 'Продолжить маршрут'
}

function showRouteSegment(segment: RouteSegment) {
  const building = buildings.find(item => item.id === segment.building)
  const floor = floors.find(item => item.id === segment.floor)
  if (!building || !floor) return
  selectedBuilding.value = building
  selectedFloor.value = floor
  resetVB()
  haptic.tap()
}

function svgRoutePath(): string {
  if (currentRoutePoints.value.length < 2) return ''
  return currentRoutePoints.value.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
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
  if (bId === 'b2' && fId === 1) return 'B2-E01'
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
interface MapViewBox { x: number; y: number; w: number; h: number }

const DEFAULT_VIEW_BOX: MapViewBox = { x: 0, y: 0, w: 1190.55, h: 841.89 }
const FLOOR_DIMS: Record<string, { w: number; h: number }> = {
  b1_1: { w: 1190.55, h: 841.89 },
  b1_2: { w: 1190.55, h: 841.89 },
  b2_1: { w: 1190.55, h: 841.89 },
}
// У планов одинаковый холст, но второй этаж ниже по видимой геометрии.
// Начальное кадрирование 1.10× выравнивает их воспринимаемый размер,
// сохраняя исходные координаты карты и маркеров.
const INITIAL_VIEW_BOXES: Record<string, MapViewBox> = {
  b1_1: DEFAULT_VIEW_BOX,
  b1_2: { x: 54.07, y: 38.24, w: 1082.40, h: 765.41 },
  b2_1: DEFAULT_VIEW_BOX,
}
const floorKey = computed(() => `${selectedBuilding.value.id}_${selectedFloor.value.id}`)
const floorDims = computed(() => {
  return FLOOR_DIMS[floorKey.value] ?? { w: DEFAULT_VIEW_BOX.w, h: DEFAULT_VIEW_BOX.h }
})
const initialViewBox = computed(() => INITIAL_VIEW_BOXES[floorKey.value] ?? DEFAULT_VIEW_BOX)
const vbX = ref(0)
const vbY = ref(0)
const vbW = ref(1190.55)
const vbH = ref(841.89)
const zoom = computed(() => floorDims.value.w / vbW.value)
const baseZoom = computed(() => floorDims.value.w / initialViewBox.value.w)
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
  const { x, y, w, h } = initialViewBox.value
  vbX.value = x; vbY.value = y; vbW.value = w; vbH.value = h
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
  const cz = Math.min(Math.max(newZoom, baseZoom.value), 3)
  const nW = w / cz, nH = h / cz
  if (cz <= baseZoom.value + 0.001) { resetVB() }
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
  locker: 'Раздевалка', stairs: 'Лестница', start: 'Вход', storage: 'Тех. помещение',
  security: 'Охрана',
}
const categoryColors: Record<string, { background: string; color: string }> = {
  office:   { background: '#dbeafe', color: '#1d4ed8' },
  service:  { background: '#d1fae5', color: '#065f46' },
  wc:       { background: '#f0fdf4', color: '#166534' },
  shower:   { background: '#e0f2fe', color: '#0369a1' },
  locker:   { background: '#ede9fe', color: '#6d28d9' },
  stairs:   { background: '#fef3c7', color: '#b45309' },
  start:    { background: '#dcfce7', color: '#15803d' },
  storage:  { background: '#f8fafc', color: '#475569' },
  security: { background: '#fff7ed', color: '#c2410c' },
}

// Единый источник мест назначения: новые пользовательские точки из allPoints
// автоматически появляются в поиске без отдельного изменения шаблона.
const destinationPoints = computed(() =>
  allPoints.filter(p => p.label && p.category !== 'corridor' && p.category !== 'start')
)

function normalizeSearch(value: string): string {
  return value.toLocaleLowerCase('ru-RU').replaceAll('ё', 'е').trim()
}

const filteredDestinationPoints = computed(() => {
  const query = normalizeSearch(destinationSearch.value)
  const currentBuildingId = selectedBuilding.value.id
  const currentFloorId = selectedFloor.value.id

  return destinationPoints.value
    .filter(point => {
      if (!query) return true
      const building = buildings.find(item => item.id === point.building)
      const searchableFields = [
        point.label,
        point.room,
        categoryLabels[point.category] ?? '',
        building?.label ?? point.building,
        `этаж ${point.floor}`,
        `${point.floor} этаж`,
      ]
      return searchableFields.some(field => normalizeSearch(field).includes(query))
    })
    .sort((a, b) => {
      const aCurrent = a.building === currentBuildingId && a.floor === currentFloorId ? 0 : 1
      const bCurrent = b.building === currentBuildingId && b.floor === currentFloorId ? 0 : 1
      if (aCurrent !== bCurrent) return aCurrent - bCurrent
      if (a.building !== b.building) return a.building.localeCompare(b.building, 'ru-RU')
      if (a.floor !== b.floor) return a.floor - b.floor
      return a.label.localeCompare(b.label, 'ru-RU')
    })
})

const sheetPoints = computed(() =>
  selectingStart.value ? visiblePoints.value : filteredDestinationPoints.value
)

function pointMeta(point: MapPoint): string {
  const building = buildings.find(item => item.id === point.building)
  const genericFloorLabels = new Set([`${point.floor} этаж`, `этаж ${point.floor}`])
  const room = point.room.trim()
  return [
    building?.label ?? point.building,
    `Этаж ${point.floor}`,
    room && !genericFloorLabels.has(room.toLocaleLowerCase('ru-RU')) ? room : '',
    categoryLabels[point.category] ?? '',
  ].filter(Boolean).join(' · ')
}

function openDestinationPicker() {
  destinationSearch.value = ''
  selectingStart.value = false
  showPointsList.value = true
}

function clearDestination() {
  targetId.value = null
  haptic.tap()
}

function selectSheetPoint(point: MapPoint) {
  if (selectingStart.value) {
    selectPoint(point.id)
    return
  }

  if (point.id !== startId.value) targetId.value = point.id
  const firstSegment = routeSegments.value[0]
  if (firstSegment) showRouteSegment(firstSegment)
  destinationSearch.value = ''
  showPointsList.value = false
  haptic.tap()
}

function pointIcon(cat: string): string {
  const icons: Record<string, string> = {
    office:   'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    service:  'M22 12h-4l-3 9L9 3l-3 9H2',
    wc:       'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    shower:   'M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2',
    locker:   'M20 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z',
    stairs:   'M3 20h5v-4h4v-4h4V8h5',
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

          <!-- ═══ КОРПУС 1 · ЭТАЖ 2 ═══ -->
          <template v-if="selectedBuilding.id === 'b1' && selectedFloor.id === 2">
            <!-- Генеральный директор -->
            <rect x="106" y="230" width="388" height="109"
              :fill="roomFill('F2-R01','')" :stroke="roomStroke('F2-R01','')"
              :stroke-width="roomStrokeWidth('F2-R01')" :stroke-opacity="roomStrokeOpacity('F2-R01')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('F2-R01')"/>
            <text x="300" y="278" text-anchor="middle" font-size="15" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Генеральный</text>
            <text x="300" y="296" text-anchor="middle" font-size="15" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">директор</text>

            <!-- Мужской туалет -->
            <rect x="507" y="230" width="79" height="109"
              :fill="roomFill('F2-R02','')" :stroke="roomStroke('F2-R02','')"
              :stroke-width="roomStrokeWidth('F2-R02')" :stroke-opacity="roomStrokeOpacity('F2-R02')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('F2-R02')"/>
            <text x="546" y="278" text-anchor="middle" font-size="10" fill="#166534" font-family="sans-serif" font-weight="700" style="pointer-events:none">Мужской</text>
            <text x="546" y="292" text-anchor="middle" font-size="10" fill="#166534" font-family="sans-serif" font-weight="700" style="pointer-events:none">туалет</text>

            <!-- Женский туалет -->
            <rect x="598" y="230" width="84" height="109"
              :fill="roomFill('F2-R03','')" :stroke="roomStroke('F2-R03','')"
              :stroke-width="roomStrokeWidth('F2-R03')" :stroke-opacity="roomStrokeOpacity('F2-R03')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('F2-R03')"/>
            <text x="640" y="278" text-anchor="middle" font-size="10" fill="#166534" font-family="sans-serif" font-weight="700" style="pointer-events:none">Женский</text>
            <text x="640" y="292" text-anchor="middle" font-size="10" fill="#166534" font-family="sans-serif" font-weight="700" style="pointer-events:none">туалет</text>

            <!-- Комната питания и отдыха -->
            <rect x="690" y="230" width="132" height="109"
              :fill="roomFill('F2-R04','')" :stroke="roomStroke('F2-R04','')"
              :stroke-width="roomStrokeWidth('F2-R04')" :stroke-opacity="roomStrokeOpacity('F2-R04')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('F2-R04')"/>
            <text x="756" y="270" text-anchor="middle" font-size="11" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Комната</text>
            <text x="756" y="285" text-anchor="middle" font-size="11" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">питания</text>
            <text x="756" y="300" text-anchor="middle" font-size="11" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">и отдыха</text>

            <!-- Служба технического маркетинга -->
            <rect x="833" y="230" width="252" height="109"
              :fill="roomFill('F2-R05','')" :stroke="roomStroke('F2-R05','')"
              :stroke-width="roomStrokeWidth('F2-R05')" :stroke-opacity="roomStrokeOpacity('F2-R05')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('F2-R05')"/>
            <text x="959" y="278" text-anchor="middle" font-size="14" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Служба технического</text>
            <text x="959" y="296" text-anchor="middle" font-size="14" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">маркетинга</text>

            <!-- Исполнительный директор -->
            <rect x="106" y="352" width="154" height="201"
              :fill="roomFill('F2-R06','')" :stroke="roomStroke('F2-R06','')"
              :stroke-width="roomStrokeWidth('F2-R06')" :stroke-opacity="roomStrokeOpacity('F2-R06')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('F2-R06')"/>
            <text x="178" y="470" text-anchor="middle" font-size="12" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Исполнительный</text>
            <text x="178" y="486" text-anchor="middle" font-size="12" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">директор</text>

            <!-- Руководитель юридического отдела, Директор по строительству -->
            <rect x="350" y="400" width="91" height="153"
              :fill="roomFill('F2-R07','')" :stroke="roomStroke('F2-R07','')"
              :stroke-width="roomStrokeWidth('F2-R07')" :stroke-opacity="roomStrokeOpacity('F2-R07')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('F2-R07')"/>
            <text x="395" y="450" text-anchor="middle" font-size="9" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Руководитель</text>
            <text x="395" y="463" text-anchor="middle" font-size="9" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">юридического отдела,</text>
            <text x="395" y="476" text-anchor="middle" font-size="9" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Директор по</text>
            <text x="395" y="489" text-anchor="middle" font-size="9" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">строительству</text>

            <!-- Коммерческий директор -->
            <rect x="450" y="400" width="72" height="153"
              :fill="roomFill('F2-R08','')" :stroke="roomStroke('F2-R08','')"
              :stroke-width="roomStrokeWidth('F2-R08')" :stroke-opacity="roomStrokeOpacity('F2-R08')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('F2-R08')"/>
            <text x="486" y="463" text-anchor="middle" font-size="9" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Коммерческий</text>
            <text x="486" y="477" text-anchor="middle" font-size="9" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">директор</text>

            <!-- Коммерческий отдел и отдел закупок -->
            <rect x="530" y="400" width="218" height="153"
              :fill="roomFill('F2-R09','')" :stroke="roomStroke('F2-R09','')"
              :stroke-width="roomStrokeWidth('F2-R09')" :stroke-opacity="roomStrokeOpacity('F2-R09')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('F2-R09')"/>
            <text x="639" y="463" text-anchor="middle" font-size="13" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Коммерческий отдел</text>
            <text x="639" y="480" text-anchor="middle" font-size="13" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">и отдел закупок</text>

            <!-- Финансовый директор -->
            <rect x="758" y="400" width="81" height="153"
              :fill="roomFill('F2-R10','')" :stroke="roomStroke('F2-R10','')"
              :stroke-width="roomStrokeWidth('F2-R10')" :stroke-opacity="roomStrokeOpacity('F2-R10')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('F2-R10')"/>
            <text x="799" y="463" text-anchor="middle" font-size="9" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Финансовый</text>
            <text x="799" y="477" text-anchor="middle" font-size="9" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">директор</text>

            <!-- Бухгалтерия -->
            <rect x="925" y="400" width="160" height="153"
              :fill="roomFill('F2-R11','')" :stroke="roomStroke('F2-R11','')"
              :stroke-width="roomStrokeWidth('F2-R11')" :stroke-opacity="roomStrokeOpacity('F2-R11')" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('F2-R11')"/>
            <text x="1005" y="480" text-anchor="middle" font-size="14" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Бухгалтерия</text>
          </template>

          <!-- ═══ КОРПУС 2 · ЭТАЖ 1 · ВРЕМЕННАЯ СХЕМА ═══ -->
          <template v-if="selectedBuilding.id === 'b2' && selectedFloor.id === 1">
            <rect x="760" y="235" width="320" height="145"
              :fill="roomFill('B2-P01','')" :stroke="roomStroke('B2-P01','')"
              :stroke-width="roomStrokeWidth('B2-P01')" :stroke-opacity="roomStrokeOpacity('B2-P01')"
              style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint('B2-P01')"/>
            <text x="920" y="300" text-anchor="middle" font-size="17" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Условная точка</text>
            <text x="920" y="323" text-anchor="middle" font-size="17" fill="#3730a3" font-family="sans-serif" font-weight="700" style="pointer-events:none">Корпуса 2</text>
            <text x="920" y="345" text-anchor="middle" font-size="12" fill="#dc2626" font-family="sans-serif" font-weight="700" style="pointer-events:none">Временное назначение</text>
          </template>

          <!-- ═══ МАРШРУТ ═══ -->
          <path v-if="currentRoutePoints.length > 1"
            :d="svgRoutePath()"
            fill="none" stroke="#0079C2" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round"
            stroke-dasharray="10 6" class="route-anim"
          />

          <circle v-for="point in routeBoundaryPoints" :key="`boundary-${point.id}`"
            :cx="point.x" :cy="point.y" r="12" fill="#f59e0b" stroke="white" stroke-width="4"/>

          <!-- ═══ МАРКЕР СТАРТА ═══ -->
          <template v-if="startPoint && pointIsOnCurrentMap(startPoint)">
            <circle :cx="startPoint.x" :cy="startPoint.y" r="20" fill="#0079C2" stroke="white" stroke-width="4"/>
            <circle :cx="startPoint.x" :cy="startPoint.y" r="8"  fill="white"/>
            <rect :x="startPoint.x - 42" :y="startPoint.y - 50" width="84" height="28" rx="14" fill="white" stroke="#c8d5e8" stroke-width="1.5"/>
            <text :x="startPoint.x" :y="startPoint.y - 30" text-anchor="middle" font-size="17" fill="#0079C2" font-family="sans-serif" font-weight="700" style="pointer-events:none">Старт</text>
          </template>

          <!-- ═══ МАРКЕР ЦЕЛИ ═══ -->
          <template v-if="targetPoint && pointIsOnCurrentMap(targetPoint)">
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
        <button class="nav-page__zoom-btn" @click="zoomOut" :disabled="zoom <= baseZoom + 0.001"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
      </div>
    </div>

    <div class="nav-page__below-map">
      <button class="nav-page__points-btn" @click="openDestinationPicker">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        Все места назначения
        <span class="nav-page__points-count">{{ destinationPoints.length }}</span>
      </button>
    </div>

    <div v-if="routeSegments.length > 1" class="nav-page__route-steps">
      <div class="nav-page__route-steps-head">
        <span>Участки маршрута</span>
        <small>{{ routeSegments.length }}</small>
      </div>
      <button v-for="(segment, index) in routeSegments" :key="segment.key"
        class="nav-page__route-step"
        :class="{ 'is-active': currentRouteSegment?.key === segment.key }"
        @click="showRouteSegment(segment)">
        <span class="nav-page__route-step-index">{{ index + 1 }}</span>
        <span class="nav-page__route-step-text">
          <strong>{{ buildingLabel(segment.building) }} · Этаж {{ segment.floor }}</strong>
          <small>{{ segmentInstruction(segment, index) }}</small>
        </span>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
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
          <button class="nav-page__destination-trigger" @click="openDestinationPicker">
            <span class="nav-page__info-text">
              <span class="nav-page__info-name">{{ targetPoint?.label ?? 'Найти место назначения' }}</span>
              <span class="nav-page__info-room">{{ targetPoint ? pointMeta(targetPoint) : 'Поиск по всем корпусам и этажам' }}</span>
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button v-if="targetId" class="nav-page__destination-clear" aria-label="Сбросить точку назначения" @click="clearDestination">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
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
          <button class="nav-page__change-btn" @click="destinationSearch = ''; showPointsList = true; selectingStart = true">Изменить</button>
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
            <h3>{{ selectingStart ? 'Выберите стартовую точку' : `Места назначения · ${destinationPoints.length}` }}</h3>
            <button @click="showPointsList = false; selectingStart = false; destinationSearch = ''">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div v-if="!selectingStart" class="nav-page__sheet-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/></svg>
            <input
              v-model="destinationSearch"
              type="search"
              inputmode="search"
              autocomplete="off"
              aria-label="Поиск места назначения"
              placeholder="Название, кабинет, этаж…"
            />
            <button v-if="destinationSearch" aria-label="Очистить поиск" @click="destinationSearch = ''">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="nav-page__sheet-list">
            <button
              v-for="pt in sheetPoints"
              :key="pt.id"
              class="nav-page__sheet-item"
              :class="{
                'is-target':  !selectingStart && targetId === pt.id,
                'is-start':   selectingStart  && startId  === pt.id,
              }"
              @click="selectSheetPoint(pt)"
            >
              <div class="nav-page__sheet-icon" :style="categoryColors[pt.category]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="categoryColors[pt.category].color" stroke-width="1.8" stroke-linecap="round">
                  <path :d="pointIcon(pt.category)"/>
                </svg>
              </div>
              <div>
                <p class="nav-page__sheet-name">{{ pt.label }}</p>
                <p class="nav-page__sheet-room">{{ selectingStart ? `${pt.room} · ${categoryLabels[pt.category]}` : pointMeta(pt) }}</p>
              </div>
              <svg v-if="(!selectingStart && targetId === pt.id) || (selectingStart && startId === pt.id)"
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-3)" stroke-width="1.8" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <div v-if="!sheetPoints.length" class="nav-page__sheet-empty">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/></svg>
              <p>Ничего не найдено</p>
              <span>Попробуйте изменить запрос</span>
            </div>
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
.nav-page__points-count {
  min-width: 22px; height: 22px; padding: 0 6px; border-radius: var(--r-full);
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--c-accent-dim); color: var(--c-accent);
  font-size: 11px; font-weight: 700;
}

/* Участки маршрута между этажами и корпусами */
.nav-page__route-steps {
  margin: var(--gap-sm) var(--gap-md) 0; padding: var(--gap-sm);
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-xl); box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; gap: 4px;
}
.nav-page__route-steps-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 2px 6px 6px; color: var(--c-text-2);
  font-size: var(--fs-xs); font-weight: 700; text-transform: uppercase; letter-spacing: .05em;
}
.nav-page__route-steps-head small {
  min-width: 22px; height: 22px; padding: 0 6px; border-radius: var(--r-full);
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--c-bg-2); color: var(--c-text-3); font-size: 11px;
}
.nav-page__route-step {
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border: 1px solid transparent; border-radius: var(--r-lg);
  background: transparent; color: var(--c-text-2); cursor: pointer;
  text-align: left; font-family: var(--font-body);
}
.nav-page__route-step.is-active { background: var(--c-accent-dim); border-color: #bfdbfe; color: var(--c-accent); }
.nav-page__route-step-index {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--c-bg-2); color: var(--c-text-2); font-size: 12px; font-weight: 700;
}
.nav-page__route-step.is-active .nav-page__route-step-index { background: var(--c-accent); color: #fff; }
.nav-page__route-step-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.nav-page__route-step-text strong { font-size: var(--fs-sm); font-weight: 700; }
.nav-page__route-step-text small { font-size: var(--fs-xs); color: var(--c-text-3); }
.nav-page__route-step > svg { flex-shrink: 0; }

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
.nav-page__info-text { flex: 1; min-width: 0; }
.nav-page__info-name { display: block; font-size: var(--fs-sm); font-weight: 600; }
.nav-page__info-room { display: block; font-size: var(--fs-xs); color: var(--c-text-3); }
.nav-page__destination-trigger {
  min-width: 0; flex: 1; display: flex; align-items: center; gap: var(--gap-sm);
  padding: 4px 0; text-align: left; background: transparent; border: none;
  color: inherit; font-family: var(--font-body); cursor: pointer;
}
.nav-page__destination-trigger > svg { color: var(--c-text-3); flex-shrink: 0; }
.nav-page__destination-clear {
  width: 34px; height: 34px; border-radius: var(--r-md); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--c-text-3); background: transparent; border: 1px solid var(--c-border);
  cursor: pointer; transition: background var(--dur-fast), color var(--dur-fast);
}
.nav-page__destination-clear:active { background: var(--c-bg-2); color: var(--c-text); }
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
.nav-page__sheet-search {
  margin: 0 var(--gap-md) var(--gap-sm); min-height: 44px; padding: 0 12px;
  display: flex; align-items: center; gap: 9px; flex-shrink: 0;
  background: var(--c-bg-2); border: 1.5px solid transparent; border-radius: var(--r-lg);
  color: var(--c-text-3); transition: border-color var(--dur-fast), background var(--dur-fast);
}
.nav-page__sheet-search:focus-within { background: var(--c-surface); border-color: var(--c-accent); }
.nav-page__sheet-search input {
  min-width: 0; flex: 1; border: none; outline: none; background: transparent;
  color: var(--c-text); font-family: var(--font-body); font-size: var(--fs-sm);
}
.nav-page__sheet-search input::placeholder { color: var(--c-text-3); }
.nav-page__sheet-search button {
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  border: none; background: transparent; color: var(--c-text-3); cursor: pointer;
}
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
.nav-page__sheet-item > div:nth-child(2) { min-width: 0; flex: 1; }
.nav-page__sheet-name { font-size: var(--fs-sm); font-weight: 600; }
.nav-page__sheet-room { font-size: var(--fs-xs); color: var(--c-text-3); }
.nav-page__sheet-empty {
  min-height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: var(--c-text-3); text-align: center; gap: 6px;
}
.nav-page__sheet-empty p { font-size: var(--fs-sm); font-weight: 600; color: var(--c-text-2); }
.nav-page__sheet-empty span { font-size: var(--fs-xs); }

/* Анимации */
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s var(--ease-out); }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px); }
.sheet-enter-active, .sheet-leave-active { transition: all 0.3s var(--ease-out); }
.sheet-enter-from .nav-page__sheet, .sheet-leave-to .nav-page__sheet { transform: translateY(100%); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }

.nav-spacer { height: 80px; }
</style>

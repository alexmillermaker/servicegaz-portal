<template>
  <div class="dash">
    <div class="dash__header">
      <div>
        <h1 class="dash__title">Панель администратора</h1>
        <p class="dash__sub">UNITorg SG · Обзор состояния системы</p>
      </div>
      <div class="dash__header-right">
        <div class="dash__date-range">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {{ todayLabel }}
        </div>
        <button class="dash__customize-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          Настроить вид
        </button>
      </div>
    </div>

    <div class="dash__stats">
      <div v-for="card in statCards" :key="card.label" class="stat-card">
        <div class="stat-card__icon" :style="{ background: card.iconBg }">
          <span v-html="card.icon" :style="{ color: card.iconColor }" />
        </div>
        <div class="stat-card__value">{{ card.value }}</div>
        <div class="stat-card__label">{{ card.label }}</div>
        <div class="stat-card__trend" :class="card.trendNeutral ? 'trend--neutral' : 'trend--up'">{{ card.trend }}</div>
        <div class="stat-card__bar"><div class="stat-card__bar-fill" :style="{ width: card.barPct + '%', background: card.barColor }" /></div>
      </div>
    </div>

    <div class="dash__grid">
      <div class="dash__col">
        <div class="dash-card">
          <div class="dash-card__head"><h2 class="dash-card__title">Недавняя активность</h2></div>
          <div class="table-scroll">
            <table class="activity-table">
              <thead><tr><th>Время</th><th>Пользователь</th><th>Действие</th><th>Объект</th><th>Детали</th><th></th></tr></thead>
              <tbody>
                <tr v-for="log in activityLog" :key="log.id">
                  <td class="activity-table__time">{{ log.time }}</td>
                  <td><div class="activity-table__user"><div class="activity-table__avatar">{{ log.userInitials }}</div><span>{{ log.userName }}</span></div></td>
                  <td><span class="activity-badge" :class="'activity-badge--' + actionClass(log.action)">{{ log.action }}</span></td>
                  <td class="activity-table__object">{{ log.object }}</td>
                  <td class="activity-table__details">{{ log.details }}</td>
                  <td><button class="activity-table__chevron"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <RouterLink to="/admin/audit" class="dash-card__link">Перейти в журнал действий <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></RouterLink>
        </div>

        <div class="dash-card">
          <div class="dash-card__head"><h2 class="dash-card__title">Документы на ознакомление</h2></div>
          <div class="table-scroll">
            <table class="docs-table">
              <thead><tr><th>Документ</th><th>Тип</th><th>Назначен</th><th>Крайний срок</th><th>Назначено</th></tr></thead>
              <tbody>
                <tr v-for="doc in pendingDocs" :key="doc.id">
                  <td><div class="docs-table__file"><span class="docs-table__ext" :class="'ext--' + doc.fileType">{{ doc.fileType.toUpperCase() }}</span><span class="docs-table__name">{{ doc.title }}</span></div></td>
                  <td class="docs-table__meta">{{ doc.fileType.toUpperCase() }} · {{ doc.fileSize }}</td>
                  <td class="docs-table__date">{{ formatDate(doc.assignedDate) }}</td>
                  <td class="docs-table__due" :class="{ 'is-overdue': isOverdue(doc.dueDate) }">{{ formatDate(doc.dueDate) }}</td>
                  <td class="docs-table__count">{{ doc.assignedTo }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <RouterLink to="/admin/documents" class="dash-card__link">Перейти к документам <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></RouterLink>
        </div>
      </div>

      <div class="dash__col dash__col--right">
        <div class="dash-card">
          <div class="dash-card__head"><h2 class="dash-card__title">Статус адаптации</h2></div>
          <div class="donut-wrap">
            <svg viewBox="0 0 160 160" class="donut-svg">
              <circle cx="80" cy="80" r="60" fill="none" stroke="#e5e7eb" stroke-width="22"/>
              <circle cx="80" cy="80" r="60" fill="none" stroke="#22c55e" stroke-width="22" stroke-dasharray="285.6 91.9" stroke-dashoffset="0" transform="rotate(-90 80 80)"/>
              <circle cx="80" cy="80" r="60" fill="none" stroke="#f59e0b" stroke-width="22" stroke-dasharray="67.9 309.6" stroke-dashoffset="-285.6" transform="rotate(-90 80 80)"/>
              <circle cx="80" cy="80" r="60" fill="none" stroke="#ef4444" stroke-width="22" stroke-dasharray="23.4 354.1" stroke-dashoffset="-353.5" transform="rotate(-90 80 80)"/>
              <text x="80" y="76" text-anchor="middle" font-size="22" font-weight="800" fill="#111827" font-family="sans-serif">128</text>
              <text x="80" y="92" text-anchor="middle" font-size="9" fill="#6b7280" font-family="sans-serif">сотрудников</text>
            </svg>
          </div>
          <div class="donut-legend">
            <div v-for="item in adaptationLegend" :key="item.label" class="donut-legend__item">
              <span class="donut-legend__dot" :style="{ background: item.color }" />
              <span class="donut-legend__label">{{ item.label }}</span>
              <span class="donut-legend__count">{{ item.count }}</span>
              <span class="donut-legend__pct">({{ item.pct }}%)</span>
            </div>
          </div>
          <RouterLink to="/admin/adaptation" class="dash-card__link">Перейти к адаптации <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></RouterLink>
        </div>

        <div class="dash-card">
          <div class="dash-card__head">
            <h2 class="dash-card__title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Проблемы с данными
            </h2>
          </div>
          <div class="problems-list">
            <div v-for="p in dataProblems" :key="p.label" class="problem-item">
              <span class="problem-item__label">{{ p.label }}</span>
              <span class="problem-item__count" :class="p.count > 5 ? 'count--red' : 'count--orange'">{{ p.count }}</span>
            </div>
          </div>
          <RouterLink to="/admin/employees" class="dash-card__link">Перейти к проверке данных <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { mockActivityLog, mockDocuments } from '@/api/mockData'

const today = new Date()
const todayLabel = today.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })

function formatDate(d: string) {
  if (!d || d === '---') return '---'
  return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function isOverdue(d: string) {
  if (!d || d === '---') return false
  return new Date(d) < today
}
function actionClass(action: string) {
  const map: Record<string, string> = { 'Создано': 'green', 'Обновлено': 'blue', 'Назначено': 'orange', 'Просмотрено': 'gray', 'Заблокировано': 'red', 'Удалено': 'red' }
  return map[action] ?? 'gray'
}

const activityLog = mockActivityLog.slice(0, 5)
const pendingDocs = mockDocuments.filter(d => d.requiresAck).slice(0, 3)

const statCards = [
  { label: 'Активные сотрудники', value: 128, trend: '12 за неделю', trendNeutral: false, barPct: 75, barColor: '#0079C2', iconBg: '#dbeafe', iconColor: '#1d4ed8', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
  { label: 'Неполная адаптация', value: 23, trend: '5 за неделю', trendNeutral: false, barPct: 18, barColor: '#f59e0b', iconBg: '#fff7ed', iconColor: '#c2410c', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></svg>' },
  { label: 'Просроченная адаптация', value: 8, trend: '2 за неделю', trendNeutral: false, barPct: 6, barColor: '#ef4444', iconBg: '#fee2e2', iconColor: '#dc2626', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
  { label: 'Документы на ознакомление', value: 14, trend: 'без изменений', trendNeutral: true, barPct: 50, barColor: '#8b5cf6', iconBg: '#f3f0ff', iconColor: '#6d28d9', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
  { label: 'Действий сегодня', value: 156, trend: '+18% к вчерашнему дню', trendNeutral: false, barPct: 82, barColor: '#22c55e', iconBg: '#dcfce7', iconColor: '#15803d', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' },
]

const adaptationLegend = [
  { label: 'Завершена',    color: '#22c55e', count: 97, pct: 75.8 },
  { label: 'В процессе',  color: '#f59e0b', count: 23, pct: 18.0 },
  { label: 'Просрочена',  color: '#ef4444', count:  8, pct:  6.2 },
  { label: 'Не назначена', color: '#d1d5db', count:  0, pct:  0.0 },
]

const dataProblems = [
  { label: 'Сотрудники без подразделения', count: 5 },
  { label: 'Сотрудники без должности', count: 3 },
  { label: 'Дублирующиеся email', count: 2 },
  { label: 'Просроченные адаптации', count: 8 },
]
</script>

<style scoped>
.dash { display: flex; flex-direction: column; gap: 20px; }
.dash__header { display: flex; align-items: flex-start; justify-content: space-between; }
.dash__title  { font-size: 22px; font-weight: 800; color: #111827; }
.dash__sub    { font-size: 13px; color: #6b7280; margin-top: 2px; }
.dash__header-right { display: flex; align-items: center; gap: 10px; }
.dash__date-range { display: flex; align-items: center; gap: 6px; padding: 7px 12px; background: #fff; border: 1px solid #e5e9ef; border-radius: 8px; font-size: 13px; font-weight: 500; color: #374151; }
.dash__customize-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; background: #fff; border: 1px solid #e5e9ef; border-radius: 8px; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; font-family: var(--font-body); transition: background 0.15s; }
.dash__customize-btn:hover { background: #f9fafb; }
.dash__stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
.stat-card { background: #fff; border: 1px solid #e5e9ef; border-radius: 12px; padding: 18px 16px 14px; display: flex; flex-direction: column; gap: 6px; }
.stat-card__icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
.stat-card__value { font-size: 32px; font-weight: 800; color: #111827; line-height: 1; }
.stat-card__label { font-size: 13px; color: #6b7280; line-height: 1.4; }
.stat-card__trend { font-size: 12px; font-weight: 600; margin-top: 2px; }
.trend--up { color: #16a34a; }
.trend--neutral { color: #9ca3af; }
.stat-card__bar { height: 3px; background: #f3f4f6; border-radius: 2px; overflow: hidden; margin-top: 4px; }
.stat-card__bar-fill { height: 100%; border-radius: 2px; }
.dash__grid { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 20px; align-items: start; }
.dash__col { display: flex; flex-direction: column; gap: 20px; }
.dash-card { background: #fff; border: 1px solid #e5e9ef; border-radius: 12px; overflow: hidden; }
.dash-card__head { padding: 16px 20px 12px; border-bottom: 1px solid #f3f4f6; }
.dash-card__title { font-size: 15px; font-weight: 700; color: #111827; display: flex; align-items: center; gap: 7px; }
.dash-card__link { display: flex; align-items: center; gap: 4px; padding: 12px 20px; font-size: 13px; font-weight: 600; color: #0079C2; text-decoration: none; border-top: 1px solid #f3f4f6; transition: background 0.15s; }
.dash-card__link:hover { background: #f0f9ff; }
.table-scroll { overflow-x: auto; }
.activity-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 580px; }
.activity-table th { padding: 10px 14px 8px; text-align: left; font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; background: #f9fafb; white-space: nowrap; }
.activity-table td { padding: 11px 14px; border-top: 1px solid #f3f4f6; color: #374151; vertical-align: middle; }
.activity-table__time { color: #9ca3af; white-space: nowrap; font-size: 12px; }
.activity-table__object { color: #6b7280; white-space: nowrap; }
.activity-table__details { color: #374151; max-width: 200px; font-size: 12px; }
.activity-table__user { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
.activity-table__avatar { width: 28px; height: 28px; border-radius: 6px; background: #dbeafe; color: #1d4ed8; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.activity-badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 5px; white-space: nowrap; }
.activity-badge--green  { background: #dcfce7; color: #166534; }
.activity-badge--blue   { background: #dbeafe; color: #1d4ed8; }
.activity-badge--orange { background: #fff7ed; color: #c2410c; }
.activity-badge--gray   { background: #f3f4f6; color: #6b7280; }
.activity-badge--red    { background: #fee2e2; color: #dc2626; }
.activity-table__chevron { background: none; border: none; color: #d1d5db; cursor: pointer; padding: 4px; border-radius: 4px; display: flex; align-items: center; transition: color 0.15s; }
.activity-table__chevron:hover { color: #0079C2; }
.docs-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 480px; }
.docs-table th { padding: 10px 14px 8px; text-align: left; font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; background: #f9fafb; white-space: nowrap; }
.docs-table td { padding: 11px 14px; border-top: 1px solid #f3f4f6; vertical-align: middle; }
.docs-table__file { display: flex; align-items: center; gap: 8px; }
.docs-table__ext { font-size: 10px; font-weight: 700; padding: 2px 5px; border-radius: 4px; flex-shrink: 0; }
.ext--pdf  { background: #fee2e2; color: #dc2626; }
.ext--docx { background: #dbeafe; color: #1d4ed8; }
.ext--xlsx { background: #d1fae5; color: #065f46; }
.docs-table__name { color: #111827; max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.docs-table__meta { color: #9ca3af; white-space: nowrap; font-size: 12px; }
.docs-table__date { color: #6b7280; white-space: nowrap; font-size: 12px; }
.docs-table__due  { white-space: nowrap; color: #6b7280; font-size: 12px; }
.docs-table__due.is-overdue { color: #dc2626; font-weight: 600; }
.docs-table__count { font-weight: 600; color: #374151; }
.donut-wrap { display: flex; justify-content: center; padding: 16px; }
.donut-svg  { width: 160px; height: 160px; }
.donut-legend { display: flex; flex-direction: column; gap: 8px; padding: 0 20px 16px; }
.donut-legend__item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.donut-legend__dot  { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.donut-legend__label { flex: 1; color: #374151; }
.donut-legend__count { font-weight: 700; color: #111827; }
.donut-legend__pct   { color: #9ca3af; }
.problems-list { padding: 4px 0; }
.problem-item { display: flex; align-items: center; justify-content: space-between; padding: 11px 20px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #374151; }
.problem-item:last-child { border-bottom: none; }
.problem-item__count { font-weight: 700; font-size: 15px; }
.count--red    { color: #dc2626; }
.count--orange { color: #f59e0b; }
</style>

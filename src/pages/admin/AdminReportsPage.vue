<template>
  <div class="reports-page">
    <div class="reports-page__header">
      <div>
        <h1 class="reports-page__title">Отчёты и аналитика</h1>
        <p class="reports-page__sub">Данные за {{ period }}</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <select v-model="period" class="filter-select">
          <option>Июнь 2026</option>
          <option>Май 2026</option>
          <option>Апрель 2026</option>
          <option>Q2 2026</option>
        </select>
        <button class="btn btn--outline" @click="exportXlsx">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Экспорт Excel
        </button>
        <button class="btn btn--outline" @click="exportPdf">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Экспорт PDF
        </button>
      </div>
    </div>

    <!-- Табы -->
    <div class="reports-tabs">
      <button v-for="tab in tabs" :key="tab.key" class="reports-tab" :class="{ 'reports-tab--active': activeTab === tab.key }" @click="activeTab = tab.key">{{ tab.label }}</button>
    </div>

    <!-- Сводка -->
    <div v-if="activeTab === 'summary'" class="tab-content">
      <div class="kpi-grid">
        <div v-for="kpi in kpis" :key="kpi.label" class="kpi-card">
          <div class="kpi-card__icon" :style="{ background: kpi.color + '22', color: kpi.color }">
            <span v-html="kpi.icon" />
          </div>
          <div class="kpi-card__body">
            <span class="kpi-card__val">{{ kpi.value }}</span>
            <span class="kpi-card__label">{{ kpi.label }}</span>
            <span class="kpi-card__delta" :class="kpi.delta > 0 ? 'kpi-card__delta--up' : 'kpi-card__delta--down'">
              {{ kpi.delta > 0 ? '+' : '' }}{{ kpi.delta }}{{ kpi.unit }}
            </span>
          </div>
        </div>
      </div>

      <!-- Диаграмма найма по месяцам -->
      <div class="chart-section">
        <h2 class="chart-section__title">Динамика найма</h2>
        <div class="bar-chart">
          <div v-for="bar in hiringData" :key="bar.month" class="bar-chart__col">
            <div class="bar-chart__bar-wrap">
              <div class="bar-chart__bar" :style="{ height: (bar.value / maxHiring * 100) + '%', background: '#0079C2' }">
                <span class="bar-chart__bar-val">{{ bar.value }}</span>
              </div>
            </div>
            <span class="bar-chart__label">{{ bar.month }}</span>
          </div>
        </div>
      </div>

      <!-- Структура по отделам -->
      <div class="reports-two-col">
        <div class="chart-section">
          <h2 class="chart-section__title">Сотрудники по отделам</h2>
          <div class="dept-list">
            <div v-for="dept in deptBreakdown" :key="dept.name" class="dept-row">
              <span class="dept-row__name">{{ dept.name }}</span>
              <div class="dept-row__bar-wrap">
                <div class="dept-row__bar" :style="{ width: (dept.count / totalEmployees * 100) + '%', background: dept.color }"></div>
              </div>
              <span class="dept-row__count">{{ dept.count }}</span>
              <span class="dept-row__pct">{{ Math.round(dept.count / totalEmployees * 100) }}%</span>
            </div>
          </div>
        </div>
        <div class="chart-section">
          <h2 class="chart-section__title">Статусы сотрудников</h2>
          <div class="donut-wrap">
            <svg viewBox="0 0 120 120" class="donut">
              <circle cx="60" cy="60" r="45" fill="none" stroke="#f3f4f6" stroke-width="18" />
              <circle cx="60" cy="60" r="45" fill="none" stroke="#0079C2" stroke-width="18" stroke-dasharray="212.1 282.7" stroke-dashoffset="70.7" stroke-linecap="round" />
              <circle cx="60" cy="60" r="45" fill="none" stroke="#22c55e" stroke-width="18" stroke-dasharray="42.4 282.7" stroke-dashoffset="-141.4" stroke-linecap="round" />
              <circle cx="60" cy="60" r="45" fill="none" stroke="#ef4444" stroke-width="18" stroke-dasharray="28.3 282.7" stroke-dashoffset="-183.8" stroke-linecap="round" />
            </svg>
            <div class="donut-legend">
              <div class="donut-legend__item"><span class="donut-legend__dot" style="background:#0079C2"></span><span>Активны (96)</span></div>
              <div class="donut-legend__item"><span class="donut-legend__dot" style="background:#22c55e"></span><span>Адаптация (19)</span></div>
              <div class="donut-legend__item"><span class="donut-legend__dot" style="background:#ef4444"></span><span>Заблокированы (13)</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Текучесть -->
    <div v-if="activeTab === 'turnover'" class="tab-content">
      <div class="reports-table-wrap">
        <table class="reports-table">
          <thead><tr><th>Отдел</th><th>Принято</th><th>Уволено</th><th>Текучесть</th><th>Средний стаж</th></tr></thead>
          <tbody>
            <tr v-for="r in turnoverData" :key="r.dept">
              <td class="reports-table__td-bold">{{ r.dept }}</td>
              <td class="reports-table__td-center"><span class="badge-green">+{{ r.hired }}</span></td>
              <td class="reports-table__td-center"><span class="badge-red">-{{ r.fired }}</span></td>
              <td class="reports-table__td-center">
                <span :class="r.rate > 15 ? 'badge-red' : r.rate > 8 ? 'badge-yellow' : 'badge-green'">{{ r.rate }}%</span>
              </td>
              <td class="reports-table__td-center">{{ r.avgTenure }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Адаптация -->
    <div v-if="activeTab === 'adaptation'" class="tab-content">
      <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-card__icon" style="background:#e0f2fe;color:#0369a1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div><div class="kpi-card__body"><span class="kpi-card__val">87%</span><span class="kpi-card__label">Успешно адаптированы</span><span class="kpi-card__delta kpi-card__delta--up">+5%</span></div></div>
        <div class="kpi-card"><div class="kpi-card__icon" style="background:#fef9c3;color:#a16207"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="kpi-card__body"><span class="kpi-card__val">32 дня</span><span class="kpi-card__label">Средний срок адаптации</span><span class="kpi-card__delta kpi-card__delta--down">+3 дня</span></div></div>
        <div class="kpi-card"><div class="kpi-card__icon" style="background:#fee2e2;color:#b91c1c"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div><div class="kpi-card__body"><span class="kpi-card__val">3</span><span class="kpi-card__label">Просрочено</span><span class="kpi-card__delta kpi-card__delta--down">+1</span></div></div>
      </div>
      <div class="chart-section">
        <h2 class="chart-section__title">Прогресс по программам адаптации</h2>
        <div class="progress-list">
          <div v-for="prog in adaptPrograms" :key="prog.name" class="progress-row">
            <div class="progress-row__info">
              <span class="progress-row__name">{{ prog.name }}</span>
              <span class="progress-row__pct">{{ prog.pct }}%</span>
            </div>
            <div class="progress-row__bar"><div class="progress-row__fill" :style="{ width: prog.pct + '%', background: prog.pct >= 80 ? '#22c55e' : prog.pct >= 50 ? '#0079C2' : '#f59e0b' }"></div></div>
            <span class="progress-row__count">{{ prog.count }} чел.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const period = ref('Июнь 2026')
const activeTab = ref('summary')
const tabs = [{ key: 'summary', label: 'Сводка' }, { key: 'turnover', label: 'Текучесть' }, { key: 'adaptation', label: 'Адаптация' }]

const iconSvg = (d: string) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">${d}</svg>`

const kpis = [
  { label: 'Всего сотрудников', value: '128', delta: 3, unit: '', color: '#0079C2', icon: iconSvg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>') },
  { label: 'Принято в этом месяце', value: '7', delta: 2, unit: '', color: '#22c55e', icon: iconSvg('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>') },
  { label: 'Уволено', value: '3', delta: -1, unit: '', color: '#ef4444', icon: iconSvg('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>') },
  { label: 'Уровень текучести', value: '8.2%', delta: -0.5, unit: '%', color: '#f59e0b', icon: iconSvg('<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>') },
]

const hiringData = [
  { month: 'Янв', value: 4 }, { month: 'Фев', value: 6 }, { month: 'Мар', value: 9 }, { month: 'Апр', value: 5 },
  { month: 'Май', value: 8 }, { month: 'Июн', value: 7 },
]
const maxHiring = computed(() => Math.max(...hiringData.map(b => b.value)))

const deptBreakdown = [
  { name: 'Производство', count: 45, color: '#0079C2' },
  { name: 'IT', count: 22, color: '#8b5cf6' },
  { name: 'HR', count: 12, color: '#22c55e' },
  { name: 'Бухгалтерия', count: 18, color: '#f59e0b' },
  { name: 'Прочие', count: 31, color: '#9ca3af' },
]
const totalEmployees = computed(() => deptBreakdown.reduce((s, d) => s + d.count, 0))

const turnoverData = [
  { dept: 'Производство', hired: 4, fired: 3, rate: 6.7, avgTenure: '2 года 4 мес.' },
  { dept: 'IT', hired: 2, fired: 1, rate: 4.5, avgTenure: '1 год 8 мес.' },
  { dept: 'HR', hired: 1, fired: 0, rate: 0, avgTenure: '3 года 1 мес.' },
  { dept: 'Бухгалтерия', hired: 0, fired: 2, rate: 11.1, avgTenure: '4 года 7 мес.' },
  { dept: 'Прочие', hired: 0, fired: 2, rate: 16.4, avgTenure: '11 мес.' },
]

const adaptPrograms = [
  { name: 'Онбординг разработчика', pct: 65, count: 4 },
  { name: 'Онбординг HR-специалиста', pct: 100, count: 3 },
  { name: 'Адаптация инженера', pct: 30, count: 6 },
  { name: 'Онбординг менеджера', pct: 80, count: 5 },
]

function exportXlsx() {
  const rows: (string | number)[][] = [['Отдел','Принято','Уволено','Текучесть,%','Средний стаж']]
  for (const r of turnoverData) rows.push([r.dept, r.hired, r.fired, r.rate, r.avgTenure])
  const csv = rows.map(r => r.join(';')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob); const a = document.createElement('a')
  a.href = url; a.download = 'report_turnover.csv'; a.click(); URL.revokeObjectURL(url)
}
function exportPdf() { window.print() }
</script>

<style scoped>
.reports-page { width: 100%; }
.reports-page__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
.reports-page__title { font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.reports-page__sub { font-size: 13px; color: #6b7280; }
.filter-select { padding: 8px 12px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; background: #fff; color: #374151; outline: none; cursor: pointer; }

.reports-tabs { display: flex; gap: 4px; margin-bottom: 20px; background: #f3f4f6; padding: 4px; border-radius: 10px; width: fit-content; }
.reports-tab { padding: 7px 18px; border-radius: 7px; border: none; background: transparent; font-size: 13px; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.15s; font-family: inherit; }
.reports-tab--active { background: #fff; color: #111827; font-weight: 700; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }

.tab-content { display: flex; flex-direction: column; gap: 20px; }

.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.kpi-card { background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; padding: 18px; display: flex; align-items: flex-start; gap: 14px; }
.kpi-card__icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-card__body { display: flex; flex-direction: column; }
.kpi-card__val { font-size: 26px; font-weight: 800; color: #111827; line-height: 1.1; }
.kpi-card__label { font-size: 12px; color: #6b7280; margin-top: 2px; }
.kpi-card__delta { font-size: 12px; font-weight: 600; margin-top: 4px; }
.kpi-card__delta--up { color: #22c55e; }
.kpi-card__delta--down { color: #ef4444; }

.chart-section { background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; padding: 20px; }
.chart-section__title { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 16px; }

.bar-chart { display: flex; align-items: flex-end; gap: 10px; height: 160px; }
.bar-chart__col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; }
.bar-chart__bar-wrap { flex: 1; display: flex; align-items: flex-end; width: 100%; }
.bar-chart__bar { width: 100%; border-radius: 5px 5px 0 0; min-height: 4px; transition: height 0.4s ease; display: flex; align-items: flex-start; justify-content: center; padding-top: 4px; }
.bar-chart__bar-val { font-size: 11px; font-weight: 700; color: #fff; }
.bar-chart__label { font-size: 11px; color: #6b7280; font-weight: 500; }

.reports-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 800px) { .reports-two-col { grid-template-columns: 1fr; } }

.dept-list { display: flex; flex-direction: column; gap: 10px; }
.dept-row { display: grid; grid-template-columns: 120px 1fr 40px 40px; align-items: center; gap: 10px; }
.dept-row__name { font-size: 13px; color: #374151; }
.dept-row__bar-wrap { height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
.dept-row__bar { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
.dept-row__count { font-size: 13px; font-weight: 700; color: #111827; text-align: right; }
.dept-row__pct { font-size: 11px; color: #6b7280; text-align: right; }

.donut-wrap { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.donut { width: 120px; height: 120px; flex-shrink: 0; transform: rotate(-90deg); }
.donut-legend { display: flex; flex-direction: column; gap: 10px; }
.donut-legend__item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; }
.donut-legend__dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

.reports-table-wrap { background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; overflow: auto; }
.reports-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.reports-table thead { background: #f8fafc; border-bottom: 1px solid #e5e9ef; }
.reports-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
.reports-table td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.reports-table tr:last-child td { border-bottom: none; }
.reports-table__td-bold { font-weight: 600; color: #111827; }
.reports-table__td-center { text-align: center; }
.badge-green { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; background: #d1fae5; color: #065f46; }
.badge-red { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; background: #fee2e2; color: #b91c1c; }
.badge-yellow { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; background: #fef9c3; color: #92400e; }

.progress-list { display: flex; flex-direction: column; gap: 14px; }
.progress-row { display: grid; grid-template-columns: 1fr 200px 60px; align-items: center; gap: 14px; }
.progress-row__info { display: flex; flex-direction: column; }
.progress-row__name { font-size: 13px; font-weight: 600; color: #111827; }
.progress-row__pct { font-size: 12px; color: #6b7280; }
.progress-row__bar { height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
.progress-row__fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
.progress-row__count { font-size: 12px; color: #6b7280; text-align: right; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; font-family: inherit; }
.btn--outline { background: #fff; border: 1px solid #e5e9ef; color: #374151; }
.btn--outline:hover { border-color: #0079C2; color: #0079C2; }
</style>
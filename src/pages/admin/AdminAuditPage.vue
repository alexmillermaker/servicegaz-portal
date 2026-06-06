<template>
  <div class="audit">
    <!-- Шапка -->
    <div class="audit__header">
      <div>
        <h1 class="audit__title">Журнал действий</h1>
        <p class="audit__sub">{{ filtered.length }} событий · за последние 30 дней</p>
      </div>
      <div class="audit__actions">
        <button class="btn btn--outline" @click="exportCsv">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Экспорт
        </button>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="audit__filters">
      <div class="search-wrap">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" placeholder="Поиск по действию или пользователю…" class="search-input" />
      </div>
      <select v-model="filterAction" class="filter-select">
        <option value="">Все действия</option>
        <option value="login">Вход в систему</option>
        <option value="update">Изменение данных</option>
        <option value="delete">Удаление</option>
        <option value="create">Создание</option>
        <option value="block">Блокировка</option>
      </select>
      <select v-model="filterUser" class="filter-select">
        <option value="">Все пользователи</option>
        <option v-for="u in uniqueUsers" :key="u" :value="u">{{ u }}</option>
      </select>
      <button v-if="search || filterAction || filterUser" class="btn btn--ghost" @click="resetFilters">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        Сбросить
      </button>
    </div>

    <!-- Таблица -->
    <div class="audit__table-wrap">
      <table class="audit__table">
        <thead>
          <tr>
            <th>Дата и время</th>
            <th>Пользователь</th>
            <th>Действие</th>
            <th>Объект</th>
            <th>IP-адрес</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginated" :key="row.id" class="audit__row">
            <td class="audit__td-time">
              <span class="audit__date">{{ row.date }}</span>
              <span class="audit__time">{{ row.time }}</span>
            </td>
            <td>
              <div class="audit__user">
                <div class="audit__user-avatar">{{ row.user[0] }}</div>
                <span>{{ row.user }}</span>
              </div>
            </td>
            <td>
              <span class="audit__action-badge" :class="`audit__action-badge--${row.actionType}`">{{ row.action }}</span>
            </td>
            <td class="audit__td-object">{{ row.object }}</td>
            <td class="audit__td-ip">{{ row.ip }}</td>
            <td>
              <span class="audit__status" :class="`audit__status--${row.status}`">
                {{ row.status === 'ok' ? 'Успешно' : 'Ошибка' }}
              </span>
            </td>
          </tr>
          <tr v-if="paginated.length === 0">
            <td colspan="6" class="audit__empty">Нет записей по выбранным фильтрам</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Пагинация -->
    <div class="audit__pagination" v-if="totalPages > 1">
      <button class="page-btn" :disabled="page === 1" @click="page--">‹</button>
      <button
        v-for="p in totalPages" :key="p"
        class="page-btn" :class="{ 'page-btn--active': p === page }"
        @click="page = p"
      >{{ p }}</button>
      <button class="page-btn" :disabled="page === totalPages" @click="page++">›</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface LogRow {
  id: number; date: string; time: string; user: string; action: string;
  actionType: string; object: string; ip: string; status: 'ok' | 'error';
}

const rows: LogRow[] = [
  { id: 1, date: '05.06.2026', time: '14:32', user: 'Карпова А.В.', action: 'Вход в систему', actionType: 'login', object: 'Авторизация', ip: '10.0.1.45', status: 'ok' },
  { id: 2, date: '05.06.2026', time: '14:15', user: 'Карпова А.В.', action: 'Изменение данных', actionType: 'update', object: 'Сотрудник: Иванов П.С.', ip: '10.0.1.45', status: 'ok' },
  { id: 3, date: '05.06.2026', time: '11:02', user: 'Смирнов К.Д.', action: 'Блокировка', actionType: 'block', object: 'Сотрудник: Петров А.И.', ip: '192.168.1.22', status: 'ok' },
  { id: 4, date: '04.06.2026', time: '17:48', user: 'Карпова А.В.', action: 'Создание', actionType: 'create', object: 'Новость: Обновление системы', ip: '10.0.1.45', status: 'ok' },
  { id: 5, date: '04.06.2026', time: '16:30', user: 'Волков Д.Р.', action: 'Удаление', actionType: 'delete', object: 'Документ: Приказ №41', ip: '10.0.2.11', status: 'ok' },
  { id: 6, date: '04.06.2026', time: '15:12', user: 'Смирнов К.Д.', action: 'Вход в систему', actionType: 'login', object: 'Авторизация', ip: '192.168.1.22', status: 'error' },
  { id: 7, date: '04.06.2026', time: '12:05', user: 'Новикова О.П.', action: 'Создание', actionType: 'create', object: 'Адаптационный план: Онбординг', ip: '10.0.3.7', status: 'ok' },
  { id: 8, date: '03.06.2026', time: '18:22', user: 'Карпова А.В.', action: 'Изменение данных', actionType: 'update', object: 'Роль: Аналитик → Менеджер', ip: '10.0.1.45', status: 'ok' },
  { id: 9, date: '03.06.2026', time: '10:45', user: 'Волков Д.Р.', action: 'Вход в систему', actionType: 'login', object: 'Авторизация', ip: '10.0.2.11', status: 'ok' },
  { id: 10, date: '02.06.2026', time: '09:10', user: 'Новикова О.П.', action: 'Изменение данных', actionType: 'update', object: 'Документ: Регламент ИБ', ip: '10.0.3.7', status: 'ok' },
  { id: 11, date: '02.06.2026', time: '08:54', user: 'Смирнов К.Д.', action: 'Создание', actionType: 'create', object: 'Событие: Планёрка отдела', ip: '192.168.1.22', status: 'ok' },
  { id: 12, date: '01.06.2026', time: '16:00', user: 'Карпова А.В.', action: 'Удаление', actionType: 'delete', object: 'Сотрудник: Тестов Т.Т.', ip: '10.0.1.45', status: 'ok' },
  { id: 13, date: '01.06.2026', time: '14:30', user: 'Волков Д.Р.', action: 'Блокировка', actionType: 'block', object: 'Сотрудник: Грушин А.А.', ip: '10.0.2.11', status: 'ok' },
  { id: 14, date: '31.05.2026', time: '11:11', user: 'Новикова О.П.', action: 'Вход в систему', actionType: 'login', object: 'Авторизация', ip: '10.0.3.7', status: 'ok' },
  { id: 15, date: '30.05.2026', time: '09:00', user: 'Карпова А.В.', action: 'Создание', actionType: 'create', object: 'Пользователь: Лебедев С.К.', ip: '10.0.1.45', status: 'ok' },
]

const search = ref('')
const filterAction = ref('')
const filterUser = ref('')
const page = ref(1)
const PER_PAGE = 10

const uniqueUsers = computed(() => [...new Set(rows.map(r => r.user))])

const filtered = computed(() => {
  let list = rows
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(r => r.action.toLowerCase().includes(q) || r.user.toLowerCase().includes(q) || r.object.toLowerCase().includes(q))
  }
  if (filterAction.value) list = list.filter(r => r.actionType === filterAction.value)
  if (filterUser.value) list = list.filter(r => r.user === filterUser.value)
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)))
const paginated = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))

function resetFilters() { search.value = ''; filterAction.value = ''; filterUser.value = ''; page.value = 1 }
function exportCsv() {
  const headers = ['Дата','Время','Пользователь','Действие','Объект','IP-адрес','Статус']
  const csvRows = [headers.join(';')]
  for (const row of filtered.value) {
    csvRows.push([row.date, row.time, row.user, row.action, row.object, row.ip, row.status === 'ok' ? 'Успешно' : 'Ошибка'].join(';'))
  }
  const blob = new Blob(['﻿' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'audit_log.csv'; a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.audit { width: 100%; }
.audit__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.audit__title { font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.audit__sub { font-size: 13px; color: #6b7280; }
.audit__actions { display: flex; gap: 10px; }

.audit__filters {
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
  background: #fff; border-radius: 12px; padding: 12px 16px;
  border: 1px solid #e5e9ef; margin-bottom: 16px;
}
.search-wrap { position: relative; flex: 1; min-width: 200px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
.search-input { width: 100%; padding: 8px 12px 8px 32px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; outline: none; background: #f9fafb; color: #111827; }
.search-input:focus { border-color: #0079C2; background: #fff; }
.filter-select { padding: 8px 12px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; background: #f9fafb; color: #374151; outline: none; cursor: pointer; }
.filter-select:focus { border-color: #0079C2; }

.audit__table-wrap { background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; overflow: auto; }
.audit__table { width: 100%; border-collapse: collapse; font-size: 13px; }
.audit__table thead tr { background: #f8fafc; border-bottom: 1px solid #e5e9ef; }
.audit__table th { padding: 11px 14px; text-align: left; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
.audit__row { border-bottom: 1px solid #f3f4f6; transition: background 0.1s; }
.audit__row:last-child { border-bottom: none; }
.audit__row:hover { background: #f9fafb; }
.audit__table td { padding: 10px 14px; vertical-align: middle; }
.audit__td-time { display: flex; flex-direction: column; }
.audit__date { font-size: 13px; font-weight: 500; color: #111827; white-space: nowrap; }
.audit__time { font-size: 11px; color: #9ca3af; }
.audit__user { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
.audit__user-avatar { width: 28px; height: 28px; border-radius: 6px; background: #0079C2; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.audit__action-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
.audit__action-badge--login { background: #e0f2fe; color: #0369a1; }
.audit__action-badge--update { background: #fef9c3; color: #92400e; }
.audit__action-badge--delete { background: #fee2e2; color: #b91c1c; }
.audit__action-badge--create { background: #d1fae5; color: #065f46; }
.audit__action-badge--block { background: #f3e8ff; color: #6b21a8; }
.audit__td-object { color: #374151; max-width: 200px; }
.audit__td-ip { font-family: monospace; font-size: 12px; color: #6b7280; white-space: nowrap; }
.audit__status { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; }
.audit__status--ok { background: #d1fae5; color: #065f46; }
.audit__status--error { background: #fee2e2; color: #b91c1c; }
.audit__empty { text-align: center; padding: 48px; color: #9ca3af; }

.audit__pagination { display: flex; gap: 6px; justify-content: center; margin-top: 16px; flex-wrap: wrap; }
.page-btn { min-width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e5e9ef; background: #fff; font-size: 13px; color: #374151; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; padding: 0 10px; }
.page-btn:hover:not(:disabled) { border-color: #0079C2; color: #0079C2; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-btn--active { background: #0079C2; border-color: #0079C2; color: #fff; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
.btn--outline { background: #fff; border: 1px solid #e5e9ef; color: #374151; }
.btn--outline:hover { border-color: #0079C2; color: #0079C2; }
.btn--ghost { background: transparent; color: #6b7280; border: 1px solid transparent; }
.btn--ghost:hover { background: #f3f4f6; }
</style>
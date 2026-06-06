<template>
  <div class="org-page">
    <div class="org-page__header">
      <div>
        <h1 class="org-page__title">Организации</h1>
        <p class="org-page__sub">{{ orgs.length }} организаций в группе компаний</p>
      </div>
      <button class="btn btn--primary" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Добавить организацию
      </button>
    </div>

    <!-- Карточки -->
    <div class="org-grid">
      <div v-for="org in orgs" :key="org.id" class="org-card" :class="{ 'org-card--main': org.isMain }">
        <div class="org-card__head">
          <div class="org-card__logo" :style="{ background: org.color }">{{ org.short }}</div>
          <div class="org-card__info">
            <span class="org-card__name">{{ org.name }}</span>
            <span class="org-card__inn">ИНН: {{ org.inn }}</span>
          </div>
          <span v-if="org.isMain" class="org-card__main-badge">Головная</span>
          <div class="org-card__actions">
            <button class="icon-btn" @click="editOrg(org)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          </div>
        </div>
        <div class="org-card__details">
          <div class="org-card__detail"><span class="org-card__detail-label">ОГРН</span><span>{{ org.ogrn }}</span></div>
          <div class="org-card__detail"><span class="org-card__detail-label">Юрадрес</span><span class="org-card__detail-addr">{{ org.address }}</span></div>
          <div class="org-card__detail"><span class="org-card__detail-label">Директор</span><span>{{ org.director }}</span></div>
        </div>
        <div class="org-card__footer">
          <div class="org-card__stat"><span class="org-card__stat-val">{{ org.employees }}</span><span class="org-card__stat-label">сотрудников</span></div>
          <div class="org-card__stat"><span class="org-card__stat-val">{{ org.departments }}</span><span class="org-card__stat-label">подразделений</span></div>
          <span class="org-status-badge" :class="`org-status-badge--${org.status}`">{{ org.status === 'active' ? 'Активна' : 'Ликвидирована' }}</span>
        </div>
      </div>
    </div>

    <!-- Модальное окно -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal">
          <div class="modal__header">
            <h2>{{ editingOrg ? 'Редактировать организацию' : 'Новая организация' }}</h2>
            <button class="modal__close" @click="showModal = false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="modal__body">
            <label class="form-label">Полное наименование</label>
            <input v-model="form.name" class="form-input" placeholder="ООО «Пример»" />
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div><label class="form-label">ИНН</label><input v-model="form.inn" class="form-input" placeholder="1234567890" /></div>
              <div><label class="form-label">ОГРН</label><input v-model="form.ogrn" class="form-input" placeholder="1234567890123" /></div>
            </div>
            <label class="form-label">Юридический адрес</label>
            <input v-model="form.address" class="form-input" placeholder="г. Москва, ул. …" />
            <label class="form-label">Генеральный директор</label>
            <input v-model="form.director" class="form-input" placeholder="Иванов Иван Иванович" />
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" @click="showModal = false">Отмена</button>
            <button class="btn btn--primary" @click="saveOrg">{{ editingOrg ? 'Сохранить' : 'Добавить' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
interface Org { id: number; name: string; short: string; inn: string; ogrn: string; address: string; director: string; employees: number; departments: number; status: string; color: string; isMain: boolean }
const orgs = ref<Org[]>([
  { id: 1, name: 'ГК «СЕРВИСГАЗ»', short: 'СГ', inn: '7701234567', ogrn: '1027701012345', address: 'г. Москва, ул. Газовиков, 12', director: 'Громов Алексей Петрович', employees: 128, departments: 8, status: 'active', color: '#0079C2', isMain: true },
  { id: 2, name: 'ООО «СервисГаз-Монтаж»', short: 'М', inn: '7709876543', ogrn: '1027709012348', address: 'г. Москва, пр. Мира, 34', director: 'Белов Сергей Николаевич', employees: 45, departments: 3, status: 'active', color: '#22c55e', isMain: false },
  { id: 3, name: 'ООО «СервисГаз-Сервис»', short: 'С', inn: '7711234567', ogrn: '1027711012349', address: 'г. Москва, ш. Варшавское, 87', director: 'Козлова Марина Владимировна', employees: 32, departments: 2, status: 'active', color: '#8b5cf6', isMain: false },
  { id: 4, name: 'ООО «СервисГаз-Проект»', short: 'П', inn: '7712233445', ogrn: '1027712012350', address: 'г. Москва, ул. Ленинская слобода, 19', director: 'Ершов Дмитрий Олегович', employees: 18, departments: 2, status: 'active', color: '#f59e0b', isMain: false },
])
const showModal = ref(false)
const editingOrg = ref<Org | null>(null)
const form = reactive({ name: '', inn: '', ogrn: '', address: '', director: '' })

function openCreate() { editingOrg.value = null; Object.assign(form, { name: '', inn: '', ogrn: '', address: '', director: '' }); showModal.value = true }
function editOrg(org: Org) { editingOrg.value = org; Object.assign(form, { name: org.name, inn: org.inn, ogrn: org.ogrn, address: org.address, director: org.director }); showModal.value = true }
function saveOrg() {
  if (!form.name.trim()) return
  if (editingOrg.value) {
    const o = orgs.value.find(o => o.id === editingOrg.value!.id)
    if (o) Object.assign(o, { name: form.name, inn: form.inn, ogrn: form.ogrn, address: form.address, director: form.director })
  } else {
    const s = form.name.replace(/[«»"']/g, '').split(' ').filter(w => w.length > 2).slice(0,2).map(w=>w[0]).join('').toUpperCase() || 'НО'
    orgs.value.push({ id: Date.now(), name: form.name, short: s, inn: form.inn, ogrn: form.ogrn, address: form.address, director: form.director, employees: 0, departments: 0, status: 'active', color: '#6b7280', isMain: false })
  }
  showModal.value = false
}
</script>

<style scoped>
.org-page { width: 100%; }
.org-page__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.org-page__title { font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.org-page__sub { font-size: 13px; color: #6b7280; }
.org-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.org-card { background: #fff; border-radius: 14px; border: 1px solid #e5e9ef; padding: 20px; display: flex; flex-direction: column; gap: 14px; transition: box-shadow 0.15s; }
.org-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
.org-card--main { border-left: 4px solid #0079C2; }
.org-card__head { display: flex; align-items: center; gap: 12px; }
.org-card__logo { width: 42px; height: 42px; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.org-card__info { flex: 1; min-width: 0; }
.org-card__name { font-size: 13px; font-weight: 700; color: #111827; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.org-card__inn { font-size: 11px; color: #9ca3af; }
.org-card__main-badge { font-size: 10px; font-weight: 700; background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
.org-card__actions { display: flex; gap: 4px; }
.org-card__details { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #f3f4f6; padding-top: 12px; }
.org-card__detail { display: flex; gap: 10px; font-size: 12px; color: #374151; align-items: baseline; }
.org-card__detail-label { font-size: 11px; font-weight: 600; color: #9ca3af; min-width: 60px; white-space: nowrap; }
.org-card__detail-addr { flex: 1; }
.org-card__footer { display: flex; align-items: center; gap: 16px; border-top: 1px solid #f3f4f6; padding-top: 12px; }
.org-card__stat { display: flex; flex-direction: column; }
.org-card__stat-val { font-size: 20px; font-weight: 800; color: #111827; line-height: 1.1; }
.org-card__stat-label { font-size: 11px; color: #6b7280; }
.org-status-badge { margin-left: auto; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
.org-status-badge--active { background: #d1fae5; color: #065f46; }
.icon-btn { width: 30px; height: 30px; border-radius: 6px; background: transparent; border: 1px solid #e5e9ef; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
.icon-btn:hover { border-color: #0079C2; color: #0079C2; background: #f0f9ff; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 460px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal__header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.modal__header h2 { font-size: 16px; font-weight: 700; color: #111827; }
.modal__close { width: 32px; height: 32px; border-radius: 6px; background: #f3f4f6; border: none; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.modal__body { padding: 16px 24px; display: flex; flex-direction: column; gap: 12px; }
.modal__footer { display: flex; gap: 10px; justify-content: flex-end; padding: 16px 24px 20px; border-top: 1px solid #f3f4f6; }
.form-label { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: -6px; display: block; }
.form-input { width: 100%; padding: 9px 12px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; outline: none; background: #f9fafb; color: #111827; font-family: inherit; }
.form-input:focus { border-color: #0079C2; background: #fff; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; font-family: inherit; }
.btn--primary { background: #0079C2; color: #fff; } .btn--primary:hover { background: #005fa3; }
.btn--outline { background: #fff; border: 1px solid #e5e9ef; color: #374151; } .btn--outline:hover { border-color: #0079C2; color: #0079C2; }
</style>
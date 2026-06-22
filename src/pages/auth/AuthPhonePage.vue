<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { loginWithPassword } from '@/api/mockClient'

const router = useRouter()
const auth = useAuthStore()

const rawPhone = ref('')
const password = ref('')
const showPass = ref(false)
const error = ref('')
const loading = ref(false)

function applyMask(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1)
  digits = digits.slice(0, 10)

  let result = '+7'
  if (!digits.length) return result
  result += ' (' + digits.slice(0, 3)
  if (digits.length <= 3) return result
  result += ') ' + digits.slice(3, 6)
  if (digits.length <= 6) return result
  result += '-' + digits.slice(6, 8)
  if (digits.length <= 8) return result
  result += '-' + digits.slice(8, 10)
  return result
}

function onInput(e: Event) {
  const input = e.target as HTMLInputElement
  rawPhone.value = applyMask(input.value)
  error.value = ''
  input.value = rawPhone.value
}

function onPasswordInput(e: Event) {
  const input = e.target as HTMLInputElement
  password.value = input.value
  error.value = ''
}

const isPhoneComplete = computed(() => {
  let digits = rawPhone.value.replace(/\D/g, '')
  if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1)
  return digits.length === 10
})

const canSubmit = computed(() => isPhoneComplete.value && password.value.length >= 6)

async function submit() {
  if (!canSubmit.value || loading.value) return
  loading.value = true
  error.value = ''

  const res = await loginWithPassword(rawPhone.value, password.value)
  loading.value = false

  if (res.ok) {
    auth.setEmployee(res.employee)
    router.push(res.employee.role === 'HR' ? '/admin' : '/profile')
  } else {
    const msgs: Record<string, string> = {
      NOT_IN_WHITELIST: 'Неверный логин или пароль.',
      INVALID_CREDENTIALS: 'Неверный логин или пароль.',
      BLOCKED: 'Доступ заблокирован. Обратитесь в отдел кадров.',
      ARCHIVED: 'Учётная запись архивирована.',
    }
    error.value = msgs[res.code] ?? 'Произошла ошибка. Попробуйте позже.'
  }
}
</script>

<template>
  <div class="auth-phone">

    <div class="auth-phone__hero">
      <img src="/servisgaz-logo.png" class="auth-phone__sg-logo" alt="СЕРВИСГАЗ" />
    </div>

    <div class="auth-phone__card">
      <div class="auth-phone__card-head">
        <h1 class="auth-phone__title">Вход в систему</h1>
        <p class="auth-phone__desc">Введите номер телефона и постоянный пароль</p>
      </div>

      <!-- Телефон — постоянный логин -->
      <div class="auth-phone__field">
        <label class="auth-phone__label">Номер телефона (логин)</label>
        <div class="auth-phone__input-wrap" :class="{ 'is-error': error, 'is-filled': isPhoneComplete }">
          <svg class="auth-phone__phone-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.33 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6.53 6.53l1.62-1.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <input
            class="auth-phone__input"
            type="tel"
            inputmode="numeric"
            autocomplete="tel"
            enterkeyhint="next"
            spellcheck="false"
            autocorrect="off"
            autocapitalize="off"
            placeholder="+7 (999) 999-99-99"
            :value="rawPhone"
            maxlength="18"
            @input="onInput"
            @keydown.enter="submit"
            autofocus
          />
          <Transition name="check">
            <svg v-if="isPhoneComplete" class="auth-phone__check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </Transition>
        </div>
      </div>

      <!-- Пароль -->
      <div class="auth-phone__field">
        <label class="auth-phone__label">Пароль</label>
        <div class="auth-phone__input-wrap" :class="{ 'is-error': error }">
          <svg class="auth-phone__phone-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            class="auth-phone__input"
            :type="showPass ? 'text' : 'password'"
            inputmode="text"
            autocomplete="current-password"
            enterkeyhint="go"
            placeholder="Введите пароль"
            :value="password"
            maxlength="128"
            @input="onPasswordInput"
            @keydown.enter="submit"
          />
          <button type="button" class="auth-phone__eye" @click="showPass = !showPass">
            <svg v-if="!showPass" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
        <Transition name="fade-down">
          <p v-if="error" class="auth-phone__error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ error }}
          </p>
        </Transition>
      </div>

      <button
        class="auth-phone__btn"
        :class="{ 'is-loading': loading }"
        :disabled="!canSubmit || loading"
        @click="submit"
      >
        <span v-if="loading" class="auth-phone__spinner" />
        <template v-else>
          Войти
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </template>
      </button>

      <div class="auth-phone__info">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Доступ только для сотрудников ГК «СЕРВИСГАЗ»
      </div>
    </div>

    <div class="auth-phone__footer">
      <p class="auth-phone__help">Забыли пароль? Обратитесь к администратору системы.</p>
    </div>
  </div>
</template>

<style scoped>
.auth-phone {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--c-bg);
}

.auth-phone__hero {
  padding: 48px var(--gap-lg) var(--gap-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-md);
  text-align: center;
}

.auth-phone__sg-logo { height: 56px; width: auto; object-fit: contain; }

.auth-phone__card {
  margin: 0 var(--gap-md);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  padding: var(--gap-lg);
  display: flex;
  flex-direction: column;
  gap: var(--gap-lg);
  box-shadow: var(--shadow-md);
}

.auth-phone__card-head { display: flex; flex-direction: column; gap: 4px; }
.auth-phone__title { font-size: var(--fs-xl); font-weight: 700; }
.auth-phone__desc  { font-size: var(--fs-sm); color: var(--c-text-2); }

.auth-phone__field { display: flex; flex-direction: column; gap: 6px; }
.auth-phone__label { font-size: var(--fs-sm); font-weight: 600; color: var(--c-text-2); }

.auth-phone__input-wrap {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  background: var(--c-bg);
  border: 1.5px solid var(--c-border);
  border-radius: var(--r-lg);
  padding: 0 var(--gap-md);
  min-height: 52px;
  transition: border-color var(--dur-fast), box-shadow var(--dur-fast);
}
.auth-phone__input-wrap:focus-within {
  border-color: var(--c-accent);
  box-shadow: 0 0 0 3px var(--c-accent-dim);
  background: var(--c-surface);
}
.auth-phone__input-wrap.is-error { border-color: var(--c-danger); box-shadow: 0 0 0 3px rgba(220,38,38,0.08); }
.auth-phone__input-wrap.is-filled:not(.is-error) { border-color: var(--c-success); }

.auth-phone__phone-icon { color: var(--c-text-3); flex-shrink: 0; transition: color var(--dur-fast); }
.auth-phone__input-wrap:focus-within .auth-phone__phone-icon { color: var(--c-accent); }

.auth-phone__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--fs-md);
  font-family: var(--font-mono);
  color: var(--c-text);
  min-height: 52px;
  width: 0;
}
.auth-phone__input::placeholder { color: var(--c-text-3); font-family: var(--font-body); font-size: var(--fs-base); }

.auth-phone__check { flex-shrink: 0; }

.auth-phone__eye {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--c-text-3);
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: color var(--dur-fast);
  flex-shrink: 0;
}
.auth-phone__eye:hover { color: var(--c-accent); }

.auth-phone__error {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--fs-sm);
  color: var(--c-danger);
}

.auth-phone__btn {
  width: 100%;
  min-height: 52px;
  background: var(--c-accent);
  color: #fff;
  font-size: var(--fs-base);
  font-weight: 600;
  border-radius: var(--r-lg);
  cursor: pointer;
  transition: background var(--dur-fast), transform var(--dur-fast), opacity var(--dur-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--gap-sm);
  border: none;
  font-family: var(--font-body);
}
.auth-phone__btn:hover:not(:disabled) { background: #0069aa; }
.auth-phone__btn:active:not(:disabled) { transform: scale(0.98); }
.auth-phone__btn:disabled { opacity: 0.4; cursor: not-allowed; }

.auth-phone__spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.auth-phone__info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  color: var(--c-text-3);
}
.auth-phone__info svg { color: var(--c-text-3); }

.auth-phone__footer {
  margin-top: auto;
  padding: var(--gap-lg);
  display: flex;
  justify-content: center;
}
.auth-phone__help {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--c-accent);
  cursor: default;
  text-align: center;
  line-height: 1.4;
  padding: var(--gap-sm) var(--gap-md);
}

.check-enter-active { transition: all 0.2s var(--ease-out); }
.check-enter-from { opacity: 0; transform: scale(0.5) rotate(-45deg); }

.fade-down-enter-active { transition: all 0.2s var(--ease-out); }
.fade-down-enter-from   { opacity: 0; transform: translateY(-4px); }
.fade-down-leave-active { transition: all 0.15s; }
.fade-down-leave-to     { opacity: 0; }
</style>

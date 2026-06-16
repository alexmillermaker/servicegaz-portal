import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Enrollment {
  id: number
  employeeId: string
  name: string
  department: string
  phone: string
  progress: number
  status: 'active' | 'completed' | 'overdue'
  enrolledDate: string
}

export interface Course {
  id: number
  title: string
  category: string
  duration: string
  deadline: string
  status: 'active' | 'draft' | 'archived'
  mandatory: boolean
  enrollments: Enrollment[]
}

export const useLearningStore = defineStore('learning', () => {
  const courses = ref<Course[]>([
    { id: 1, title: 'Промышленная безопасность', category: 'Безопасность', duration: '8 часов', deadline: '30.06.2026', status: 'active', mandatory: true,
      enrollments: [
        { id: 1001, employeeId: 'emp-1', name: 'Иванов Петр Сергеевич', department: 'ИТ и цифровые решения', phone: '+79991112233', progress: 70, status: 'active', enrolledDate: '01.05.2026' },
        { id: 1003, employeeId: 'emp-3', name: 'Кузнецов Дмитрий Олегович', department: 'Производственный блок', phone: '+79993334455', progress: 100, status: 'completed', enrolledDate: '01.05.2026' },
        { id: 1005, employeeId: 'emp-5', name: 'Волков Алексей Павлович', department: 'Служба безопасности', phone: '+79995556688', progress: 30, status: 'overdue', enrolledDate: '01.05.2026' },
        { id: 1004, employeeId: 'emp-4', name: 'Морозова Елена Андреевна', department: 'HR департамент', phone: '+79994445566', progress: 85, status: 'active', enrolledDate: '01.05.2026' },
      ]
    },
    { id: 2, title: 'Вводный курс по 1С', category: 'IT', duration: '4 часа', deadline: '', status: 'active', mandatory: false,
      enrollments: [
        { id: 2002, employeeId: 'emp-2', name: 'Сидорова Анна Викторовна', department: 'Финансовый департамент', phone: '+79992223344', progress: 89, status: 'active', enrolledDate: '01.05.2026' },
        { id: 2004, employeeId: 'emp-4', name: 'Морозова Елена Андреевна', department: 'HR департамент', phone: '+79994445566', progress: 100, status: 'completed', enrolledDate: '01.05.2026' },
      ]
    },
    { id: 3, title: 'Навыки деловой коммуникации', category: 'Soft skills', duration: '3 часа', deadline: '15.07.2026', status: 'active', mandatory: false,
      enrollments: [
        { id: 3001, employeeId: 'emp-1', name: 'Иванов Петр Сергеевич', department: 'ИТ и цифровые решения', phone: '+79991112233', progress: 20, status: 'active', enrolledDate: '01.05.2026' },
        { id: 3002, employeeId: 'emp-2', name: 'Сидорова Анна Викторовна', department: 'Финансовый департамент', phone: '+79992223344', progress: 20, status: 'active', enrolledDate: '01.05.2026' },
      ]
    },
    { id: 4, title: 'Антикоррупционная политика', category: 'Право', duration: '2 часа', deadline: '01.07.2026', status: 'active', mandatory: true,
      enrollments: [
        { id: 4001, employeeId: 'emp-1', name: 'Иванов Петр Сергеевич', department: 'ИТ и цифровые решения', phone: '+79991112233', progress: 90, status: 'active', enrolledDate: '01.05.2026' },
        { id: 4002, employeeId: 'emp-2', name: 'Сидорова Анна Викторовна', department: 'Финансовый департамент', phone: '+79992223344', progress: 100, status: 'completed', enrolledDate: '01.05.2026' },
        { id: 4003, employeeId: 'emp-3', name: 'Кузнецов Дмитрий Олегович', department: 'Производственный блок', phone: '+79993334455', progress: 90, status: 'active', enrolledDate: '01.05.2026' },
        { id: 4004, employeeId: 'emp-4', name: 'Морозова Елена Андреевна', department: 'HR департамент', phone: '+79994445566', progress: 100, status: 'completed', enrolledDate: '01.05.2026' },
      ]
    },
    { id: 5, title: 'Управление проектами (Agile)', category: 'Управление', duration: '12 часов', deadline: '', status: 'draft', mandatory: false, enrollments: [] },
    { id: 6, title: 'Работа с персональными данными', category: 'Право', duration: '2 часа', deadline: '', status: 'archived', mandatory: true,
      enrollments: [
        { id: 6001, employeeId: 'emp-1', name: 'Иванов Петр Сергеевич', department: 'ИТ и цифровые решения', phone: '+79991112233', progress: 100, status: 'completed', enrolledDate: '01.04.2026' },
        { id: 6002, employeeId: 'emp-2', name: 'Сидорова Анна Викторовна', department: 'Финансовый департамент', phone: '+79992223344', progress: 100, status: 'completed', enrolledDate: '01.04.2026' },
        { id: 6003, employeeId: 'emp-3', name: 'Кузнецов Дмитрий Олегович', department: 'Производственный блок', phone: '+79993334455', progress: 100, status: 'completed', enrolledDate: '01.04.2026' },
      ]
    },
  ])

  function getEnrollmentsForEmployee(empId: string) {
    return courses.value
      .filter(c => c.enrollments.some(e => e.employeeId === empId))
      .map(c => {
        const enr = c.enrollments.find(e => e.employeeId === empId)!
        return {
          id: c.id,
          title: c.title,
          category: c.category,
          duration: c.duration,
          deadline: c.deadline || '—',
          mandatory: c.mandatory,
          progress: enr.progress,
          status: enr.status as 'active' | 'completed' | 'overdue',
        }
      })
  }

  function add(course: Omit<Course, 'id'>): void {
    courses.value.unshift({ ...course, id: Date.now() })
  }

  function update(id: number, patch: Partial<Course>): void {
    const found = courses.value.find(c => c.id === id)
    if (found) Object.assign(found, patch)
  }

  function archive(id: number): void {
    const found = courses.value.find(c => c.id === id)
    if (found) found.status = 'archived'
  }

  function addEnrollment(courseId: number, enrollment: Enrollment): void {
    const course = courses.value.find(c => c.id === courseId)
    if (course) course.enrollments.push(enrollment)
  }

  function removeEnrollment(courseId: number, enrollmentId: number): void {
    const course = courses.value.find(c => c.id === courseId)
    if (course) course.enrollments = course.enrollments.filter(e => e.id !== enrollmentId)
  }

  return { courses, getEnrollmentsForEmployee, add, update, archive, addEnrollment, removeEnrollment }
})

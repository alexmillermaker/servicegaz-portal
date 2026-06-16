// Репозиторий курсов обучения. Источник данных — mockData.ts.
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockCourses } from '@/api/mockData'
import type { Course, Enrollment } from '@/api/mockData'

// Ре-экспорт типов для обратной совместимости импортов из страниц.
export type { Course, Enrollment }

export const useLearningStore = defineStore('learning', () => {
  const courses = ref<Course[]>(mockCourses)

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

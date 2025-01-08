<template>
    <div class="agenda-view">
      <!-- Filters -->
      <div class="agenda-filters">
        <div class="filter-group">
          <label>Date Range:</label>
          <select v-model="dateRange" class="filter-select">
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
  
        <div v-if="dateRange === 'custom'" class="date-range-picker">
          <Datepicker
            v-model="customRange"
            range
            :format="dateFormat"
            auto-apply
          />
        </div>
  
        <div class="filter-group">
          <label>Status:</label>
          <select v-model="statusFilter" class="filter-select">
            <option value="all">All</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
  
        <div class="filter-group">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search events..."
            class="search-input"
          >
        </div>
      </div>
  
      <!-- Events List -->
      <div class="agenda-content">
        <div v-if="groupedEvents.length === 0" class="no-events">
          <p>No events found for the selected criteria</p>
        </div>
  
        <div 
          v-for="group in groupedEvents" 
          :key="group.date"
          class="event-group"
        >
          <div class="group-header">
            <h3>{{ formatGroupDate(group.date) }}</h3>
            <span class="event-count">{{ group.events.length }} events</span>
          </div>
  
          <div class="event-list">
            <div 
              v-for="event in group.events" 
              :key="event.id"
              class="agenda-event"
              :class="[event.status, { 'is-recurring': isRecurringEvent(event) }]"
              @click="$emit('event-click', event)"
            >
              <div class="event-time">
                {{ formatEventTime(event.time) }}
                <span v-if="event.duration" class="event-duration">
                  ({{ formatDuration(event.duration) }})
                </span>
              </div>
  
              <div class="event-details">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-customer">{{ event.customerName }}</div>
                <div v-if="event.notes" class="event-notes">
                  {{ truncateNotes(event.notes) }}
                </div>
              </div>
  
              <div class="event-status">
                <span class="status-badge" :class="event.status">
                  {{ event.status }}
                </span>
                <i 
                  v-if="isRecurringEvent(event)" 
                  class="fas fa-sync-alt recurring-icon"
                  title="Recurring event"
                ></i>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Load More -->
      <div v-if="hasMoreEvents" class="load-more">
        <button 
          class="btn btn-secondary"
          :disabled="isLoading"
          @click="loadMoreEvents"
        >
          {{ isLoading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import {
    format,
    isToday,
    isYesterday,
    isTomorrow,
    parseISO,
    addDays,
    differenceInMinutes
  } from 'date-fns'
  import Datepicker from '@vuepic/vue-datepicker'
  import type { CalendarEvent, EventStatus } from '@/types/calendar'
  
  const props = defineProps<{
    currentDate: Date
    events: CalendarEvent[]
    isLoading?: boolean
  }>()
  
  const emit = defineEmits<{
    'event-click': [event: CalendarEvent]
    'load-more': []
  }>()
  
  // State
  const dateRange = ref<'day' | 'week' | 'month' | 'custom'>('week')
  const customRange = ref<[Date, Date]>([new Date(), addDays(new Date(), 7)])
  const statusFilter = ref<EventStatus | 'all'>('all')
  const searchQuery = ref('')
  const page = ref(1)
  const dateFormat = 'dd/MM/yyyy'
  
  // Computed
  const filteredEvents = computed(() => {
    return props.events.filter(event => {
      // Status filter
      if (statusFilter.value !== 'all' && event.status !== statusFilter.value) {
        return false
      }
  
      // Search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        return event.title.toLowerCase().includes(query) ||
               event.customerName.toLowerCase().includes(query) ||
               (event.notes && event.notes.toLowerCase().includes(query))
      }
  
      return true
    })
  })
  
  const groupedEvents = computed(() => {
    const groups: { date: string; events: CalendarEvent[] }[] = []
    
    filteredEvents.value.forEach(event => {
      const date = format(new Date(event.date), 'yyyy-MM-dd')
      let group = groups.find(g => g.date === date)
      
      if (!group) {
        group = { date, events: [] }
        groups.push(group)
      }
      
      group.events.push(event)
    })
  
    // Sort groups by date and events by time
    return groups
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(group => ({
        ...group,
        events: group.events.sort((a, b) => a.time.localeCompare(b.time))
      }))
  })
  
  const hasMoreEvents = computed(() => {
    // Implement your pagination logic here
    return false
  })
  
  // Methods
  function formatGroupDate(dateString: string): string {
    const date = parseISO(dateString)
    
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    if (isTomorrow(date)) return 'Tomorrow'
    
    return format(date, 'EEEE, MMMM d')
  }
  
  function formatEventTime(time: string): string {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return format(date, 'h:mm a')
  }
  
  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }
  
  function truncateNotes(notes: string, length = 100): string {
    return notes.length > length 
      ? `${notes.substring(0, length)}...` 
      : notes
  }
  
  function isRecurringEvent(event: CalendarEvent): boolean {
    return 'recurrence' in event
  }
  
  async function loadMoreEvents() {
    page.value++
    emit('load-more')
  }
  
  // Watchers
  watch([dateRange, customRange, statusFilter], () => {
    page.value = 1
    // Trigger refetch with new filters
  })
  </script>
  
  <style scoped>
  .agenda-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--surface-1);
    border-radius: var(--radius-md);
  }
  
  .agenda-filters {
    padding: var(--space-4);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
  }
  
  .filter-group {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  
  .filter-select,
  .search-input {
    padding: var(--space-2);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--surface-1);
  }
  
  .agenda-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-4);
  }
  
  .event-group {
    margin-bottom: var(--space-6);
  }
  
  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
  }
  
  .group-header h3 {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-1);
  }
  
  .event-count {
    color: var(--text-2);
    font-size: var(--font-size-sm);
  }
  
  .agenda-event {
    display: grid;
    grid-template-columns: 150px 1fr 120px;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--surface-2);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-2);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .agenda-event:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  
  .event-time {
    font-weight: 600;
  }
  
  .event-duration {
    color: var(--text-2);
    font-weight: normal;
  }
  
  .event-details {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  
  .event-title {
    font-weight: 500;
  }
  
  .event-customer {
    color: var(--text-2);
    font-size: var(--font-size-sm);
  }
  
  .event-notes {
    color: var(--text-2);
    font-size: var(--font-size-sm);
    margin-top: var(--space-1);
  }
  
  .event-status {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-2);
  }
  
  .status-badge {
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    text-transform: capitalize;
  }
  
  .status-badge.scheduled {
    background: var(--primary-50);
    color: var(--primary-900);
  }
  
  .status-badge.completed {
    background: var(--success-50);
    color: var(--success-900);
  }
  
  .status-badge.cancelled {
    background: var(--error-50);
    color: var(--error-900);
  }
  
  .recurring-icon {
    color: var(--warning);
    font-size: var(--font-size-sm);
  }
  
  .load-more {
    padding: var(--space-4);
    text-align: center;
    border-top: 1px solid var(--border-color);
  }
  
  .no-events {
    text-align: center;
    color: var(--text-2);
    padding: var(--space-8);
  }
  
  @media (max-width: 768px) {
    .agenda-event {
      grid-template-columns: 1fr;
      gap: var(--space-2);
    }
  
    .event-status {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }
  </style>
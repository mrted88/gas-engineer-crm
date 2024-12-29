<template>
    <div class="dashboard">
      <!-- Stats Overview -->
      <section class="stats-overview" data-aos="fade-up">
        <div class="stats-grid">
          <div 
            v-for="stat in stats" 
            :key="stat.label"
            class="stat-card"
            data-aos="zoom-in"
            :data-aos-delay="stat.delay"
          >
            <div class="stat-icon" :class="stat.color">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-info">
              <h3>{{ stat.value }}</h3>
              <p>{{ stat.label }}</p>
            </div>
            <div class="stat-trend" :class="stat.trend > 0 ? 'positive' : 'negative'">
              {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
            </div>
          </div>
        </div>
      </section>
  
      <!-- Recent Activity -->
      <section class="recent-activity" data-aos="fade-up">
        <div class="section-header">
          <h2>Recent Activity</h2>
          <button class="btn btn-secondary">View All</button>
        </div>
        
        <div class="activity-timeline">
          <div 
            v-for="activity in recentActivities" 
            :key="activity.id"
            class="activity-item"
            data-aos="fade-left"
            :data-aos-delay="activity.delay"
          >
            <div class="activity-icon" :class="activity.type">
              <i :class="activity.icon"></i>
            </div>
            <div class="activity-content">
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.description }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Upcoming Jobs -->
      <section class="upcoming-jobs" data-aos="fade-up">
        <div class="section-header">
          <h2>Upcoming Jobs</h2>
          <button class="btn btn-secondary">Schedule New</button>
        </div>
        
        <div class="jobs-grid">
          <div 
            v-for="job in upcomingJobs" 
            :key="job.id"
            class="job-card"
            data-aos="fade-up"
            :data-aos-delay="job.delay"
          >
            <div class="job-header">
              <h3>{{ job.customer }}</h3>
              <span class="job-type" :class="job.type">{{ job.type }}</span>
            </div>
            <div class="job-details">
              <p><i class="fas fa-map-marker-alt"></i> {{ job.location }}</p>
              <p><i class="fas fa-calendar"></i> {{ job.date }}</p>
              <p><i class="fas fa-clock"></i> {{ job.time }}</p>
            </div>
            <div class="job-actions">
              <button class="btn btn-primary">View Details</button>
              <button class="btn btn-secondary">Reschedule</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  const stats = [
    {
      label: 'Total Jobs',
      value: '156',
      icon: 'fas fa-tools',
      color: 'blue',
      trend: 12,
      delay: 0
    },
    {
      label: 'Revenue',
      value: '£8,459',
      icon: 'fas fa-pound-sign',
      color: 'green',
      trend: 8,
      delay: 100
    },
    {
      label: 'Customers',
      value: '89',
      icon: 'fas fa-users',
      color: 'orange',
      trend: 5,
      delay: 200
    },
    {
      label: 'Pending Jobs',
      value: '7',
      icon: 'fas fa-clock',
      color: 'red',
      trend: -2,
      delay: 300
    }
  ]
  
  const recentActivities = [
    {
      id: 1,
      type: 'completed',
      icon: 'fas fa-check-circle',
      title: 'Boiler Service Completed',
      description: 'Annual service for John Smith completed successfully',
      time: '2 hours ago',
      delay: 0
    },
    {
      id: 2,
      type: 'scheduled',
      icon: 'fas fa-calendar-plus',
      title: 'New Appointment',
      description: 'Emergency call scheduled for Sarah Johnson',
      time: '4 hours ago',
      delay: 100
    },
    // Add more activities...
  ]
  
  const upcomingJobs = [
    {
      id: 1,
      customer: 'David Wilson',
      type: 'emergency',
      location: '123 Main St, London',
      date: 'Today',
      time: '14:00',
      delay: 0
    },
    {
      id: 2,
      customer: 'Emma Thompson',
      type: 'service',
      location: '456 Park Ave, Manchester',
      date: 'Tomorrow',
      time: '10:30',
      delay: 100
    },
    // Add more jobs...
  ]
  </script>
  
  <style scoped>
  .dashboard {
    padding: var(--space-4);
    max-width: 1400px;
    margin: 0 auto;
  }
  
  /* Stats Overview */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }
  
  .stat-card {
    background: var(--bg-primary);
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    display: flex;
    align-items: center;
    gap: var(--space-4);
    transition: transform 0.3s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-5px);
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }
  
  .stat-icon.blue { background-color: var(--blue-50); color: var(--primary-blue); }
  .stat-icon.green { background-color: var(--success); color: white; }
  .stat-icon.orange { background-color: var(--primary-orange); color: white; }
  .stat-icon.red { background-color: var(--error); color: white; }
  
  .stat-info {
    flex: 1;
  }
  
  .stat-info h3 {
    font-size: 1.5rem;
    margin-bottom: var(--space-1);
  }
  
  .stat-info p {
    color: var(--text-secondary);
    margin: 0;
  }
  
  .stat-trend {
    font-weight: 500;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-md);
  }
  
  .stat-trend.positive {
    background-color: var(--success);
    color: white;
  }
  
  .stat-trend.negative {
    background-color: var(--error);
    color: white;
  }
  
  /* Recent Activity */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
  }
  
  .activity-timeline {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    box-shadow: var(--shadow-md);
  }
  
  .activity-item {
    display: flex;
    gap: var(--space-4);
    padding: var(--space-3) 0;
    border-bottom: 1px solid var(--border-light);
  }
  
  .activity-item:last-child {
    border-bottom: none;
  }
  
  .activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .activity-icon.completed {
    background-color: var(--success);
    color: white;
  }
  
  .activity-icon.scheduled {
    background-color: var(--primary-blue);
    color: white;
  }
  
  /* Jobs Grid */
  .jobs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-4);
  }
  
  .job-card {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    box-shadow: var(--shadow-md);
  }
  
  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-3);
  }
  
  .job-type {
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .job-type.emergency {
    background-color: var(--error);
    color: white;
  }
  
  .job-type.service {
    background-color: var(--primary-blue);
    color: white;
  }
  
  .job-details {
    margin-bottom: var(--space-3);
  }
  
  .job-details p {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
    color: var(--text-secondary);
  }
  
  .job-actions {
    display: flex;
    gap: var(--space-2);
  }
  
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  
    .jobs-grid {
      grid-template-columns: 1fr;
    }
  
    .job-actions {
      flex-direction: column;
    }
  }
  </style>
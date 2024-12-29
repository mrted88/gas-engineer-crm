<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 
          class="hero-title"
          data-aos="fade-up"
        >Welcome to OpenBook CRM</h1>
        <p 
          class="hero-subtitle"
          data-aos="fade-up" 
          data-aos-delay="200"
        >Streamline Your Gas Engineering Business</p>
        <div 
          class="hero-actions"
          data-aos="fade-up" 
          data-aos-delay="400"
        >
          <router-link to="/register" class="btn btn-primary">Get Started</router-link>
          <router-link to="/login" class="btn btn-secondary">Login</router-link>
        </div>
      </div>
      <!-- Animated background elements -->
      <div class="hero-bg">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 
          class="section-title"
          data-aos="fade-up"
        >Why Choose Us?</h2>
        <div class="feature-grid">
          <div 
            v-for="(feature, index) in features" 
            :key="feature.title"
            class="feature-card"
            data-aos="fade-up"
            :data-aos-delay="index * 100"
          >
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="container">
        <div class="stats-grid">
          <div 
            v-for="stat in stats" 
            :key="stat.value"
            class="stat-card"
            data-aos="zoom-in"
            :data-aos-delay="stat.delay"
          >
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <div class="cta-content" data-aos="fade-up">
          <h2>Ready to Get Started?</h2>
          <p>Join other gas engineers who are growing their business with OpenBook CRM</p>
          <router-link to="/register" class="btn btn-primary pulse">
            Start Free Trial
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
  delay: number;
}

const features: Feature[] = [
  {
    icon: '📊',
    title: 'Customer Management',
    description: 'Easily manage your customer database and service history'
  },
  {
    icon: '📱',
    title: 'Mobile Friendly',
    description: 'Access your data anywhere, perfect for field operations'
  },
  {
    icon: '📈',
    title: 'Business Analytics',
    description: 'Track your business growth with detailed insights'
  }
]

const stats: Stat[] = [
  { value: '1000+', label: 'Active Users', delay: 0 },
  { value: '50K+', label: 'Jobs Completed', delay: 200 },
  { value: '98%', label: 'Customer Satisfaction', delay: 400 }
]
</script>

<style scoped>
.home {
  min-height: 100vh;
}

/* Hero Section */
.hero {
  position: relative;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--blue-900) 100%);
  padding: var(--space-6) 0;
  color: var(--text-white);
  text-align: center;
  margin-top: -64px;
  padding-top: calc(var(--space-6) + 64px);
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: var(--space-3);
  color: var(--text-white);
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: var(--space-5);
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

/* Animated background circles */
.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  background: var(--text-white);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation: float 6s ease-in-out infinite;
}

.circle-2 {
  width: 200px;
  height: 200px;
  top: 50%;
  right: -50px;
  animation: float 8s ease-in-out infinite;
}

.circle-3 {
  width: 150px;
  height: 150px;
  bottom: -50px;
  left: 50%;
  animation: float 7s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
  100% { transform: translateY(0) rotate(360deg); }
}

/* Features Section */
.features {
  padding: var(--space-6) 0;
  background-color: var(--bg-secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: var(--space-5);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

.feature-card {
  background: var(--bg-primary);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: var(--space-3);
}

/* Stats Section */
.stats {
  padding: var(--space-6) 0;
  background-color: var(--blue-50);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  text-align: center;
}

.stat-card {
  padding: var(--space-4);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-blue);
  margin-bottom: var(--space-2);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* CTA Section */
.cta {
  background-color: var(--bg-primary);
  padding: var(--space-6) 0;
}

.cta-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.cta h2 {
  font-size: 2rem;
  margin-bottom: var(--space-3);
}

.cta p {
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

/* Pulse animation */
.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .hero-actions .btn {
    width: 100%;
    max-width: 300px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
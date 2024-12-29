<template>
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-section">
          <h3 class="footer-title">OpenBook CRM</h3>
          <p class="footer-description">
            Streamlining gas engineering operations with smart business management solutions.
          </p>
        </div>
  
        <div class="footer-section">
          <h4 class="footer-subtitle">Quick Links</h4>
          <nav class="footer-links">
            <router-link to="/" class="footer-link">Home</router-link>
            <router-link to="/about" class="footer-link">About</router-link>
            <router-link to="/features" class="footer-link">Features</router-link>
            <router-link to="/contact" class="footer-link">Contact</router-link>
          </nav>
        </div>
  
        <div class="footer-section">
          <h4 class="footer-subtitle">Contact</h4>
          <div class="footer-contact">
            <p><strong>Email:</strong> support@openbookcrm.com</p>
            <p><strong>Phone:</strong> (555) 123-4567</p>
            <p><strong>Hours:</strong> Mon-Fri 9am-5pm</p>
          </div>
        </div>
  
        <div class="footer-section">
          <h4 class="footer-subtitle">Follow Us</h4>
          <div class="social-links">
            <a href="#" class="social-link" title="Twitter">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="social-link" title="LinkedIn">
              <i class="fab fa-linkedin"></i>
            </a>
            <a href="#" class="social-link" title="Facebook">
              <i class="fab fa-facebook"></i>
            </a>
          </div>
        </div>
      </div>
  
      <div class="footer-bottom">
        <div class="footer-container">
          <p>&copy; {{ currentYear }} OpenBook CRM. All rights reserved.</p>
          <div class="footer-legal">
            <router-link to="/privacy" class="footer-link">Privacy Policy</router-link>
            <router-link to="/terms" class="footer-link">Terms of Service</router-link>
          </div>
        </div>
      </div>
    </footer>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  
  const currentYear = computed(() => new Date().getFullYear())
  </script>
  
  <style scoped>
  .footer {
    background-color: var(--gray-800);
    color: var(--gray-200);
    padding-top: var(--space-6);
    margin-top: auto;
  }
  
  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-4);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-6);
  }
  
  .footer-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .footer-title {
    color: var(--primary-blue);
    font-size: 1.5rem;
    margin-bottom: var(--space-2);
  }
  
  .footer-subtitle {
    color: var(--gray-100);
    font-size: 1.1rem;
    margin-bottom: var(--space-2);
  }
  
  .footer-description {
    color: var(--gray-400);
    line-height: 1.6;
  }
  
  .footer-links {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .footer-link {
    color: var(--gray-400);
    text-decoration: none;
    transition: color 0.3s ease;
  }
  
  .footer-link:hover {
    color: var(--primary-orange);
  }
  
  .footer-contact p {
    color: var(--gray-400);
    margin-bottom: var(--space-2);
  }
  
  .social-links {
    display: flex;
    gap: var(--space-3);
  }
  
  .social-link {
    color: var(--gray-400);
    font-size: 1.5rem;
    transition: color 0.3s ease;
  }
  
  .social-link:hover {
    color: var(--primary-orange);
  }
  
  .footer-bottom {
    margin-top: var(--space-6);
    padding: var(--space-4) 0;
    border-top: 1px solid var(--gray-700);
  }
  
  .footer-bottom .footer-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
  }
  
  .footer-legal {
    display: flex;
    gap: var(--space-4);
  }
  
  @media (max-width: 768px) {
    .footer-container {
      grid-template-columns: 1fr;
      gap: var(--space-4);
      padding: 0 var(--space-3);
    }
  
    .footer-bottom .footer-container {
      flex-direction: column;
      text-align: center;
    }
  
    .footer-legal {
      justify-content: center;
    }
  }
  </style>
<template>
    <div class="not-found">
      <div class="content" data-aos="fade-up">
        <h1>404</h1>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <router-link to="/" class="btn btn-primary">
          <i class="fas fa-home"></i>
          Return Home
        </router-link>
      </div>
    </div>
  </template>
  
  <style scoped>
  .not-found {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-4);
  }
  
  .content {
    max-width: 400px;
  }
  
  h1 {
    font-size: 6rem;
    color: var(--primary-blue);
    margin-bottom: var(--space-4);
  }
  
  p {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-bottom: var(--space-4);
  }
  </style>
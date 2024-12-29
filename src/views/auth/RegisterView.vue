<template>
    <div class="auth-container">
      <div class="auth-card" data-aos="fade-up">
        <h1>Create Account</h1>
        <p class="auth-subtitle">Start managing your business today</p>
        
        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                v-model="firstName"
                required
              >
            </div>
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                v-model="lastName"
                required
              >
            </div>
          </div>
  
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="email"
              required
            >
          </div>
  
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              v-model="password"
              required
              @input="checkPasswordStrength"
            >
            <div class="password-strength">
              <div 
                class="strength-bar"
                :style="{ width: passwordStrength + '%' }"
                :class="strengthClass"
              ></div>
              <span class="strength-text">{{ strengthText }}</span>
            </div>
          </div>
  
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="confirmPassword"
              required
            >
          </div>
  
          <div class="terms">
            <label>
              <input 
                type="checkbox" 
                v-model="acceptTerms"
                required
              >
              I accept the <a href="#" @click.prevent="showTerms">Terms of Service</a>
            </label>
          </div>
  
          <button 
            type="submit" 
            class="btn btn-primary w-full"
            :disabled="!isFormValid || isLoading"
          >
            <span v-if="isLoading" class="loader"></span>
            <span v-else>Create Account</span>
          </button>
        </form>
  
        <p class="auth-footer">
          Already have an account? 
          <router-link to="/login">Log in</router-link>
        </p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const firstName = ref('')
  const lastName = ref('')
  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const acceptTerms = ref(false)
  const isLoading = ref(false)
  const passwordStrength = ref(0)
  
  const strengthClass = computed(() => {
    if (passwordStrength.value < 25) return 'weak'
    if (passwordStrength.value < 50) return 'medium'
    if (passwordStrength.value < 75) return 'good'
    return 'strong'
  })
  
  const strengthText = computed(() => {
    if (passwordStrength.value < 25) return 'Weak'
    if (passwordStrength.value < 50) return 'Medium'
    if (passwordStrength.value < 75) return 'Good'
    return 'Strong'
  })
  
  const isFormValid = computed(() => {
    return firstName.value && 
           lastName.value && 
           email.value && 
           password.value && 
           confirmPassword.value === password.value && 
           acceptTerms.value
  })
  
  const checkPasswordStrength = () => {
    const pwd = password.value
    let strength = 0
    
    if (pwd.length >= 8) strength += 25
    if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength += 25
    if (pwd.match(/\d/)) strength += 25
    if (pwd.match(/[^a-zA-Z\d]/)) strength += 25
    
    passwordStrength.value = strength
  }
  
  const handleRegister = async () => {
    if (!isFormValid.value) return
    
    try {
      isLoading.value = true
      // Add your registration logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      router.push('/dashboard')
    } catch (error) {
      console.error('Registration failed:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  const showTerms = () => {
    // Add your terms modal logic here
    console.log('Show terms modal')
  }
  </script>
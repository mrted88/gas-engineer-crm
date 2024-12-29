declare module 'aos' {
    interface AosOptions {
      duration?: number
      easing?: string
      once?: boolean
      offset?: number
      delay?: number
      // Add other options as needed
    }
  
    interface AOS {
      init(options?: AosOptions): void
      refresh(): void
      refreshHard(): void
    }
  
    const aos: AOS
    export default aos
  }
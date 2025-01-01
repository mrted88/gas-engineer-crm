<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import { useEventsStore } from '@/stores/events'
import { useCustomersStore } from '@/stores/customers'
import type { CalendarEvent } from '@/types/event'

// Interfaces
interface Customer {
  id: string
  name: string
  phone: string
  email: string
  address: string
}

interface Certificate {
  id: string
  type: string
  createdAt: string | Date
}

interface Part {
  name: string
  quantity: number
}

interface JobReport {
  workPerformed: string
  partsUsed: Part[]
  notes: string
}

// Route and Store Setup
const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()
const customersStore = useCustomersStore()

// State
const event = ref<CalendarEvent | null>(null)
const customer = ref<Customer | null>(null)
const currentTab = ref('details')
const certificates = ref<Certificate[]>([])
const jobReport = ref<JobReport>({
  workPerformed: '',
  partsUsed: [],
  notes: ''
})

// Constants
const tabs = [
  { id: 'details', label: 'Details' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'report', label: 'Job Report' }
]

// Fetch data
onMounted(async () => {
  const eventId = route.params.id as string
  try {
    const eventData = await eventsStore.getEvent(eventId)
    event.value = eventData

    if (eventData?.customerId) {
      const customerData = await customersStore.getCustomer(eventData.customerId)
      customer.value = customerData
    }
    // Fetch certificates if needed
    // certificates.value = await certificatesStore.getCertificatesForJob(eventId)
  } catch (error) {
    console.error('Error fetching job details:', error)
  }
})

// Utility Functions
function formatDate(date: string | Date | undefined): string {
  if (!date) return ''
  return format(new Date(date), 'dd/MM/yyyy')
}

function formatDateTime(date: string | Date | undefined, time: string | undefined): string {
  if (!date) return ''
  const dateStr = format(new Date(date), 'dd/MM/yyyy')
  return time ? `${dateStr} ${time}` : dateStr
}

function formatDuration(minutes: number | undefined): string {
  if (!minutes) return ''
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 
    ? `${hours}h ${mins}m`
    : `${mins}m`
}

// Event Handlers
function startNewCertificate(): void {
  router.push(`/certificates/new?jobId=${route.params.id}`)
}

function viewCertificate(cert: Certificate): void {
  router.push(`/certificates/${cert.id}`)
}

function downloadCertificate(cert: Certificate): void {
  // Implement certificate download logic
  console.log('Downloading certificate:', cert.id)
}

function addPart(): void {
  const newPart: Part = { name: '', quantity: 1 }
  jobReport.value.partsUsed.push(newPart)
}

function removePart(index: number): void {
  jobReport.value.partsUsed.splice(index, 1)
}

async function saveJobReport(): Promise<void> {
  try {
    // Implement save logic
    // await jobReportsStore.createReport({
    //   jobId: route.params.id,
    //   ...jobReport.value
    // })
    console.log('Saving job report:', jobReport.value)
  } catch (error) {
    console.error('Error saving job report:', error)
  }
}
</script>
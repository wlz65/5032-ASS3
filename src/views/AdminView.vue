<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import FormMessage from '@/components/FormMessage.vue'
import {
  adminToolsConfigured,
  deleteMember,
  listMembers,
  sendMemberEmail,
} from '@/services/adminService'
import { MAX_ATTACHMENT_BYTES, validateAdminEmailForm } from '@/utils/validation'

const members = ref([])
const selectedMembers = ref([])
const loadingMembers = ref(false)
const deletingUid = ref('')
const sending = ref(false)
const fileInput = ref(null)
const result = reactive({ type: '', message: '' })
const errors = reactive({ recipients: '', subject: '', message: '', attachment: '' })
const form = reactive({ subject: '', message: '', attachment: null })

const acceptedTypes = '.pdf,.png,.jpg,.jpeg,.txt'
const selectedUids = computed(() => selectedMembers.value.map((member) => member.uid))

function friendlyAdminError(error) {
  const code = String(error?.code || '')
  if (code.includes('unauthenticated')) return 'Sign in again before using administrator tools.'
  if (code.includes('permission-denied')) return 'Administrator access is required.'
  if (code.includes('not-found')) return 'The selected member no longer exists.'
  if (code.includes('invalid-argument')) return 'Check the selected members and email fields.'
  if (code.includes('failed-precondition')) return error?.message || 'The operation cannot be completed.'
  return error?.message || 'The administrator operation could not be completed.'
}

function applyErrors(nextErrors) {
  for (const field of Object.keys(errors)) errors[field] = nextErrors[field] || ''
}

function formatDate(value) {
  if (!value) return 'Never'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Unavailable'
    : new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

async function loadMembers() {
  if (loadingMembers.value || !adminToolsConfigured) return
  loadingMembers.value = true
  result.message = ''
  try {
    members.value = await listMembers()
    selectedMembers.value = selectedMembers.value.filter((selected) =>
      members.value.some((member) => member.uid === selected.uid),
    )
  } catch (error) {
    result.type = 'error'
    result.message = friendlyAdminError(error)
  } finally {
    loadingMembers.value = false
  }
}

function updateSelection(nextSelection) {
  if (nextSelection.length > 50) {
    selectedMembers.value = nextSelection.slice(0, 50)
    errors.recipients = 'A maximum of 50 members can be selected at once.'
    return
  }
  selectedMembers.value = nextSelection
  errors.recipients = ''
}

function selectAll() {
  selectedMembers.value = members.value.slice(0, 50)
  errors.recipients = members.value.length > 50 ? 'The first 50 members were selected.' : ''
}

function clearSelection() {
  selectedMembers.value = []
  errors.recipients = ''
}

async function removeMember(member) {
  const confirmed = window.confirm(`Delete the member account ${member.email}? This cannot be undone.`)
  if (!confirmed || deletingUid.value) return

  deletingUid.value = member.uid
  result.message = ''
  try {
    await deleteMember(member.uid)
    members.value = members.value.filter((item) => item.uid !== member.uid)
    selectedMembers.value = selectedMembers.value.filter((item) => item.uid !== member.uid)
    result.type = 'success'
    result.message = `${member.email} was deleted.`
  } catch (error) {
    result.type = 'error'
    result.message = friendlyAdminError(error)
  } finally {
    deletingUid.value = ''
  }
}

function selectAttachment(event) {
  form.attachment = event.target.files?.[0] || null
  errors.attachment = ''
  result.message = ''
}

async function submitEmail() {
  result.message = ''
  const nextErrors = validateAdminEmailForm({
    recipientUids: selectedUids.value,
    subject: form.subject,
    message: form.message,
    attachment: form.attachment,
  })
  applyErrors(nextErrors)
  if (Object.keys(nextErrors).length || sending.value || !adminToolsConfigured) return

  sending.value = true
  try {
    const response = await sendMemberEmail({
      recipientUids: selectedUids.value,
      subject: form.subject,
      message: form.message,
      attachment: form.attachment,
    })
    const successCount = Number(response?.successCount || 0)
    const failureCount = Number(response?.failureCount || 0)
    result.type = failureCount ? 'info' : 'success'
    result.message = `${successCount} sent successfully, ${failureCount} failed.`
  } catch (error) {
    result.type = 'error'
    result.message = friendlyAdminError(error)
  } finally {
    sending.value = false
  }
}

onMounted(loadMembers)
</script>

<template>
  <div class="page-heading">
    <p class="eyebrow">Administrator tools</p>
    <h1>Manage members and email</h1>
    <p class="lede">
      Review registered members, remove an account when necessary and email selected members.
    </p>
  </div>

  <FormMessage
    v-if="!adminToolsConfigured"
    type="info"
    message="Firebase administrator tools are not configured."
  />
  <FormMessage v-if="result.message" :type="result.type" :message="result.message" />

  <div class="admin-layout">
    <section class="member-card card" aria-labelledby="members-heading">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Registered accounts</p>
          <h2 id="members-heading">Members</h2>
          <p>{{ members.length }} available · {{ selectedMembers.length }} selected</p>
        </div>
        <div class="member-actions">
          <button class="secondary-button" type="button" :disabled="loadingMembers" @click="loadMembers">
            <i :class="loadingMembers ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" aria-hidden="true"></i>
            {{ loadingMembers ? 'Loading…' : 'Refresh' }}
          </button>
          <button class="secondary-button" type="button" :disabled="!members.length" @click="selectAll">
            Select all
          </button>
          <button class="text-button" type="button" :disabled="!selectedMembers.length" @click="clearSelection">
            Clear
          </button>
        </div>
      </div>

      <p v-if="errors.recipients" class="field-error" role="status">{{ errors.recipients }}</p>

      <DataTable
        :value="members"
        :selection="selectedMembers"
        data-key="uid"
        paginator
        :rows="10"
        :loading="loadingMembers"
        striped-rows
        responsive-layout="scroll"
        empty-message="No ordinary member accounts are available."
        @update:selection="updateSelection"
      >
        <Column selection-mode="multiple" header-style="width: 3rem" />
        <Column field="email" header="Email" sortable />
        <Column header="Created" sortable sort-field="creationTime">
          <template #body="{ data }">{{ formatDate(data.creationTime) }}</template>
        </Column>
        <Column header="Last sign-in" sortable sort-field="lastSignInTime">
          <template #body="{ data }">{{ formatDate(data.lastSignInTime) }}</template>
        </Column>
        <Column header="Email verified">
          <template #body="{ data }">{{ data.emailVerified ? 'Yes' : 'No' }}</template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">{{ data.disabled ? 'Disabled' : 'Active' }}</template>
        </Column>
        <Column header="Manage">
          <template #body="{ data }">
            <button
              class="delete-button"
              type="button"
              :disabled="Boolean(deletingUid)"
              :aria-label="`Delete ${data.email}`"
              @click="removeMember(data)"
            >
              <i :class="deletingUid === data.uid ? 'pi pi-spin pi-spinner' : 'pi pi-trash'" aria-hidden="true"></i>
              Delete
            </button>
          </template>
        </Column>
      </DataTable>
    </section>

    <section class="email-card card" aria-labelledby="email-heading">
      <p class="eyebrow">Admin-only email</p>
      <h2 id="email-heading">Email selected members</h2>
      <p class="selection-summary">{{ selectedMembers.length }} registered member(s) selected.</p>

      <form class="email-form" novalidate @submit.prevent="submitEmail">
        <div class="field">
          <label for="admin-subject">Subject</label>
          <input
            id="admin-subject"
            v-model="form.subject"
            type="text"
            maxlength="120"
            :aria-invalid="Boolean(errors.subject)"
          />
          <p v-if="errors.subject" class="field-error">{{ errors.subject }}</p>
        </div>

        <div class="field">
          <label for="admin-message">Message</label>
          <textarea
            id="admin-message"
            v-model="form.message"
            rows="7"
            maxlength="5000"
            :aria-invalid="Boolean(errors.message)"
          ></textarea>
          <p v-if="errors.message" class="field-error">{{ errors.message }}</p>
        </div>

        <div class="field">
          <label for="admin-attachment">Attachment <span>(optional)</span></label>
          <input
            id="admin-attachment"
            ref="fileInput"
            type="file"
            :accept="acceptedTypes"
            :aria-invalid="Boolean(errors.attachment)"
            @change="selectAttachment"
          />
          <p class="field-help">PDF, PNG, JPEG or TXT. Maximum {{ MAX_ATTACHMENT_BYTES / 1024 / 1024 }} MB.</p>
          <p v-if="form.attachment" class="file-summary">
            <i class="pi pi-paperclip" aria-hidden="true"></i>
            {{ form.attachment.name }} · {{ (form.attachment.size / 1024).toFixed(1) }} KB
          </p>
          <p v-if="errors.attachment" class="field-error">{{ errors.attachment }}</p>
        </div>

        <button
          class="primary-button send-button"
          type="submit"
          :disabled="sending || !selectedMembers.length || !adminToolsConfigured"
        >
          <i :class="sending ? 'pi pi-spin pi-spinner' : 'pi pi-send'" aria-hidden="true"></i>
          {{ sending ? 'Sending…' : `Send to ${selectedMembers.length || 0}` }}
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.admin-layout {
  display: grid;
  gap: 1.5rem;
}

.member-card,
.email-card {
  padding: clamp(1rem, 3vw, 1.75rem);
  overflow: hidden;
}

.section-heading,
.member-actions,
.send-button,
.file-summary {
  display: flex;
  align-items: center;
}

.section-heading {
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-heading h2,
.section-heading p,
.email-card h2 {
  margin-bottom: 0.25rem;
}

.section-heading > div > p:last-child,
.selection-summary,
.field-help {
  margin-bottom: 0;
  color: var(--ink-500);
}

.member-actions {
  flex-wrap: wrap;
  gap: 0.55rem;
}

.member-actions button,
.send-button,
.delete-button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.delete-button {
  min-height: 38px;
  border: 1px solid #f0b7b2;
  border-radius: 9px;
  padding: 0.45rem 0.7rem;
  color: var(--danger);
  background: var(--danger-soft);
  font-weight: 750;
  cursor: pointer;
}

.email-form {
  display: grid;
  gap: 1.15rem;
  margin-top: 1.25rem;
}

.field label span,
.field-help {
  font-size: 0.85rem;
  font-weight: 500;
}

.file-summary {
  gap: 0.4rem;
  margin: 0;
  color: var(--brand-800);
  font-size: 0.9rem;
  font-weight: 700;
}

.send-button {
  justify-self: start;
}

@media (max-width: 760px) {
  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

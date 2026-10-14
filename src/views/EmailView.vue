<script setup>
import { reactive, ref } from 'vue'
import FormMessage from '@/components/FormMessage.vue'
import {
  emailConfigured,
  emailSetupMessage,
  sendEmailWithAttachment,
} from '@/services/emailService'
import { MAX_ATTACHMENT_BYTES, validateEmailForm } from '@/utils/validation'

const form = reactive({ to: '', subject: '', message: '', attachment: null })
const errors = reactive({ to: '', subject: '', message: '', attachment: '' })
const sending = ref(false)
const result = reactive({ type: '', message: '' })
const fileInput = ref(null)

const acceptedTypes = '.pdf,.png,.jpg,.jpeg,.txt'

function applyErrors(nextErrors) {
  for (const field of Object.keys(errors)) {
    errors[field] = nextErrors[field] || ''
  }
}

function selectAttachment(event) {
  form.attachment = event.target.files?.[0] || null
  errors.attachment = ''
  result.message = ''
}

function resetForm() {
  form.to = ''
  form.subject = ''
  form.message = ''
  form.attachment = null
  if (fileInput.value) fileInput.value.value = ''
}

function friendlyEmailError(error) {
  const code = String(error?.code || '')
  if (code.includes('unauthenticated')) return 'Sign in again before sending an email.'
  if (code.includes('resource-exhausted')) return 'The attachment is too large.'
  if (code.includes('invalid-argument')) return 'Check the form fields and attachment.'
  return error?.message || 'The email could not be sent. Please try again.'
}

async function submit() {
  result.message = ''
  const nextErrors = validateEmailForm(form)
  applyErrors(nextErrors)
  if (Object.keys(nextErrors).length || sending.value || !emailConfigured) return

  sending.value = true
  try {
    const response = await sendEmailWithAttachment(form)
    result.type = 'success'
    result.message = response?.message || 'Email sent successfully.'
    resetForm()
  } catch (error) {
    result.type = 'error'
    result.message = friendlyEmailError(error)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="page-heading">
    <p class="eyebrow">Secure member tool</p>
    <h1>Send a learning resource</h1>
    <p class="lede">
      Share a climate learning document through our authenticated email service.
    </p>
  </div>

  <section class="email-layout">
    <form class="email-form card" novalidate @submit.prevent="submit">
      <FormMessage
        v-if="!emailConfigured"
        type="info"
        :message="emailSetupMessage"
      />
      <FormMessage v-if="result.message" :type="result.type" :message="result.message" />

      <div class="field">
        <label for="recipient">Recipient email</label>
        <input
          id="recipient"
          v-model="form.to"
          type="email"
          autocomplete="email"
          placeholder="learner@example.org"
          :aria-invalid="Boolean(errors.to)"
          aria-describedby="recipient-error"
        />
        <p v-if="errors.to" id="recipient-error" class="field-error">{{ errors.to }}</p>
      </div>

      <div class="field">
        <label for="subject">Subject</label>
        <input
          id="subject"
          v-model="form.subject"
          type="text"
          maxlength="120"
          placeholder="Climate learning resource"
          :aria-invalid="Boolean(errors.subject)"
          aria-describedby="subject-error"
        />
        <p v-if="errors.subject" id="subject-error" class="field-error">{{ errors.subject }}</p>
      </div>

      <div class="field">
        <label for="message">Message</label>
        <textarea
          id="message"
          v-model="form.message"
          rows="7"
          maxlength="5000"
          placeholder="Add a short, helpful message…"
          :aria-invalid="Boolean(errors.message)"
          aria-describedby="message-error"
        ></textarea>
        <p v-if="errors.message" id="message-error" class="field-error">{{ errors.message }}</p>
      </div>

      <div class="field">
        <label for="attachment">Attachment</label>
        <input
          id="attachment"
          ref="fileInput"
          type="file"
          :accept="acceptedTypes"
          :aria-invalid="Boolean(errors.attachment)"
          aria-describedby="attachment-help attachment-error"
          @change="selectAttachment"
        />
        <p id="attachment-help" class="field-help">
          PDF, PNG, JPEG or TXT. Maximum {{ MAX_ATTACHMENT_BYTES / 1024 / 1024 }} MB.
        </p>
        <p v-if="form.attachment" class="file-summary">
          <i class="pi pi-paperclip" aria-hidden="true"></i>
          {{ form.attachment.name }} · {{ (form.attachment.size / 1024).toFixed(1) }} KB
        </p>
        <p v-if="errors.attachment" id="attachment-error" class="field-error">
          {{ errors.attachment }}
        </p>
      </div>

      <button class="primary-button send-button" type="submit" :disabled="sending || !emailConfigured">
        <i :class="sending ? 'pi pi-spin pi-spinner' : 'pi pi-send'" aria-hidden="true"></i>
        {{ sending ? 'Sending…' : 'Send email' }}
      </button>
    </form>

    <aside class="security-card card" aria-labelledby="security-heading">
      <span class="shield"><i class="pi pi-shield" aria-hidden="true"></i></span>
      <h2 id="security-heading">Simple and focused</h2>
      <p>Your form and attachment are sent through a protected Firebase function.</p>
      <ul>
        <li>The page is available only after Firebase sign-in.</li>
        <li>Attachments are checked before submission.</li>
        <li>Duplicate requests are blocked while sending.</li>
      </ul>
    </aside>
  </section>
</template>

<style scoped>
.email-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
  align-items: start;
  gap: 1.5rem;
}

.email-form {
  display: grid;
  gap: 1.2rem;
  padding: clamp(1.2rem, 4vw, 2rem);
}

.field-help {
  margin: 0;
  color: var(--ink-500);
  font-size: 0.85rem;
}

.file-summary {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  color: var(--brand-800);
  font-size: 0.9rem;
  font-weight: 700;
}

.send-button {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.security-card {
  position: sticky;
  top: 104px;
  padding: 1.5rem;
}

.shield {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  margin-bottom: 1rem;
  border-radius: 14px;
  color: var(--brand-800);
  background: var(--brand-100);
  font-size: 1.35rem;
}

.security-card p,
.security-card li {
  color: var(--ink-700);
}

.security-card ul {
  display: grid;
  gap: 0.65rem;
  padding-left: 1.2rem;
  margin-bottom: 0;
}

@media (max-width: 800px) {
  .email-layout {
    grid-template-columns: 1fr;
  }

  .security-card {
    position: static;
  }
}
</style>

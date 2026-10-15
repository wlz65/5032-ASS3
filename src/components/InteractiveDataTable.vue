<script setup>
import { computed, ref } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  rows: { type: Array, required: true },
  columns: { type: Array, required: true },
  searchPlaceholder: { type: String, default: 'Search all columns' },
  exportFilename: { type: String, default: '' },
})

function createFilters() {
  return props.columns.reduce(
    (result, column) => {
      result[column.field] = { value: null, matchMode: FilterMatchMode.CONTAINS }
      return result
    },
    { global: { value: null, matchMode: FilterMatchMode.CONTAINS } },
  )
}

const filters = ref(createFilters())
const dataTable = ref(null)
const filteredRowCount = ref(props.rows.length)
const exportMessage = ref('')
const resolvedExportFilename = computed(
  () => props.exportFilename || props.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
)

function clearFilters() {
  filters.value = createFilters()
  filteredRowCount.value = props.rows.length
  exportMessage.value = ''
}

function handleFilter(event) {
  filteredRowCount.value = event.filteredValue.length
  exportMessage.value = ''
}

function exportTable() {
  if (!filteredRowCount.value) return
  dataTable.value?.exportCSV()
  exportMessage.value = `${filteredRowCount.value} ${filteredRowCount.value === 1 ? 'row' : 'rows'} exported from ${props.title}.`
}
</script>

<template>
  <section class="table-card card" :aria-labelledby="`${title.replace(/\s+/g, '-')}-heading`">
    <div class="table-intro">
      <div>
        <h2 :id="`${title.replace(/\s+/g, '-')}-heading`">{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
      <span class="record-count">{{ filteredRowCount }} of {{ rows.length }} records</span>
    </div>

    <DataTable
      ref="dataTable"
      v-model:filters="filters"
      :value="rows"
      :export-filename="resolvedExportFilename"
      data-key="id"
      paginator
      :rows="10"
      filter-display="row"
      :global-filter-fields="columns.map((column) => column.field)"
      striped-rows
      responsive-layout="scroll"
      class="climate-table"
      @filter="handleFilter"
    >
      <template #header>
        <div class="table-toolbar">
          <label class="global-search">
            <span class="sr-only">{{ searchPlaceholder }}</span>
            <i class="pi pi-search" aria-hidden="true"></i>
            <InputText v-model="filters.global.value" :placeholder="searchPlaceholder" />
          </label>
          <div class="table-actions">
            <Button
              type="button"
              label="Export CSV"
              icon="pi pi-download"
              :disabled="filteredRowCount === 0"
              @click="exportTable"
            />
            <Button
              type="button"
              label="Clear filters"
              icon="pi pi-filter-slash"
              severity="secondary"
              outlined
              @click="clearFilters"
            />
          </div>
        </div>
      </template>

      <template #empty>
        <div class="empty-state">
          <i class="pi pi-search" aria-hidden="true"></i>
          <strong>No matching records</strong>
          <span>Try another keyword or clear the filters.</span>
        </div>
      </template>

      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        :export-header="column.header"
        sortable
        :show-filter-menu="false"
        :style="{ minWidth: column.width || '11rem' }"
      >
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            :placeholder="column.filterPlaceholder"
            :aria-label="column.filterPlaceholder"
            fluid
            @input="filterCallback()"
          />
        </template>
      </Column>
    </DataTable>
    <p class="export-status" aria-live="polite" aria-atomic="true">{{ exportMessage }}</p>
  </section>
</template>

<style scoped>
.table-card {
  overflow: hidden;
  padding: clamp(1rem, 3vw, 1.6rem);
}

.table-intro {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.table-intro h2 {
  margin-bottom: 0.35rem;
}

.table-intro p {
  margin: 0;
  color: var(--ink-500);
}

.record-count {
  align-self: flex-start;
  white-space: nowrap;
  border-radius: 999px;
  padding: 0.4rem 0.7rem;
  color: var(--brand-800);
  background: var(--brand-100);
  font-size: 0.82rem;
  font-weight: 750;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
}

.table-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.global-search {
  position: relative;
  display: flex;
  align-items: center;
  width: min(360px, 100%);
}

.global-search i {
  position: absolute;
  left: 0.8rem;
  z-index: 1;
  color: var(--ink-500);
}

.global-search :deep(input) {
  width: 100%;
  padding-left: 2.4rem;
}

.empty-state {
  display: grid;
  justify-items: center;
  gap: 0.25rem;
  padding: 2rem;
  color: var(--ink-500);
}

.empty-state i {
  margin-bottom: 0.35rem;
  font-size: 1.5rem;
}

.export-status {
  min-height: 1.4rem;
  margin: 0.7rem 0 0;
  color: var(--success);
  font-size: 0.9rem;
  font-weight: 650;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 620px) {
  .table-intro,
  .table-toolbar {
    flex-direction: column;
  }

  .record-count {
    align-self: flex-start;
  }
}
</style>

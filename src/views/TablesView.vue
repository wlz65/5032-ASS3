<script setup>
import InteractiveDataTable from '@/components/InteractiveDataTable.vue'
import { climateResources } from '@/data/climateResources'
import { communityEvents } from '@/data/communityEvents'

const resourceColumns = [
  { field: 'title', header: 'Resource title', filterPlaceholder: 'Search title', width: '17rem' },
  { field: 'topic', header: 'Topic', filterPlaceholder: 'Search topic' },
  { field: 'audience', header: 'Audience', filterPlaceholder: 'Search audience' },
  { field: 'format', header: 'Format', filterPlaceholder: 'Search format' },
  { field: 'difficulty', header: 'Difficulty', filterPlaceholder: 'Search difficulty' },
]

const eventColumns = [
  { field: 'name', header: 'Event name', filterPlaceholder: 'Search event', width: '18rem' },
  { field: 'type', header: 'Type', filterPlaceholder: 'Search type' },
  { field: 'location', header: 'Location', filterPlaceholder: 'Search location' },
  { field: 'date', header: 'Date', filterPlaceholder: 'Search date' },
  { field: 'audience', header: 'Audience', filterPlaceholder: 'Search audience' },
  { field: 'availability', header: 'Availability', filterPlaceholder: 'Search availability' },
]
</script>

<template>
  <div class="page-heading">
    <p class="eyebrow">Climate learning directory</p>
    <h1>Explore resources and local action</h1>
    <p class="lede">
      Sort, search and filter two practical datasets created for Melbourne learners and communities.
    </p>
  </div>

  <div class="table-stack">
    <InteractiveDataTable
      title="Climate education resources"
      description="Learning material for students, teachers, families and community groups."
      :rows="climateResources"
      :columns="resourceColumns"
      search-placeholder="Search all climate resources"
      export-filename="mclimatewise-climate-resources"
    />

    <InteractiveDataTable
      title="Community events and workshops"
      description="Upcoming opportunities to learn, connect and take practical local action."
      :rows="communityEvents"
      :columns="eventColumns"
      search-placeholder="Search all community events"
      export-filename="mclimatewise-community-events"
    />
  </div>
</template>

<style scoped>
.table-stack {
  display: grid;
  gap: 2rem;
}
</style>

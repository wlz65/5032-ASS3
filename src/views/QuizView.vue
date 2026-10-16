<script setup>
import { computed, ref } from 'vue'
import { climateResources } from '@/data/climateResources'
import { climateQuizSets } from '@/data/climateQuizSets'

const quizLibrary = climateQuizSets.map((quizSet) => {
  const resource = climateResources.find(({ id }) => id === quizSet.resourceId)
  return {
    ...quizSet,
    title: resource.title,
    difficulty: resource.difficulty,
  }
})

function shuffledQuestions(questionSet) {
  const shuffled = [...questionSet]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }

  return shuffled
}

const activeQuiz = ref(null)
const questions = ref([])
const currentIndex = ref(0)
const selectedAnswer = ref('')
const submitted = ref(false)
const score = ref(0)
const finished = ref(false)

const currentQuestion = computed(() => questions.value[currentIndex.value])
const progress = computed(() => ((currentIndex.value + 1) / questions.value.length) * 100)
const isCorrect = computed(() => selectedAnswer.value === currentQuestion.value.answer)
const resultMessage = computed(() => {
  if (score.value === questions.value.length) return 'Excellent climate knowledge!'
  if (score.value >= 3) return 'Good work — you have a strong foundation.'
  return 'Good start — revisit the explanations and try again.'
})

function resetProgress() {
  currentIndex.value = 0
  selectedAnswer.value = ''
  submitted.value = false
  score.value = 0
  finished.value = false
}

function startQuiz(quizSet) {
  activeQuiz.value = quizSet
  questions.value = shuffledQuestions(quizSet.questions)
  resetProgress()
}

function checkAnswer() {
  if (!selectedAnswer.value || submitted.value) return
  submitted.value = true
  if (isCorrect.value) score.value += 1
}

function nextQuestion() {
  if (!submitted.value) return

  if (currentIndex.value === questions.value.length - 1) {
    finished.value = true
    return
  }

  currentIndex.value += 1
  selectedAnswer.value = ''
  submitted.value = false
}

function restartQuiz() {
  questions.value = shuffledQuestions(activeQuiz.value.questions)
  resetProgress()
}

function chooseAnotherQuiz() {
  activeQuiz.value = null
  questions.value = []
  resetProgress()
}
</script>

<template>
  <div class="page-heading">
    <p class="eyebrow">Climate knowledge quiz</p>
    <h1>Choose a resource quiz</h1>
    <p class="lede">
      Choose one of six resource titles. Each quiz contains five fixed questions presented in a
      different order each time.
    </p>
  </div>

  <section v-if="!activeQuiz" class="quiz-library" aria-label="Available climate quizzes">
    <article v-for="quizSet in quizLibrary" :key="quizSet.resourceId" class="quiz-set-card card">
      <div class="resource-context">
        <span>{{ quizSet.difficulty }}</span>
        <span>{{ quizSet.questions.length }} questions</span>
      </div>
      <h2>{{ quizSet.title }}</h2>
      <p>Test your understanding of this climate learning resource.</p>
      <button class="primary-button" type="button" @click="startQuiz(quizSet)">Start quiz</button>
    </article>
  </section>

  <section v-else-if="!finished" class="quiz-card card" aria-labelledby="quiz-question">
    <button class="text-button" type="button" @click="chooseAnotherQuiz">
      <i class="pi pi-arrow-left" aria-hidden="true"></i>
      Choose another quiz
    </button>
    <div class="active-quiz-heading">
      <div class="resource-context">
        <span>{{ activeQuiz.title }}</span>
        <span>{{ activeQuiz.difficulty }}</span>
      </div>
    </div>
    <div class="quiz-progress-row">
      <strong>Question {{ currentIndex + 1 }} of {{ questions.length }}</strong>
      <span>{{ score }} correct so far</span>
    </div>
    <div
      class="quiz-progress"
      role="progressbar"
      :aria-valuenow="currentIndex + 1"
      aria-valuemin="1"
      :aria-valuemax="questions.length"
      :aria-label="`Question ${currentIndex + 1} of ${questions.length}`"
    >
      <span :style="{ width: `${progress}%` }"></span>
    </div>

    <form @submit.prevent="checkAnswer">
      <fieldset :disabled="submitted">
        <legend id="quiz-question">{{ currentQuestion.question }}</legend>
        <label
          v-for="option in currentQuestion.options"
          :key="option"
          class="quiz-option"
          :class="{
            'quiz-option--correct': submitted && option === currentQuestion.answer,
            'quiz-option--incorrect': submitted && option === selectedAnswer && !isCorrect,
          }"
        >
          <input v-model="selectedAnswer" type="radio" name="quiz-answer" :value="option" />
          <span>{{ option }}</span>
        </label>
      </fieldset>

      <button v-if="!submitted" class="primary-button" type="submit" :disabled="!selectedAnswer">
        Check answer
      </button>
    </form>

    <div
      v-if="submitted"
      class="answer-feedback"
      :class="isCorrect ? 'answer-feedback--correct' : 'answer-feedback--incorrect'"
      role="status"
      aria-live="polite"
    >
      <strong>{{
        isCorrect ? 'Correct!' : `Not quite. The answer is ${currentQuestion.answer}.`
      }}</strong>
      <p>{{ currentQuestion.explanation }}</p>
      <button class="primary-button" type="button" @click="nextQuestion">
        {{ currentIndex === questions.length - 1 ? 'See my result' : 'Next question' }}
      </button>
    </div>
  </section>

  <section v-else class="quiz-result card" aria-labelledby="quiz-result-heading" aria-live="polite">
    <span class="result-icon" aria-hidden="true"><i class="pi pi-trophy"></i></span>
    <p class="eyebrow">Quiz complete</p>
    <p class="result-resource">{{ activeQuiz.title }}</p>
    <h2 id="quiz-result-heading">You scored {{ score }} out of {{ questions.length }}</h2>
    <p>{{ resultMessage }}</p>
    <div class="result-actions">
      <button class="primary-button" type="button" @click="restartQuiz">Try again</button>
      <button class="secondary-button" type="button" @click="chooseAnotherQuiz">
        Choose another quiz
      </button>
    </div>
  </section>
</template>

<style scoped>
.quiz-card,
.quiz-result {
  max-width: 820px;
  padding: clamp(1.25rem, 4vw, 2rem);
}

.quiz-library {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.quiz-set-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 245px;
  padding: 1.5rem;
}

.quiz-set-card h2 {
  margin: 0 0 0.65rem;
  font-size: 1.35rem;
}

.quiz-set-card p {
  flex: 1;
  margin: 0 0 1.2rem;
  color: var(--ink-700);
}

.active-quiz-heading {
  margin: 1rem 0 0.6rem;
}

.quiz-progress-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--ink-700);
}

.quiz-progress {
  height: 10px;
  margin: 0.75rem 0 1.75rem;
  overflow: hidden;
  border-radius: 999px;
  background: var(--brand-100);
}

.quiz-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--brand-650);
  transition: width 180ms ease;
}

.resource-context {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-bottom: 0.8rem;
}

.resource-context span {
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  color: var(--brand-800);
  background: var(--brand-100);
  font-size: 0.88rem;
  font-weight: 700;
}

fieldset {
  display: grid;
  gap: 0.75rem;
  padding: 0;
  margin: 0 0 1.25rem;
  border: 0;
}

legend {
  width: 100%;
  margin-bottom: 1rem;
  color: var(--ink-950);
  font-size: clamp(1.25rem, 3vw, 1.65rem);
  font-weight: 800;
  line-height: 1.3;
}

.quiz-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 52px;
  padding: 0.8rem 1rem;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface-soft);
  cursor: pointer;
}

.quiz-option:has(input:checked) {
  border-color: var(--brand-650);
  background: var(--brand-50);
  box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.12);
}

.quiz-option--correct {
  border-color: var(--success);
  background: var(--success-soft);
}

.quiz-option--incorrect {
  border-color: var(--danger);
  background: var(--danger-soft);
}

.quiz-option input {
  width: 19px;
  height: 19px;
  accent-color: var(--brand-650);
}

.answer-feedback {
  margin-top: 1.25rem;
  padding: 1rem;
  border-left: 5px solid;
  border-radius: 10px;
}

.answer-feedback p {
  margin: 0.45rem 0 1rem;
}

.answer-feedback--correct {
  border-color: var(--success);
  background: var(--success-soft);
}

.answer-feedback--incorrect {
  border-color: var(--danger);
  background: var(--danger-soft);
}

.quiz-result {
  text-align: center;
}

.quiz-result p:not(.eyebrow) {
  color: var(--ink-700);
  font-size: 1.08rem;
}

.quiz-result .result-resource {
  margin: 0.35rem 0 0.75rem;
  font-weight: 700;
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.result-icon {
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  margin: 0 auto 1rem;
  border-radius: 20px;
  color: var(--brand-800);
  background: var(--brand-100);
  font-size: 1.8rem;
}

@media (max-width: 560px) {
  .quiz-library {
    grid-template-columns: 1fr;
  }

  .quiz-progress-row {
    flex-direction: column;
    gap: 0.2rem;
  }
}
</style>

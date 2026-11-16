import { exercises } from './data.js'

const KEY = 'ana-wellness-v1'

export const LEVELS = [
  {
    id: 1,
    name: 'Recruta',
    line: 'Aprender a posição. Cada repetição conta se o corpo ficar inteiro.',
    push: 'wall-push',
    pull: { porta: 'door-easy', barra: 'dead-hang', chao: 'prone-row' },
    squat: 'chair-squat',
    hinge: 'glute-bridge',
    core: ['dead-bug-easy', 'knee-plank'],
    motor: 'squat-back',
  },
  {
    id: 2,
    name: 'Base',
    line: 'Sair da parede e sustentar o corpo numa linha simples.',
    push: 'incline-push',
    pull: { porta: 'door-row', barra: 'scap-pull', chao: 'prone-pause' },
    squat: 'squat',
    hinge: 'wall-lunge',
    core: ['dead-bug', 'plank', 'bird-dog'],
    motor: 'climber',
  },
  {
    id: 3,
    name: 'Operacional',
    line: 'Flexão militar, puxada de verdade e perna estável.',
    push: 'push-up',
    pull: { porta: 'door-low', barra: 'negative', chao: 'prone-single' },
    squat: 'pause-squat',
    hinge: 'reverse-lunge',
    core: ['plank', 'side-plank', 'bent-leg-raise'],
    motor: 'burpee-easy',
  },
  {
    id: 4,
    name: 'Padrão',
    line: 'Volume limpo, prova e o degrau seguinte.',
    push: 'hr-push',
    pull: { porta: 'door-single', barra: 'pull-up', chao: 'prone-single' },
    squat: 'reverse-lunge',
    hinge: 'split-squat',
    core: ['bent-leg-raise', 'side-plank', 'plank'],
    motor: 'burpee',
  },
]

const PREP = ['bend-reach', 'rear-lunge', 'high-jumper', 'rower', 'squat-bender']
const RECOVERY = ['stretch-chest', 'stretch-hip', 'stretch-back']

const META = {
  A: {
    title: 'Força de base',
    summary: 'Empurrar e puxar em pares, core e soltura.',
    why: 'Enquanto um padrão descansa, o outro trabalha. A força sobe sem série podre no fim.',
    cue: 'Peito perto do apoio. Na puxada, o cotovelo desce para o bolso.',
    filter: 'Força',
    art: 'push',
    focus: 'Empurrar + puxar',
  },
  B: {
    title: 'Motor das pernas',
    summary: 'Agachamento, avanço e um bloco curto de fôlego.',
    why: 'Perna forte primeiro. O intervalo fica curto para a posição não quebrar.',
    cue: 'Calcanhar no chão. Joelho na direção dos dedos.',
    filter: 'Motor',
    art: 'legs',
    focus: 'Pernas + fôlego',
  },
  C: {
    title: 'Corpo inteiro',
    summary: 'Os três padrões no mesmo dia, com o tronco nos quatro lados.',
    why: 'O dia que junta tudo e serve de ensaio para a prova.',
    cue: 'Uma linha só, do calcanhar ao ombro, nos empurrões.',
    filter: 'Força',
    art: 'full',
    focus: 'Corpo inteiro',
  },
  M: {
    title: 'Mobilidade de prontidão',
    summary: 'Preparação completa, controle de tronco e alongamento.',
    why: 'O dia extra não é folga no sofá. É amplitude para o próximo esforço chegar inteiro.',
    cue: 'Devagar. Se tremer, encurte o movimento e continue.',
    filter: 'Mobilidade',
    art: 'move',
    focus: 'Mobilidade',
  },
  T: {
    title: 'Prova de prontidão',
    summary: 'Um minuto de empurrar, agachar, puxar e prancha.',
    why: 'Número limpo vale mais que número alto. A prova mostra se o ciclo subiu.',
    cue: 'Pare antes de a posição quebrar.',
    filter: 'Prova',
    art: 'test',
    focus: 'Teste',
  },
  H: {
    title: 'Densidade curta',
    summary: 'Circuito curto para dias de pouco tempo.',
    why: 'Quando o relógio aperta, a densidade substitui a série longa. A posição continua valendo.',
    cue: 'Respire no ritmo. Não transforme o circuito em corrida.',
    filter: 'Motor',
    art: 'full',
    focus: 'Condicionamento',
  },
}

const GAIN = {
  A: { push: 6, pull: 6, legs: 1, core: 3 },
  B: { push: 1, pull: 1, legs: 7, core: 3 },
  C: { push: 4, pull: 4, legs: 4, core: 4 },
  M: { push: 1, pull: 1, legs: 2, core: 6 },
  T: { push: 3, pull: 3, legs: 3, core: 3 },
  H: { push: 4, pull: 1, legs: 4, core: 3 },
}

export const FILTERS = ['Tudo', 'Força', 'Motor', 'Mobilidade', 'Prova']
export const LIBRARY = ['A', 'B', 'C', 'H', 'M', 'T']

export function defaultState() {
  return {
    onboarded: false,
    name: '',
    start: 'zero',
    days: 3,
    pull: 'porta',
    week: 1,
    level: 1,
    sessionsDone: 0,
    streak: 0,
    lastSessionDate: '',
    feeling: null,
    hardStreak: 0,
    easyStreak: 0,
    skill: { push: 8, pull: 8, legs: 8, core: 8 },
    history: [],
    favorites: [],
    test: null,
    coach: [],
    coachUnread: 0,
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw)
    return {
      ...defaultState(),
      ...parsed,
      skill: { ...defaultState().skill, ...(parsed.skill || {}) },
    }
  } catch {
    return defaultState()
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* armazenamento cheio ou bloqueado */
  }
}

export function levelOf(state) {
  return LEVELS.find((item) => item.id === state.level) || LEVELS[0]
}

export function pullId(state) {
  const level = levelOf(state)
  return level.pull[state.pull] || level.pull.chao
}

export function todayKey(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

export function trainedToday(state) {
  return state.lastSessionDate === todayKey()
}

export function greeting(name) {
  const hour = new Date().getHours()
  const part = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  return `${part}, ${name || 'atleta'}`
}

export function phaseOf(week) {
  if (week <= 2) return { index: 0, name: 'Adaptação' }
  if (week <= 4) return { index: 1, name: 'Volume' }
  if (week <= 6) return { index: 1, name: 'Densidade' }
  return { index: 2, name: 'Padrão' }
}

export function adaptLine(state) {
  if (state.feeling === 'pesado') return 'O último treino pesou. Hoje as repetições descem e o descanso sobe.'
  if (state.feeling === 'facil') return 'O último treino sobrou. Hoje entra a faixa alta de repetições.'
  if (state.week <= 2) return 'Fase de adaptação. Feche as séries com folga de forma, sem correr.'
  if (state.week <= 4) return 'Fase de volume. A faixa de cima é o alvo, na mesma posição.'
  if (state.week <= 6) return 'Fase de densidade. Entra mais uma série.'
  return 'Fase de padrão. No fim do esforço aparece o degrau seguinte.'
}

export function volumeFor(state) {
  let sets = state.week <= 4 ? 3 : state.week <= 6 ? 4 : 3
  let band = state.week <= 2 ? 'low' : 'high'
  let rest = state.week <= 2 ? 75 : state.week <= 4 ? 65 : state.week <= 6 ? 50 : 55
  if (state.feeling === 'pesado') {
    band = 'low'
    rest += 15
    sets = Math.max(2, sets - 1)
  }
  if (state.feeling === 'facil') {
    band = 'high'
    rest = Math.max(40, rest - 10)
  }
  return { sets, band, rest }
}

export function todayCode(state) {
  const seq = state.days === 4 ? ['A', 'B', 'C', 'M'] : ['A', 'B', 'C']
  return seq[state.sessionsDone % seq.length]
}

export function easierThan(id) {
  return Object.values(exercises).find((item) => item.next === id) || null
}

export function harderThan(id) {
  const next = exercises[id]?.next
  return next ? exercises[next] : null
}

function createBuilder() {
  const steps = []
  function add(exerciseId, opts = {}) {
    const exercise = exercises[exerciseId]
    if (!exercise) throw new Error(`Exercício ausente: ${exerciseId}`)
    const band = opts.band || 'low'
    const timed = Boolean(opts.forceTimer || exercise.hold)
    const seconds = opts.seconds ?? (exercise.hold ? (band === 'low' ? exercise.hold[0] : exercise.hold[1]) : 30)
    const baseReps = opts.reps ?? (exercise.reps ? String(band === 'low' ? exercise.reps[0] : exercise.reps[1]) : '')
    const sides = timed && exercise.eachSide ? ['Lado direito', 'Lado esquerdo'] : [opts.tag || '']
    sides.forEach((side, index) => {
      const last = index === sides.length - 1
      steps.push({
        id: `s${steps.length + 1}`,
        kind: timed ? 'timer' : 'mark',
        exerciseId,
        reps: !timed && exercise.eachSide ? `${baseReps} cada` : baseReps,
        seconds: timed ? seconds : 0,
        rest: last ? opts.rest ?? 0 : 8,
        block: opts.block,
        checklist: Boolean(opts.checklist),
        set: opts.set || 0,
        totalSets: opts.totalSets || 0,
        tag: side,
        note: index === 0 ? opts.note || '' : '',
      })
    })
  }
  return { steps, add }
}

function estimate(steps) {
  let seconds = 0
  for (const step of steps) {
    seconds += step.kind === 'timer' ? step.seconds + 8 : 40
    seconds += step.rest || 0
  }
  return Math.max(8, Math.round(seconds / 60))
}

function pack(code, level, steps) {
  const meta = META[code]
  return {
    id: code,
    ...meta,
    levelName: level.name,
    levelId: level.id,
    minutes: estimate(steps),
    steps,
  }
}

export function buildWorkout(state, forced) {
  const code = forced || todayCode(state)
  const level = levelOf(state)
  const volume = volumeFor(state)
  const { steps, add } = createBuilder()
  const push = level.push
  const pull = pullId(state)
  const wantNext = state.week >= 7 && state.feeling !== 'pesado'

  const prepCount = code === 'T' || code === 'H' ? 3 : 5
  PREP.slice(0, prepCount).forEach((id) => {
    add(id, { reps: '5', rest: code === 'M' ? 12 : 10, block: 'Preparação', band: 'low' })
  })

  if (code === 'A') {
    for (let set = 1; set <= volume.sets; set += 1) {
      add(push, {
        band: volume.band,
        rest: 40,
        block: 'Esforço',
        checklist: true,
        set,
        totalSets: volume.sets,
        note: set === 1 ? 'Faça a série e descanse pouco. A puxada entra em seguida.' : '',
      })
      add(pull, {
        band: volume.band,
        rest: volume.rest,
        block: 'Esforço',
        checklist: true,
        set,
        totalSets: volume.sets,
      })
    }
    if (wantNext) addDegrau(add, push, pull, volume)
    addCore(add, level, volume)
    addRecovery(add, volume.band)
  }

  if (code === 'B') {
    for (let set = 1; set <= volume.sets; set += 1) {
      add(level.squat, { band: volume.band, rest: volume.rest, block: 'Esforço', checklist: true, set, totalSets: volume.sets })
    }
    for (let set = 1; set <= volume.sets; set += 1) {
      add(level.hinge, { band: volume.band, rest: volume.rest, block: 'Esforço', checklist: true, set, totalSets: volume.sets })
    }
    if (wantNext && exercises[level.squat].next) {
      add(exercises[level.squat].next, {
        band: 'low',
        rest: 60,
        block: 'Esforço',
        checklist: true,
        set: 1,
        totalSets: 2,
        tag: 'Degrau seguinte',
      })
      add(exercises[level.squat].next, {
        band: 'low',
        rest: 60,
        block: 'Esforço',
        checklist: true,
        set: 2,
        totalSets: 2,
        tag: 'Degrau seguinte',
      })
    }
    addMotor(add, state, level)
    addCore(add, level, volume)
    addRecovery(add, volume.band)
  }

  if (code === 'C') {
    const sets = Math.max(2, volume.sets - 1)
    for (const id of [push, pull, level.squat]) {
      for (let set = 1; set <= sets; set += 1) {
        add(id, { band: volume.band, rest: volume.rest, block: 'Esforço', checklist: true, set, totalSets: sets })
      }
    }
    if (wantNext && exercises[push].next) {
      add(exercises[push].next, {
        band: 'low',
        rest: 60,
        block: 'Esforço',
        checklist: true,
        set: 1,
        totalSets: 1,
        tag: 'Degrau seguinte',
      })
    }
    addCore(add, level, volume)
    addRecovery(add, volume.band)
  }

  if (code === 'M') {
    addCore(add, level, { ...volume, band: 'low' })
    addRecovery(add, 'high')
  }

  if (code === 'T') {
    const plankId = state.level === 1 ? 'knee-plank' : 'plank'
    add(push, { forceTimer: true, seconds: 60, rest: 75, block: 'Prova', checklist: true, tag: 'Máximo limpo', set: 1, totalSets: 1 })
    add(level.squat, { forceTimer: true, seconds: 60, rest: 75, block: 'Prova', checklist: true, tag: 'Máximo limpo', set: 1, totalSets: 1 })
    add(pull, { forceTimer: true, seconds: 45, rest: 60, block: 'Prova', checklist: true, tag: 'Máximo limpo', set: 1, totalSets: 1 })
    add(plankId, { forceTimer: true, seconds: state.level === 1 ? 30 : 60, rest: 20, block: 'Prova', checklist: true, tag: 'Pare se a linha quebrar', set: 1, totalSets: 1 })
    add('stretch-back', { band: 'high', rest: 0, block: 'Recuperação' })
  }

  if (code === 'H') {
    addMotor(add, state, level, true)
    add(state.level === 1 ? 'knee-plank' : 'plank', { band: 'low', rest: 20, block: 'Core', checklist: true, set: 1, totalSets: 1 })
    add('stretch-hip', { band: 'low', rest: 0, block: 'Recuperação' })
  }

  return pack(code, level, steps)
}

function addDegrau(add, push, pull, volume) {
  const nextPush = exercises[push].next
  const nextPull = exercises[pull].next
  if (nextPush) {
    add(nextPush, { band: 'low', rest: 50, block: 'Esforço', checklist: true, set: 1, totalSets: 2, tag: 'Degrau seguinte' })
    add(nextPush, { band: 'low', rest: 50, block: 'Esforço', checklist: true, set: 2, totalSets: 2, tag: 'Degrau seguinte' })
  }
  if (nextPull) {
    add(nextPull, { band: 'low', rest: volume.rest, block: 'Esforço', checklist: true, set: 1, totalSets: 2, tag: 'Degrau seguinte' })
    add(nextPull, { band: 'low', rest: volume.rest, block: 'Esforço', checklist: true, set: 2, totalSets: 2, tag: 'Degrau seguinte' })
  }
}

function addCore(add, level, volume) {
  level.core.forEach((id, index) => {
    add(id, {
      band: volume.band,
      rest: index === level.core.length - 1 ? 20 : 35,
      block: 'Core',
      checklist: true,
      set: 1,
      totalSets: 1,
    })
  })
}

function addRecovery(add, band) {
  RECOVERY.forEach((id, index) => {
    add(id, { band, rest: index === RECOVERY.length - 1 ? 0 : 8, block: 'Recuperação' })
  })
}

function addMotor(add, state, level, circuit) {
  const work = level.id === 1 ? 20 : level.id === 2 ? 25 : 30
  let recover = level.id === 1 ? 40 : 30
  let rounds = state.week <= 2 ? 4 : state.week <= 4 ? 5 : 6
  if (state.feeling === 'pesado') {
    rounds = Math.max(3, rounds - 1)
    recover += 10
  }
  if (circuit) rounds = Math.min(rounds, 4)
  const moves = circuit ? [level.push, level.squat, level.motor] : [level.motor]
  for (let round = 1; round <= rounds; round += 1) {
    moves.forEach((id, index) => {
      const lastMove = index === moves.length - 1
      add(id, {
        forceTimer: true,
        seconds: work,
        rest: lastMove ? recover : 12,
        block: circuit ? 'Densidade' : 'Motor',
        checklist: true,
        set: round,
        totalSets: rounds,
      })
    })
  }
}

export function sessionForExercise(state, exerciseId) {
  const volume = volumeFor(state)
  const exercise = exercises[exerciseId]
  const level = levelOf(state)
  const { steps, add } = createBuilder()
  for (let set = 1; set <= volume.sets; set += 1) {
    add(exerciseId, {
      band: volume.band,
      rest: set === volume.sets ? 0 : volume.rest,
      block: 'Prática',
      checklist: true,
      set,
      totalSets: volume.sets,
    })
  }
  return {
    id: 'X',
    title: exercise.name,
    summary: exercise.pattern,
    why: exercise.steps[0],
    cue: exercise.tips[0] || '',
    filter: 'Força',
    art: artFor(exercise.pattern),
    focus: exercise.pattern,
    levelName: level.name,
    levelId: level.id,
    minutes: estimate(steps),
    steps,
  }
}

function artFor(pattern) {
  if (pattern === 'Empurrar') return 'push'
  if (pattern === 'Puxar') return 'pull'
  if (pattern === 'Pernas') return 'legs'
  if (pattern === 'Core') return 'core'
  if (pattern === 'Preparação' || pattern === 'Recuperação') return 'move'
  return 'full'
}

export function listWorkouts(state) {
  const today = todayCode(state)
  const order = [today, ...LIBRARY.filter((code) => code !== today)]
  return order.map((code) => buildWorkout(state, code))
}

export function blocksOf(workout) {
  const blocks = []
  for (const step of workout.steps) {
    let block = blocks.find((item) => item.name === step.block)
    if (!block) {
      block = { name: step.block, items: [] }
      blocks.push(block)
    }
    const label = exercises[step.exerciseId].short
    if (!block.items.includes(label)) block.items.push(label)
  }
  return blocks
}

export function standards(state) {
  const pull = state.pull
  const table = {
    1: [
      ['Flexão na parede', '10 seguidas'],
      ['Prancha de joelhos', '20 segundos'],
      ['Agachamento na cadeira', '10 com o peito alto'],
      ['Puxada', pull === 'barra' ? '20 segundos de suspensão' : pull === 'porta' ? '8 remadas fáceis' : '10 remadas deitado'],
    ],
    2: [
      ['Flexão na mesa', '10 seguidas'],
      ['Prancha', '30 segundos'],
      ['Agachamento', '15 com o calcanhar no chão'],
      ['Puxada', pull === 'barra' ? '8 ativações de escápula' : pull === 'porta' ? '8 remadas na porta' : '10 remadas com pausa'],
    ],
    3: [
      ['Flexão militar', '12 com o peito perto do chão'],
      ['Prancha', '45 segundos'],
      ['Agachamento com pausa', '10 paradas de 2 segundos'],
      ['Puxada', pull === 'barra' ? '5 negativas de 3 segundos' : pull === 'porta' ? '8 remadas com o corpo baixo' : '8 remadas unilaterais'],
    ],
    4: [
      ['Flexão com soltura das mãos', '15'],
      ['Prancha', '60 segundos'],
      ['Avanço reverso', '8 cada perna'],
      ['Puxada', pull === 'barra' ? '5 barras estritas' : pull === 'porta' ? '6 remadas unilaterais' : '8 remadas unilaterais'],
    ],
  }
  return table[state.level] || table[1]
}

function clockStamp(date = new Date()) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function coachMsg(text) {
  return { from: 'coach', text, time: clockStamp() }
}

export function completeOnboarding(answers) {
  const level = answers.start === 'ativo' ? 3 : answers.start === 'base' ? 2 : 1
  const skillBase = answers.start === 'ativo' ? 40 : answers.start === 'base' ? 24 : 8
  const state = {
    ...defaultState(),
    onboarded: true,
    name: (answers.name || '').trim() || 'atleta',
    start: answers.start,
    days: answers.days,
    pull: answers.pull,
    level,
    week: 1,
    skill: { push: skillBase, pull: skillBase, legs: skillBase, core: skillBase },
  }
  const workout = buildWorkout(state)
  state.coach = [
    coachMsg(
      `${state.name}, plano montado no nível ${levelOf(state).name}. Semana 1, adaptação. A repetição fica na faixa de baixo até a posição ficar estável.`,
    ),
    coachMsg(`Missão de hoje: ${workout.title}. ${workout.minutes} min. ${workout.why}`),
  ]
  state.coachUnread = 2
  return state
}

function nextStreak(state) {
  const today = todayKey()
  if (!state.lastSessionDate) return 1
  if (state.lastSessionDate === today) return state.streak || 1
  const previous = new Date(`${state.lastSessionDate}T12:00:00`)
  const now = new Date(`${today}T12:00:00`)
  const diff = Math.round((now - previous) / 86400000)
  return diff === 1 ? (state.streak || 0) + 1 : 1
}

function addSkill(skill, gain, half) {
  const next = { ...skill }
  for (const key of Object.keys(gain)) {
    const inc = half ? Math.ceil(gain[key] / 2) : gain[key]
    next[key] = Math.min(100, (next[key] || 0) + inc)
  }
  return next
}

function gainFor(workout) {
  if (workout.id !== 'X') return GAIN[workout.id] || GAIN.C
  const pattern = exercises[workout.steps[0].exerciseId].pattern
  if (pattern === 'Empurrar') return { push: 5, pull: 0, legs: 0, core: 1 }
  if (pattern === 'Puxar') return { push: 0, pull: 5, legs: 0, core: 1 }
  if (pattern === 'Pernas' || pattern === 'Motor') return { push: 0, pull: 0, legs: 5, core: 1 }
  if (pattern === 'Core') return { push: 0, pull: 0, legs: 0, core: 5 }
  return { push: 1, pull: 1, legs: 1, core: 2 }
}

export function applyResult(state, { workout, feeling, test, extra }) {
  const next = {
    ...state,
    feeling,
    skill: addSkill(state.skill, gainFor(workout), extra),
    history: [
      { date: todayKey(), id: workout.id, title: workout.title, feeling, extra: Boolean(extra) },
      ...state.history,
    ].slice(0, 40),
    lastSessionDate: todayKey(),
  }
  let note = ''
  if (!extra) {
    next.streak = nextStreak(state)
    next.sessionsDone = state.sessionsDone + 1
    let week = state.week
    let level = state.level
    let hard = state.hardStreak || 0
    let easy = state.easyStreak || 0
    if (next.sessionsDone % state.days === 0) week += 1
    if (feeling === 'facil') {
      easy += 1
      hard = 0
      if (easy >= 2) {
        week += 1
        easy = 0
        note = 'Dois treinos com folga. Adiantei a semana para a faixa de repetição subir.'
      }
    } else if (feeling === 'pesado') {
      easy = 0
      hard += 1
      if (hard >= 2 && level > 1) {
        level -= 1
        hard = 0
        note = 'Dois treinos pesados. Desci um degrau do movimento para a forma voltar a ficar limpa.'
      }
    } else {
      easy = 0
      hard = 0
    }
    if (week > 8) {
      if (level < 4 && feeling !== 'pesado') {
        level += 1
        week = 1
        note = `Ciclo fechado. Nível ${LEVELS[level - 1].name}. A faixa recomeça embaixo, no exercício novo.`
      } else {
        week = 5
        note = note || 'Ciclo de padrão renovado na fase de densidade.'
      }
    }
    next.week = week
    next.level = level
    next.hardStreak = hard
    next.easyStreak = easy
  }
  if (test && [test.push, test.squat, test.row, test.plank].some((value) => Number(value) > 0)) {
    next.test = {
      date: todayKey(),
      level: state.level,
      push: Number(test.push) || 0,
      squat: Number(test.squat) || 0,
      row: Number(test.row) || 0,
      plank: Number(test.plank) || 0,
    }
  }
  const feelingLine = {
    pesado: 'Registrei como pesado. A próxima missão usa a faixa baixa e mais descanso.',
    facil: 'Registrei como fácil. A próxima missão usa a faixa alta.',
    certo: 'Registrei no ponto. A missão segue a semana em que você está.',
  }[feeling]
  const text = [feelingLine, note].filter(Boolean).join(' ')
  next.coach = [...state.coach, coachMsg(text)]
  next.coachUnread = (state.coachUnread || 0) + 1
  return next
}

export function replyTo(state, text) {
  const message = text.toLowerCase()
  const today = buildWorkout(state)
  const level = levelOf(state)
  const push = exercises[level.push]
  const pull = exercises[pullId(state)]
  const squat = exercises[level.squat]

  if (/punho|pulso/.test(message)) {
    return 'Punho: abra a mão, espalhe os dedos e deixe o indicador para a frente. Se doer, volte para a flexão na parede ou feche o punho na versão de joelhos. Dor aguda interrompe a série.'
  }
  if (/joelho/.test(message)) {
    return 'Joelho: ele pode passar a ponta do pé se o calcanhar ficar no chão. Dor aguda pede a cadeira e uma descida mais curta. Inchaço ou fisgada não se treina por cima.'
  }
  if (/ombro/.test(message)) {
    return 'Ombro: cotovelo a cerca de 45 graus na flexão, não aberto até a orelha. Encolha menos a escápula na puxada. Se pinicar, desça um degrau do exercício e encurte a amplitude.'
  }
  if (/porta/.test(message)) {
    return 'Porta: ela abre para o lado oposto a você, fechadura travada, toalha na maçaneta e um calço no pé. Se a maçaneta mexer, a série acaba. Corpo mais deitado, puxada mais difícil.'
  }
  if (/barra|muscle|planche|alavanca|pistol/.test(message)) {
    return 'Barra estrita, pistol e skill de alavanca vêm depois do padrão. Primeiro: flexão militar limpa, uma puxada de verdade e agachamento estável. Skill em cima de base frouxa machuca.'
  }
  if (/aqueci|prepara/.test(message)) {
    return 'O drill completo do PRT tem 10 movimentos. Na missão eu uso 5: inclinar e alcançar, avanço atrás, salto baixo, remada em pé e agachar e dobrar. Cinco repetições, ritmo controlado. O objetivo é preparar, não cansar.'
  }
  if (/f[aá]cil|leve|sobrou/.test(message)) {
    return 'Se as séries fecharam com sobra, marque Fácil no fim. Dois treinos assim e eu adianto a semana. O exercício só muda quando a faixa de cima fica limpa, ou na fase de padrão.'
  }
  if (/dif[ií]cil|pesad|n[aã]o consegui|falhei/.test(message)) {
    return 'Marque Pesado. Eu seguro a faixa de baixo e aumento o descanso. Dois treinos pesados seguidos e o movimento desce um degrau. Isso preserva a semana, não apaga ela.'
  }
  if (/flex/.test(message)) {
    return `${push.name}. ${push.steps[0]} ${push.steps[1]} ${push.avoid}`
  }
  if (/agach|perna|avan[cç]/.test(message)) {
    return `${squat.name}. ${squat.steps[0]} ${squat.steps[1]} ${squat.avoid}`
  }
  if (/remada|pux/.test(message)) {
    return `${pull.name}. ${pull.steps[0]} ${pull.steps[1]} ${pull.avoid}`
  }
  if (/prancha|core|abd/.test(message)) {
    return 'Prancha: cotovelo sob o ombro, costela fechada, glúteo firme. A série acaba quando a linha quebra. Vinte segundos alinhados contam mais do que um minuto com a barriga caída.'
  }
  if (/pr[oó]xim|hoje|foco|miss/.test(message)) {
    return `Próxima missão: ${today.title}, ${today.minutes} min. ${today.why} Ponto de atenção: ${today.cue}`
  }
  if (/semana|quant|quando|resultado/.test(message)) {
    return `O ciclo tem 8 semanas. Você está na semana ${state.week}, fase ${phaseOf(state.week).name}, nível ${level.name}. Resultado alto aqui é repetir o processo: posição, repetição, série, depois o exercício mais difícil.`
  }
  if (/dor/.test(message)) {
    return 'Dor muscular difusa no dia seguinte cabe no plano. Dor aguda, fisgada ou articulação inchada: pare o movimento e desça o degrau. Eu não atravesso dor para cumprir série.'
  }
  return `Anotei. Na missão de hoje, ${today.title}, o ponto é este: ${today.cue}`
}

export function initialRun(workout) {
  const step = workout.steps[0]
  return {
    i: 0,
    mode: 'work',
    left: step.kind === 'timer' ? step.seconds : 0,
    paused: false,
    finished: [],
  }
}

function advance(run, workout) {
  const next = run.i + 1
  if (next >= workout.steps.length) return { ...run, mode: 'done', left: 0, paused: false }
  const step = workout.steps[next]
  return {
    ...run,
    i: next,
    mode: 'work',
    paused: false,
    left: step.kind === 'timer' ? step.seconds : 0,
  }
}

export function afterWork(run, workout) {
  if (run.mode === 'done') return run
  const step = workout.steps[run.i]
  const finished = run.finished.includes(step.id) ? run.finished : [...run.finished, step.id]
  if (step.rest > 0) return { ...run, finished, mode: 'rest', left: step.rest, paused: false }
  return advance({ ...run, finished }, workout)
}

export function primaryAction(run, workout) {
  if (run.mode === 'done') return run
  if (run.mode === 'rest') return advance(run, workout)
  return afterWork(run, workout)
}

export function tick(run, workout) {
  if (run.paused || run.mode === 'done') return run
  const step = workout.steps[run.i]
  if (!step) return run
  const timing = run.mode === 'rest' || step.kind === 'timer'
  if (!timing) return run
  if (run.left > 1) return { ...run, left: run.left - 1 }
  if (run.mode === 'rest') return advance(run, workout)
  return afterWork(run, workout)
}

export function retreat(run, workout) {
  if (run.mode === 'rest') {
    const step = workout.steps[run.i]
    return {
      ...run,
      mode: 'work',
      paused: false,
      left: step.kind === 'timer' ? step.seconds : 0,
      finished: run.finished.filter((id) => id !== step.id),
    }
  }
  const index = run.mode === 'done' ? workout.steps.length - 1 : Math.max(0, run.i - 1)
  if (run.mode !== 'done' && run.i === 0) return run
  const step = workout.steps[index]
  return {
    ...run,
    i: index,
    mode: 'work',
    paused: false,
    left: step.kind === 'timer' ? step.seconds : 0,
    finished: run.finished.filter((id) => id !== step.id),
  }
}

export function formatClock(value) {
  const seconds = Math.max(0, value | 0)
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

export function showDate(key) {
  if (!key) return ''
  const [, month, day] = key.split('-')
  return `${day}/${month}`
}

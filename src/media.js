const WORKOUT_SCENE = {
  A: 'push',
  B: 'legs',
  C: 'engine',
  H: 'engine',
  M: 'move',
  T: 'core',
}

const PATTERN_SCENE = {
  Empurrar: 'push',
  Puxar: 'pull',
  Pernas: 'legs',
  Core: 'core',
  Motor: 'engine',
  Preparação: 'move',
  Recuperação: 'move',
}

function who(gender) {
  return gender === 'f' ? 'f' : 'm'
}

export function workoutPhoto(gender, workoutId) {
  const scene = WORKOUT_SCENE[workoutId] || 'push'
  return `/library/${who(gender)}-${scene}.jpg`
}

export function patternPhoto(gender, pattern) {
  const scene = PATTERN_SCENE[pattern] || 'push'
  return `/library/${who(gender)}-${scene}.jpg`
}

const EXERCISE_VIDEO = {
  'm:bend-reach': '/library/m-bend-reach.mp4',
  'm:push-up': '/library/m-push.mp4',
}

export function exerciseVideo(gender, exerciseId) {
  return EXERCISE_VIDEO[`${who(gender)}:${exerciseId}`] || ''
}

export function patternVideo(gender, pattern) {
  if (pattern === 'Empurrar' && who(gender) === 'm') return '/library/m-push.mp4'
  return ''
}

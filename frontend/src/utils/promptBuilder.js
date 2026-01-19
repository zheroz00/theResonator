// Axis descriptors mapping fader values to prompt terms
export const AXIS_DESCRIPTORS = {
  energy: {
    low: ['ambient', 'chill', 'atmospheric', 'slow', 'relaxed'],
    mid: ['moderate tempo', 'flowing', 'steady'],
    high: ['intense', 'driving', 'energetic', 'fast', 'aggressive', 'powerful'],
  },
  mood: {
    low: ['dark', 'ominous', 'brooding', 'minor key', 'melancholic'],
    mid: ['neutral', 'balanced'],
    high: ['bright', 'uplifting', 'euphoric', 'major key', 'triumphant'],
  },
  texture: {
    low: ['smooth', 'clean', 'polished', 'soft', 'pristine'],
    mid: ['textured', 'warm'],
    high: ['gritty', 'distorted', 'saturated', 'raw', 'crunchy', 'aggressive'],
  },
  complexity: {
    low: ['minimal', 'sparse', 'simple', 'stripped-back'],
    mid: ['layered', 'balanced arrangement'],
    high: ['dense', 'complex', 'intricate', 'maximalist', 'full'],
  },
  bass: {
    low: ['sub bass', 'deep bass', 'rumbling low-end', 'subterranean'],
    mid: ['balanced bass', 'punchy bass'],
    high: ['mid-range bass', 'reese bass', 'growling bass', 'screaming bass'],
  },
}

export const GENRES = [
  'neurofunk',
  'drum and bass',
  'dubstep',
  'techno',
  'house',
  'ambient',
  'trap',
  'synthwave',
  'industrial',
  'breakbeat',
]

export const ELEMENTS = [
  'synth pads',
  'arpeggios',
  'vocal chops',
  'risers',
  'impacts',
  'hi-hats',
  'reese bass',
  'strings',
  'brass stabs',
  'piano',
]

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getDescriptorForValue(axis, value) {
  const descriptors = AXIS_DESCRIPTORS[axis]
  if (value < 33) {
    return pickRandom(descriptors.low)
  } else if (value > 66) {
    return pickRandom(descriptors.high)
  }
  // Mid values are optional, only include sometimes
  return Math.random() > 0.5 ? pickRandom(descriptors.mid) : null
}

export function buildPromptFromMixer(mixerState) {
  const parts = []

  // Add genre if selected
  if (mixerState.genre) {
    parts.push(mixerState.genre)
  }

  // Map each axis to descriptors based on value ranges
  const axes = ['energy', 'mood', 'texture', 'complexity', 'bass']
  axes.forEach((axis) => {
    const descriptor = getDescriptorForValue(axis, mixerState[axis])
    if (descriptor) {
      parts.push(descriptor)
    }
  })

  // Add selected elements
  if (mixerState.elements.length > 0) {
    parts.push(`with ${mixerState.elements.join(', ')}`)
  }

  return parts.join(' ')
}

export function randomizeMixer() {
  // Pick 2-4 random elements
  const elementCount = 2 + Math.floor(Math.random() * 3)
  const shuffled = [...ELEMENTS].sort(() => Math.random() - 0.5)
  const randomElements = shuffled.slice(0, elementCount)

  return {
    energy: Math.floor(Math.random() * 101),
    mood: Math.floor(Math.random() * 101),
    texture: Math.floor(Math.random() * 101),
    complexity: Math.floor(Math.random() * 101),
    bass: Math.floor(Math.random() * 101),
    genre: GENRES[Math.floor(Math.random() * GENRES.length)],
    elements: randomElements,
  }
}

export const DEFAULT_MIXER_STATE = {
  energy: 50,
  mood: 50,
  texture: 50,
  complexity: 50,
  bass: 50,
  genre: null,
  elements: [],
}

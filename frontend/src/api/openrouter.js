// OpenRouter API client for generating creative music prompts

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const DEFAULT_MODEL = 'anthropic/claude-3-haiku'

const SYSTEM_PROMPT = `You are an expert in drum and bass, neurofunk, and electronic bass music production. Your job is to generate creative, varied prompts for an AI music generation system.

You know all the terminology:
- Subgenres: neurofunk, liquid, jump-up, techstep, darkstep, minimal, halftime, jungle, ragga, crossbreed, dancefloor
- Bass types: reese bass, wobble bass, neuro bass, growl bass, hoover, sub bass, foghorn, talking bass, yoi bass, screech
- Drum elements: amen break, jungle break, think break, rolling snares, syncopated hats, punchy kicks, ghost notes, breaks
- Textures: dark, aggressive, melodic, atmospheric, rolling, hypnotic, clinical, liquid, deep, techy, heavy
- Effects: filtered, distorted, modulated, granular, detuned, pitched, warped, phased, flanged, bitcrushed
- Actions: drop, buildup, breakdown, roller, tear-out, banger, intro, outro

Generate ONE short, creative prompt (5-15 words) that describes a unique piece of drum and bass music. Be specific and interesting. Mix different elements creatively.

Examples of good prompts:
- "aggressive neurofunk drop with screaming reese bass and tight rolling drums"
- "liquid drum and bass with atmospheric pads and deep sub"
- "dark techstep roller with modulated hoover bass"
- "halftime beat with granular textures and deep wobble"
- "jump-up banger with foghorn bass and amen breaks"

Output ONLY the prompt, nothing else. No quotes, no explanation.`

// Fallback prompts if API fails
const FALLBACK_PROMPTS = [
  'neurofunk bass drop with reese growl and tight drums',
  'liquid drum and bass with atmospheric pads and rolling breakbeats',
  'dark techstep with aggressive neuro bass and distorted snares',
  'halftime beat with deep sub and granular textures',
  'jump-up banger with foghorn bass and jungle breaks',
  'minimal drum and bass with clinical percussion and filtered reese',
  'ragga jungle with chopped vocals and amen breaks',
  'deep roller with hypnotic bass modulation and ghost notes',
  'crossbreed tear-out with screaming bass and punchy kicks',
  'melodic liquid with lush pads and smooth sub bass'
]

export async function generateRandomPrompt() {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  const model = import.meta.env.VITE_OPENROUTER_MODEL || DEFAULT_MODEL

  if (!apiKey) {
    console.warn('OpenRouter API key not configured, using fallback prompts')
    return getRandomFallback()
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'The Resonator'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: 'Generate a creative music prompt.' }
        ],
        max_tokens: 100,
        temperature: 0.9
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error('OpenRouter API error:', error)
      return getRandomFallback()
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.trim()

    if (!content) {
      console.warn('Empty response from OpenRouter, using fallback')
      return getRandomFallback()
    }

    // Clean up the response - remove quotes if present
    return content.replace(/^["']|["']$/g, '').trim()
  } catch (error) {
    console.error('Error calling OpenRouter:', error)
    return getRandomFallback()
  }
}

function getRandomFallback() {
  return FALLBACK_PROMPTS[Math.floor(Math.random() * FALLBACK_PROMPTS.length)]
}

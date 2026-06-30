import assert from 'node:assert/strict'
import test from 'node:test'
import {
  makeTelegraphPlan,
  makeTelegraphTransitionPlan,
  renderTelegraphFrame,
  renderTelegraphTransitionFrame,
  telegraphDuration,
} from './telegraphText.js'

const TEXT = 'JUNGUI SIGNAL\n文字正在校准'

test('renders the final text after the telegraph sequence completes', () => {
  const plan = makeTelegraphPlan(TEXT, { seed: 7 })
  const output = renderTelegraphFrame(TEXT, telegraphDuration(plan), plan)

  assert.equal(output, TEXT)
})

test('keeps frame length stable while preserving whitespace positions', () => {
  const plan = makeTelegraphPlan(TEXT, { seed: 7 })
  const output = renderTelegraphFrame(TEXT, 8, plan)

  assert.equal([...output].length, [...TEXT].length)
  assert.equal(output[13], '\n')
})

test('uses deterministic plans for the same seed', () => {
  assert.deepEqual(
    makeTelegraphPlan(TEXT, { seed: 11 }),
    makeTelegraphPlan(TEXT, { seed: 11 }),
  )
})

test('renders the expanded hover phrase at the end of a transition', () => {
  const target = 'Multiple Intelligent Agents'
  const plan = makeTelegraphTransitionPlan('MIA', target, { seed: 3 })

  assert.equal(
    renderTelegraphTransitionFrame('MIA', target, telegraphDuration(plan), plan),
    target,
  )
})

test('renders the compact MIA label after contracting from the expanded phrase', () => {
  const source = 'Multiple Intelligent Agents'
  const plan = makeTelegraphTransitionPlan(source, 'MIA', { seed: 4 })

  assert.equal(
    renderTelegraphTransitionFrame(source, 'MIA', telegraphDuration(plan), plan),
    'MIA',
  )
})

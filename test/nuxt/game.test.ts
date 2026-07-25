import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import GameShell from '../../app/components/game/GameShell.vue'

describe('single-player game', () => {
  let wrapper: VueWrapper | undefined

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    document.body.innerHTML = ''
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders a named 3-by-3 board in Hard mode', async () => {
    wrapper = await mountGame()

    expect(wrapper.get('[role="grid"]').attributes('aria-label')).toBe('Tic-tac-toe board')
    expect(wrapper.findAll('[role="gridcell"]')).toHaveLength(9)
    expect(wrapper.get('[aria-label="Row 1, column 1, empty"]').attributes('aria-label'))
      .toBe('Row 1, column 1, empty')
    expect(wrapper.text()).toContain('hard mode')
    expect(wrapper.text()).toContain('You are X')
    expect(wrapper.text()).toContain('Your move, human.')
    expect(wrapper.get('[aria-label="Your mark"] [aria-pressed="true"]').text()).toBe('X')
    expect(wrapper.findAll('[data-preview-mark="X"]')).toHaveLength(9)
    expect(wrapper.get('[aria-label="You, 0 wins"]').text()).toBe('00')
    expect(wrapper.get('[aria-label="CPU, 0 wins"]').text()).toBe('00')
    expect(wrapper.get('[aria-label="Draws, 0 draws"]').text()).toBe('00')
    expect(buttonNamed('Reset score').attributes('disabled')).toBeDefined()
  })

  it('accepts one human move and locks input until Hard responds', async () => {
    wrapper = await mountGame()
    vi.useFakeTimers()

    await cell(0).trigger('click')
    await cell(1).trigger('click')

    expect(cell(0).attributes('data-mark')).toBe('X')
    expect(cell(0).get('[data-placed-mark]').text()).toBe('X')
    expect(cell(1).attributes('data-mark')).toBeUndefined()
    expect(cell(1).attributes('aria-disabled')).toBe('true')
    expect(wrapper.text()).toContain('CPU TURN')

    vi.advanceTimersByTime(260)
    await nextTick()

    expect(cell(4).attributes('data-mark')).toBe('O')
    expect(wrapper.text()).toContain('YOUR TURN')
  })

  it('cancels a pending computer move when New round is pressed', async () => {
    wrapper = await mountGame()
    vi.useFakeTimers()

    await cell(0).trigger('click')
    await buttonNamed('New round').trigger('click')
    vi.runAllTimers()
    await nextTick()

    expect(wrapper.findAll('[data-mark]')).toHaveLength(0)
    expect(wrapper.text()).toContain('Round 02')
    expect(wrapper.text()).toContain('YOUR TURN')
  })

  it('queues Easy mode for the next round', async () => {
    wrapper = await mountGame()

    await wrapper.get('[aria-label="Difficulty"] [aria-pressed="false"]').trigger('click')

    expect(wrapper.text()).toContain('Changes next round')
    expect(wrapper.text()).toContain('Finish this round on hard. The next one starts on easy.')

    await buttonNamed('New round').trigger('click')

    expect(wrapper.text()).toContain('easy mode')
    expect(wrapper.text()).toContain('quickPick()')
  })

  it('switches to O immediately and renders the computer opening as X', async () => {
    wrapper = await mountGame()
    vi.useFakeTimers()

    await wrapper.get('[aria-label="Your mark"] [aria-pressed="false"]').trigger('click')

    expect(wrapper.text()).toContain('You are O')
    expect(wrapper.text()).toContain('Round 02')
    expect(wrapper.text()).toContain('CPU TURN')

    vi.advanceTimersByTime(260)
    await nextTick()

    expect(cell(4).attributes('data-mark')).toBe('X')
    expect(wrapper.text()).toContain('YOUR TURN')
    expect(wrapper.findAll('[data-preview-mark="O"]')).toHaveLength(8)

    await cell(0).trigger('click')

    expect(cell(0).attributes('data-mark')).toBe('O')
  })

  it('supports arrow-key navigation with one cell in the tab order', async () => {
    wrapper = await mountGame()
    const firstCell = cell(0)
    const firstElement = firstCell.element as HTMLElement

    firstElement.focus()
    await firstCell.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()

    expect(document.activeElement?.getAttribute('aria-label')).toBe('Row 1, column 2, empty')
    expect(wrapper.findAll('[role="gridcell"] button[tabindex="0"]')).toHaveLength(1)
  })

  it('keeps arrow-key navigation available after the focused cell is played', async () => {
    wrapper = await mountGame()
    vi.useFakeTimers()
    const firstCell = cell(0)
    const firstElement = firstCell.element as HTMLElement

    firstElement.focus()
    await firstCell.trigger('click')
    vi.advanceTimersByTime(260)
    await nextTick()
    await firstCell.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()

    expect(document.activeElement?.getAttribute('aria-label')).toBe('Row 1, column 2, empty')
    expect(wrapper.findAll('[role="gridcell"] button[tabindex="0"]')).toHaveLength(1)
  })

  it('announces and highlights a human winning line', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    wrapper = await mountGame()

    await wrapper.get('[aria-label="Difficulty"] [aria-pressed="false"]').trigger('click')
    await buttonNamed('New round').trigger('click')
    vi.useFakeTimers()

    await cell(0).trigger('click')
    vi.advanceTimersByTime(260)
    await nextTick()
    await cell(3).trigger('click')
    vi.advanceTimersByTime(260)
    await nextTick()
    await cell(6).trigger('click')

    expect(wrapper.text()).toContain('You found the line.')
    expect(wrapper.text()).toContain('LINE FOUND')
    expect(wrapper.findAll('[data-winning="true"]')).toHaveLength(3)
    expect(wrapper.findAll('[data-winning-line]')).toHaveLength(3)
    expect(cell(8).attributes('aria-disabled')).toBe('true')
    expect(wrapper.get('[aria-label="You, 1 win"]').text()).toBe('01')
    expect(buttonNamed('Run it back').exists()).toBe(true)
  })

  it('resets the visible session score', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    wrapper = await mountGame()

    await wrapper.get('[aria-label="Difficulty"] [aria-pressed="false"]').trigger('click')
    await buttonNamed('New round').trigger('click')
    vi.useFakeTimers()

    await cell(0).trigger('click')
    vi.advanceTimersByTime(260)
    await nextTick()
    await cell(3).trigger('click')
    vi.advanceTimersByTime(260)
    await nextTick()
    await cell(6).trigger('click')
    await buttonNamed('Reset score').trigger('click')

    expect(wrapper.get('[aria-label="You, 0 wins"]').text()).toBe('00')
    expect(buttonNamed('Reset score').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('You found the line.')
  })

  async function mountGame(): Promise<VueWrapper> {
    return await mountSuspended(GameShell, {
      attachTo: document.body
    })
  }

  function cell(index: number) {
    if (!wrapper) {
      throw new Error('Game is not mounted')
    }

    return wrapper.get(`[data-cell-index="${index}"]`)
  }

  function buttonNamed(name: string) {
    if (!wrapper) {
      throw new Error('Game is not mounted')
    }

    const button = wrapper.findAll('button').find(candidate => candidate.text().trim() === name)

    if (!button) {
      throw new Error(`Could not find button named ${name}`)
    }

    return button
  }
})

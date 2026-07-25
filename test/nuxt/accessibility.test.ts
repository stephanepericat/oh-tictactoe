import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../../app/app.vue'
import GameShell from '../../app/components/game/GameShell.vue'

describe('game accessibility', () => {
  let wrapper: VueWrapper | undefined

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    document.documentElement.classList.remove('dark', 'light')
    document.body.innerHTML = ''
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('exposes named landmarks in the app shell', async () => {
    wrapper = await mountSuspended(App, {
      attachTo: document.body
    })

    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('main').exists()).toBe(true)
    expect(wrapper.get('a[aria-label="Oh! Tic-Tac-Toe home"]').attributes('href')).toBe('/')
  })

  it('publishes a complete ARIA grid and single-selection controls', async () => {
    wrapper = await mountGame()

    const grid = wrapper.get('[role="grid"]')
    const cells = wrapper.findAll('[role="gridcell"] button')
    const status = wrapper.get('[role="status"]')

    expect(grid.attributes()).toMatchObject({
      'aria-label': 'Tic-tac-toe board',
      'aria-rowcount': '3',
      'aria-colcount': '3'
    })
    expect(wrapper.findAll('[role="row"]')).toHaveLength(3)
    expect(cells).toHaveLength(9)
    expect(cells.map(cell => cell.attributes('aria-label'))).toEqual([
      'Row 1, column 1, empty',
      'Row 1, column 2, empty',
      'Row 1, column 3, empty',
      'Row 2, column 1, empty',
      'Row 2, column 2, empty',
      'Row 2, column 3, empty',
      'Row 3, column 1, empty',
      'Row 3, column 2, empty',
      'Row 3, column 3, empty'
    ])
    expect(cells.filter(cell => cell.attributes('tabindex') === '0')).toHaveLength(1)
    expect(cells.every(cell => cell.attributes('aria-disabled') === 'false')).toBe(true)
    expect(wrapper.findAll('[data-preview-mark]')
      .every(preview => preview.attributes('aria-hidden') === 'true')).toBe(true)
    expect(status.attributes()).toMatchObject({
      'aria-live': 'polite',
      'aria-atomic': 'true'
    })

    for (const label of ['Your mark', 'Difficulty']) {
      const group = wrapper.get(`[role="group"][aria-label="${label}"]`)
      const options = group.findAll('button')

      expect(options).toHaveLength(2)
      expect(options.filter(option => option.attributes('aria-pressed') === 'true')).toHaveLength(1)
      expect(options.filter(option => option.attributes('aria-pressed') === 'false')).toHaveLength(1)
    }
  })

  it('announces the CPU turn while keeping the board keyboard reachable', async () => {
    wrapper = await mountGame()
    vi.useFakeTimers()

    const status = wrapper.get('[role="status"]')
    await cell(0).trigger('click')

    expect(status.text()).toContain('The machine is thinking.')
    expect(status.text()).toContain('Evaluating every legal continuation.')

    for (const button of wrapper.findAll('[role="gridcell"] button')) {
      expect(button.attributes('aria-disabled')).toBe('true')
      expect(button.attributes('disabled')).toBeUndefined()
    }

    vi.advanceTimersByTime(260)
    await nextTick()

    expect(status.text()).toContain('Your move, human.')
    expect(cell(0).attributes('aria-label')).toBe('Row 1, column 1, X')
    expect(cell(0).attributes('aria-disabled')).toBe('true')
    expect(cell(1).attributes('aria-disabled')).toBe('false')
  })

  it('supports Home, End, and arrow keys with one roving tab stop', async () => {
    wrapper = await mountGame()
    const firstCell = cell(0)
    const firstElement = firstCell.element as HTMLElement

    firstElement.focus()
    await firstCell.trigger('keydown', { key: 'End' })
    await nextTick()

    expect(document.activeElement?.getAttribute('aria-label')).toBe('Row 3, column 3, empty')

    await cell(8).trigger('keydown', { key: 'Home' })
    await nextTick()
    await cell(0).trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    expect(document.activeElement?.getAttribute('aria-label')).toBe('Row 2, column 1, empty')
    expect(wrapper.findAll('[role="gridcell"] button[tabindex="0"]')).toHaveLength(1)
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
})

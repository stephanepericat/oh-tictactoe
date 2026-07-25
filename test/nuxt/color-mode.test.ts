import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../../app/app.vue'

describe('color mode', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark', 'light')
    document.body.innerHTML = ''
  })

  it('uses the Nuxt UI color-mode button to switch themes', async () => {
    const wrapper = await mountSuspended(App, {
      attachTo: document.body
    })
    const button = wrapper.find('button[aria-label*="mode"]')
    const initialLabel = button.attributes('aria-label')

    expect(['Switch to dark mode', 'Switch to light mode']).toContain(initialLabel)

    await button.trigger('click')

    expect(button.attributes('aria-label')).toBe(
      initialLabel === 'Switch to dark mode'
        ? 'Switch to light mode'
        : 'Switch to dark mode'
    )

    wrapper.unmount()
  })
})

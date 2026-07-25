export default defineAppConfig({
  ui: {
    colors: {
      primary: 'ember',
      success: 'forest',
      neutral: 'stone'
    },
    button: {
      slots: {
        base: 'font-semibold'
      }
    },
    badge: {
      slots: {
        base: 'font-medium'
      }
    }
  }
})

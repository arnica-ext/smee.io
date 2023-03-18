/**
 * Mode enum
 * @enum {string}
 */
const Mode = {
  /** block all */
  block: 'block',

  /** no protection */
  open: 'open',

  /** only in list */
  allowed: 'allowed',

  /** requires password */
  password: 'password'
}

module.exports = {
  channels: {
    /**
     * Mode
     * @param mode {Mode} one of the modes
     */
    mode: Mode.allowed,
    list: {
      protected: {
        password: 'password'
      },
      open: {
        password: null
      },
      slack: {
        password: 'slack',
        handler: 'slack'
      }
    }
  }
}

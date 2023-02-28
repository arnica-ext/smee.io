const config = require('config').util.toObject()

module.exports = class ChannelResolver {
  static mode = config.channels?.mode || 'block'

  channel
  name
  password
  options
  handler
  req
  res
  next

  constructor (req, res, next) {
    this.req = req
    this.res = res
    this.next = next
    this.channel = req.params.channel
    const [name, password] = this.channel.split(':')
    this.name = name
    this.password = password || null
    this.options = config.channels?.list?.[name]
    this.handler = req.method === 'POST' && this.options?.type
      ? require(`./handlers/${this.options.handler}`)?.bind(null, req, res, next)
      : null
  }

  get responder () {
    switch (ChannelResolver.mode) {
      case 'block': return this.forbidden.bind(this)
      case 'open': return this.handler
      case 'allowed': {
        if (!this.options) return this.forbidden.bind(this)
        if (this.options.password && this.options.password === this.password) return this.handler
        return this.forbidden.bind(this)
      }
      case 'password': {
        if (!this.options?.password) return this.forbidden.bind(this)
        if (this.options.password === this.password) return this.handler
        return this.forbidden.bind(this)
      }
    }
  }

  forbidden () {
    this.res.status(403).send('Forbidden')
    return true
  }
}

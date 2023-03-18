const config = require('config').util.toObject();
const mode = config.channels?.mode || 'block'

function forbidden(res) {
  return res.status(403).send('Forbidden')
}

function internalServerError(res) {
  return res.status(500).send('Internal Server Error')
}

module.exports = function customMiddlewareInstaller(app) {
  app.get('/new', (req, res, next) => {
    try {
      if (mode !== "open") return forbidden(res)
      // let the next layer handle the request
      return next()
    } catch (e) {
      console.error('customMiddleware', e)
      return internalServerError(res)
    }
  })
  app.use('/:channel', async (req, res, next) => {
    try {
      const channel = req.params.channel;
      const [name, password] = channel?.split(':') || [];
      const options = config.channels?.list?.[name];
      const handler = req.method === 'POST' && options?.handler
          ? require(`./handlers/${options.handler}`)?.bind(null, req, res, next)
          : null;
          
      switch (mode) {
        // block everything
        case 'block': return forbidden(res)
    
        // allow everything 
        case 'open': break;
    
        // allow only if in list
        case 'allowed': {
          if (options?.password && options.password !== password) return forbidden(res)
          break;
        }
    
        // allow only if in list and password protected
        case 'password': {
          if (!options?.password || options.password !== password) return forbidden(res)
          break;
        }
    
        // misconfiguration
        default: throw new Error(`Invalid mode ${mode}`)
      }
    
      // if there's no handler OR it return 'false'
      // request should be handled by the next layer
      if (!await handler?.(req, res, next)) return next()
    } catch (e) {
      console.error('customMiddleware', e);
      return internalServerError(res)
    }
  })
}
const {
  contentElements,
  contentRenderers,
  actions: builtinActions,
  setup: setupBuiltins
} = require('@botpress/builtins')

const registerCustom = require('./custom')

module.exports = async bp => {
  bp.middlewares.load()
  // This bot template includes a couple of built-in elements and actions
  // Please see the "@botpress/builtins" package to know more
  await registerBuiltin(bp)

  // // Register custom actions, elements and renderers
  await registerCustom(bp)

  // // Train the NLU model if using the Native NLU Engine
  if (bp.nlu && bp.nlu.provider && bp.nlu.provider.name === 'native') {
    await bp.nlu.provider.sync()
  }

  const webchat = {
    botName: 'Basic',
    botAvatarUrl: null, // You can provide a URL here
    botConvoTitle: 'Botpress Basic Webchat Bot',
    botConvoDescription: "Hello, I'm a Botpress bot!",
    backgroundColor: '#ffffff',
    textColorOnBackground: '#666666',
    foregroundColor: '#000000',
    textColorOnForeground: '#ffffff'
  }

  bp.createShortlink('chat', '/lite', {
    m: 'channel-web',
    v: 'fullscreen',
    options: JSON.stringify({ config: webchat })
  })

  bp.logger.info(`------------`)
  bp.logger.info(`Webchat available at ${bp.botfile.botUrl}/s/chat`)
  bp.logger.info(`------------`)

  ////////////////////////////
  /// Conversation Management
  ////////////////////////////

  // Examples of message triggrers
  // bp.hear({platform:'rocketchat', type: 'message', text:'hello'}, async (event, next) => {
  //   await bp.rocketchat.sendText(event.channel, 'Hi I\'m alive', {})
  //   next()
  // })
  // bp.hear({platform:'rocketchat', type: 'message', text:/.+/}, async (event, next) => {
  //   await bp.rocketchat.sendText(event.channel, 'I\'m a freaking awesome bot', {})
  //   next()
  // })

  // All events that should be processed by the Flow Manager
  bp.hear({type: /bp_dialog_timeout|text|message/i, text: /.+/}, async (event, next) => {
    console.log("ENGINE")
    console.log("USER:")
    console.log(event.user)
    console.log("CHANNEL:")
    console.log(event.channel)
    await bp.dialogEngine.processMessage(event.user.id || event.channel, event).then()
    
    
    next()
  })
}

async function registerBuiltin(bp) {
  await setupBuiltins(bp)

  // Register all the built-in content elements
  // Such as Carousel, Text, Choice etc..
  for (const schema of Object.values(contentElements)) {
    await bp.contentManager.loadCategoryFromSchema(schema)
  }

  await bp.contentManager.recomputeCategoriesMetadata()

  // Register all the renderers for the built-in elements
  for (const renderer of Object.keys(contentRenderers)) {
    bp.renderers.register(renderer, contentRenderers[renderer])
  }

  // Register all the built-in actions
  bp.dialogEngine.registerActions(builtinActions)
}

const chalk = require('chalk')

function createPrompt(name, context, opts) {
  if (!context && !opts || (context && 'object' === typeof context)) {
    opts = context
    context = '-'
  }

  opts = opts || {}
  let prompt = ''

  if (false !== opts.colors) {
    // Enhanced prompt with visual flair
    const time = new Date().toLocaleTimeString('en-US', { hour12: false })
    prompt += chalk.bold.magenta('🎬 ')
    prompt += chalk.bold.cyan(name)
    prompt += chalk.gray(' • ')
    prompt += chalk.yellow(time)
  } else {
    prompt += name
  }

  prompt += '('
  if (false !== opts.colors) {
    // Add contextual icons based on file type
    let icon = '📄'
    if (context) {
      if (context.includes('.xml')) icon = '📄'
      else if (context.includes('.rss')) icon = '📡'
      else if (context.includes('.json')) icon = '📃'
      else if (context !== '-') icon = '📁'
    }
    prompt += icon + ' '
    prompt += chalk.italic.green(context)
  } else {
    prompt += context
  }

  if (false !== opts.colors) {
    prompt += chalk.bold.magenta(') ❯ ')
  } else {
    prompt += ')> '
  }

  return prompt
}

function createAnimatedPrompt(name, context) {
  const frames = ['⠇', '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦']
  let frameIndex = 0

  return () => {
      const frame = frames[frameIndex % frames.length]
      frameIndex++

      let prompt = chalk.bold.cyan(frame + ' ')
      prompt += chalk.bold.magenta('🎬 ')
      prompt += chalk.bold.cyan(name)

      if (context && context !== '-') {
          prompt += chalk.gray(' • ')
          prompt += chalk.italic.green(context)
      }

      prompt += chalk.bold.magenta(' ❯ ')
      return prompt
  }
}

module.exports = {
  createPrompt,
  createAnimatedPrompt
}

const { ParserNode, ParserNodeAttributes } = require('../parser')
const { inspect } = require('util')
const chromafi = require('@mediaxml/chromafi')
const chalk = require('chalk')

function pretty(result, opts) {
  opts = { ...opts }
  const context = opts.context || null

  if (
    !ParserNode.isParserNode(result) &&
    false === (result instanceof ParserNodeAttributes)
  ) {
    if (result && result._jsonata_function) {
      const name = (result.implementation.name || 'bound').replace(/^\$/, '')
      const signature = result.signature.definition
      const { description } = result.implementation

      if (false === opts.colors) {
        return `${name}(${signature})${(description ? ` // ${description}` : '')}`
      } else {
        return chalk.bold.blue('🔧 ') + chalk.italic(`${chalk.cyan(name)}(${chalk.bold(signature)})`) + (
          description
          ? ` ${chalk.magenta('//')} ${chalk.italic(description)}`
          : ''
        )
      }
    } else if ('function' === typeof result) {
      const name = (result.name || 'bound').replace(/^\$/, '')
      const signature = result.signature || '..'
      const description = result.description || ''

      if (false === opts.colors) {
        return `${name}(${signature})${(description ? ` // ${description}` : '')}`
      } else {
        return chalk.bold.blue('🔧 ') + chalk.italic(`${chalk.cyan(name)}(${chalk.bold(signature)})`) + (
          description
          ? ` ${chalk.magenta('//')} ${chalk.italic(description)}`
          : ''
        )
      }
    } else {
      return formatResult(result, opts)
    }
  }

  const output = inspect.custom in result
    ? result[inspect.custom]({ colors: false !== opts.colors })
    : result

  if (Array.isArray(output)) {
    const header = opts.colors !== false
      ? chalk.bold.green(`📊 Found ${output.length} result${output.length !== 1 ? 's' : ''}:\n`) +
      chalk.gray('─'.repeat(50)) + '\n'
      : `Found ${output.length} result${output.length !== 1 ? 's' : ''}:\n`

    return header + output.reduce((string, object, index) => {
      const prefix = opts.colors !== false
        ? chalk.bold.yellow(`[${index + 1}] `)
        : `[${index + 1}] `

      return string + prefix + print((
        object && 'object' === typeof object && inspect.custom in object)
        ? object[inspect.custom]({ colors: false !== opts.colors })
        : object, context
      ) + '\n'
    }, '')
  }

  if (false !== opts.color) {
    return print(output, context)
  } else {
    return output
  }
}

function print(out, context) {
  if (false === (out instanceof String) && 'object' !== typeof out && 'string' !== typeof out) {
    return out
  }

  let result = chromafi(out, {
    consoleTabWidth: 0,
    lineNumberPad: 0,
    tabsToSpaces: 2,
    lineNumbers: false,
    stripIndent: false,
    decorate: false,
    codePad: 0,
    lang: 'xml'
  })

  // Apply rainbow coloring if context is provided and rainbow mode is on
  if (context && context.ui && context.ui.animations.rainbow) {
    result = context.ui.colorizeXML(result)
  }

  return result
}

function formatResult(result, opts) {
  if (Array.isArray(result)) {
    const header = opts.colors !== false
      ? chalk.bold.green(`📊 Array with ${result.length} item${result.length !== 1 ? 's' : ''}:`)
      : `Array with ${result.length} item${result.length !== 1 ? 's' : ''}:`
    return header + '\n' + inspect(result, { colors: false !== opts.colors, maxArrayLength: 20 })
  }

  if (result && typeof result === 'object') {
    const keys = Object.keys(result)
    const header = opts.colors !== false
      ? chalk.bold.blue(`📎 Object with ${keys.length} propert${keys.length !== 1 ? 'ies' : 'y'}:`)
      : `Object with ${keys.length} propert${keys.length !== 1 ? 'ies' : 'y'}:`
    return header + '\n' + inspect(result, { colors: false !== opts.colors, depth: 3 })
  }

  return inspect(result, { colors: false !== opts.colors })
}

module.exports = {
  pretty,
  formatResult
}

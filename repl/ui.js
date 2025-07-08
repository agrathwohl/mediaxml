const chalk = require('chalk')
const ora = require('ora')
const { performance } = require('perf_hooks')

class UI {
  constructor(context) {
    this.context = context
    this.startTime = performance.now()
    this.queryCount = 0
    this.animations = {
      rainbow: false
    }

    this.rainbowColors = [
      chalk.red,
      chalk.yellow,
      chalk.green,
      chalk.cyan,
      chalk.blue,
      chalk.magenta
    ]
    this.rainbowIndex = 0

    this.spinners = {
      loading: ora({
        discardStdin: false,
        hideCursor: false,
        indent: 0,
        spinner: {
          interval: 80,
          frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
        },
        color: 'cyan',
        prefixText: `${chalk.bold(chalk.magenta('🔍 loading'))}:`,
        ...context.options.ui.loading
      }),

      processing: ora({
        discardStdin: false,
        hideCursor: false,
        indent: 0,
        spinner: {
          interval: 100,
          frames: ['🌟', '✨', '⭐', '💫', '🌟', '✨', '⭐', '💫']
        },
        color: 'yellow',
        prefixText: `${chalk.bold(chalk.yellow('⚡ processing'))}:`
      }),

      success: ora({
        discardStdin: false,
        hideCursor: false,
        indent: 0,
        spinner: {
          interval: 150,
          frames: ['✅', '🎉', '🎊', '✨', '🌟', '💫']
        },
        color: 'green',
        prefixText: `${chalk.bold(chalk.green('🎯 complete'))}:`
      })
    }
  }

  showWelcome() {
    const banner = [
      '',
      chalk.bold.magenta('╔══════════════════════════════════════════════════════════════╗'),
      chalk.bold.magenta('║') + chalk.bold.cyan('                        MediaXML TUI                          ') + chalk.bold.magenta('║'),
      chalk.bold.magenta('║') + chalk.bold.yellow('              🎬 Media Manifest Query Engine 🎬               ') + chalk.bold.magenta('║'),
      chalk.bold.magenta('╠══════════════════════════════════════════════════════════════╣'),
      chalk.bold.magenta('║') + chalk.white('  ⚡ Lightning-fast XML parsing & querying                    ') + chalk.bold.magenta('║'),
      chalk.bold.magenta('║') + chalk.white('  🎨 Syntax-highlighted results with live preview             ') + chalk.bold.magenta('║'),
      chalk.bold.magenta('║') + chalk.white('  🔍 Powerful JSONata query syntax with media extensions      ') + chalk.bold.magenta('║'),
      chalk.bold.magenta('║') + chalk.white('  📁 Support for ADI, mRSS, XMLTV, and custom formats         ') + chalk.bold.magenta('║'),
      chalk.bold.magenta('╚══════════════════════════════════════════════════════════════╝'),
      ''
    ]

    console.log(banner.join('\n'))

    // Show helpful shortcuts
    this.showShortcuts()
  }

  showShortcuts() {
    const shortcuts = [
      chalk.bold.cyan('🔥 Keyboard Shortcuts:'),
      chalk.white('  • ') + chalk.yellow('Ctrl+R') + chalk.white('     - Rainbow mode (colorize brackets/parens)'),
      chalk.white('  • ') + chalk.yellow('Ctrl+H') + chalk.white('     - Show this help again'),
      chalk.white('  • ') + chalk.yellow('Ctrl+L') + chalk.white('     - Clear screen'),
      chalk.white('  • ') + chalk.yellow('Ctrl+T') + chalk.white('     - Show performance stats'),
      chalk.white('  • ') + chalk.yellow('Tab') + chalk.white('       - Smart completion'),
      chalk.white('  • ') + chalk.yellow('↑/↓') + chalk.white('       - Command history'),
      ''
    ]
    console.log(shortcuts.join('\n'))
  }

  showStats() {
    const uptime = ((performance.now() - this.startTime) / 1000).toFixed(1)
    const stats = [
      '',
      chalk.bold.green('📊 Performance Stats:'),
      chalk.white('  • ') + chalk.cyan('Uptime: ') + chalk.yellow(`${uptime}s`),
      chalk.white('  • ') + chalk.cyan('Queries: ') + chalk.yellow(this.queryCount),
      chalk.white('  • ') + chalk.cyan('Avg Query Time: ') + chalk.yellow(`${(parseFloat(uptime) / Math.max(this.queryCount, 1)).toFixed(2)}s`),
      ''
    ]
    console.log(stats.join('\n'))
  }

  incrementQueryCount() {
    this.queryCount++
  }

  clearScreen() {
    console.clear()
    this.showWelcome()
  }

  toggleRainbow() {
    this.animations.rainbow = !this.animations.rainbow
    const status = this.animations.rainbow ? 'ON' : 'OFF'
    console.log(chalk.bold.magenta(`🌈 Rainbow mode: ${status}`))
  }

  getRainbowColor() {
    if (!this.animations.rainbow) { return chalk.white }
    const color = this.rainbowColors[this.rainbowIndex % this.rainbowColors.length]
    this.rainbowIndex++
    return color
  }

  colorizeXML(xmlString) {
    if (!this.animations.rainbow) { return xmlString }

    // Color brackets, parens, and quotes with rainbow colors
    return xmlString.replace(/([\[\]\(\){}"'<>])/g, (match) => {
      const color = this.getRainbowColor()
      return color(match)
    })
  }

  formatResult(result, query) {
    if (!result) { return '' }

    let output = ''

    // Add query info header
    output += chalk.bold.blue('🔍 Query: ') + chalk.white(query) + '\n'
    output += chalk.bold.blue('📊 Results: ') + chalk.yellow(Array.isArray(result) ? result.length : 1) + '\n'
    output += chalk.gray('─'.repeat(60)) + '\n'

    return output
  }

  showError(error) {
    console.log(chalk.bold.red('❌ Error: ') + chalk.white(error.message))
  }

  showSuccess(message) {
    console.log(chalk.bold.green('✅ Success: ') + chalk.white(message))
  }
}

module.exports = {
  UI
}

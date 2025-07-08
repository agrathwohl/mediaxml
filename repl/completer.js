const { Bindings } = require('../query/index')
const debug = require('debug')('mediaxml')
const glob = require('glob')
const path = require('path')
const fs = require('fs')

function createCompleter(context) {
  return function completer(query) {
    try {
      const parts = query.split(':')
      const end = parts.pop()

      const completions = []
      const smartCompletions = []
      const contextualCompletions = []

      // Add variable completions
      completions.push(...[ ...context.assignments.keys() ].map((key) => `$${key}`))

      // Add function completions
      for (const key in Bindings.builtins) {
        completions.push(`$${key}(`)
      }

      // Smart completions based on context
      if (context.parser && context.parser.rootNode) {
        try {
          const rootNode = context.parser.rootNode
          if (rootNode.children && rootNode.children.length > 0) {
            const commonTags = new Set()
            rootNode.children.forEach(child => {
              if (child.name) { commonTags.add(child.name) }
            })

            commonTags.forEach(tag => {
              smartCompletions.push(`[name="${tag}"]`)
              smartCompletions.push(`**[name="${tag}"]`)
            })
          }
        } catch (e) {
          debug('Error getting smart completions:', e)
        }
      }

      // Enhanced path completion for imports
      if (query) {
        const pathToLoad = query.match(/\bimport\s*(['|"])?(.*)['|"]?\s*?/)
        if (pathToLoad) {
          let [, , pathspec ] = pathToLoad

          if (pathspec) {
            let hits = glob.sync(pathspec + '*')
            if (!hits || !hits.length) {
              hits = glob.sync(pathspec + '**')
            }

            for (const hit of hits) {
              const stat = fs.statSync(hit)
              if (stat.isDirectory()) {
                completions.push(query.replace(pathspec, hit + path.sep))
              } else {
                completions.push(query.replace(pathspec, hit))
              }
            }
          }
        }

        // Smart query suggestions based on current input
        if (query.includes('**')) {
          contextualCompletions.push('**[is node]')
          contextualCompletions.push('**[is text]')
          contextualCompletions.push('**[is not empty]')
        }

        if (query.includes('[')) {
          contextualCompletions.push('[contains "text"]')
          contextualCompletions.push('[starts with "prefix"]')
          contextualCompletions.push('[ends with "suffix"]')
        }
      }

      // Enhanced children completions with visual indicators
      if (/children:?[a-z|A-Z|-]*$/.test(query)) {
        const colon = /children:([a-z|A-Z|-]+)?$/.test(query)

        if (!colon) {
          for (let i = 0; i < 10; i++) {
            completions.push(`${query}[${i}]`)
          }
        }

        const ordinals = [
          'first', 'second', 'third', 'fourth',
          'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'
        ]

        ordinals.forEach(ordinal => {
          completions.push(`${parts.join(':')}:${ordinal}`)
        })
      }

      // Root completions with visual enhancement
      if (!query || ':' === query || /:?r?o?o?t?/.test(query)) {
        if (!/\.$/.test(end)) {
          completions.unshift(':root')
        }
      }

      // Enhanced bracket completions
      if (/\[(is|attributes|children|name|text)?\s*(.*)$/i.test(end)) {
        completions.push(
          'attributes',
          'children',
          'attr(',
          'name',
          'text',
          'import',
          'is',
          'is array',
          'is date',
          'is fragment',
          'is node',
          'is number',
          'is object',
          'is text',
          'is string',
        )
      }
      // Basic completions
      completions.push(
        'name',
        'text',
        'children',
        'attributes',
        'length'
      )

      // Enhanced type completions with visual indicators
      if (/\s$/.test(query) || /(as|is)(\s.*?)$/.test(query)) {
        const typeCompletions = [
          'as',
          'as array',
          'as boolean',
          'as float',
          'as int',
          'as json',
          'as number',
          'as object',
          'as string',
          'as false',
          'as true',
          'as NaN',
          'as nan',
          'as null',
          'as Date',
          'as date',
          'as Document',
          'as document',
          'as Fragment',
          'as fragment',
          'as Node',
          'as node',
          'as Text',
          'as text',
          'as any',
          'as camelcase',
          'as eval',
          'as keys',
          'as pascalcase',
          'as query',
          'as reversed',
          'as snakecase',
          'as sorted',
          'as tuple',
          'as unique',
          'is',
          'is array',
          'is date',
          'is fragment',
          'is node',
          'is number',
          'is object',
          'is text',
          'is string',
        ]

        completions.push(...typeCompletions.map((s) => query.replace(/\b(as|is)\b.*$/, '') + s))
      }

      // Enhanced selector completions
      completions.push(
        ':json',
        ':keys',
        ':text',
        ':attr',
        ':attrs',
        ':children',
        ':nth-child',
      )

      // Combine all completions and filter
      const allCompletions = [...completions, ...smartCompletions, ...contextualCompletions]

      const hits = allCompletions.filter((c) => {
        return c.startsWith(`:${end}`) || c.startsWith(end)
      })

      const sortedResults = hits.length ? unique(hits.sort()) : unique(allCompletions.sort())

      return [sortedResults, query]
    } catch (err) {
      debug(err.stack || err)
      return [[], query]
    }

    function unique(array) {
      return Array.from(new Set(array))
    }
  }
}
module.exports = {

  createCompleter
}

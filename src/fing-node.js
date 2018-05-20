const { spawn } = require('child_process')
const isRoot = require('is-root')

if (!isRoot()) {
	throw new Error('netdiscover requires root')
}

function parseTable(tableString){    
    let hosts = tableString.match(tableLineRegexMultiline)
        .map((host) => {
            tableLineRegex.lastIndex = 0;
            let hostParts = tableLineRegex.exec(host.trim())

            return {
                ip: hostParts[1],
                mac: hostParts[2]
            }
        })
    return hosts
}

function parseOptions(options = {}) {
	let parsedOptions = Object.keys(options).map(key => {
		if (optionsMapper.hasOwnProperty(key)) {
			if (typeof options[key] === 'boolean') {
				return optionsMapper[key]
			} else {
				return `${optionsMapper[key]} ${options[key]}`
			}
		} else {
			throw Error(`Unsupported option ${key}`)
		}
	})

	return parsedOptions.join(' ')
}

let events = {
	scanComplete: () => {}
}

let tableHeaderRegex = new RegExp("-*\\n\\| state \\| host * \\| mac address * \\| last change \\|\\n\\|-*\\|\\n", "gim")
let tableLineRegex = new RegExp("\\| *\\w* *\\| (\\d*\\.\\d*\\.\\d*\\.\\d*) *\\| ([A-z\\d]*:[A-z\\d]*:[A-z\\d]*:[A-z\\d]*:[A-z\\d]*:[A-z\\d]*) \\| *\\|", "gim")
let tableLineRegexMultiline = new RegExp(`${tableLineRegex.source}\\n`, "gim")
let tableRegex = new RegExp(`${tableHeaderRegex.source}(${tableLineRegexMultiline.source})*-*`, "gim")

module.exports = {
	start: async options => {
        let parsedOptions = parseOptions(options).split(' ')

		fing = spawn(`fing`, parsedOptions)

		fing.stdout.on('data', (data) => {
            let tableOutput = tableRegex.exec(data)
            if (tableOutput){
                let parsedTable = parseTable(tableOutput[0])
                events.scanComplete(parsedTable)
            }
        })

		fing.stderr.on('data', err => {
			throw new Error(err)
		})
	},
	on: (eventName, funct) => {
		if (events.hasOwnProperty(eventName)) {
			events[eventName] = funct
		} else {
			throw new Error(`No event with the name: ${eventName} found`)
		}
	}
}

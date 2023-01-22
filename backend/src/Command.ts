import cli from './cliInterface'
import user from './User'
import AirBrake from './AirBrake'
import Logger from './Logger'
import environment from './environment'
import { promisify } from 'util'
import { exec, ExecException } from 'child_process'
import { sudoPromise } from './sudoPromise'

type StdExecException = ExecException & { stderr: string; stdout: string }

const execPromise = promisify(exec)

export default class Command {
  commands: string[] = []
  admin: boolean = false
  quiet: boolean = false

  onError: (error: Error) => void = () => {}

  constructor(options: { command?: string; admin?: boolean; onError?: ErrorCallback; quiet?: boolean }) {
    if (options.command) this.commands = [options.command]
    options.command = undefined
    Object.assign(this, options)
  }

  push(command: string) {
    if (command) this.commands.push(command)
  }

  toString() {
    return this.commands.join(' && ')
  }

  log(
    message: string,
    params: ILookup<object | string | boolean | undefined>,
    type: 'info' | 'warn' | 'error' = 'info'
  ) {
    if (this.quiet) return
    Logger[type](message, this.sanitize(params))
  }

  sanitize(params: ILookup<object | string | boolean | undefined>) {
    if (user.authHash) {
      Object.keys(params).forEach(key => {
        if (typeof params[key] === 'string' && params[key]?.toString().includes(user.authHash))
          params[key] = params[key]?.toString().replace(new RegExp(user.authHash, 'g'), '[CLEARED]')
      })
    }
    return params
  }

  toSafeString() {
    return this.sanitize({ string: this.commands.join(' && ') }).string?.toString() || ''
  }

  parseStdError(error: string): CliStderr {
    const cliError = error.match(/{.*}/)
    if (cliError) {
      return toJson(cliError[0])
    }
    return { message: error, code: -1 }
  }

  async exec() {
    if (this.commands.length === 0) return ''

    let result = ''

    try {
      this.log('EXEC', {
        displayed: !!this.onError,
        exec: this.toString(),
        admin: this.admin,
        elevated: environment.isElevated,
      })

      const { stdout, stderr } =
        this.admin && !environment.isHeadless && !environment.isElevated
          ? await sudoPromise(this.toString())
          : await execPromise(this.toString())

      if (stderr) {
        this.log(`EXEC *** STD ERROR ***`, this.sanitize({ stderr: stderr.toString().trim() }), 'error')
        const error = this.parseStdError(stderr)
        if (isErrorReportable(error)) {
          AirBrake.notify({
            params: { type: 'COMMAND STDERR', exec: this.toString() },
            context: { version: environment.version },
            error: stderr.toString(),
          })
        }
        this.onError(new Error(error.message))
        result = error.message
      }

      if (stdout) {
        result = toJson(stdout)
      }
    } catch (error) {
      if (isStdExecException(error)) {
        const parsed = this.parseStdError(error.stderr || error.stdout || error.message)
        if (isErrorReportable(parsed)) {
          AirBrake.notify({
            params: { type: 'COMMAND ERROR', exec: this.toString() },
            context: { version: environment.version },
            error,
          })
        }
        this.log(`EXEC CAUGHT *** STD ERROR ***`, { error, errorStack: error.stack }, 'error')
        this.onError(new Error(parsed.message))
        result = parsed.message
      } else if (error instanceof Error) {
        this.log(`EXEC CAUGHT *** ERROR ***`, { error, errorStack: error.stack }, 'error')
      } else {
        Logger.error(`EXEC CAUGHT *** UNKNOWN ERROR ***`, { error }, 'error')
      }
    }

    return result
  }
}

// isStdExecException Type Guard
function isStdExecException(error: any): error is StdExecException {
  return !!error.stdout || !!error.stderr
}

function isErrorReportable(error: CliStderr) {
  const newError = error.code > 0 ? !cli.data.errorCodes.includes(error.code) : true
  const reportable = !error.message.includes('read-only file system') && newError
  if (newError) cli.data.errorCodes.push(error.code)
  return reportable
}

function toJson(string: string) {
  let result
  try {
    result = JSON.parse(string)
  } catch (error) {
    return string
  }
  return result
}

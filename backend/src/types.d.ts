import { ChildProcess } from 'child_process'
import { IService } from 'remote.it'

declare global {
  type ConfigFile = {
    device?: IDevice | undefined
    services?: ITarget[]
    auth?: UserCredentials | undefined
  } & { [key: string]: any }

  type IPayload = {
    type: string
    hasError: boolean
    errorMessage: string
    data: object
  }
}

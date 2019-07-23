import Connection from './Connection'
import EventBus from './EventBus'
import Logger from './Logger'
import PortScanner from './PortScanner'
import User from './User'
import { IUser } from 'remote.it'

const PEER_PORT_RANGE = [33000, 42999]

export default class ConnectionPool {
  user?: UserCredentials
  private pool: { [id: string]: Connection } = {}

  static EVENTS = {
    updated: 'pool/updated',
  }

  constructor(connections: ConnectionData[], user?: UserCredentials) {
    Logger.info('Initializing connections pool', { connections })

    this.user = user

    connections.map(conn => this.connect(conn))

    EventBus.on(User.EVENTS.signedIn, (user: IUser) => (this.user = user))
    EventBus.on(User.EVENTS.signedOut, () => (this.user = undefined))
  }

  connect = async (args: { id: string; port?: number; name?: string }) => {
    if (!this.user) throw new Error('No user to authenticate connection!')

    const port = args.port || (await this.freePort())

    if (!port) throw new Error('No port could be assigned to connection!')

    Logger.info('Connecting to service', args)

    // TODO: De-dupe connections!

    const connection = new Connection({
      port,
      username: this.user.username,
      authHash: this.user.authHash,
      ...args,
    })
    this.pool[args.id] = connection
    await this.start(args.id)

    // Trigger a save of the connections file
    this.updated()

    return connection
  }

  find = (id: string) => {
    const conn = this.pool[id]
    if (!conn) throw new Error(`Connection with ID ${id} could not be found!`)
    return conn
  }

  start = async (id: string) => {
    return this.find(id).start()
  }

  stop = async (id: string) => {
    return this.find(id).stop()
  }

  stopAll = async () => {
    return Object.keys(this.pool).map(id => this.stop(id))
  }

  forget = async (id: string) => {
    await this.stop(id)
    delete this.pool[id]
    this.updated()
    EventBus.emit(Connection.EVENTS.forgotten, id)
  }

  reset = async () => {
    await this.stopAll()
    this.pool = {}
  }

  restart = async (id: string) => {
    return this.find(id).restart()
  }

  updated = async () => {
    EventBus.emit(ConnectionPool.EVENTS.updated, this.toJSON())
  }

  toJSON = (): ConnectionData[] => {
    const ids = Object.keys(this.pool)
    return ids.map(id => this.pool[id].toJSON())
  }

  private freePort = async () => {
    return await PortScanner.findFreePortInRange(
      PEER_PORT_RANGE[0],
      PEER_PORT_RANGE[1],
      this.usedPorts
    )
  }

  private get usedPorts() {
    return Object.keys(this.pool).map(id => this.pool[id].port)
  }
}

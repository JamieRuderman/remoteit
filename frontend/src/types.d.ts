import { Application } from './shared/applications'
import { Attribute } from './components/Attributes'
import { Color } from './styling'

declare global {
  type DiagramGroupType =
    | 'target'
    | 'initiator'
    | 'public'
    | 'tunnel'
    | 'relay'
    | 'agent'
    | 'proxy'
    | 'lan'
    | 'endpoint'

  interface IDeviceListContext {
    device?: IDevice
    connections?: IConnection[]
    required?: Attribute
    attributes?: Attribute[]
  }

  interface IDeviceContext {
    user: IUser
    device?: IDevice
    network?: INetwork
    connections: IConnection[]
    service?: IService
    connection: IConnection
    instance?: IInstance
    waiting: boolean
  }

  interface IDiagramContext {
    toTypes?: { [key in DiagramGroupType]?: string }
    errorTypes: DiagramGroupType[]
    activeTypes: DiagramGroupType[]
    highlightTypes: DiagramGroupType[]
    state?: IConnectionState
    proxy?: boolean
    relay?: boolean
  }

  type IPortScan = 'REACHABLE' | 'UNREACHABLE' | 'SCANNING' | 'INVALID'

  type IOrganizationProvider = 'SAML' | 'OIDC'

  type IOrganizationSettings = {
    name?: string
    domain?: string
    providers?: null | IOrganizationProvider[]
    accountId?: string
  }

  type IIdentityProviderSettings = {
    accountId?: string
    enabled: boolean
    type: IOrganizationProvider
    metadata?: string
    clientId?: string
    clientSecret?: string
    issuer?: string
  }

  type ILicenseChip = {
    name: string
    colorName: Color
    background?: string
    hoverColor?: string
    disabled?: boolean
    show?: boolean
  }
  type ILimit = {
    name: string
    value: any
    actual: any
    license: { id: string } | null
  }

  type ILicense = {
    id: string
    created: Date
    updated: Date
    expiration: Date | null
    valid: boolean
    quantity: number | null
    plan: IPlan
    subscription?: ISubscription
    managePath?: string
    limits?: ILimit[]
  }

  type ISubscription = {
    total: number | null
    status: 'ACTIVE' | 'CANCELED' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'PAST_DUE' | 'TRIALING' | 'UNPAID' | null
    price: IPrice | null
    card: ICard | null
  }

  type ICard = {
    brand: string
    country: string
    email: string
    expiration: Date
    last: string
    month: number
    name: string
    phone: string
    postal: string
    year: number
  }

  type IPlan = {
    id?: string
    name: IPlanName
    description: string
    duration: string | null
    commercial?: boolean
    billing?: boolean
    product: {
      id: string
      name: string
      description: string
    }
    prices?: IPrice[]
  }

  type IPrice = {
    id: string
    amount: number
    currency: string
    interval: IPlanInterval
  }
  type IPlanName = 'PERSONAL' | 'PROFESSIONAL' | 'TRIAL' | string
  type IPlanInterval = 'MONTH' | 'YEAR'

  type IInvoice = {
    price: {
      id: string
      amount: number
      currency: string
      interval: IPlanInterval
    }
    id: string
    plan: IPlan
    quantity: number
    total: number
    currency: string
    paid: boolean
    url?: string
    created: Date
  }

  type IAnnouncement = {
    id: string
    type: INoticeType
    title: string
    link: string
    image: string
    body: string
    modified?: Date
    read?: Date
  }

  type INoticeType = 'GENERIC' | 'SYSTEM' | 'RELEASE' | 'COMMUNICATION' | 'SECURITY'

  type IPurchase = {
    checkout?: boolean
    planId?: string
    priceId?: string
    quantity: number
    accountId: string
    confirm?: boolean
  }

  type LogType = 'general' | 'connectd' | 'alert'

  interface Log {
    type: LogType
    message: string
    data?: any
    createdAt?: Date
  }

  type IconType = 'light' | 'regular' | 'solid' | 'brands'

  /**
   * Action which are called by components that are wrapped
   * by the context API store.
   */
  interface Action {
    type: string
    [key: string]: any
  }

  type IDataOptions = {
    application?: Application
    device?: IDevice
    instance?: IInstance
    service?: IService
    connection?: IConnection
    session?: ISession
    connections?: IConnection[]
  }

  type IContextMenu = { el?: HTMLElement; serviceID?: string }

  type IGlobalTooltip = {
    el?: HTMLElement
    title: React.ReactElement | string
    color?: string
    children?: React.ReactNode
  }

  type ILayout = {
    showOrgs: boolean
    hideSidebar: boolean
    singlePanel: boolean
    sidePanelWidth: number
  }
}

declare module '@mui/material/styles' {
  interface Palette {
    primaryLight: Palette['primary']
    primaryLighter: Palette['primary']
    primaryHighlight: Palette['primaryHighlight']
    primaryBackground: Palette['primaryBackground']
    secondary: Palette['secondary']
    successLight: Palette['successLight']
    success: Palette['success']
    successDark: Palette['successDark']
    dangerLight: Palette['dangerLight']
    danger: Palette['danger']
    warning: Palette['warning']
    warningLightest: Palette['warningLightest']
    warningHighlight: Palette['warningHighlight']
    gray: Palette['gray']
    grayLightest: Palette['grayLightest']
    grayLighter: Palette['grayLighter']
    grayLight: Palette['grayLight']
    grayDark: Palette['grayDark']
    grayDarker: Palette['grayDarker']
    grayDarkest: Palette['grayDarkest']
    white: Palette['white']
    black: Palette['black']
    alwaysWhite?: Palette['alwaysWhite']
    darken: Palette['darken']
    screen: Palette['screen']
    rpi: Palette['rpi']
    guide: Palette['guide']
    test: Palette['test']
  }
  interface PaletteOptions {
    primaryLight?: PaletteOptions['primary']
    primaryLighter?: PaletteOptions['primary']
    primaryHighlight?: Palette['primaryHighlight']
    primaryBackground?: Palette['primaryBackground']
    secondary?: Palette['secondary']
    successLight?: Palette['successLight']
    success?: Palette['success']
    successDark?: Palette['successDark']
    dangerLight?: Palette['dangerLight']
    danger?: Palette['danger']
    warning?: Palette['warning']
    warningLightest: Palette['warningLightest']
    warningHighlight: Palette['warningHighlight']
    gray?: Palette['gray']
    grayLightest?: Palette['grayLightest']
    grayLighter?: Palette['grayLighter']
    grayLight?: Palette['grayLight']
    grayDark?: Palette['grayDark']
    grayDarker?: Palette['grayDarker']
    grayDarkest?: Palette['grayDarkest']
    white?: Palette['white']
    black?: Palette['black']
    alwaysWhite?: Palette['alwaysWhite']
    darken?: Palette['darken']
    screen?: Palette['screen']
    rpi?: Palette['rpi']
    guide?: Palette['guide']
    test?: Palette['test']
  }
}

export {}

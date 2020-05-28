interface Aliases {
  [key: string]: <T = any>(...args: any[]) => T
}

const aliases: Aliases = {}

export default {
  get: (key: string) => aliases[key],

  set: (key: string, value: <T = any>(...args: any[]) => T) => {
    aliases[key] = value
  },
}

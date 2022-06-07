import { printf } from 'fast-printf'

// export function StringFormat(format: string, ...args: any[]) {
//   return printf(format, ...args)
// }

export function StringFormat(format: string, ...args: any[]) {
  try {
    const stringFormat = (str: string, ...args: any[]) =>
      str.replace(/{(\d+)}/g, (match, index) => args[index] || '')
    let res = stringFormat(format, ...args)
    return res
  } catch (err) {
    console.error(
      'stringFormat error:',
      format,
      '[',
      ...args,
      '] result :',
      err
    )
    return format
  }
}

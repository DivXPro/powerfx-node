//获取类名
export class Types {
  static getType(inputClass: any) {
    let funcNameRegex = /function (.{1,})\(/
    let results = funcNameRegex.exec((<any>inputClass).constructor.toString())
    return results && results.length > 1 ? results[1] : ''
  }
}

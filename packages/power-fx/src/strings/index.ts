import { lang as zhCN } from './zh-CN/PowerFxResources'
import { lang as enUS } from './en-US/PowerFxResources'

export const Lang = {
  zhCN,
  enUS,
} as Record<string, ILangData>
interface ILangData {
  data: Array<{ name: string; value: string; comment?: string }>
}

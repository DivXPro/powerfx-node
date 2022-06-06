import { createForm } from '@formily/core'
import { CustomTexlFunction } from './interpreter'
import { FormulaValue } from './public/values'
import { PowerFxConfig } from './public/config/PowerFxConfig'
import { DType } from './types'
import { DName } from './utils'
import { Control } from './interpreter/environment/Control'
import { ControlTemplate } from './interpreter/environment/ControlTemplate'
import { ComponentType } from './app/components/ComponentType'
import { ControlType } from './interpreter/environment/ControlType'
import { MetaEngineDocument, MetaEntityScope, MetaRecalcEngine } from './meta'
import { MetaDataEntityMetadataProvider } from './meta/external/MetaDataEntityMetadataProvider'
import { MetaDataEntityMetadata } from './meta/external/MetaDataEntityMetadata'
import { MetaFlowMetadataProvider } from './meta/external/MetaFlowMetadataProvider'
import { MetaFlowMetadata } from './meta/external/MetaFlowMetadata'
import { Flow } from './interpreter/external/Flow'

export declare type SubmitFn = (data: any) => Promise<FormulaValue>

class Submit extends CustomTexlFunction {
  private submitFn: SubmitFn
  constructor(submitFn: SubmitFn) {
    super('Submit', DType.ObjNull, [DType.Error], 0)
    this.submitFn = submitFn
  }
  public invoke(args: FormulaValue[]): Promise<FormulaValue> {
    const data = args[0].toObject()

    return this.submitFn(data)
  }
}

const controlTemplate = new ControlTemplate({
  componentType: ComponentType.DataComponent,
  isMetaLoc: true,
})

const controlType = new ControlType({ isMetaField: true, controlTemplate })

const formTemplate = new ControlTemplate({
  componentType: ComponentType.DataComponent,
})

const dataView = new Control({
  displayName: 'AddUser',
  entityName: new DName('AddUser'),
  type: controlType,
  uniqueId: 'AddUser',
  template: formTemplate,
  isAppGlobalControl: true,
  isDataComponentDefinition: true,
})
//

const form = createForm({
  validateFirst: true,
})

const scope = new MetaEntityScope({ form, entities: [dataView], metaSchema: undefined })

const flowMetadataProvider = new MetaFlowMetadataProvider([
  new MetaFlowMetadata({
    identity: 'NewUser',
    name: 'New User',
    flow: new Flow({
      name: 'NewUser',
      displayName: 'New User',
      flowDefinition: {
        name: 'NewUser',
        displayName: 'New User',
        inbound: {
          key: 'User',
          name: '用户',
          primaryKey: 'id',
          titleKey: 'username',
          type: 'object',
          properties: {
            id: {
              key: 'id',
              name: 'ID',
              type: 'string',
              primary: true,
            },
            username: {
              key: 'username',
              name: '姓名',
              type: 'string',
              required: true,
            },
            age: {
              key: 'age',
              name: '年龄',
              type: 'number',
            },
          },
        },
        outbound: undefined,
      },
    }),
  }),
])
const dataEntityMetadataProvider = new MetaDataEntityMetadataProvider([
  new MetaDataEntityMetadata({
    datasetName: 'hrm',
    entityName: 'User',
    entityDefinition: {
      key: 'User',
      name: '用户',
      primaryKey: 'id',
      titleKey: 'username',
      type: 'object',
      properties: {
        id: {
          key: 'id',
          name: 'ID',
          type: 'string',
          primary: true,
        },
        username: {
          key: 'username',
          name: '姓名',
          type: 'string',
          required: true,
        },
        age: {
          key: 'age',
          name: '年龄',
          type: 'number',
        },
      },
    },
  }),
])
const document = new MetaEngineDocument(scope, dataEntityMetadataProvider, flowMetadataProvider)

const config = new PowerFxConfig()
const submitFn: SubmitFn = (data: any) => {
  return new Promise((resolve) => {
    resolve(FormulaValue.NewBlank())
  })
}

config.addFunction(new Submit(submitFn))
const engine = new MetaRecalcEngine(form, undefined, config, document)

// engine.updateVariable('Users', users)
// engine.updateVariable('Shop', shop)

engine.eval(`Submit("123")`).then((result) => {
  console.log('result:', result.toObject())
})

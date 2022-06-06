import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { DocumentErrorSeverity } from '../../errors'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax'
import { DKind } from '../../types/DKind'
import { DType } from '../../types/DType'
import { ErrorType } from '../../types/ErrorType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { Dictionary } from '../../utils/Dictionary'
import { DPath } from '../../utils/DPath'

export class ErrorFunction extends BuiltinFunction {
  public get hasPreciseErrors() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  public get canSuggestInputColumns() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(undefined, 'Error', undefined, TexlStrings.AboutError, FunctionCategories.Logical, DType.ObjNull, 0, 1, 1)
  }

  public getSignatures() {
    return [[TexlStrings.ErrorArg1]]
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding,
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.Assert(args.Length == 1);
    // Contracts.AssertValue(errors);

    const reifiedError = ErrorType.ReifiedError()
    const acceptedFields = reifiedError.getNames(DPath.Root)
    const requiredKindField = acceptedFields.filter((tn) => tn.name.value == 'Kind')[0]
    // Contracts.Assert(requiredKindField.Type.IsEnum || requiredKindField.Type.Kind == DKind.Number);
    const optionalFields = acceptedFields.filter((tn) => tn.name.value != 'Kind')

    let returnType = DType.ObjNull
    let nodeToCoercedTypeMap = null

    const argument = args[0]
    const argumentType = argTypes[0]

    if (argumentType.kind != DKind.Record && argumentType.kind != DKind.Table) {
      errors.ensureError(argument, TexlStrings.ErrBadType)
      // return false;
      return [false, { returnType, nodeToCoercedTypeMap }]
    }

    // We cache the whole name list regardless of path.
    const names = argumentType.getNames(DPath.Root) //.ToArray();

    // First handle required fields (currently only 'Kind')
    if (!names.some((field) => field.name == requiredKindField.name)) {
      // Kind is required, point it out to the maker, and specify the enumeration type.
      errors.ensureError(argument, TexlStrings.ErrBadSchema_ExpectedType, reifiedError.getKindString())
      errors.error(
        argument,
        TexlStrings.ErrColumnMissing_ColName_ExpectedType,
        requiredKindField.name.value,
        'ErrorKind',
      )
      // return false;
      return [false, { returnType, nodeToCoercedTypeMap }]
    }

    const argumentKindType = names.filter((tn) => tn.name == requiredKindField.name)[0].type
    if (argumentKindType.kind != requiredKindField.type.kind) {
      errors.ensureError(argument, TexlStrings.ErrBadSchema_ExpectedType, reifiedError.getKindString())
      errors.error(
        argument,
        TexlStrings.ErrBadRecordFieldType_FieldName_ExpectedType,
        requiredKindField.name.value,
        'ErrorKind',
      )
      // return false;
      return [false, { returnType, nodeToCoercedTypeMap }]
    }

    let valid = true

    const record = argument.asRecord()
    for (let name of names) {
      if (!acceptedFields.some((field) => field.name == name.name)) {
        // If they have a record literal, we can position the errors for rejected fields.
        if (record != null) {
          errors.ensureError(
            record.children.filter((_, i) => record.ids[i].name == name.name)[0] ?? record,
            TexlStrings.ErrErrorIrrelevantField,
          )
        } else {
          errors.ensureError(argument, TexlStrings.ErrErrorIrrelevantField)
        }

        valid = false
      }
    }

    let matchedWithCoercion: boolean
    let typeValid: boolean
    if (argumentType.kind == DKind.Record) {
      // A record with the proper types for the fields that are specified.
      const expectedOptionalFieldsRecord = DType.CreateRecord(
        ...acceptedFields.filter(
          (field) =>
            // Kind has already been handled before
            field.name.value != 'Kind' && names.some((x) => x.name == field.name),
        ),
      )

      let checkTypeRes = super.checkType(argument, argumentType, expectedOptionalFieldsRecord, errors, true)
      typeValid = checkTypeRes[0]
      matchedWithCoercion = checkTypeRes[1]
    } else {
      // A table with the proper types for the fields that are specified.
      const expectedOptionalFieldsTable = DType.CreateTable(
        ...acceptedFields.filter(
          (field) =>
            // Kind has already been handled before
            field.name.value != 'Kind' && names.some((name) => name.name == field.name),
        ),
      )
      let checkTypeRes = super.checkType(argument, argumentType, expectedOptionalFieldsTable, errors, true)
      typeValid = checkTypeRes[0]
      matchedWithCoercion = checkTypeRes[1]
    }

    if (!typeValid) {
      errors.ensureErrorWithSeverity(DocumentErrorSeverity.Severe, argument, TexlStrings.ErrTypeError)
      valid = false
    } else if (matchedWithCoercion && valid) {
      const recordOrTableSchema = acceptedFields.filter((field) => names.some((x) => x.name == field.name))
      const expectedRecordOrTable =
        argumentType.kind == DKind.Record
          ? DType.CreateRecord(...recordOrTableSchema)
          : DType.CreateTable(...recordOrTableSchema)
      nodeToCoercedTypeMap = CollectionUtils.AddDictionary(nodeToCoercedTypeMap, argument, expectedRecordOrTable)
    }

    // return valid;
    return [valid, { returnType, nodeToCoercedTypeMap }]
  }
}

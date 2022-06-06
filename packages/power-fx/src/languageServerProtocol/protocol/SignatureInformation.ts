import { ParameterInformation } from './ParameterInformation'

export class SignatureInformation {
  /// </summary>
  /// The label of this signature. Will be shown in
  /// the UI.
  /// </summary>
  public label: string

  /// </summary>
  /// The human-readable doc-comment of this signature. Will be shown
  /// in the UI but can be omitted.
  /// </summary>
  public documentation: string

  /// </summary>
  /// The parameters of this signature.
  /// </summary>
  public parameters: ParameterInformation[]

  /// </summary>
  /// The index of the active parameter.
  ///
  /// If provided, this is used in place of `SignatureHelp.activeParameter`.
  /// </summary>
  public activeParameter: number
}

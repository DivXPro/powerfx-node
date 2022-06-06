export class DataTableMetadata {
  public displayName: string

  public name: string

  constructor(name: string, displayName: string) {
    // Contracts.AssertNonEmpty(name);
    // Contracts.AssertNonEmpty(DisplayName);

    this.name = name
    this.displayName = displayName
  }
}

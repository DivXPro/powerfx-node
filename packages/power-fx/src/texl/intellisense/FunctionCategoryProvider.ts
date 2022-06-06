import { StringResources } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import KeyValuePair from '../../utils/typescriptNet/KeyValuePair'

export class FunctionCategoryProvider {
  /// <summary>
  /// Returns a list of all the function categories in the document.
  /// The enumerated function categories are locale-specific.
  /// </summary>
  public GetFunctionCategories(): KeyValuePair<string, string>[] {
    // for(let category of Enum.GetValues(typeof (FunctionCategories)))
    // {
    //   if (category.Equals(FunctionCategories.None))
    //     continue;

    //   var str = StringResources.Get("FunctionCategoryName_" + category.ToString());
    //   yield return new KeyValuePair<string, string>(category.ToString(), str);
    // }
    let pair: KeyValuePair<string, string>[] = []
    for (const key in FunctionCategories) {
      let keyToAny: any = key
      if (isNaN(keyToAny)) {
        // console.log('key: ' + key + '_' + FunctionCategories[key])
        if (FunctionCategories[key].valueOf() == FunctionCategories.None.toString()) {
          continue
          // console.log('here is->' + FunctionCategories[key].valueOf() + ';' + FunctionCategories.None.toString())
        }

        // if (category.Equals(FunctionCategories.None))
        //     continue;

        let str = StringResources.Get('FunctionCategoryName_' + key)
        //   yield return new KeyValuePair<string, string>(category.ToString(), str);
        pair.push({ key: key, value: str })
      }
    }
    return pair
  }

  /// <summary>
  /// Returns a list of all the function categories in the document.
  /// The enumerated function categories are locale-specific.
  /// </summary>
  public GetFunctionCategoriesAsync(): Promise<KeyValuePair<string, string>[]> {
    return Promise.resolve(this.GetFunctionCategories()) // Task.FromResult(this.GetFunctionCategories());
  }
}

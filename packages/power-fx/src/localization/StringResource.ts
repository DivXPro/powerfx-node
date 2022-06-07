import { CurrentLocaleInfo } from './CurrentLocaleInfo'
import { ErrorResource } from './ErrorResource'
import { ErrorResourceKey } from './ErrorResourceKey'
import { IExternalStringResources } from './IExternalStringResources'
import { Lang } from '../strings'
import { CollectionUtils } from '../utils/CollectionUtils'
import { isNullOrEmpty } from '../utils/CharacterUtils'

export enum ResourceFormat {
  Resw,
  Pares,
}

export class StringResources {
  /// <summary>
  ///  This field is set once on startup by Canvas' Document Server, and allows access to Canvas-specific string keys
  ///  It is a legacy use, left over from when PowerFx was deeply embedded in Canvas, and ideally should be removed if possible.
  /// </summary>
  static ExternalStringResources?: IExternalStringResources

  // This is used to workaround a build-time issue when this class is loaded by reflection without all the resources initialized correctly.
  // If the dependency on ExternalStringResources is removed, this can be as well
  public static ShouldThrowIfMissing = true

  private static FallbackLocale: string = 'en-US'

  public static GetErrorResource(
    resourceKey: ErrorResourceKey,
    locale?: string
  ) {
    // Contracts.CheckValue(resourceKey.Key, 'action');
    // Contracts.CheckValueOrNull(locale, 'locale');

    let resourceValue = StringResources.TryGetErrorResource(
      resourceKey,
      locale
    )[1]
    if (resourceValue == null) {
      resourceValue = StringResources.TryGetErrorResource(
        resourceKey,
        StringResources.FallbackLocale
      )[1]
    }
    // As foreign languages can lag behind en-US while being localized, if we can't find it then always look in the en-US locale
    if (resourceValue == null) {
      // Debug.WriteLine(string.Format('ERROR error resource {0} not found', resourceKey));
      if (StringResources.ShouldThrowIfMissing) {
        throw new Error(
          `FileNotFoundException: resource ${resourceKey.key} not found`
        )
      }
    } else {
      return resourceValue
    }
  }

  public static Get(resourceKey: ErrorResourceKey | string, locale?: string) {
    if (typeof resourceKey == 'string') {
      return StringResources.GetByKeyString(resourceKey)
    }
    return StringResources.GetByKeyString(resourceKey.key, locale)
  }

  public static GetByKeyString(resourceKey: string, locale?: string) {
    // Contracts.CheckValue(resourceKey, 'action');
    // Contracts.CheckValueOrNull(locale, 'locale');
    let resourceValue: string
    const result1 = StringResources.TryGet(resourceKey, locale)
    resourceValue = result1[1]
    if (resourceValue == null) {
      const result2 = StringResources.TryGet(
        resourceKey,
        StringResources.FallbackLocale
      )
      resourceValue = result2[1]
    }
    // As foreign languages can lag behind en-US while being localized, if we can't find it then always look in the en-US locale
    if (resourceValue == null) {
      // Prior to ErrorResources, error messages were fetched like other string resources.
      // The resource associated with the key corresponds to the ShortMessage of the new
      // ErrorResource objects. For backwards compatibility with tests/telemetry that fetched
      // the error message manually (as opposed to going through the DocError class), we check
      // if there is an error resource associated with this key if we did not find it normally.
      let potentialErrorResource: ErrorResource | undefined
      const result = StringResources.TryGetErrorResource(
        new ErrorResourceKey(resourceKey),
        locale
      )
      potentialErrorResource = result[1]
      if (potentialErrorResource == null) {
        const result = StringResources.TryGetErrorResource(
          new ErrorResourceKey(resourceKey),
          StringResources.FallbackLocale
        )
        potentialErrorResource = result[1]
      }
      if (potentialErrorResource != null) {
        return potentialErrorResource.getSingleValue(
          ErrorResource.ShortMessageTag
        )
      }

      // Debug.WriteLine(string.Format('ERROR resource string {0} not found', resourceKey))
      if (StringResources.ShouldThrowIfMissing) {
        // throw new Error(`FileNotFoundException: resource ${resourceKey} not found`)
        console.error(
          '获取资源名异常[国际化模块]!',
          `FileNotFoundException: resource ${resourceKey} not found`
        )
      }
    }

    return resourceValue
  }

  // One resource dictionary per locale
  private static Strings: Record<string, Record<string, string>> = {}
  private static ErrorResources: Record<string, Record<string, ErrorResource>> =
    {}
  // private static Object dictionaryLock = new object();

  // private class TypeFromThisAssembly{ }

  private static ResourceNamePrefix = 'Microsoft.PowerFx.Core.Strings.'
  private static ResourceFileName = 'PowerFxResources.json'

  public static TryGetErrorResource(
    resourceKey: ErrorResourceKey,
    locale?: string
  ): [boolean, ErrorResource | undefined] {
    // Contracts.CheckValue(resourceKey.Key, 'action');
    // Contracts.CheckValueOrNull(locale, 'locale');

    if (locale == null) {
      locale = CurrentLocaleInfo.CurrentUILanguageName
      // If the locale is not set here, return false immedately and go to the "en-us" fallback
      if (isNullOrEmpty(locale)) {
        return [false, undefined]
      }
    }

    let errorResources = StringResources.ErrorResources[locale]

    if (errorResources == null) {
      // Dictionary<string, string> strings;
      const result = StringResources.LoadFromResource(
        locale
        // StringResources.ResourceNamePrefix,
        // StringResources.ResourceFileName,
        // ResourceFormat.Resw,
      )
      StringResources.Strings[locale] = result.strings
      errorResources = result.errorResources
      StringResources.ErrorResources[locale] = errorResources
    }

    if (errorResources[resourceKey.key] != null) {
      return [true, errorResources[resourceKey.key]]
    }

    return (
      StringResources.ExternalStringResources?.tryGetErrorResource(
        resourceKey,
        locale
      ) ?? [false, null]
    )
  }

  public static TryGet(
    resourceKey: string,
    locale?: string
  ): [boolean, string] {
    // Contracts.CheckValue(resourceKey, 'action');
    // Contracts.CheckValueOrNull(locale, 'locale');

    if (locale == null) {
      locale = CurrentLocaleInfo.CurrentUILanguageName
      // Contracts.CheckNonEmpty(locale, 'currentLocale');
    }
    // resourceValue
    let strings: Record<string, string> = StringResources.Strings[locale]

    if (strings == null) {
      const result = StringResources.LoadFromResource(
        locale
        // StringResources.ResourceNamePrefix,
        // StringResources.ResourceFileName,
        // ResourceFormat.Resw,
      )
      strings = result.strings
      StringResources.Strings[locale] = strings
      StringResources.ErrorResources[locale] = result.errorResources
    }
    if (strings[resourceKey] != null) {
      return [true, strings[resourceKey]]
    }

    return (
      StringResources.ExternalStringResources?.tryGet(resourceKey, locale) ?? [
        false,
        null,
      ]
    )
  }

  // TODO: 完善
  static LoadFromResource(
    locale: string
    // assemblyPrefix: string,
    // resourceFileName: string,
    // resourceFormat: ResourceFormat,
  ): {
    strings: Record<string, string>
    errorResources: Record<string, ErrorResource>
  } {
    // let assembly = typeFromAssembly.Assembly;

    // This is being done because the filename of the manifest is case sensitive e.g. given zh-CN it was returning English
    if (locale === 'zh-CN') {
      locale = 'zh-CN'
    } else if (locale === 'en-US') {
      locale = 'en-US'
    } else {
      locale = 'en-US'
    }
    const strings: Record<string, string> = {}
    const separatedResourceKeys: Record<string, string> = {}
    Lang[locale.replace('-', '')].data.forEach((item) => {
      if (item.name.startsWith(ErrorResource.ReswErrorResourcePrefix)) {
        separatedResourceKeys[item.name] = item.value
      } else {
        strings[item.name] = item.value
      }
    })
    const errorResources = StringResources.PostProcessErrorResources(
      separatedResourceKeys
    )
    return {
      strings,
      errorResources,
    }
  }

  private static TryGetMultiValueSuffix(
    resourceKey: string,
    baseSuffix: string
  ): [boolean, string | undefined, number] {
    // TODO:无法做到忽略大小写
    const pattern = new RegExp(baseSuffix + '_([0-9]*)')
    // const match = pattern.Match(resourceKey);
    const match = resourceKey.match(pattern)
    if (match?.length) {
      const suffix = match[0]
      const index = match.index
      return [true, match[0], match.index as number]
    }
    return [false, undefined, -1]
  }

  private static UpdateErrorResource(
    resourceName: string,
    resourceValue: string,
    tag: string,
    index: number,
    errorResources: Record<string, Record<string, Record<number, string>>>
  ) {
    // Contracts.AssertValue(errorResources);
    // Contracts.AssertNonEmpty(resourceName);
    // Contracts.AssertNonEmpty(resourceValue);

    let { isGet: isGetTagToValuesDict, data: tagToValuesDict } =
      CollectionUtils.TryGetProperty(errorResources, resourceName)
    if (isGetTagToValuesDict) {
      const { isGet: isGetTagNumberToValuesDict, data: tagNumberToValuesDict } =
        CollectionUtils.TryGetProperty(tagToValuesDict, tag)
      if (isGetTagNumberToValuesDict) {
        tagNumberToValuesDict[index] = resourceValue
      } else {
        const tagNumberToValuesDict = { [index]: resourceValue }
        tagToValuesDict[tag] = tagNumberToValuesDict
      }
    } else {
      tagToValuesDict = {}
      const tagNumberToValuesDict = { [index]: resourceValue }
      tagToValuesDict[tag] = tagNumberToValuesDict
      errorResources[resourceName] = tagToValuesDict
    }
  }

  private static PostProcessErrorResources(
    separateResourceKeys: Record<string, string>
  ): Record<string, ErrorResource> {
    // ErrorResource name -> ErrorResourceTag -> tag number -> value
    // let errorResources = new Dictionary<string, Dictionary<string, Dictionary<int, string>>>(StringComparer.OrdinalIgnoreCase);
    const errorResources: Record<
      string,
      Record<string, Record<number, string>>
    > = {}
    for (const resourceKey in separateResourceKeys) {
      if (!resourceKey.startsWith(ErrorResource.ReswErrorResourcePrefix)) {
        continue
      }
      if (resourceKey.endsWith(ErrorResource.LinkTagUrlTag)) {
        continue
      }
      for (const tag of ErrorResource.ErrorResourceTagToReswSuffix) {
        if (!ErrorResource.IsTagMultivalue(tag[0])) {
          if (!resourceKey.endsWith(tag[1])) {
            continue
          }
          const resourceName = resourceKey.substr(
            ErrorResource.ReswErrorResourcePrefix.length,
            resourceKey.length -
              (ErrorResource.ReswErrorResourcePrefix.length + tag[1].length)
          )
          StringResources.UpdateErrorResource(
            resourceName,
            separateResourceKeys[resourceKey],
            tag[0],
            0,
            errorResources
          )
          break
        } else {
          const rst = StringResources.TryGetMultiValueSuffix(
            resourceKey,
            tag[1]
          )
          const suffix = rst[1]
          const index = rst[2]
          if (!rst[0]) {
            continue
          }

          const resourceName = resourceKey.substr(
            ErrorResource.ReswErrorResourcePrefix.length,
            resourceKey.length -
              (ErrorResource.ReswErrorResourcePrefix.length + suffix.length)
          )
          StringResources.UpdateErrorResource(
            resourceName,
            separateResourceKeys[resourceKey],
            tag[0],
            index,
            errorResources
          )

          // Also handle the URL for link resources
          if (tag[0] == ErrorResource.LinkTag) {
            // This must exist, and the .verify call will fail CI builds if the resource is incorrectly defined.
            const urlValue = separateResourceKeys[resourceKey + '_url']
            StringResources.UpdateErrorResource(
              resourceName,
              urlValue,
              ErrorResource.LinkTagUrlTag,
              index,
              errorResources
            )
          }
          break
        }
      }
    }
    const errRes: Record<string, ErrorResource> = {}
    Object.keys(errorResources).forEach((key) => {
      errRes[key] = ErrorResource.Reassemble(errorResources[key])
    })
    return errRes
  }
}

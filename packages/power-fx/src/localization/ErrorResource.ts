import { ErrorHelpLink, IErrorHelpLink } from '../errors/ErrorHelpLink'
import { CollectionUtils } from '../utils/CollectionUtils'
import { Dictionary } from '../utils/Dictionary'

export class ErrorResource {
  public static XmlType = 'errorResource'

  // The default error message.
  public static ShortMessageTag = 'shortMessage'

  // Optional: A longer explanation of the error. There is currently no UI (or DocError) support for this.
  public static LongMessageTag = 'longMessage'

  // Optional: A series of messages explaining how to fix the error.
  public static HowToFixTag = 'howToFixMessage'

  // Optional: A series of messages explaining why to fix the error. Used primarily for accessibility errors.
  public static WhyToFixTag = 'whyToFixMessage'

  // Optional: A series of links to help documents. There is currently no UI (or DocError) support for this.
  public static LinkTag = 'link'
  public static LinkTagDisplayTextTag = 'value'
  public static LinkTagUrlTag = 'url'

  public static ReswErrorResourcePrefix = 'ErrorResource_'
  public static readonly ErrorResourceTagToReswSuffix = new Dictionary<
    string,
    string
  >([
    [ErrorResource.ShortMessageTag, '_ShortMessage'],
    [ErrorResource.LongMessageTag, '_LongMessage'],
    [ErrorResource.HowToFixTag, '_HowToFix'],
    [ErrorResource.WhyToFixTag, '_WhyToFix'],
    [ErrorResource.LinkTag, '_Link'],
  ])

  static IsTagMultivalue(tag: string) {
    return tag === ErrorResource.HowToFixTag || tag === ErrorResource.LinkTag
  }

  private readonly _tagToValues: Record<string, Array<string>>

  private _helpLinks: Array<IErrorHelpLink>
  public get helpLinks() {
    return this._helpLinks
  }

  constructor() {
    this._tagToValues = {}
    this._helpLinks = []
  }

  // public static Parse(XElement errorXml): ErrorResource
  // {
  //     Contracts.AssertValue(errorXml);

  //     let errorResource = new ErrorResource();

  //     // Parse each sub-element into the TagToValues dictionary.
  //     foreach (let tag in errorXml.Elements())
  //     {
  //         let tagName = tag.Name.LocalName;

  //         // Links are specialized because they are a two-part resource.
  //         if (tagName == LinkTag)
  //         {
  //             errorResource.AddHelpLink(tag);
  //         }
  //         else
  //         {
  //             if (!errorResource._tagToValues.ContainsKey(tagName))
  //             {
  //                 errorResource._tagToValues[tagName] = new List<string>();
  //             }

  //             errorResource._tagToValues[tagName].Add(tag.Element("value").Value);
  //         }
  //     }

  //     return errorResource;
  // }

  public static Reassemble(
    members: Record<string, Record<number, string>>
  ): ErrorResource {
    // Contracts.AssertAllNonEmpty(members.Keys);
    // Contracts.AssertAllValues(members.Values);

    const errorResource = new ErrorResource()

    // Reassemble link 2-part resources first
    // They need to match up. Because these resources are loaded for almost all tests,
    // The asserts here will fail during unit tests if they're incorrectly defined
    const { isGet: isGetLinkValues, data: linkValues } =
      CollectionUtils.TryGetProperty(members, ErrorResource.LinkTag)
    if (isGetLinkValues) {
      const { isGet: urlsExist, data: urls } = CollectionUtils.TryGetProperty(
        members,
        ErrorResource.LinkTagUrlTag
      )
      // Contracts.Assert(linkValues.Count == urls.Count);
      for (const key in linkValues) {
        const { isGet: correspondingUrlExist, data: correspondingUrl } =
          CollectionUtils.TryGetProperty(urls, key)
        errorResource.helpLinks.push(
          new ErrorHelpLink(linkValues[key], correspondingUrl)
        )
        // urls.TryGetValue(kvp.Key, out let correspondingUrl).Verify();
        // errorResource.HelpLinks.Add(new ErrorHelpLink(kvp.Value, correspondingUrl));
      }
      delete members[ErrorResource.LinkTag]
      delete members[ErrorResource.LinkTagUrlTag]
    }

    for (const key in members) {
      if (!errorResource._tagToValues.hasOwnProperty(key)) {
        errorResource._tagToValues[key] = []
      }

      for (const v of Object.keys(members[key])
        .map((s) => parseInt(s))
        .sort()
        .map((n) => members[key][n])) {
        errorResource._tagToValues[key] = [v]
      }
    }

    return errorResource
  }

  // private void AddHelpLink(XElement linkTag)
  // {
  //     Contracts.AssertValue(linkTag);

  //     HelpLinks.Add(new ErrorHelpLink(linkTag.Element(LinkTagDisplayTextTag).Value, linkTag.Element(LinkTagUrlTag).Value));
  // }

  public getSingleValue(tag: string): string {
    // Contracts.AssertValue(tag)

    if (!this._tagToValues.hasOwnProperty(tag)) {
      return null
    }

    // Contracts.Assert(_tagToValues[tag].Count == 1)

    return this._tagToValues[tag][0]
  }

  public getValues(tag: string): Array<string> {
    if (!this._tagToValues.hasOwnProperty(tag)) {
      return null
    }
    return this._tagToValues[tag]
  }
}

import { ExtensionContext, languages, ReferenceProvider, TextDocument, Position, ReferenceContext, CancellationToken, Location, Range, RenameProvider, WorkspaceEdit, ProviderResult } from 'vscode'
import { ExtensionModule } from '../modules'
import { KeyDetector, Analyst } from '../core'
import { Global } from '../core/Global'

class Provider implements ReferenceProvider, RenameProvider {
  async provideReferences(document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): Promise<Location[] | undefined> {
    if (!Global.enabled)
      return []

    const key = KeyDetector.getKey(document, position)

    if (!key)
      return []

    return await Analyst.getAllOccurrenceLocations(key)
  }

  prepareRename(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Range | { range: Range; placeholder: string }> {
    const result = KeyDetector.getKeyAndRange(document, position)
    if (!result)
      return
    const { key, range } = result
    return { range, placeholder: key }
  }

  async provideRenameEdits(document: TextDocument, position: Position, newName: string, token: CancellationToken): Promise<WorkspaceEdit | undefined> {
    if (!Global.enabled)
      return

    const key = KeyDetector.getKey(document, position)

    if (!key)
      return

    return await Global.loader.renameKey(key, newName) // TODO:sfc
  }

  constructor(public readonly ctx: ExtensionContext) {}
}

const m: ExtensionModule = (ctx) => {
  const provider = new Provider(ctx)
  return [
    languages.registerReferenceProvider(Global.getDocumentSelectors(), provider),
    languages.registerRenameProvider(Global.getDocumentSelectors(), provider),
  ]
}

export default m

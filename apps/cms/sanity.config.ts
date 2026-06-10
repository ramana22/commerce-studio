import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes, SINGLETON_TYPES } from './schemaTypes'
import { structure } from './structure'

const singletons = new Set<string>(SINGLETON_TYPES)

// Singletons can be published/edited but not created, duplicated, or deleted.
const SINGLETON_ACTIONS = new Set([
  'publish',
  'discardChanges',
  'restore',
])

export default defineConfig({
  name: 'sugar-store',
  title: 'Sugar Store CMS',
  projectId: process.env['SANITY_STUDIO_PROJECT_ID'] ?? '',
  dataset: process.env['SANITY_STUDIO_DATASET'] ?? 'production',
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    // Hide singletons from the global "create new document" menu.
    templates: (templates) =>
      templates.filter((t) => !singletons.has(t.schemaType)),
  },
  document: {
    // Restrict the action set on singleton documents.
    actions: (actions, { schemaType }) =>
      singletons.has(schemaType)
        ? actions.filter(
            ({ action }) => action && SINGLETON_ACTIONS.has(action),
          )
        : actions,
  },
})

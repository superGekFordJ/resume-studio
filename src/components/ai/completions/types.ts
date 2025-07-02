/**
 * Shared Slate types for the AI Completions editor.
 */

/**
 * Text node that supports inline "ghost" suggestions.
 */
export type CustomText = {
  text: string
  /** When true, the text is rendered as a non-committed suggestion */
  ghost?: boolean
}

/**
 * Simple paragraph element used by the editor.
 */
export type ParagraphElement = {
  type: "paragraph"
  children: CustomText[]
}

/**
 * Augment Slate's global `CustomTypes` so all editors in the project can recognise the `ghost` flag.
 *
 * NOTE:  This shape **must** stay in sync with any other `declare module 'slate'` blocks in the codebase
 * to avoid type mismatches between files.
 */
declare module "slate" {
  interface CustomTypes {
    Text: CustomText
  }
} 
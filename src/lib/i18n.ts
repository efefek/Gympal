/**
 * i18n entry point. The app is single-language (English) for now;
 * `t` is the typed dictionary. To add a language later, create
 * src/locales/<lang>.ts with the same shape and switch this export.
 */
import { en } from '@/locales/en'

export const t = en
export type Dictionary = typeof en

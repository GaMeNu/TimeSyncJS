declare module Intl {
    export function supportedValuesOf(name: string): string[];

    export interface Locale extends Intl.Locale{
        getCalendars(): string[]
    }
}
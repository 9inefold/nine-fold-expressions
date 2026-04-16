/// Used for generating mappings from compile-time types to runtime values.
export const enum TypeTag {
  BOOLEAN = 'boolean',
  STRING  = 'string',
  NUMBER  = 'number',
};

/// Intermediate for converting `TypeTag` to types.
export interface TypeTagMap {
  'boolean': boolean;
  'string': string;
  'number': number;
};

/// Converts `TypeTag` values to its actual type.
export type TypeTagType<T extends TypeTag> = TypeTagMap[T];

/// Converts `TypeTag` values to its actual type.
type TypeTagType1<V> = V extends keyof TypeTagMap ? TypeTagMap[V] : never;
type TypeTagType0<V> = V extends TypeTag ? TypeTagMap[V] : TypeTagType1<V>;

/// Converts object from `TypeTag` map to type.
export type TypeTagRecord<T extends any> = {
  -readonly [P in keyof T]: TypeTagType0<T[P]>;
};

/// Maps optional names to non optional ones.
export type TypeRemap<E, To> = {
  -readonly [P in keyof E]: E[P] extends keyof To ? To[E[P]] : never;
};

////////////////////////////////////////////////////////////////////////////////
// Preferences

export enum PreferencesTag {
  vfx = TypeTag.BOOLEAN,
};

export enum PreferencesTagRemap {
  'reduce-motion' = 'vfx',
  'simplify-vfx'  = 'vfx',
  'vfx'           = 'vfx',
};

export type Preferences = TypeTagRecord<typeof PreferencesTag>;
export type PreferencesTagNameMap = TypeRemap<typeof PreferencesTagRemap, Preferences>;

////////////////////////////////////////////////////////////////////////////////
// Blog

export type BlogPost = {
  title:      string,
  slug:       string,
  tags:       string[],
  keywords:   string[],
  excerpt:    string,
  component:  string | false,

  hidden:     boolean,
  date:       string,
  updated?:   string,
  image?:     string,
  cover?:     string,
  related:    BlogPost[],
  html?:      string,
};

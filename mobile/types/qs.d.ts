declare module "qs" {
  interface IStringifyOptions {
    delimiter?: string;
    encode?: boolean;
    encodeValuesOnly?: boolean;
    encoder?: (str: any, defaultEncoder: any, charset: string, type: string) => string;
    filter?: Array<string | number> | ((prefix: string, value: any) => any);
    indices?: boolean;
    serializeDate?: (d: Date) => string;
    skipNulls?: boolean;
    sort?: ((a: string, b: string) => number) | null;
    strictNullHandling?: boolean;
    addQueryPrefix?: boolean;
    format?: "RFC3986" | "RFC1738";
    charset?: "utf-8" | "iso-8859-1";
    charsetSentinel?: boolean;
    comma?: boolean;
  }

  interface IParseOptions {
    delimiter?: string;
    decoder?: (str: string, defaultDecoder: any, charset: string, type: string) => any;
    filter?: Array<string | number> | ((prefix: string, value: any) => any);
    depth?: number;
    parameterLimit?: number;
    parseArrays?: boolean;
    plainObjects?: boolean;
    allowPrototypes?: boolean;
    allowSparse?: boolean;
    strictNullHandling?: boolean;
    ignoreQueryPrefix?: boolean;
    comma?: boolean;
    charset?: "utf-8" | "iso-8859-1";
    charsetSentinel?: boolean;
    interpretNumericEntities?: boolean;
  }

  function stringify(object: any, options?: IStringifyOptions): string;
  function parse(str: string, options?: IParseOptions): any;

  export = { stringify, parse };
}

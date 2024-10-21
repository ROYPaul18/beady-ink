// types/busboy.d.ts

declare module 'busboy' {
    import { IncomingHttpHeaders } from 'http';
    import { Readable, Writable } from 'stream';
  
    interface BusboyOptions {
      headers: IncomingHttpHeaders;
      highWaterMark?: number;
      defParamCharset?: string;
      preservePath?: boolean;
    }
  
    type BusboyEvents =
      | 'file'
      | 'field'
      | 'finish'
      | 'error'
      | 'partsLimit'
      | 'filesLimit'
      | 'fieldsLimit'
      | 'close';
  
    export default class Busboy extends Writable {
      constructor(options: BusboyOptions);
      on(event: 'file', listener: (fieldname: string, file: Readable, filename: string, encoding: string, mimetype: string) => void): this;
      on(event: 'field', listener: (fieldname: string, val: string) => void): this;
      on(event: 'finish', listener: () => void): this;
      on(event: 'error', listener: (err: Error) => void): this;
      pipe(stream: Writable): Writable;
    }
  }
  
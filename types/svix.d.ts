// src/types/svix.d.ts
declare module 'svix' {
    class Webhook {
      constructor(secret: string);
      verify(payload: string, headers: { [key: string]: string }): any;
    }
    export { Webhook };
  }
  
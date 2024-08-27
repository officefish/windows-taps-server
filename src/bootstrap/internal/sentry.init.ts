import { INestApplication, Logger } from '@nestjs/common'
// Import with `const Sentry = require("@sentry/nestjs");` if you are using CJS
import * as Sentry from "@sentry/nestjs"
//new Sentry.Integrations.Http({ tracing: true }),
//import * as Sentry from '@sentry/node'
//import { Handlers } from '@sentry/nestjs'


import { nodeProfilingIntegration } from "@sentry/profiling-node"

export function initializeSentry(app: INestApplication) {

    Sentry.init({
        dsn: "https://b68d831cbe03e22ea6bccaddf8101bbd@o4507844018700288.ingest.de.sentry.io/4507844022239312",
        integrations: [
          new (Sentry as any).Integrations.Http({ tracing: true }),
          nodeProfilingIntegration(),
        ],
        // Tracing
        tracesSampleRate: 1.0, //  Capture 100% of the transactions
      
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: 1.0,
      })  

    app.use((Sentry as any).Handlers.requestHandler())
    app.use((Sentry as any).Handlers.tracingHandler())
  
  Logger.log('Sentry initialized', 'Bootstrap')
  //}
}
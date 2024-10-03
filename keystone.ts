import 'dotenv/config'

// Welcome to Keystone!
//
// This file is what Keystone uses as the entry-point to your headless backend
//
// Keystone imports the default export of this file, expecting a Keystone configuration object
//   you can find out more at https://keystonejs.com/docs/apis/config

import { config } from '@keystone-6/core'

// to keep this file tidy, we define our schema in a different file
import { lists } from './schema'

// authentication is configured separately here too, but you might move this elsewhere
// when you write your list-level access control functions, as they typically rely on session data
import { withAuth, session } from './auth'

// const { DATABASE_URL, DATABASE_LOGGING } = parseEnv({
//   DATABASE_URL: 'env:DATABASE_URL',
//   DATABASE_LOGGING: 'boolean?:DATABASE_LOGGING',
// })

// return {
//   provider: 'postgresql',
//   url: DATABASE_URL,
//   enableLogging: DATABASE_LOGGING,
//   idField: {
//     kind: 'uuid',
//   },
// }

export default config({
  db: {
    // we're using sqlite for the fastest startup experience
    //   for more information on what database might be appropriate for you
    //   see https://keystonejs.com/docs/guides/choosing-a-database#title
    provider: 'postgresql',
    url: process.env.DATABASE_URL as string,
    // enableLogging: true,
    idField: {
      kind: 'uuid',
    },
  },
  lists,
  // session,
})

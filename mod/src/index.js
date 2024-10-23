import keystoneConf from '../../.keystone/config'
import { getContext } from '@keystone-6/core/context'
import * as PrismaModule from '.prisma/client'
import * as path from 'node:path'

export const PRISMA_SCHEMA_PATH = path.join(
  // dirname(fileURLToPath(import.meta.url)),
  __dirname,
  '../../schema.prisma',
)

export const GRAPHQL_SCHEMA_PATH = path.join(
  // dirname(fileURLToPath(import.meta.url)),
  __dirname,
  '../../schema.graphql'
)

export { keystoneConf }
export function getKContext() {
  return getContext(keystoneConf, PrismaModule)
}

export const kContext = getKContext()

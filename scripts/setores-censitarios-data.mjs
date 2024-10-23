import chain from 'stream-chain'
import STREAM_JSON from 'stream-json'
import PICK from 'stream-json/filters/Pick.js'
// import { ignore } from 'stream-json/filters/Ignore'
import STREAM_VALUES from 'stream-json/streamers/StreamValues.js'
import STREAM_ARRAY from 'stream-json/streamers/StreamArray.js'
import { fileURLToPath } from 'node:url'

import { getKContext } from '../mod/dist/index.js'

import fs, { exists } from 'node:fs'
import { dirname, join } from 'node:path'
import bytes from 'bytes'
import streamToPromise from 'stream-to-promise'

const pick = PICK.pick

const kContext = getKContext()

const parser = STREAM_JSON.parser
const streamValues = STREAM_VALUES.streamValues

// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url)

// Get the directory name
const __dirname = dirname(__filename)

async function loadData(src) {
  console.log('will load', src)

  const pipeline = chain([
    fs.createReadStream(src),
    parser(),
    pick({
      filter: 'features',
    }),

    STREAM_ARRAY.streamArray(),

    async (data) => {
      const { key, value } = data
      console.log('data', key)
      const [existingFeature] = await kContext
        .sudo()
        .query.Json_MapFeature.findMany({
          where: {
            name: {
              equals: `${value.properties.id}P`,
            },
          },
          query: 'id properties',
        })

      if (!existingFeature) {
        return null
      }

      const updatedProperties = {
        ...existingFeature.properties,
        ...value.properties,
      }

      await kContext.sudo().query.Json_MapFeature.updateOne({
        where: {
          id: existingFeature.id,
        },
        data: {
          properties: updatedProperties,
        },
      })

      return null
    },
    // (data) => {
    //   const value = data.value
    //   // keep data only for the accounting department
    //   return value && value.department === 'accounting' ? data : null
    // },
  ])

  return streamToPromise(pipeline)
}

const FILES_ROOT = join(__dirname, '../data/censo-2010/')

const files = fs
  .readdirSync(FILES_ROOT)
  .filter((name) => name.endsWith('geojson'))

console.log(files)

await files.reduce(async (prev, file) => {
  await prev

  return loadData(join(FILES_ROOT, file))
}, Promise.resolve())

// await loadData(
//   join(__dirname, '../data/censo-2010/ananindeua_1500800_censo-2010.geojson'),
// )

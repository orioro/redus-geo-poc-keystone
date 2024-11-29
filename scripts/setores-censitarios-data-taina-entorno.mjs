import chain from 'stream-chain'
import STREAM_JSON from 'stream-json'
import PICK from 'stream-json/filters/Pick.js'
// import { ignore } from 'stream-json/filters/Ignore'
import STREAM_VALUES from 'stream-json/streamers/StreamValues.js'
import STREAM_ARRAY from 'stream-json/streamers/StreamArray.js'
import { fileURLToPath } from 'node:url'

import { parse } from 'csv-parse'

import { getKContext } from '../mod/dist/index.js'

import fs, { exists } from 'node:fs'
import { dirname, join } from 'node:path'
import bytes from 'bytes'
import streamToPromise from 'stream-to-promise'

// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url)

// Get the directory name
const __dirname = dirname(__filename)

const kContext = getKContext()

const TEXT_COLUMNS = [
  'Cod_UF',
  'Nome_da_UF',
  'Cod_municipio',
  'Nome_do_municipio',
  'Cod_distrito',
  'Nome_do_distrito',
  'Cod_bairro',
  'Nome_do_bairro',
  'Cod_setor',
  'Situacao_setor',
]

async function loadData(src) {
  let count = 0
  console.log('will load', src)

  const pipeline = chain([
    fs.createReadStream(src),

    parse({
      delimiter: ',',
      columns: true,
      cast: (value, context) => {
        if (context.lines === 1) {
          return value
        }

        if (!TEXT_COLUMNS.includes(context.column)) {
          return parseFloat(value)
        } else {
          return value
        }
      },
    }),

    async (data) => {
      count += 1
      const [existingFeature] = await kContext
        .sudo()
        .query.Json_MapFeature.findMany({
          where: {
            name: {
              equals: `${data.Cod_setor}P`,
            },
          },
          query: 'id name properties',
        })

      if (!existingFeature) {
        return null
        console.log(data.Cod_setor, Boolean(existingFeature))
      } else {
        // console.log(data.Cod_setor, 'exists')
      }

      // if (!existingFeature) {
      //   return null
      // }

      const updatedProperties = {
        ...existingFeature.properties,
        ...data,
      }

      await kContext.sudo().query.Json_MapFeature.updateOne({
        where: {
          id: existingFeature.id,
        },
        data: {
          properties: updatedProperties,
        },
      })

      console.log(
        `[${(count + '').padStart(8, '0')}] did update ${existingFeature.name}`,
      )

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

const FILES_ROOT = join(__dirname, '../tmp-data/censo-2010-taina/')

await loadData(join(FILES_ROOT, 'base_agregada.csv'))

// const files = fs
//   .readdirSync(FILES_ROOT)
//   .filter((name) => name.endsWith('geojson'))

// console.log(files)

// await files.reduce(async (prev, file) => {
//   await prev

//   return loadData(join(FILES_ROOT, file))
// }, Promise.resolve())

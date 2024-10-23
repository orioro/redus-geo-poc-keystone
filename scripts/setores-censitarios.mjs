import chain from 'stream-chain'
import STREAM_JSON from 'stream-json'
import PICK from 'stream-json/filters/Pick.js'
// import { ignore } from 'stream-json/filters/Ignore'
import STREAM_VALUES from 'stream-json/streamers/StreamValues.js'
import STREAM_ARRAY from 'stream-json/streamers/StreamArray.js'
import { fileURLToPath } from 'node:url'

import { getKContext } from '../mod/dist/index.js'

import fs from 'node:fs'
import { dirname, join } from 'node:path'
import bytes from 'bytes'

const pick = PICK.pick

const kContext = getKContext()

const parser = STREAM_JSON.parser
const streamValues = STREAM_VALUES.streamValues

// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url)

// Get the directory name
const __dirname = dirname(__filename)

const json_mapLayer = await kContext.sudo().query.Json_MapLayer.createOne({
  data: {
    name: 'test',
  },
})

const pipeline = chain([
  fs.createReadStream(
    join(__dirname, '../tmp-data/BR_Malha_Preliminar_2022.json'),
  ),
  parser(),
  pick({
    filter: 'features',
  }),

  STREAM_ARRAY.streamArray(),

  async (data) => {
    const { key, value } = data

    if (key < 143170) {
      console.log(`skip: ${key}`)
      return
    }

    try {
      const _start = performance.now()

      const mapFeature = await kContext.sudo().query.Json_MapFeature.createOne({
        data: {
          mapLayer: {
            connect: {
              id: json_mapLayer.id,
            },
          },
          name: value.properties.CD_SETOR,
          geometry: value.geometry,
          properties: value.properties,
        },
      })

      const _end = performance.now()

      const _time = _end - _start
      const _size = Buffer.byteLength(JSON.stringify(value), 'utf8')
      const _ratio = _size / (_time * 1000)

      if (_time > 50) {
        console.log(
          `${(key + '').padStart(10, '0')} - ${_ratio.toFixed(2)} - total duration: ${_time.toFixed(2)} ms - ${bytes.format(_size)}`,
        )
      }

      return null

      return data
    } catch (err) {
      console.warn('ERROR', err)
    }
  },
  // (data) => {
  //   const value = data.value
  //   // keep data only for the accounting department
  //   return value && value.department === 'accounting' ? data : null
  // },
])

// pipeline.on('data', (data) => {
//   console.log('data', data)
// })
pipeline.on('end', () => console.log(`end`))

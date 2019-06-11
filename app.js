const { request } = require('graphql-request')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ cdps: [] })
  .write()

let cdps = ['3228', '608', '5199', '12826', '16619', '2038', '15336', '3088', '1238', '4550', '1275', '4987', '51', '14632', '17550', '4148', '14542', '1162', '16865', '2035', '5625', '135', '13615', '681', '1408', '356', '2613', '4865', '2263', '1118', '487']

const queryGen = (id) => {
  return `{
        getCup(id: ${id}) {
          lad
          art
          ink
          actions {
            nodes {
              tab
              ratio
              act
              time
              art
            }
          }
        }
      }`
}

const getCdp = async (query) => {
  return new Promise((resolve, reject) => {
    request('https://sai-mainnet.makerfoundation.com/v1', query).then(data => {
      let { actions } = data.getCup
      actions = actions.nodes.map((i) => ({ time: new Date(i.time), ratio: (i.art / i.tab) * 100, act: i.act, coll: parseFloat(i.ratio).toFixed(0) }))
      resolve(actions)
    }
    )
  })
}

const retrieveCdps = async () => {
  console.log(cdps.length)
  //   const data = await start()
  // cdpResult is an array of promises
  // Use promise.all to get data for all cdps in the array
  let cdpResult = await cdps.map(async (i) => {
    return new Promise(async (resolve, reject) => {
      let query = queryGen(i)
      resolve(await getCdp(query))
    })
  })

  Promise.all(cdpResult)
    .then((res) => {
      let data = {}
      res.map((i, ind) => {
        data[cdps[ind]] = i
      })
      console.log(data)
      db.set('cdps', data)
        .write()

      console.log('To the moon')
    })
}

run()

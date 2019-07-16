const { request } = require('graphql-request')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('liquidations.json')
const db = low(adapter)

db.defaults({ liquidations: [] })
  .write()
// List of CDP's to gpull data from
let cdps = ['3228', '608', '5199', '12826', '16619', '2038', '15336', '3088', '1238', '4550', '1275', '4987', '51', '14632', '17550', '4148', '14542', '1162', '16865', '2035', '5625', '135', '13615', '681', '1408', '356', '2613', '4865', '2263', '1118', '487']

const getAllBites =`{
  allCupActs(
    first: 1000,
    orderBy: BLOCK_DESC,
    condition: { act: BITE }
  ) {
    nodes {
      time
      pip
      id
      lad
      art
      ink
    }
  }
}`

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

const getLiquidations = async () => {
    return new Promise((resolve, reject) => {
        request('https://sai-mainnet.makerfoundation.com/v1', getAllBites).then(data => {
            resolve(data)
        })
    });
}

const run = async () => {
    let data = await getLiquidations()
    let { nodes } = data.allCupActs
    
    let parsed = nodes.map(async (i) => {
        let { time } = i
        let day = time.split("T")[0]
        i['day'] = day

    })
    console.log(parsed)
    db.set('liquidations', nodes)
      .write()

    console.log('Finished writing to the DB')


} 


run()
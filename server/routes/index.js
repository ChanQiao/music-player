const spider = require("../models/spider")

const index = {
    path: '/',
    method: "get",
    callback: async (request, response) => {
        let list = await spider.loadMusicList()
        response.send(list)
    }
}

const routes = [
    index,
]

module.exports.routes = routes
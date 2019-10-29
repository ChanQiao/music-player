const express = require('express')
const cors = require("cors")
const app = express()
const spider = require("./models/spider")

app.use(cors())

const registerRoutes = (app, routes) => {

    for (let i = 0; i < routes.length; i++) {
        let route = routes[i]
        app[route.method](route.path, route.callback)
    }
}

// 导入 index 中所有的route
const routeIndex = require("./routes/index")
registerRoutes(app, routeIndex.routes)

const __main = async () => {

    // 获取音乐数据
    let isUpdate = false
    if (isUpdate) {
        await spider.start()
    }

    let host = "localhost"
    let port = 8000
    let server = app.listen(port, host, () => {
        console.log(`服务器地址为 http://${host}:${port}`)
    })
}

if (require.main === module) {
    __main()
}
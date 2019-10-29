const _ajax = function(request) {

    let p = new Promise((resolve, reject) => {

        let { method, url, data } = request
        let r = new XMLHttpRequest()
        r.open(method, url, true)
        r.setRequestHeader('Content-Type', 'application/json')

        if (method === "POST") {
            data = JSON.stringify(data)
        }
        r.send(data)

        r.onreadystatechange = () => {
            if (r.readyState === 4) {
                resolve(r.response)
            }
        }
    })

    return p
}

class Ajax {
    async get (path) {
        let data = ''
        let request = {
            method: "GET",
            url: path,
            data: "",
        }
        await _ajax(request).then((r) => {
            data = JSON.parse(r)
        })
        return data
    }

    async post (path, data) {
        let res = ''
        let request = {
            method: "POST",
            url: path,
            data: data,
        }
        await _ajax(request).then((r) => {
            res = JSON.parse(r)
        })
        return res
    }
}

const ajax = new Ajax()

module.exports = {
    get: ajax.get,
    post: ajax.post,
}
// 创建axios实例
const service = axios.create({
    baseURL: 'https://api.github.com/repos/', // api的base_url
    timeout: 15000                  // 请求超时时间
});

// request拦截器
service.interceptors.request.use(config => {
    return config;
}, error => {
    // Do something with request error
    console.log(error); // for debug
    Promise.reject(error);
})

const issues = {
    // https://developer.github.com/v3/issues/#list-issues-for-a-repository
    list: function (label, pID) {
        return service.get(_config['owner'] + "/" + _config['repo'] + "/issues", {
            params: {
                creator: _config['owner'],
                labels: label,
                page: pID,
                per_page: _config['per_page'],
                client_id: _config['client_id'],
                client_secret: _config['client_secret'],
            }
        })
    },
    // https://developer.github.com/v3/issues/labels/#list-all-labels-for-this-repository
    labels: function () {
        return service.get(_config['owner'] + "/" + _config['repo'] + "/labels", {
            params: {
                client_id: _config['client_id'],
                client_secret: _config['client_secret'],
            }
        })
    },
    // https://developer.github.com/v3/issues/#get-a-single-issue
    getOne: function (id) {
        return service.get(_config['owner'] + "/" + _config['repo'] + "/issues/" + id, {
            params: {
                client_id: _config['client_id'],
                client_secret: _config['client_secret'],
            }
        })
    }
}

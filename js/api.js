// 创建axios实例
const service = axios.create({
    baseURL: 'https://api.github.com/repos/', // api的base_url
    timeout: 15000                  // 请求超时时间
});

// request拦截器
service.interceptors.request.use(config => {
    if (_config['access_token']) {
        config.headers['Authorization'] = _config['access_token']; // 让每个请求携带github token 请根据实际情况自行修改
    }
    return config;
}, error => {
    // Do something with request error
    console.log(error); // for debug
    Promise.reject(error);
})

const issues = {
    // https://developer.github.com/v3/issues/#list-issues-for-a-repository
    list: function (pID) {
        return service.get(_config['owner'] + "/" + _config['repo'] + "/issues", {
            params: {
                creator: _config['onlyOwner'] ? _config['owner'] : null,
                page: pID,
                per_page: _config['per_page']
            }
        })
    },
    // https://developer.github.com/v3/issues/labels/#list-all-labels-for-this-repository
    labels: function () {
        return service.get(_config['owner'] + "/" + _config['repo'] + "/labels")
    },
    // https://developer.github.com/v3/issues/#get-a-single-issue
    getOne: function (id) {
        return service.get(_config['owner'] + "/" + _config['repo'] + "/issues/" + id)
    },
    // https://developer.github.com/v3/repos/#get
    count: function () {
        return service.get(_config['owner'] + "/" + _config['repo'])
    }
}

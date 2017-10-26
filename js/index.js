// 创建axios实例
const service = axios.create({
    baseURL: 'https://api.github.com/repos/', // api的base_url
    timeout: 15000                  // 请求超时时间
});

// request拦截器
service.interceptors.request.use(config => {
    config.headers['Authorization'] = _config['access_token']; // 让每个请求携带github token 请根据实际情况自行修改
    return config;
}, error => {
    // Do something with request error
    console.log(error); // for debug
    Promise.reject(error);
})

/* -------------------------------------------------------------------------------*/

var rendererMD = new marked.Renderer();
marked.setOptions({
    renderer: rendererMD,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    // 如果直接在option中设置highlight，没办法添加代码背景高亮，所以。。我还是不采取这种方式。
    // highlight: function (code) {
    //     return hljs.highlightAuto(code).value;
    // }
});//基本设置

// 设置路由
var router = new VueRouter({
    routes: [
        {
            path: '/',
            name: 'home'
        },
        {
            path: '/detail/:issuesID',
            name: 'detail'
            // component: detail
            // 这里我可以不指定组件，一样可以建立路由,所以我决定将detail组件删除
        },
        {
            path: '/page/:pageID',
            name: 'page'
        }
    ]
})


var app = new Vue({
    router,
    data: function () {
        return {
            baseData: {},
            listPage: false,
            detailPage: false,
            loading: true,
            ps: 1,
            p: 1,
            prev: false,
            next: false,
            G: { post: {}, postList: {} },
            detailData: ''
        }
    },
    watch: {
        '$route': 'fetchList'
    },
    created: function () {
        this.getPages();
        this.fetchList();
    },
    methods: {
        fetchList: function () {

            console.log('路由变化');
            if (this.$route.params.issuesID) {

                var issID = this.$route.params.issuesID;

                if (this.G.post[issID] !== undefined) {
                    this.detailData = marked(this.G.post[issID].body);

                    // DOM 还没有更新
                    this.$nextTick(function () {
                        // DOM 现在更新了
                        this.hl(this.$refs.detail);                              
                    })

                    this.loading = false;
                    this.listPage = false;
                    this.detailPage = true;

                    return;
                }

                this.loading = true;
                this.listPage = false;
                this.detailPage = false;

                var _this = this;
                service.get(_config['owner'] + "/" + _config['repo'] + "/issues/" + this.$route.params.issuesID).then(function (response) {

                    _this.loading = false;
                    _this.listPage = false;
                    _this.detailPage = true;

                    _this.detailData = marked(response.data.body);

                    // DOM 还没有更新
                    _this.$nextTick(function () {
                        // DOM 现在更新了
                        _this.hl(_this.$refs.detail);
                    })

                }, function (response) {
                    // 响应错误回调
                });
            } else if (this.$route.params.pageID || true) {

                var pID = this.$route.params.pageID || 1;

                if (this.G.postList[pID] !== undefined) {
                    this.baseData = this.G.postList[pID];
                    this.p = pID;

                    this.loading = false;
                    this.listPage = true;
                    this.detailPage = false;

                    this.prev = (pID - 1 > 0);
                    this.next = (-(-pID) + 1 <= this.ps);
                    return;
                }


                console.log('pageID改变了');

                this.loading = true;
                this.listPage = false;
                this.detailPage = false;

                var _this = this;
                service.get(_config['owner'] + "/" + _config['repo'] + "/issues", {
                    params: {
                        filter: 'created',
                        page: pID,
                        per_page: _config['per_page']
                    }
                }).then(function (response) {
                    // 响应成功回调
                    _this.loading = false;
                    _this.listPage = true;
                    _this.detailPage = false;
                    _this.baseData = response.data;
                    _this.p = pID;
                    _this.prev = response.headers.link.indexOf('rel="prev"') > 0;
                    _this.next = response.headers.link.indexOf('rel="next"') > 0;

                    // 将该页的所有内容存到数组中
                    _this.G.postList[_this.p] = response.data;


                    for (i in response.data) {
                        _this.G.post[response.data[i].number] = response.data[i];
                    }


                }, function (response) {
                    // 响应错误回调
                });

            }
        },
        getPages: function () {
            var _this = this;
            service.get(_config['owner'] + "/" + _config['repo']).then(function (response) {
                _this.ps = Math.ceil((response.data.open_issues) / _config['per_page']);
                console.log(_this.ps, "这个是Pages");
            }, function (response) {

            });
        },
        hl: function ($elm) {
            var $codes = $elm.querySelectorAll('code');
            for (var i = 0, length = $codes.length; i < length; i++) {
                hljs.highlightBlock($codes[i]);
            }
        }
    }
}).$mount('#app')
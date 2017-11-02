var EventUtil = {
    addHandler: function (element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + type, handler);
        } else {
            element["on" + type] = handler;
        }
    },
    /**
     / THIRD FUNCTION
     * getPageScroll() by quirksmode.com
     *
     * @return Array Return an array with x,y page scroll values.
     */
    getPageScroll: function () {
        var xScroll, yScroll;
        if (self.pageYOffset) {
            yScroll = self.pageYOffset;
            xScroll = self.pageXOffset;
        } else if (document.documentElement && document.documentElement.scrollTop) { // Explorer 6 Strict
            yScroll = document.documentElement.scrollTop;
            xScroll = document.documentElement.scrollLeft;
        } else if (document.body) {// all other Explorers
            yScroll = document.body.scrollTop;
            xScroll = document.body.scrollLeft;
        }
        arrayPageScroll = new Array(xScroll, yScroll);
        return arrayPageScroll;
    }
};

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
            pageCount: 1,
            currentPage: 1,
            showPrevMore: false,
            showNextMore: false,
            prev: false,
            next: false,
            G: { post: {}, postList: {} },
            article: null,
            detailData: '',
            isSmTitle: false,
            headerTitle: '',
            gitment: null
        }
    },
    computed: {
        // 计算页码
        pagers() {
            console.log('哈哈哈');
            const pagerCount = 7;
            const currentPage = Number(this.currentPage);
            // const currentPage = Number(10);
            const pageCount = Number(this.pageCount);
            // const pageCount = Number(100);
            let showPrevMore = false;
            let showNextMore = false;
            if (pageCount > pagerCount) {
                if (currentPage > pagerCount - 3) {
                    showPrevMore = true;
                }
                if (currentPage < pageCount - 3) {
                    showNextMore = true;
                }
            }
            const array = [];
            if (showPrevMore && !showNextMore) {
                const startPage = pageCount - (pagerCount - 2);
                for (let i = startPage; i < pageCount; i++) {
                    array.push(i);
                }
            } else if (!showPrevMore && showNextMore) {
                for (let i = 2; i < pagerCount; i++) {
                    array.push(i);
                }
            } else if (showPrevMore && showNextMore) {
                const offset = Math.floor(pagerCount / 2) - 1;
                for (let i = currentPage - offset; i <= currentPage + offset; i++) {
                    array.push(i);
                }
            } else {
                for (let i = 2; i < pageCount; i++) {
                    array.push(i);
                }
            }
            this.showPrevMore = showPrevMore;
            this.showNextMore = showNextMore;
            return array;
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

                document.documentElement.scrollTop ? document.documentElement.scrollTop = 0 : document.body.scrollTop = 0;

                var issID = this.$route.params.issuesID;

                if (this.G.post[issID] !== undefined) {
                    this.article = this.G.post[issID];
                    this.detailData = marked(this.G.post[issID].body);
                    this.headerTitle = this.article.title;

                    // 进到文章页面之后就重新初始化评论
                    this.initComment(this.headerTitle);

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

                    _this.article = response.data;
                    _this.detailData = marked(response.data.body);
                    _this.headerTitle = _this.article.title;

                    // 进到文章页面之后就重新初始化评论
                    _this.initComment(_this.headerTitle);

                    // DOM 还没有更新
                    _this.$nextTick(function () {
                        // DOM 现在更新了
                        _this.hl(_this.$refs.detail);
                    })

                }, function (response) {
                    // 响应错误回调
                });
            } else {

                this.headerTitle = _config['owner'] + '的个人博客'

                var pID = this.$route.params.pageID || 1;

                if (this.G.postList[pID] !== undefined) {
                    this.baseData = this.G.postList[pID];
                    this.currentPage = pID;

                    this.loading = false;
                    this.listPage = true;
                    this.detailPage = false;

                    this.prev = (pID - 1 > 0);
                    this.next = (-(-pID) + 1 <= this.pageCount);
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
                    _this.currentPage = pID;
                    _this.prev = response.headers.link.indexOf('rel="prev"') > 0;
                    _this.next = response.headers.link.indexOf('rel="next"') > 0;

                    // 将该页的所有内容存到数组中
                    _this.G.postList[_this.currentPage] = response.data;


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
                _this.pageCount = Math.ceil((response.data.open_issues) / _config['per_page']);
                console.log(_this.pageCount, "这个是Pages");
                console.log(_this.pagers);
            }, function (response) {

            });
        },
        hl: function ($elm) {
            var $codes = $elm.querySelectorAll('code');
            for (var i = 0, length = $codes.length; i < length; i++) {
                hljs.highlightBlock($codes[i]);
            }
        },
        back: function () {
            window.history.back();
        },
        initComment: function (pageTitle) {
            this.gitment = null;
            this.gitment = new Gitment({
                // id: '页面 ID', // 可选。默认为 location.href
                owner: 'auven',
                repo: 'blog-comment',
                title: pageTitle,
                oauth: {
                    client_id: '2b4b72a134' + '03b5d7c71a',
                    client_secret: '5e27bafda0f46a0528bbb' + 'ec7a543d4fdd6047cb7',
                },
            })
            this.gitment.render('comments')
        }
    },
    mounted: function () {
        var _this = this;
        var distance = _this.$refs.indexTitle.offsetTop - _this.$refs.indexHeader.clientHeight;
        EventUtil.addHandler(document, 'scroll', function () {
            if (EventUtil.getPageScroll()[1] >= distance) {
                _this.isSmTitle = true;
            } else {
                _this.isSmTitle = false;
            }
        });
        this.initComment();
    }
}).$mount('#app')
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


var SetPswp = function ($galleryEl) {
    this.$galleryEl = $galleryEl;
    this.$galleryEl.setAttribute('data-pswp-uid', 1);
    // 预览器元素    
    this.$pswpElement = document.querySelector('.pswp');
    this.create();
}

SetPswp.prototype = {
    // 图片元素集合
    $imgs: null,
    // ps实例
    gallery: null,
    // ps图片集
    items: null,
    // ps相关设置
    options: null,
    // 初始化
    create: function () {
        var _this = this;
        this.$galleryEl.onclick = function (e) {
            console.log('hahaha');
            e = e || window.event;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
    
            // 这里获取的就是我们点击的图片
            var eTarget = e.target || e.srcElement;
            console.log('点击的图片', eTarget);
            _this.onThumbnailsClick(eTarget);
        }
        var _this = this;
        this.options = {
            barsSize: {
                top: 100,
                bottom: 100
            },
            fullscreenEl: false,
            shareButtons: [
                { id: 'wechat', label: '分享微信', url: '#' },
                { id: 'weibo', label: '新浪微博', url: '#' },
                { id: 'download', label: '保存图片', url: '{{raw_image_url}}', download: true }
            ],

            // 不添加点击图片历史记录
            history: false,

            // define gallery index (for URL)
            galleryUID: _this.$galleryEl.getAttribute('data-pswp-uid'),

            getThumbBoundsFn: function (index) {
                // See Options -> getThumbBoundsFn section of documentation for more info
                var thumbnail = _this.items[index].el; // find thumbnail
                var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                var rect = thumbnail.getBoundingClientRect();

                return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
            }
        };
    },
    // 当用户点击缩略图触发
    onThumbnailsClick: function (eTarget) {
        // 如果点击的不是图片，就不做处理
        if (eTarget.tagName.toUpperCase() !== 'IMG') {
            return;
        }

        // 通过遍历所有包含data-size的子节点查找点击的图片的索引
        // alternatively, you may define index via data- attribute
        var $imgs = this.$imgs;
        var numChildNodes = $imgs.length;
        var nodeIndex = 0;
        var index;

        for (var i = 0; i < numChildNodes; i++) {
            if ($imgs[i].nodeType !== 1) {
                continue;
            }

            if ($imgs[i] === eTarget) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }

        if (index >= 0) {
            // open PhotoSwipe if valid index found
            this.openPhotoSwipe(index);
        }
        return false;
    },
    openPhotoSwipe: function (index) {
        this.options.index = parseInt(index, 10);
        // exit if index not found
        if (isNaN(this.options.index)) {
            return;
        }
        this.gallery = new PhotoSwipe(this.$pswpElement, PhotoSwipeUI_Default, this.items, this.options);
        this.gallery.init();
    },
    init: function () {
        this.$imgs = this.$galleryEl.querySelectorAll('img');
        this.items = [];
        var numNodes = this.$imgs.length;
        var size, item, imgEl;
        for (var i = 0; i < numNodes; i++) {
            imgEl = this.$imgs[i];
            size = imgEl.getAttribute('data-size').split('x');
            // 创建幻灯片对象
            item = {
                src: imgEl.getAttribute('src'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10),
                el: imgEl
            };
            this.items.push(item);
        }
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
            gitment: null,
            setPswp: null
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
                        this.initImgbox(this.$refs.detail);
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
                        _this.initImgbox(_this.$refs.detail);
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
        },
        // 初始化图片盒子
        initImgbox: function ($detail) {
            var _this = this;
            var $imgList = $detail.querySelectorAll('img'),
                length = $imgList.length;
            // 存储图片加载状态
            var imgState = [];
            for (var i = 0; i < length; i++) {
                (function (i) {
                    var imgEl = $imgList[i];
                    var imgItem = imgEl.parentNode;
                    var imgSrc = imgEl.src;
                    var timer = null;
                    var load = function (src) {
                        var imgObj = new Image();
                        imgObj.src = src;
                        timer = setInterval(function () {
                            // console.log('加载第 ' + i + ' 张图片循环中');
                            if (imgObj.complete) {
                                clearInterval(timer);
                                imgEl.setAttribute('data-size', imgObj.width + 'x' + imgObj.height);
                                if (imgObj.width >= imgObj.height) {
                                    imgEl.height = imgItem.clientHeight;
                                }
                                if (imgObj.width < imgObj.height) {
                                    imgEl.width = imgItem.clientWidth;
                                }

                                imgState[i] = true;
                                // 所有图片加载完成
                                var allLoaded = true;
                                for (var j = 0; j < length; j++) {
                                    if (!imgState[j]) {
                                        allLoaded = false;
                                        break;
                                    }
                                }
                                // console.log('第 ' + i + ' 张图片加载完成');                                
                                if (allLoaded) {
                                    // console.log('所有图片加载完成');
                                    _this.setPswp.init();
                                }
                            }
                        }, 80);
                    };
                    load(imgSrc);
                })(i);
            }
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
        this.$nextTick(function () {
            // DOM 现在更新了
            this.setPswp = new SetPswp(this.$refs.detail);
        });
    }
}).$mount('#app');
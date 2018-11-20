var EventUtil = {
  addHandler: function(element, type, handler) {
    if (element.addEventListener) {
      element.addEventListener(type, handler, false)
    } else if (element.attachEvent) {
      element.attachEvent('on' + type, handler)
    } else {
      element['on' + type] = handler
    }
  },
  /**
     / THIRD FUNCTION
     * getPageScroll() by quirksmode.com
     *
     * @return Array Return an array with x,y page scroll values.
     */
  getPageScroll: function() {
    var xScroll, yScroll
    if (self.pageYOffset) {
      yScroll = self.pageYOffset
      xScroll = self.pageXOffset
    } else if (document.documentElement && document.documentElement.scrollTop) {
      // Explorer 6 Strict
      yScroll = document.documentElement.scrollTop
      xScroll = document.documentElement.scrollLeft
    } else if (document.body) {
      // all other Explorers
      yScroll = document.body.scrollTop
      xScroll = document.body.scrollLeft
    }
    arrayPageScroll = new Array(xScroll, yScroll)
    return arrayPageScroll
  }
}

// 锚点设置
anchors.options = {
  visible: 'always',
  icon: '¶'
}

var SetPswp = function($galleryEl) {
  this.$galleryEl = $galleryEl
  this.$galleryEl.setAttribute('data-pswp-uid', 1)
  // 预览器元素
  this.$pswpElement = document.querySelector('.pswp')
  this.init()
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
  init: function() {
    var _this = this
    this.$galleryEl.onclick = function(e) {
      e = e || window.event
      e.preventDefault ? e.preventDefault() : (e.returnValue = false)

      // 这里获取的就是我们点击的图片
      var eTarget = e.target || e.srcElement
      _this.onThumbnailsClick(eTarget)
    }
    var _this = this
    this.options = {
      barsSize: {
        top: 100,
        bottom: 100
      },
      fullscreenEl: false,
      shareButtons: [
        { id: 'wechat', label: '分享微信', url: '#' },
        { id: 'weibo', label: '新浪微博', url: '#' },
        {
          id: 'download',
          label: '保存图片',
          url: '{{raw_image_url}}',
          download: true
        }
      ],

      // 不添加点击图片历史记录
      history: false,

      // define gallery index (for URL)
      galleryUID: _this.$galleryEl.getAttribute('data-pswp-uid'),

      getThumbBoundsFn: function(index) {
        // See Options -> getThumbBoundsFn section of documentation for more info
        var thumbnail = _this.items[index].el // find thumbnail
        var pageYScroll =
          window.pageYOffset || document.documentElement.scrollTop
        var rect = thumbnail.getBoundingClientRect()

        return { x: rect.left, y: rect.top + pageYScroll, w: rect.width }
      }
    }
  },
  // 当用户点击缩略图触发
  onThumbnailsClick: function(eTarget) {
    // 如果点击的不是图片，就不做处理
    if (eTarget.tagName.toUpperCase() !== 'IMG') {
      return
    }

    // 如果已经初始化完成才继续执行
    if (this.$imgs) {
      // 通过遍历所有图片查找点击的图片的索引
      var $imgs = this.$imgs
      var numChildNodes = $imgs.length
      var nodeIndex = 0
      var index

      for (var i = 0; i < numChildNodes; i++) {
        if ($imgs[i].nodeType !== 1) {
          continue
        }

        if ($imgs[i] === eTarget) {
          index = nodeIndex
          break
        }
        nodeIndex++
      }

      if (index >= 0) {
        // open PhotoSwipe if valid index found
        this.openPhotoSwipe(index)
      }
    }

    return false
  },
  openPhotoSwipe: function(index) {
    this.options.index = parseInt(index, 10)
    // exit if index not found
    if (isNaN(this.options.index)) {
      return
    }
    this.gallery = new PhotoSwipe(
      this.$pswpElement,
      PhotoSwipeUI_Default,
      this.items,
      this.options
    )
    this.gallery.init()
    var _this = this
    // Gallery starts closing
    this.gallery.listen('close', function() {
      console.log('关闭弹窗')
      _this.removePopstateHandler()
      window.history.back()
    })
    this.addPopstateHandler()
  },
  create: function() {
    this.$imgs = this.$galleryEl.querySelectorAll('img')
    this.items = []
    var numNodes = this.$imgs.length
    var size, item, imgEl
    for (var i = 0; i < numNodes; i++) {
      imgEl = this.$imgs[i]
      size = imgEl.getAttribute('data-size').split('x')
      // 创建幻灯片对象
      item = {
        src: imgEl.getAttribute('src'),
        w: parseInt(size[0], 10),
        h: parseInt(size[1], 10),
        el: imgEl
      }
      this.items.push(item)
    }
  },
  // 销毁函数
  destroy: function() {
    this.$imgs = null
  },
  // 添加返回事件监听
  addPopstateHandler: function() {
    console.log('添加返回事件监听')
    var _this = this
    window.addEventListener('popstate', this.closeModal, false)
    console.log(location.href)
    window.history.pushState({}, '')
  },
  // 移除返回事件监听
  removePopstateHandler: function() {
    console.log('移除返回事件监听')
    window.removeEventListener('popstate', this.closeModal, false)
  },
  // 关闭弹窗
  closeModal: function(e) {
    // 既然没办法限制默认的后退事件，那么我这里就给它再添加一次state，然后关闭的时候在close；
    if (e) {
      window.history.pushState({}, '')
    }
    // window.history.back();
    // 关闭图片
    if (window.setPswp) {
      window.setPswp.gallery.close()
    }
  }
}

/* -------------------------------------------------------------------------------*/

var rendererMD = new marked.Renderer()
marked.setOptions({
  renderer: rendererMD,
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
  // 如果直接在option中设置highlight，没办法添加代码背景高亮，所以。。我还是不采取这种方式。
  // highlight: function (code) {
  //     return hljs.highlightAuto(code).value;
  // }
}) //基本设置

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
  data: function() {
    return {
      baseData: {},
      listPage: false,
      detailPage: false,
      loading: true,
      pageCount: 0,
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
      setPswp: null,
      acticleLabel: [],
      allLabel: [],
      label: '',
      gitalk: null
    }
  },
  computed: {
    // 计算页码
    pagers() {
      const pagerCount = 7
      const currentPage = Number(this.currentPage)
      // const currentPage = Number(10);
      const pageCount = Number(this.pageCount)
      // const pageCount = Number(100);
      let showPrevMore = false
      let showNextMore = false
      if (pageCount > pagerCount) {
        if (currentPage > pagerCount - 3) {
          showPrevMore = true
        }
        if (currentPage < pageCount - 3) {
          showNextMore = true
        }
      }
      const array = []
      if (showPrevMore && !showNextMore) {
        const startPage = pageCount - (pagerCount - 2)
        for (let i = startPage; i < pageCount; i++) {
          array.push(i)
        }
      } else if (!showPrevMore && showNextMore) {
        for (let i = 2; i < pagerCount; i++) {
          array.push(i)
        }
      } else if (showPrevMore && showNextMore) {
        const offset = Math.floor(pagerCount / 2) - 1
        for (let i = currentPage - offset; i <= currentPage + offset; i++) {
          array.push(i)
        }
      } else {
        for (let i = 2; i < pageCount; i++) {
          array.push(i)
        }
      }
      this.showPrevMore = showPrevMore
      this.showNextMore = showNextMore
      return array
    }
  },
  watch: {
    $route: 'fetchList'
  },
  created: function() {
    this.fetchList()
    this.getAllLabel()
  },
  methods: {
    fetchList: function() {
      if (window.setPswp) {
        // 销毁ps
        window.setPswp.destroy()
      }

      if (this.$route.params.issuesID) {
        document.documentElement.scrollTop
          ? (document.documentElement.scrollTop = 0)
          : (document.body.scrollTop = 0)

        var issID = this.$route.params.issuesID

        if (this.G.post[issID] !== undefined) {
          this.article = this.G.post[issID]
          this.acticleLabel = this.article.labels
          this.detailData = marked(this.G.post[issID].body)
          this.headerTitle = this.article.title

          // 进到文章页面之后就重新初始化评论
          // this.initComment(this.headerTitle)
          this.initGitalk(this.headerTitle)

          // DOM 还没有更新
          this.$nextTick(function() {
            // DOM 现在更新了
            this.hl(this.$refs.detail)
            anchors.add()
            this.initImgbox(this.$refs.detail)
          })

          this.loading = false
          this.listPage = false
          this.detailPage = true

          return
        }

        this.loading = true
        this.listPage = false
        this.detailPage = false

        var _this = this
        issues.getOne(this.$route.params.issuesID).then(
          function(response) {
            _this.loading = false
            _this.listPage = false
            _this.detailPage = true

            _this.article = response.data
            _this.acticleLabel = _this.article.labels
            _this.detailData = marked(response.data.body)
            _this.headerTitle = _this.article.title

            // 进到文章页面之后就重新初始化评论
            // _this.initComment(_this.headerTitle)
            _this.initGitalk(_this.headerTitle)

            // DOM 还没有更新
            _this.$nextTick(function() {
              // DOM 现在更新了
              _this.hl(_this.$refs.detail)
              anchors.add()
              _this.initImgbox(_this.$refs.detail)
            })
          },
          function(response) {
            // 响应错误回调
          }
        )
      } else {
        this.headerTitle = _config['owner'] + '的个人博客'

        // 当前页
        var pID = this.$route.params.pageID || 1
        // 获取label参数
        var label = this.$route.query.label || ''

        if (
          this.G.postList[pID] !== undefined &&
          this.G.postList['label'] === label
        ) {
          this.baseData = this.G.postList[pID]
          this.currentPage = pID

          this.loading = false
          this.listPage = true
          this.detailPage = false

          return
        }

        this.loading = true
        this.listPage = false
        this.detailPage = false

        var _this = this
        issues.list(label, pID).then(
          function(response) {
            // 如果没有页码就获取页码
            if (response.headers.link) {
              // console.log('获取页码');
              const link = response.headers.link.split(',')
              // 是不是最后一页
              var isLastPage = true
              for (let i = 0; i < link.length; i++) {
                if (/last/.test(link[i])) {
                  _this.pageCount = link[i]
                    .match(/\?.*?(?=>)/)[0]
                    .substr(1)
                    .match(/(^|&)page=([^&]*)(&|$)/)[2]
                  isLastPage = false
                  break
                }
              }
              if (isLastPage) {
                _this.pageCount = pID
              }
            } else {
              _this.pageCount = pID
            }

            // 响应成功回调
            _this.loading = false
            _this.listPage = true
            _this.detailPage = false
            _this.baseData = response.data
            _this.currentPage = pID
            _this.label = label

            if (label !== _this.G.postList['label']) {
              // 清空
              _this.G.postList = {}
              _this.G.postList['label'] = label
            }

            // 将该页的所有内容存到数组中
            _this.G.postList[_this.currentPage] = response.data

            for (i in response.data) {
              _this.G.post[response.data[i].number] = response.data[i]
            }
          },
          function(response) {
            // 响应错误回调
          }
        )
      }
    },
    hl: function($elm) {
      var $codes = $elm.querySelectorAll('code')
      for (var i = 0, length = $codes.length; i < length; i++) {
        hljs.highlightBlock($codes[i])
      }
    },
    back: function() {
      window.history.back()
    },
    initComment: function(pageTitle) {
      this.gitment = null
      this.gitment = new Gitment({
        // id: '页面 ID', // 可选。默认为 location.href
        owner: 'auven',
        repo: 'blog-comment',
        title: pageTitle,
        oauth: {
          client_id: _config['client_id'],
          client_secret: _config['client_secret']
        }
      })
      this.gitment.render('comments')
    },
    initGitalk: function(pageTitle) {
      this.gitalk = null
      this.gitalk = new Gitalk({
        clientID: _config['client_id'],
        clientSecret: _config['client_secret'],
        repo: 'blog-comment',
        owner: 'auven',
        admin: ['auven'],
        id: MD5(pageTitle),
        title: pageTitle,
        distractionFreeMode: false
      })

      this.gitalk.render('gitalk-container')
    },
    // 初始化图片盒子
    initImgbox: function($detail) {
      var _this = this
      var $imgList = $detail.querySelectorAll('img'),
        length = $imgList.length
      // 存储图片加载状态
      var imgState = []
      for (var i = 0; i < length; i++) {
        ;(function(i) {
          var imgEl = $imgList[i]
          var imgItem = imgEl.parentNode
          var imgSrc = imgEl.src
          var timer = null
          var load = function(src) {
            var imgObj = new Image()
            imgObj.src = src
            timer = setInterval(function() {
              // console.log('加载第 ' + i + ' 张图片循环中');
              if (imgObj.complete) {
                clearInterval(timer)
                imgEl.setAttribute(
                  'data-size',
                  imgObj.width + 'x' + imgObj.height
                )

                imgState[i] = true
                // 所有图片加载完成
                var allLoaded = true
                for (var j = 0; j < length; j++) {
                  if (!imgState[j]) {
                    allLoaded = false
                    break
                  }
                }
                // console.log('第 ' + i + ' 张图片加载完成');
                if (allLoaded) {
                  // console.log('所有图片加载完成');
                  window.setPswp.create()
                }
              }
            }, 80)
          }
          load(imgSrc)
        })(i)
      }
    },
    // 获取label
    getAllLabel: function() {
      var _this = this
      issues.labels().then(function(response) {
        console.log(response)
        _this.allLabel = response.data
      })
    },
    // 通过label获取issues
    selectLabel: function(label) {
      console.log(label)
      router.push({
        name: 'page',
        params: { pageID: 1 },
        query: { label: label }
      })
    },
    // 切换页码
    changePage: function(page) {
      if (this.label) {
        router.push({
          name: 'page',
          params: { pageID: page },
          query: { label: this.label }
        })
      } else {
        router.push({ name: 'page', params: { pageID: page } })
      }
    }
  },
  mounted: function() {
    var _this = this
    var distance =
      _this.$refs.indexTitle.offsetTop - _this.$refs.indexHeader.clientHeight
    EventUtil.addHandler(document, 'scroll', function() {
      if (EventUtil.getPageScroll()[1] >= distance) {
        _this.isSmTitle = true
      } else {
        _this.isSmTitle = false
      }
    })
    this.$nextTick(function() {
      // DOM 现在更新了
      window.setPswp = new SetPswp(this.$refs.detail)
    })
    // issues.labels();
  }
}).$mount('#app')

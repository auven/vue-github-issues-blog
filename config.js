var _config = {
    blog_name       : '用于演示的博客',         // 博客名称
    owner           : 'lifesinger',           // github 用户名
    repo            : 'blog',// github 中对应项目名
    access_token : 'token 19cc7e597a6885' + 'dc6b73740589af41a44744e33a',       // 请求量大时需要在 github 后台单独设置一个读取公开库的 token, 注意将token 拆成两个字符串，否则会被系统自动删除掉
    per_page        : '10',                    // 默认一页显示几篇文章
    // 版权起始年份
    since_year: 2015,
    // icp备案号 ICP_license: 京ICP备1234556号-1
    ICP_license: false,
    // 设置为 true 发布后将使用 unpkg cdn
    cdn: false,
    // 是否只显示本人的issue
    onlyOwner: false
}
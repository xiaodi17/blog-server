const {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
} = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')

//loginCheck
const loginCheck = req => {
  if (!req.session.username) {
    return Promise.resolve(new ErrorModel('login fail'))
  }
}

const handleBlogRouter = (req, res) => {
  const method = req.method //GET POST
  const id = req.query.id

  //get blog list
  if (method === 'GET' && req.path === '/api/blog/list') {
    let author = req.query.author || ''
    const keyword = req.query.keyword || ''

    if (req.query.isadmin) {
      //admin
      const loginCheckResult = loginCheck(req)
      if (loginCheckResult) {
        //not login
        return loginCheckResult
      }
      //search your own blog
      author = req.session.username
    }
    // return new SuccessModel(listData)
    const result = getList(author, keyword)
    return result.then(listData => {
      return new SuccessModel(listData)
    })
  }

  //get blog detail
  if (method === 'GET' && req.path === '/api/blog/detail') {
    // const data = getDetail(id)
    // return new SuccessModel(data)
    const result = getDetail(id)
    return result.then(data => {
      return new SuccessModel(data)
    })
  }

  //post a blog
  if (method === 'POST' && req.path === '/api/blog/new') {
    // const data = newBlog(req.body)
    // return new SuccessModel(data)

    const loginCheckResult = loginCheck(req)
    if (loginCheckResult) {
      //login fail
      return loginCheckResult
    }
    req.body.author = req.session.username
    const result = newBlog(req.body)
    return result.then(data => {
      return new SuccessModel(data)
    })
  }

  //update a blog
  if (method === 'POST' && req.path === '/api/blog/update') {
    const loginCheckResult = loginCheck(req)
    if (loginCheckResult) {
      //login fail
      return loginCheckResult
    }
    const result = updateBlog(id, req.body)
    return result.then(val => {
      if (val) {
        return new SuccessModel()
      } else {
        return ErrorModel('update blog fail')
      }
    })
  }

  //delete a blog
  if (method === 'POST' && req.path === '/api/blog/del') {
    const loginCheckResult = loginCheck(req)
    if (loginCheckResult) {
      //login fail
      return loginCheckResult
    }

    req.body.author = req.session.username
    const result = delBlog(id)
    if (result) {
      return new SuccessModel()
    } else {
      return new ErrorModel('delete fail')
    }
  }
}

module.exports = handleBlogRouter

const { login } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { set } = require('../db/redis')

const handleUserRouter = (req, res) => {
  const method = req.method //GET POST

  //login
  if (method === 'POST' && req.path === '/api/user/login') {
    const { username, password } = req.body
    const result = login(username, password) //try to return from user from _db
    return result.then(data => {
      if (data.username) {
        req.session.username = data.username
        req.session.firstName = data.firstname
        //sycn redis
        set(req.sessionId, req.session)

        return new SuccessModel()
      }
      return new ErrorModel('Login Fail')
    })
  }

  //login test
  // if (method === 'GET' && req.path === '/api/user/login-test') {
  //   if (req.session.username) {
  //     return Promise.resolve(
  //       new SuccessModel({
  //         session: req.session
  //       })
  //     )
  //   }
  //   return Promise.resolve(new ErrorModel('login fail'))
  // }
}

module.exports = handleUserRouter

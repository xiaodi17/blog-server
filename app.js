const querystring = require('querystring')
const { get, set } = require('./src/db/redis')
const { access } = require('./src/utils/log')
const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')

const getCookieExpires = () => {
  const d = new Date()
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000)
  console.log(d.toGMTString())
  return d.toGMTString()
}
// //session
// const SESSION_DATA = {}

//handle post data
const getPostData = req => {
  const promise = new Promise((resolve, reject) => {
    if (req.method !== 'POST') {
      resolve({})
      return
    }
    if (req.headers['content-type'] !== 'application/json') {
      resolve({})
      return
    }
    let postData = ''
    req.on('data', chunk => {
      postData += chunk.toString()
    })
    req.on('end', () => {
      if (!postData) {
        resolve({})
        return
      }
      resolve(JSON.parse(postData))
    })
  })
  return promise
}

const serverHandle = (req, res) => {
  //write Access log
  access(
    `${req.method} -- ${req.url} -- ${
      req.headers['user-agent']
    } -- ${Date.now()}`
  )

  //return type JSON
  res.setHeader('Content-type', 'application/json')

  //get path
  const url = req.url
  req.path = url.split('?')[0] //Define path so that blog.js/user.js can get path

  //get query
  req.query = querystring.parse(url.split('?')[1])

  //get cookie
  req.cookie = {}
  const cookieStr = req.headers.cookie || '' //k1=v1;k2=v2;k3=v3 in string format
  cookieStr.split(';').forEach(item => {
    if (!item) {
      return
    }
    const arr = item.split('=')
    const key = arr[0].trim()
    const val = arr[1].trim()
    req.cookie[key] = val
  })

  //handle session (use redis)
  let needSetCookie = false
  let userId = req.cookie.userid
  if (!userId) {
    needSetCookie = true
    userId = `${Date.now()}_${Math.random()}`

    //initialize redis session value
    set(userId, {})
  }
  //analysis session
  req.sessionId = userId

  get(req.sessionId)
    .then(sessionData => {
      if (sessionData == null) {
        //initialize redis session value
        set(req.sessionId, {})
        //set session
        req.session = {}
      } else {
        //set session
        req.session = sessionData
      }
      console.log('req.session', req.session)

      //handle post data
      return getPostData(req)
    })
    .then(postData => {
      req.body = postData

      //handle blog route
      const blogResult = handleBlogRouter(req, res) //this is promise from blog.js router
      if (blogResult) {
        blogResult.then(blogData => {
          if (needSetCookie) {
            res.setHeader(
              'Set-Cookie',
              `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`
            )
          }
          res.end(JSON.stringify(blogData))
        })
        return
      }

      //handle user route
      const userData = handleUserRouter(req, res)
      if (userData) {
        userData.then(userData => {
          res.setHeader(
            'Set-Cookie',
            `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`
          )
          res.end(JSON.stringify(userData))
        })
        return
      }

      // return 404
      res.writeHead(404, { 'Content-type': 'text-plain' })
      res.write('404 Not Fount\n')
      res.end()
    })
}

module.exports = serverHandle

//process.env.NODE_ENV

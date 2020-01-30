const { exec } = require('../db/mysql')

const getList = (author, keyword) => {
  let sql = `select * from blogs where 1=1 `
  if (author) {
    sql += `and author='${author}'`
  }
  if (keyword) {
    sql += `and title like '%${keyword}%`
  }
  sql += `order by createdtime desc`

  //return promise
  return exec(sql)
}

const getDetail = id => {
  const sql = `select * from blogs where id=${id}`
  return exec(sql).then(rows => {
    return rows[0]
  })
}

const newBlog = (blogData = {}) => {
  //blogData is a blog object
  const title = blogData.title
  const content = blogData.content
  const author = blogData.author
  const createdTime = Date.now()

  const sql = `
      insert into blogs (title, content, createdtime, author)
      values ('${title}','${content}',${createdTime},'${author}');
  `
  return exec(sql).then(insertData => {
    return {
      id: insertData.insertId
    }
  })
}

const updateBlog = (id, blogData = {}) => {
  //id is blog id
  //blogData is blog object

  const title = blogData.title
  const content = blogData.content
  const sql = `
      update blogs set title='${title}', content='${content}' where id=${id}
  `

  return exec(sql).then(updateData => {
    console.log('updateData is: ', updateData)
    if (updateData.affectedRows > 0) {
      return true
    }
    return false
  })
}

const delBlog = id => {
  //del id
  return true
}
module.exports = { getList, getDetail, newBlog, updateBlog, delBlog }

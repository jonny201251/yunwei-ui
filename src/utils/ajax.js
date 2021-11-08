import request from 'umi-request'
import { Modal } from 'antd'
import { history } from 'umi'

class ajax {
  static post(url, values) {
    if (!url) {
      Modal.error({ content: '缺少url', okText: '知道了' })
      return
    }
    return request.post(url, { data: values }).then(res => {
      if (res.code === 200 && res.data === '用户未登录') {
        Modal.error({ content: '登录过期', okText: '重新登录', onOk: () => history.push('/login') })
      } else if (res.code === 200) {
        //返回值为Object={code,msg,data}
        return res.data
      } else {
        Modal.error({ content: res.msg || '操作失败', okText: '知道了' })
      }
    }).catch(err => {
      Modal.error({ content: '网络错误', okText: '知道了' })
    })
  }

  static get(url, params) {
    if (!url) {
      Modal.error({ content: '缺少url', okText: '知道了' })
      return
    }
    return request.get(url, { params: params }).then(res => {
      if (res.code === 200 && res.data === '用户未登录') {
        Modal.error({ content: '登录过期', okText: '重新登录', onOk: () => history.push('/login') })
      } else if (res.code === 200) {
        //返回值为Object={code,msg,data}
        return res.data
      } else {
        Modal.error({ content: res.msg || '操作失败', okText: '知道了' })
      }
    }).catch(err => {
      Modal.error({ content: '网络错误', okText: '知道了' })
    })
  }
}

export { ajax }

import { LoadingButton } from '../components'
import { ajax, sysDicPath } from '../utils'

export default () => {
  return <LoadingButton type={'primary'} style={{ width: 80 }} onClick={async () => {
    const data = await ajax.get(sysDicPath.getDicVL, { flag: '自定义表单布局' })
    if (data) {
      console.log(data);
    }
    console.log('aaa');
  }}>提交</LoadingButton>
}

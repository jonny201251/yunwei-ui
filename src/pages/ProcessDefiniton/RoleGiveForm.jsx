import Form, { FormCore, FormItem } from 'noform'
import { Checkbox } from 'nowrapper/lib/antd'
import { ajax, sysUserPath, sysRolePath } from '../../utils'
import { useEffect, useState } from 'react'

export default (props) => {
  const core = new FormCore({
    validateConfig: {
      roleNameArr: { type: 'array', required: true, message: '角色不能为空' }
    }
  })
  const [role, setRole] = useState()
  const [checkNameArr, setCheckNameArr] = useState([])

  useEffect(async () => {
    const data = await ajax.get(sysRolePath.getRoleNameVL)
    if (data) {
      setRole(data)
      if (props.roleName) {
        setCheckNameArr(props.roleName.split(','))
      }
    }
  }, [])

  return <Form core={core}>
    <FormItem name="roleNameArr" value={checkNameArr}>
      <Checkbox.Group options={role} className='newLine'/>
    </FormItem>
  </Form>
}

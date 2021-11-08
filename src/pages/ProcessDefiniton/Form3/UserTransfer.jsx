import React, { useEffect, useState } from 'react'
import Form, { FormCore, FormItem, If } from 'noform'
import { Checkbox, Input, Radio } from 'nowrapper/lib/antd'
import { ConfigProvider, Transfer } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { TreeTransfer as UserTreeTransfer } from '../../../components'

const core = new FormCore()

export default (props) => {
  const [roleArr, setRoleArr] = useState()
  const [roleTargetKeys, setRoleTargetKeys] = useState([])
  const [roleSelectedKeys, setRoleSelectedKeys] = useState([])

  const [userTree, setUserTree] = useState()
  const [userTargetKeys, setUserTargetKeys] = useState([])

  useEffect(async () => {
    setRoleArr(props.roleArr)
    setUserTree(props.userTree)

    const { type, typeValue, haveStarterDept } = props.core.getValues()
    if (type) {
      haveStarterDept && core.setValue('haveStarterDept', haveStarterDept.split(',').map(item => item))
      core.setValue('type', type)
      if (type === '角色') {
        setRoleTargetKeys(typeValue.split(',').map(item => parseInt(item)))
      } else {
        setUserTargetKeys(typeValue.split(',').map(item => 'user' + item))
      }
    } else {
      core.reset()
      core.setValue('type', '角色')
    }
  }, [])

  const onChange = (nextTargetKeys, direction, moveKeys) => {
    core.setValue('typeValue', nextTargetKeys.join(','))
    setRoleTargetKeys(nextTargetKeys)
  }
  const onSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    setRoleSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  }

  return <ConfigProvider locale={zhCN}>
    <Form core={core} layout={{ label: 4, control: 20 }}>
      <FormItem name='typeValue' label='typeValue' style={{ display: 'none' }}><Input/></FormItem>
      <FormItem
        name="type"
        label="选择方式"
        onChange={e => {
          core.setValue('typeValue', '')
          if (e.target.value === '角色') {
            setUserTargetKeys([])
          } else {
            setRoleSelectedKeys([])
            setRoleTargetKeys([])
            core.setValue('haveStarterDept', [''])
          }
        }}>
        <Radio.Group
          options={[
            { label: '角色', value: '角色' },
            { label: '用户', value: '用户' }]}/>
      </FormItem>
      <If when={values => values.type === '角色'}>
        <div>
          <FormItem name='haveStarterDept'>
            <Checkbox.Group options={[{ label: '提交人部门', value: '提交人部门' }]}/>
          </FormItem>
          <div>
            <FormItem>
              <div>
                <Transfer
                  dataSource={roleArr}
                  titles={['待选角色', '已有角色']}
                  targetKeys={roleTargetKeys}
                  selectedKeys={roleSelectedKeys}
                  onChange={onChange}
                  onSelectChange={onSelectChange}
                  render={item => item.title}
                  showSelectAll={false}
                />
              </div>
            </FormItem>
          </div>
        </div>
      </If>
      <If when={values => values.type === '用户'}>
        <div>
          <FormItem>
            <div style={{ width: 500 }}>
              <UserTreeTransfer
                dataSource={userTree}
                targetKeys={userTargetKeys}
                onChange={keys => {
                  let tmp = []
                  keys.forEach(key => {
                    if (key.indexOf('user') === 0) {
                      tmp.push(key)
                    }
                  })
                  core.setValue('typeValue', tmp.join(','))
                  setUserTargetKeys(tmp)
                }}
              />
            </div>
          </FormItem>
        </div>
      </If>
    </Form>
  </ConfigProvider>
}

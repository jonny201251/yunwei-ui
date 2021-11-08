import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem, If } from 'noform'
import { AutoComplete, Input, Radio } from 'nowrapper/lib/antd'
import { Tree } from 'antd'

export default (props) => {
  const [core] = useState(new FormCore())
  const [checkedKeys, setCheckedKeys] = useState()

  const onCheck = (checkedKeys) => {
    setCheckedKeys(checkedKeys)
    if (checkedKeys.length > 0) {
      core.setValue('checkGroupIdArr', checkedKeys.map(item => parseInt(item)))
    } else {
      core.setValue('checkGroupIdArr', null)
    }
  }

  const [options, setOptions] = useState([])

  useEffect(() => {
    core.reset()
    core.setValue('userType', '给本人申请')
  }, [props])

  return <Form core={core} layout={{ label: 6, control: 18 }}>
    <FormItem name="userIdStr" style={{ display: 'none' }}><Input/></FormItem>
    <FormItem label="选择类型" name="userType">
      <Radio.Group
        options={[
          { label: '给本人申请', value: '给本人申请' },
          { label: '代其他人申请', value: '代其他人申请' }]}/>
    </FormItem>
    <If when={(values) => values.userType === '代其他人申请'}>
      <div style={{ marginLeft: 150 }}>
        <FormItem
          defaultMinWidth={false}
          name='userName'
          validateConfig={{ type: 'string', required: true, message: '责任人不能为空' }}
          onChange={(value) => {
            if (value) {
              let tmp = []
              props.userVL.forEach(item => {
                if (item.label.indexOf(value) >= 0) {
                  tmp.push(item)
                }
              })
              setOptions(tmp)
            } else {
              setOptions([])
            }
          }}
          onSelect={(value, option) => {
            core.setValue('userName', option.props.children.split('.')[0])
            core.setValue('userIdStr', value)
          }}
        >
          <AutoComplete options={options} placeholder={'模糊查询'} style={{ width: 150 }}/>
        </FormItem>
      </div>
    </If>
    <FormItem name="checkGroupIdArr" style={{ display: 'none' }}><Input/></FormItem>
    {
      props.groupTree.length > 0 && <FormItem label={'选择类别'}>
        <Tree
          treeData={props.groupTree}
          checkedKeys={checkedKeys}
          checkable
          defaultExpandAll
          onCheck={onCheck}
        />
      </FormItem>
    }
  </Form>
}

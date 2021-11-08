import React, { useEffect, useState } from 'react'
import { Col, Divider, message, Row, Tabs } from 'antd'
import Form, { FormCore, FormItem, Item } from 'noform'
import { Checkbox, Dialog, Input } from 'nowrapper/lib/antd'
import { ajax, formRule, sysDeptPath, sysRolePath, sysUserPath, width } from '../../utils'
import getFormItem from './getFormItem'
import _ from 'lodash'
import CheckUserTransfer from './CheckUserTransfer'
import ProcessGraph from './ProcessGraph'
import ProcessInstanceNodeList from '../ProcessInstanceNode/List'

const { TabPane } = Tabs

//用于待办任务
export default (props) => {
  const [core] = useState(new FormCore())
  useEffect(() => {
    core.reset()
    //表单的日期处理
    let values = formRule.dateHandle('parse', JSON.parse(props.processFormValue1.value))

    core.setValues(values)
    // 是否允许修改表单
    if (props.checkProcessConditionVO) {
      if (props.checkProcessConditionVO.haveEditForm === '否') {
        core.setStatus('disabled')
        //操作记录
        if (props.checkProcessConditionVO.haveOperate === '是') {
          core.setStatus('operate', 'edit')
        }
        //审批意见
        if (props.checkProcessConditionVO.haveComment === '是') {
          core.setStatus('comment', 'edit')
        }
      }
    }
  }, [])

  /*
    formTree:表单树
    level:字段组递归的层次，方便缩进
    colNum:一行几列
   */
  const renderFormItem = (formTree, level, colNum) => {
    let resultArr = [], tmpArr = []
    formTree.forEach(item => {
      if (item.flag === '字段组类型') {
        if (props.selectGroupIdArr && _.indexOf(props.selectGroupIdArr, item.id) >= 0) {
          resultArr.push(
            <Row style={{
              border: '1px solid #f0f0f0',
              background: '#f0f0f0',
              marginTop: -10,
              marginLeft: (level - 1) * 100,
              marginRight: (level - 1) * 100
            }}>
              <Col span={24 / colNum}>
                <FormItem label={item.label} colon={false} style={{ fontWeight: 'bolder' }}/>
              </Col>
            </Row>
          )
          resultArr.push(
            <Row style={{
              border: '1px solid #f0f0f0',
              paddingTop: 20,
              paddingBottom: 10,
              marginBottom: 20,
              marginLeft: (level - 1) * 100,
              marginRight: (level - 1) * 100
            }} gutter={[8, 16]}>
              {renderFormItem(item.children, level + 1, item.groupLayout)}
            </Row>
          )
        }
      } else if (item.flag === '表类型') {
        resultArr.push(
          <Row style={{
            border: '1px solid #f0f0f0',
            background: '#f0f0f0',
            marginTop: 10,
            marginLeft: (level - 1) * 100,
            marginRight: (level - 1) * 100
          }}>
            <Col span={24 / colNum}><FormItem label={item.label} colon={false} style={{ fontWeight: 'bolder' }}/></Col>
          </Row>
        )
        resultArr.push(
          <Row style={{
            border: '1px solid #f0f0f0',
            paddingTop: 20,
            marginBottom: 20,
            marginLeft: (level - 1) * 100,
            marginRight: (level - 1) * 100
          }} gutter={[8, 16]}>
            {
              props.tableData && props.tableData[item.type.split('.')[0]].map((itemm, index, arr) => {
                return <Col span={24 / colNum}>
                  <FormItem label={itemm.label.split('.')[1]} name={itemm.name}>
                    <Input disabled style={{ width: width }}/></FormItem>
                </Col>
              })
            }
          </Row>
        )
      } else {
        tmpArr.push(<Col span={24 / colNum}>{getFormItem(item, core)}</Col>)
        if (tmpArr.length === colNum) {
          resultArr.push(<Row gutter={[8, 16]}>{tmpArr}</Row>)
          tmpArr = []
        }
      }
    })
    if (tmpArr.length > 0) {
      resultArr.push(<Row>{tmpArr}</Row>)
    }
    return resultArr
  }

  const [roleArr, setRoleArr] = useState()
  const [userTree, setUserTree] = useState()
  useEffect(async () => {
    if (props.checkProcessConditionVO && props.checkProcessConditionVO.haveNextUser === '是') {
      const data1 = await ajax.get(sysRolePath.getRoleKT)
      data1 && setRoleArr(data1)
      const data2 = await ajax.get(sysDeptPath.getDeptUserTree)
      data2 && setUserTree(data2)
    }
  }, [])
  //是否有下一步处理人
  const renderHaveNextUser = () => {
    if (props.checkProcessConditionVO && props.checkProcessConditionVO.haveNextUser === '是') {
      return <div>
        <Row style={{
          border: '1px solid #f0f0f0',
          background: '#f0f0f0',
          marginTop: 10
        }}>
          <Col span={24 / props.processDefinition.formLayout}>
            <FormItem label={'指定下一步处理人'} colon={false} style={{ fontWeight: 'bolder' }}/></Col>
        </Row>
        <FormItem name='type' label='type' style={{ display: 'none' }}><Input/></FormItem>
        <FormItem name='typeValue' label='typeValue' style={{ display: 'none' }}><Input/></FormItem>
        <FormItem name='haveStarterDept' label='haveStarterDept' style={{ display: 'none' }}><Input/></FormItem>
        <Row style={{
          border: '1px solid #f0f0f0',
          paddingTop: 20,
          marginBottom: 20
        }} gutter={[8, 16]}>
          <Col span={24 / props.processDefinition.formLayout}>
            <FormItem label='处理人' required>
              <div>
                <FormItem name={'typeLabelErrMsg'} style={{ display: 'none' }}><Input/></FormItem>
                <Item
                  name='typeLabel'
                  validateConfig={{
                    type: 'string',
                    required: true,
                    message: '处理人不能为空'
                  }}
                >
                  <Input style={{ width: width, marginRight: 5 }} disabled/>
                </Item>
                <a onClick={() => {
                  Dialog.show({
                    title: '处理人',
                    footerAlign: 'label',
                    locale: 'zh',
                    width: 700,
                    content: <CheckUserTransfer roleArr={roleArr} userTree={userTree}/>,
                    onOk: async (values, hide) => {
                      if (values.type === '角色') {
                        if (!values.typeValue) {
                          message.error('角色不能为空')
                          return
                        }
                        const data = await ajax.get(sysRolePath.getRoleNameStr, { idArr: values.typeValue.split(',').map(item => item) })
                        if (data) {
                          core.setValues({ type: values.type, typeLabel: data, typeValue: values.typeValue })
                          if (values.haveStarterDept && values.haveStarterDept.length > 0) {
                            core.setValue('haveStarterDept', values.haveStarterDept.join(','))
                          }
                          hide()
                        }
                      } else {
                        if (!values.typeValue) {
                          message.error('用户不能为空')
                          return
                        }
                        const data = await ajax.get(sysUserPath.getNameStr, { idArr: values.typeValue.replaceAll('user', '').split(',').map(item => item) })
                        if (data) {
                          core.setValues({
                            haveStarterDept: null,
                            type: values.type,
                            typeLabel: data,
                            typeValue: values.typeValue.replaceAll('user', '')
                          })
                          hide()
                        }
                      }
                    }
                  })
                }} style={{ fontSize: 15 }}>选择</a>
                <Item render={(values, context) => {
                  if (values['typeLabelErrMsg']) {
                    return <div style={{ color: 'red' }}>{values['typeLabelErrMsg']}</div>
                  }
                  return null
                }}/>
              </div>
            </FormItem>
          </Col>
        </Row>
      </div>
    }
  }
  //是否有操作记录
  const renderHaveOperate = () => {
    if (props.checkProcessConditionVO && props.checkProcessConditionVO.haveOperate === '是') {
      return <div>
        <Row style={{
          border: '1px solid #f0f0f0',
          background: '#f0f0f0',
          marginTop: 10
        }}>
          <Col span={24 / props.processDefinition.formLayout}>
            <FormItem label={'操作类型'} colon={false} style={{ fontWeight: 'bolder' }}/>
          </Col>
        </Row>
        <Row style={{
          border: '1px solid #f0f0f0',
          paddingTop: 20,
          marginBottom: 20
        }} gutter={[8, 16]}>
          <Col span={24 / props.processDefinition.formLayout}>
            <FormItem label={'操作类型'} name="operate" value={['其他操作']}>
              <Checkbox.Group options={props.operateArr.map(val => ({ label: val, value: val }))}/>
            </FormItem>
          </Col>
        </Row>
      </div>
    }
  }
  //是否有 意见/备注
  const renderHaveComment = () => {
    if (props.checkProcessConditionVO && props.checkProcessConditionVO.haveComment === '是') {
      return <div>
        <Divider style={{ fontSize: 14, lineHeight: 0, paddingTop: 20 }}>以下是审批或处理信息</Divider>
        <Row style={{
          border: '1px solid #f0f0f0',
          background: '#f0f0f0',
          marginTop: 10
        }}>
          <Col span={24 / props.processDefinition.formLayout}>
            <FormItem label={props.checkProcessConditionVO.commentTitle}
                      colon={false}
                      style={{ fontWeight: 'bolder' }}/>
          </Col>
        </Row>
        <Row style={{
          border: '1px solid #f0f0f0',
          paddingTop: 20,
          marginBottom: 20
        }} gutter={[8, 16]}>
          <Col span={24 / props.processDefinition.formLayout}>
            <FormItem label={props.checkProcessConditionVO.commentTitle} name="comment">
              <Input.TextArea style={{ width: width }}/>
            </FormItem>
          </Col>
        </Row>
      </div>
    }
  }
  return <Form core={core} layout={{ label: 8, control: 16 }}>
    <Tabs animated={false}>
      <TabPane tab="表单" key="1">
        <FormItem name="asset" style={{ display: 'none' }}><Input/></FormItem>
        {renderFormItem(props.formTree, 1, props.processDefinition.formLayout)}
        {renderHaveOperate()}
        {renderHaveComment()}
        {renderHaveNextUser()}
      </TabPane>
      <TabPane tab="流程图" key="2">
        <ProcessGraph record={props.record}/>
      </TabPane>
      <TabPane tab="审批记录" key="3">
        <ProcessInstanceNodeList record={props.record}/>
      </TabPane>
    </Tabs>
  </Form>
}

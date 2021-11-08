import React, { useEffect, useState } from 'react'
import { Col, message, Row } from 'antd'
import Form, { FormCore, FormItem, Item } from 'noform'
import { Dialog, Input } from 'nowrapper/lib/antd'
import { ajax, processFormTemplatePath, sysDeptPath, sysRolePath, sysUserPath, width } from '../../utils'
import getFormItem from './getFormItem'
import AsDeviceCommonQuery from './AsDeviceCommonQuery'
import _ from 'lodash'
import CheckUserTransfer from './CheckUserTransfer'


export default (props) => {
  const [core] = useState(new FormCore())
  //表类型中资产设备真实的数据 自定义表id-as_id
  const [assetMap, setAssetMap] = useState(new Map())

  const selectAsset = async (item) => {
    Dialog.show({
      title: '选择资产',
      footerAlign: 'label',
      locale: 'zh',
      enableValidate: true,
      width: 1000,
      content: <AsDeviceCommonQuery/>,
      onOk: async (values, hide) => {
        if (!values.asDeviceCommonId) {
          message.error('选择一个资产')
          return
        }
        const customTableId = parseInt(item.name.split('.')[0])
        const data = await ajax.get(processFormTemplatePath.getTableTypeDbData, {
          customTableId: customTableId,
          asDeviceCommonId: values.asDeviceCommonId,
          processDefinitionId: props.record.id
        })
        if (data) {
          core.setValues(data)
          //
          let tmpMap = _.cloneDeep(assetMap)
          tmpMap.set(customTableId, values.asDeviceCommonId)
          setAssetMap(tmpMap)
          //
          let assetArr = []
          tmpMap.forEach((value, key) => {
            assetArr.push({ customTableId: key, asId: value })
          })
          core.setValue('asset', assetArr)
          hide()
        }
      }
    })
  }

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
            }}>
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
                if (index === 0) {
                  return <Col span={24 / colNum}>
                    <FormItem label={itemm.label.split('.')[1]} required>
                      <div>
                        <FormItem name={itemm.name + 'ErrMsg'} style={{ display: 'none' }}><Input/></FormItem>
                        <Item name={itemm.name}
                              validateConfig={{
                                type: 'string',
                                required: true,
                                message: itemm.label.split('.')[1] + '不能为空'
                              }}
                        >
                          <Input disabled style={{ width: width, marginRight: 5 }}/>
                        </Item>
                        <a style={{ fontSize: 15 }} onClick={() => selectAsset(itemm)}>选择</a>
                        <Item render={(values, context) => {
                          if (values[itemm.name + 'ErrMsg']) {
                            return <div style={{ color: 'red' }}>{values[itemm.name + 'ErrMsg']}</div>
                          }
                          return null
                        }}/>
                      </div>
                    </FormItem>
                  </Col>
                } else {
                  return <Col span={24 / colNum}>
                    <FormItem label={itemm.label.split('.')[1]} name={itemm.name}>
                      <Input disabled style={{ width: width }}/></FormItem>
                  </Col>
                }
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
    if (props.startProcessConditionVO && props.startProcessConditionVO.haveNextUser === '是') {
      const data1 = await ajax.get(sysRolePath.getRoleKT)
      data1 && setRoleArr(data1)
      const data2 = await ajax.get(sysDeptPath.getDeptUserTree)
      data2 && setUserTree(data2)
    }
  }, [])
  //是否有下一步处理人
  const renderHaveNextUser = () => {
    if (props.startProcessConditionVO && props.startProcessConditionVO.haveNextUser === '是') {
      return <div>
        <Row style={{
          border: '1px solid #f0f0f0',
          background: '#f0f0f0',
          marginTop: 10
        }}>
          <Col span={24 / props.record.formLayout}>
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
          <Col span={24 / props.record.formLayout}>
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

  return <Form core={core} layout={{ label: 8, control: 16 }}>
    <FormItem name="asset" style={{ display: 'none' }}><Input/></FormItem>
    {renderFormItem(props.formTree, 1, props.record.formLayout)}
    {renderHaveNextUser()}
  </Form>
}

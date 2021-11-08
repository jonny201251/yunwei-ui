import React, { useState } from 'react'
import { Button, message } from 'antd'
import { Dialog } from 'nowrapper/lib/antd'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import {
  ajax,
  formRule,
  listFormatBefore,
  processDefinitionPath,
  processFormTemplatePath,
  processInstanceDataPath,
  session,
  sysUserPath
} from '../../utils'
import { Space } from '../../components'
import ProcessFormForStart from './ProcessFormForStart'
import SelectUserGroup from './SelectUserGroup'


export default () => {
  const [list, setList] = useState()

  const buttonRender = (record) => {
    let arr = []
    //发起流程按钮
    const startProcessMap = session.getItem('startProcessButtonMap')
    const buttonItem = startProcessMap[record.id]
    if (buttonItem) {
      arr.push(<a onClick={() => onClick(record, buttonItem.permissionType)}>{buttonItem.name}</a>)
    }
    return arr
  }

  const onClick = async (record, type) => {
    if (type === 'startProcess') {
      //
      const userVL = await ajax.get(sysUserPath.getUserVL)
      const groupTree = await ajax.get(processFormTemplatePath.getFormTemplateGroupTree, { processDefinitionId: record.id })
      //选择责任人和字段组
      let userType, userIdStr, userName, selectGroupIdArr
      Dialog.show({
        title: '表单选项',
        footerAlign: 'right',
        locale: 'zh',
        enableValidate: true,
        width: 450,
        content: <SelectUserGroup record={record} userVL={userVL} groupTree={groupTree}/>,
        onOk: async (values, hide) => {
          //责任人
          userType = values.userType
          if (values.userType === '代其他人申请') {
            userName = values.userName
            if (values.userIdStr && values.userIdStr.indexOf(values.userName) > 0) {
              userIdStr = values.userIdStr
            }
          }
          //字段组
          const data = await ajax.get(processFormTemplatePath.getSelectGroupIdList, {
            processDefinitionId: record.id,
            checkGroupIdArr: values.checkGroupIdArr
          })
          if (data) {
            selectGroupIdArr = data
          }
          hide()
          //预加载数据,可以解决屏闪问题
          const formTree = await ajax.get(processFormTemplatePath.getFormTemplateTree, { processDefinitionId: record.id })
          const tableData = await ajax.get(processFormTemplatePath.getTableTypeVO, { processDefinitionId: record.id })
          const startProcessConditionVO = await ajax.get(processInstanceDataPath.getStartProcessConditionVO, { processDefinitionId: record.id })
          Dialog.show({
            title: record.processName,
            footerAlign: 'right',
            locale: 'zh',
            enableValidate: true,
            width: record.width,
            content: <ProcessFormForStart
              record={record}
              formTree={formTree}
              tableData={tableData}
              selectGroupIdArr={selectGroupIdArr}
              startProcessConditionVO={startProcessConditionVO}/>,
            footer: (hide, { _, ctx: core }) => {
              let onClick = async (buttonName) => {
                let errorArr = await core.validate()
                if (errorArr) {
                  Object.keys(errorArr).forEach(key => {
                    /*
                       key=16.计算机信息表.as_device_common.no.1
                       key=typeLabel
                     */
                    if (key.split('.').length === 5 || key === 'typeLabel') {
                      core.setValue(key + 'ErrMsg', errorArr[key])
                    }
                  })
                  message.error('请检查必填项')
                } else {
                  let values = core.getValues()
                  //表单的日期处理
                  values = formRule.dateHandle('stringify', values)
                  //表单的ErrMsg处理
                  values = formRule.errMsgHandle(values)
                  let startVO = {
                    buttonName: buttonName,
                    processDefinitionId: record.id,
                    value: null,
                    value2List: []
                  }
                  if (values.asset) {
                    startVO.value2List = values.asset
                  }
                  if (userType) {
                    startVO.userType = userType
                  }
                  if (userIdStr) {
                    startVO.userIdStr = userIdStr
                  }
                  if (userName) {
                    startVO.userName = userName
                  }
                  if (selectGroupIdArr && selectGroupIdArr.length > 0) {
                    startVO.selectGroupId = selectGroupIdArr.join(',')
                  }
                  //是否有下一步处理人
                  startVO.haveNextUser = startProcessConditionVO.haveNextUser
                  if (startProcessConditionVO.haveNextUser === '是') {
                    startVO.type = values.type
                    startVO.typeValue = values.typeValue
                    startVO.typeLabel = values.typeLabel
                    if (values.haveStarterDept) {
                      startVO.haveStarterDept = values.haveStarterDept
                      delete values.haveStarterDept
                    }
                    delete values.type
                    delete values.typeValue
                    delete values.typeLabel
                  }
                  startVO.value = JSON.stringify(values)
                  console.log(startVO);
                  const data = await ajax.post(processInstanceDataPath.start, startVO)
                  if (data) {
                    hide()
                    list.refresh()
                    message.success('发起成功')
                  }
                }
              }
              let btnArr = []
              if (startProcessConditionVO && startProcessConditionVO.buttonNameList) {
                startProcessConditionVO.buttonNameList.forEach(buttonName => {
                  btnArr.push(<Button onClick={() => {
                    onClick(buttonName)
                  }} type={'primary'}>{buttonName}</Button>)
                })
              } else {
                btnArr.push(<Button onClick={() => {
                  onClick(null)
                }} type={'primary'}>提交</Button>)
              }
              btnArr.push(<Button onClick={() => {
                hide()
              }}>取消</Button>)
              return <Space style={{ marginTop: 25, textAlign: 'center' }}>{btnArr}</Space>
            }
          })
        }
      })
    }
  }

  const renderOperation = (text, record, idx) => {
    return <Space>
      {buttonRender(record)}
    </Space>
  }

  return <div>
    <List url={processDefinitionPath.list} onMount={list => setList(list)} formatBefore={listFormatBefore}>
      <Table>
        <Table.Column title="流程名称" dataIndex="processName"/>
        <Table.Column title="流程分类" dataIndex="processType"/>
        <Table.Column title="操作" render={renderOperation}/>
      </Table>
      <Pagination showTotal={total => `共${total}条`}/>
    </List>
  </div>
}

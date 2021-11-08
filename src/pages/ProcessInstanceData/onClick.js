import React from 'react'
import {
  ajax,
  formRule,
  processDefinitionPath,
  processFormTemplatePath,
  processFormValue1Path,
  processInstanceDataPath,
  sysDicPath
} from '../../utils'
import { Dialog } from 'nowrapper/lib/antd'
import ProcessFormForComplete from '../ProcessDefiniton/ProcessFormForComplete'
import ProcessFormForCheck from '../ProcessDefiniton/ProcessFormForCheck'
import ProcessFormForModify from '../ProcessDefiniton/ProcessFormForModify'
import { Button, message } from 'antd'
import { Space } from '../../components'

//待办任务
export const onClickForMy = async (record, list) => {
  //processDefinition
  const processDefinition = await ajax.get(processDefinitionPath.get, { processDefinitionId: record.processDefinitionId })
  //processFormValue1
  const processFormValue1 = await ajax.get(processFormValue1Path.get, {
    processDefinitionId: record.processDefinitionId,
    actProcessInstanceId: record.actProcessInstanceId
  })
  //预加载数据,可以解决屏闪问题
  const formTree = await ajax.get(processFormTemplatePath.getFormTemplateTree, { processDefinitionId: record.processDefinitionId })
  const tableData = await ajax.get(processFormTemplatePath.getTableTypeVO, { processDefinitionId: record.processDefinitionId })
  const checkProcessConditionVO = await ajax.get(processInstanceDataPath.getCheckProcessConditionVO, {
    processDefinitionId: record.processDefinitionId,
    actProcessInstanceId: record.actProcessInstanceId
  })
  const operateArr = await ajax.get(sysDicPath.getDicValueList, { flag: '操作类型' })
  if (processDefinition && processFormValue1 && formTree) {
    Dialog.show({
      title: record.processName,
      footerAlign: 'right',
      locale: 'zh',
      enableValidate: true,
      width: processDefinition.width,
      content: <ProcessFormForCheck
        record={record}
        formTree={formTree}
        tableData={tableData}
        selectGroupIdArr={processFormValue1.selectGroupId.split(',').map(item => parseInt(item))}
        processDefinition={processDefinition}
        processFormValue1={processFormValue1}
        checkProcessConditionVO={checkProcessConditionVO}
        operateArr={operateArr}
      />,
      footer: (hide, { _, ctx: core }) => {
        let onClick = async (buttonName) => {
          let errorArr = await core.validate()
          if (errorArr) {
            Object.keys(errorArr).forEach(key => {
              // key=typeLabel
              if (key === 'typeLabel') {
                core.setValue(key + 'ErrMsg', errorArr[key])
              }
            })
            message.error('请检查必填项')
          } else {
            let checkVO = {
              processInstanceDataId: record.id,
              buttonName: buttonName,
              value: null
            }
            let values = core.getValues()
            checkVO.haveEditForm = checkProcessConditionVO.haveEditForm
            if (checkProcessConditionVO.haveEditForm === '是') {
              //表单的日期处理
              values = formRule.dateHandle('stringify', values)
              //表单的ErrMsg处理
              values = formRule.errMsgHandle(values)
            }
            //是否有下一步处理人
            checkVO.haveNextUser = checkProcessConditionVO.haveNextUser
            if (checkProcessConditionVO.haveNextUser === '是') {
              checkVO.type = values.type
              checkVO.typeValue = values.typeValue
              checkVO.typeLabel = values.typeLabel
              if (values.haveStarterDept) {
                checkVO.haveStarterDept = values.haveStarterDept
                delete values.haveStarterDept
              }
              delete values.type
              delete values.typeValue
              delete values.typeLabel
            }
            //是否有审批意见
            checkVO.haveComment = checkProcessConditionVO.haveComment
            if (checkProcessConditionVO.haveComment === '是') {
              checkVO.comment = values.comment
              delete values.comment
            }
            //是否有操作记录
            checkVO.haveOperate = checkProcessConditionVO.haveOperate
            if (checkProcessConditionVO.haveOperate === '是') {
              if (values.operate) {
                checkVO.operate = values.operate.join(',')
              }
              delete values.operate
            }
            checkVO.value = JSON.stringify(values)
            const data = await ajax.post(processInstanceDataPath.handle, checkVO)
            if (data) {
              hide()
              list.refresh()
              message.success((buttonName || '提交') + '成功')
            }
          }
        }
        let btnArr = []
        if (checkProcessConditionVO && checkProcessConditionVO.buttonNameList) {
          checkProcessConditionVO.buttonNameList.forEach(buttonName => {
            btnArr.push(<Button onClick={() => {
              onClick(buttonName)
            }} type={'primary'}>{buttonName}</Button>)
          })
          btnArr.push(<Button onClick={() => {
            hide()
          }}>取消</Button>)
        } else {
          btnArr.push(<Button onClick={() => {
            onClick(null)
          }} type={'primary'}>提交</Button>)
          btnArr.push(<Button onClick={() => {
            hide()
          }}>取消</Button>)
        }
        return <Space style={{ marginTop: 25, textAlign: 'center' }}>{btnArr}</Space>
      }
    })
  }
}
//流程实例的修改表单
export const onClickForModify = async (record, list) => {
  //processDefinition
  const processDefinition = await ajax.get(processDefinitionPath.get, { processDefinitionId: record.processDefinitionId })
  //processFormValue1
  const processFormValue1 = await ajax.get(processFormValue1Path.get, {
    processDefinitionId: record.processDefinitionId,
    actProcessInstanceId: record.actProcessInstanceId
  })
  //预加载数据,可以解决屏闪问题
  const formTree = await ajax.get(processFormTemplatePath.getFormTemplateTree, { processDefinitionId: record.processDefinitionId })
  const tableData = await ajax.get(processFormTemplatePath.getTableTypeVO, { processDefinitionId: record.processDefinitionId })
  if (processDefinition && processFormValue1 && formTree) {
    Dialog.show({
      title: record.processName,
      footerAlign: 'right',
      locale: 'zh',
      enableValidate: true,
      width: processDefinition.width,
      content: <ProcessFormForModify
        record={record}
        formTree={formTree}
        tableData={tableData}
        selectGroupIdArr={processFormValue1.selectGroupId.split(',').map(item => parseInt(item))}
        processDefinition={processDefinition}
        processFormValue1={processFormValue1}
      />,
      footer: (hide, { _, ctx: core }) => {
        return <Space style={{ marginTop: 25, textAlign: 'center' }}>
          <Button onClick={async () => {
            let errorArr = await core.validate()
            if (!errorArr) {
              let values = core.getValues()
              //表单的日期处理
              values = formRule.dateHandle('stringify', values)
              let VO = {
                processFormValue1Id: record.businessId,
                value: JSON.stringify(values)
              }
              const data = await ajax.post(processInstanceDataPath.modify, VO)
              if (data) {
                hide()
                list.refresh()
                message.success('修改成功')
              }
            }
          }
          } type='primary'>修改</Button>
          <Button onClick={() => {
            hide()
          }}>取消</Button>
        </Space>
      }
    })
  }
}
//当前工单
export const onClickForCurrent = async (record) => {
  //processDefinition
  const processDefinition = await ajax.get(processDefinitionPath.get, {
    processDefinitionId:
    record.processDefinitionId
  })
  //processFormValue1
  const processFormValue1 = await ajax.get(processFormValue1Path.get, {
    processDefinitionId: record.processDefinitionId,
    actProcessInstanceId: record.actProcessInstanceId
  })
  //预加载数据,可以解决屏闪问题
  const formTree = await ajax.get(processFormTemplatePath.getFormTemplateTree, {
    processDefinitionId:
    record.processDefinitionId
  })
  const tableData = await ajax.get(processFormTemplatePath.getTableTypeVO, {
    processDefinitionId:
    record.processDefinitionId
  })
  const checkProcessConditionVO = await ajax.get(processInstanceDataPath.getCheckProcessConditionVO, {
    processDefinitionId: record.processDefinitionId,
    actProcessInstanceId: record.actProcessInstanceId
  })
  const operateArr = await ajax.get(sysDicPath.getDicValueList, { flag: '操作类型' })
  if (processDefinition && processFormValue1 && formTree) {
    Dialog.show({
      title: record.processName,
      footerAlign: 'right',
      locale: 'zh',
      enableValidate: true,
      width: processDefinition.width,
      content: <ProcessFormForComplete
        record={record}
        formTree={formTree}
        tableData={tableData}
        selectGroupIdArr={processFormValue1.selectGroupId.split(',').map(item => parseInt(item))}
        processDefinition={processDefinition}
        processFormValue1={processFormValue1}
        checkProcessConditionVO={checkProcessConditionVO}
        operateArr={operateArr}
      />,
      footer: () => {
      }
    })
  }
}
//已办任务、流程实例、历史工单
export const onClickForComplete = async (record) => {
  //processDefinition
  const processDefinition = await ajax.get(processDefinitionPath.get, { processDefinitionId: record.processDefinitionId })
  //processFormValue1
  const processFormValue1 = await ajax.get(processFormValue1Path.get, {
    processDefinitionId: record.processDefinitionId,
    actProcessInstanceId: record.actProcessInstanceId
  })
  //预加载数据,可以解决屏闪问题
  const formTree = await ajax.get(processFormTemplatePath.getFormTemplateTree, { processDefinitionId: record.processDefinitionId })
  const tableData = await ajax.get(processFormTemplatePath.getTableTypeVO, { processDefinitionId: record.processDefinitionId })
  if (processDefinition && processFormValue1 && formTree) {
    Dialog.show({
      title: record.processName,
      footerAlign: 'right',
      locale: 'zh',
      enableValidate: true,
      width: processDefinition.width,
      content: <ProcessFormForComplete
        record={record}
        formTree={formTree}
        tableData={tableData}
        selectGroupIdArr={processFormValue1.selectGroupId.split(',').map(item => parseInt(item))}
        processDefinition={processDefinition}
        processFormValue1={processFormValue1}
      />,
      footer: () => {
      }
    })
  }
}

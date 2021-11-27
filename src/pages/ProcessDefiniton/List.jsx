import React, { useState } from 'react'
import { Button, message, Modal, Steps } from 'antd'
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
import { LoadingButton, QueryCondition, Space } from '../../components'
import OperateButton from './OperateButton'
import { useModel } from 'umi'
import Form1 from './Form1'
import Form2 from './Form2'
import Form3 from './Form3'
import ProcessFormForStart from './ProcessFormForStart'
import SelectUserGroup from './SelectUserGroup'

//这是form3的回调函数
let getForm3DataFunction

export default () => {
  const { current, setCurrent, modalVisit, setModalVisit, title, setTitle, form1Core, map, setMap, setForm1Data, setForm3Data, type, setType } = useModel('useProcessDefinition')
  const [list, setList] = useState()


  const [loading, setLoading] = useState(false)

  const buttonRender = (record) => {
    let arr = []
    //发起流程按钮
    const startProcessMap = session.getItem('startProcessButtonMap')
    const buttonItem = startProcessMap[record.id]
    if (buttonItem) {
      arr.push(<a onClick={() => onClick(record, buttonItem.permissionType)}>{buttonItem.name}</a>)
    }
    //
    const buttonArr = session.getItem('dataListButtonMap')[processDefinitionPath.flag]
    if (buttonArr) {
      buttonArr.forEach(item => {
        arr.push(<a onClick={() => onClick(record, item.permissionType)}>{item.name}</a>)
      })
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
                  btnArr.push(<LoadingButton onClick={onClick} param={buttonName}
                                             type={'primary'}>{buttonName}</LoadingButton>)
                })
              } else {
                btnArr.push(<LoadingButton onClick={onClick} type={'primary'}>提交</LoadingButton>)
              }
              btnArr.push(<Button onClick={() => {
                hide()
              }}>取消</Button>)
              return <Space style={{ marginTop: 25, textAlign: 'center' }}>{btnArr}</Space>
            }
          })
        }
      })
    } else if (type === 'edit') {
      //获取form1、form2、form3的数据
      const data = await ajax.get(processDefinitionPath.getProcessDefinitionVO, { processDefinitionId: record.id })
      if (data) {
        //form1
        setForm1Data(data.processDefinition)
        //form2
        let initMap = new Map()
        initMap.set('group', [])

        let count = 10
        Object.keys(data.formTemplateMap).forEach((key) => {
          let tmp = []
          data.formTemplateMap[key].forEach(item => {
            item.index = count
            count++
            tmp.push(item)
          })
          initMap.set(key, tmp)
        })

        initMap.set('index', count)
        setMap(initMap)
        //form3
        setForm3Data({
          bpmnXml: data.processDefinition.bpmnXml,
          nodeList: data.taskList,
          edgeList: data.edgeList
        })

        setType('edit')
        setTitle('修改流程')
        setModalVisit(true)
      }
    } else if (type === 'copy') {
      Dialog.show({
        title: '提示',
        footerAlign: 'right',
        locale: 'zh',
        width: 400,
        content: <p style={{ fontSize: 15 }}>确定要复制<span style={{ color: 'red' }}>{record.processName}</span></p>,
        onOk: async (values, hide) => {
          const data = await ajax.get(processDefinitionPath.copy, { processDefinitionId: record.id })
          if (data) {
            hide()
            list.refresh()
            message.success('复制成功')
          }
        }
      })
    } else if (type === 'delete') {
      Dialog.show({
        title: '提示',
        footerAlign: 'right',
        locale: 'zh',
        width: 400,
        content: <p style={{ fontSize: 15 }}>确定要删除<span style={{ color: 'red' }}>{record.processName}</span></p>,
        onOk: async (values, hide) => {
          const data = await ajax.get(processDefinitionPath.delete, { processDefinitionId: record.id })
          if (data) {
            hide()
            list.refresh()
            message.success('删除成功')
          }
        }
      })
    }
  }

  const renderOperation = (text, record, idx) => {
    return <Space>
      {/*      <a onClick={() => onClick(record, 'startProcess')}>发起流程</a>
      <a onClick={() => onClick(record, 'edit')}>修改</a>
      <a onClick={() => onClick(record, 'copy')}>复制</a>
      <a onClick={() => onClick(record, 'delete')}>删除</a>*/}
      {buttonRender(record)}
    </Space>
  }

  return <div>
    <List url={processDefinitionPath.list} onMount={list => setList(list)} formatBefore={listFormatBefore}>
      <QueryCondition path={processDefinitionPath} list={list}/>
      <OperateButton path={processDefinitionPath}/>
      <Table>
        <Table.Column title="流程名称" dataIndex="processName"/>
        <Table.Column title="流程分类" dataIndex="processType"/>
        <Table.Column title="操作" render={renderOperation}/>
      </Table>
      <Pagination showTotal={total => `共${total}条`}/>
    </List>
    <Modal
      title={title}
      visible={modalVisit}
      style={{ top: 0 }}
      width={'100%'}
      okText={'保存流程定义'}
      onOk={async () => {
        setLoading(true)
        let data = { processDefinition: {}, formTemplateList: [], taskList: [], edgeList: [] }
        //表单1
        const errorArr = await form1Core.validate()

        if (errorArr) {
          message.error('基本信息不能为空')
          return
        }
        data.processDefinition = form1Core.getValues()
        //表单2
        map.forEach((value, key, mapp) => {
          if (key === 'firstData') {
            data.formTemplateList = data.formTemplateList.concat(value)
          } else if (key !== 'index' || key !== 'group') {
            if (value.length > 0) {
              let tmp = []
              value.forEach(item => {
                item.groupParentLabel = key
                tmp.push(item)
              })
              data.formTemplateList = data.formTemplateList.concat(tmp)
            }
          }
        })
        if (data.formTemplateList.length === 0) {
          message.error('配置表单不能为空')
          return
        }
        //表单3
        let form3Data = getForm3DataFunction()
        if (!form3Data) return
        data.processDefinition.bpmnXml = form3Data.bpmnXml
        data.taskList = form3Data.nodeList
        data.edgeList = form3Data.edgeList
        //
        const dataa = await ajax.post(data.processDefinition.id ? processDefinitionPath.edit : processDefinitionPath.add, data)
        if (dataa) {
          //刷新
          list.refresh()
          //清空表单1、表单2、表单3
          form1Core.reset()
          let initMap = new Map()
          initMap.set('firstData', [])
          initMap.set('index', 1)
          initMap.set('group', [])
          setMap(initMap)
          setForm3Data(null)

          setType('add')
          setCurrent(0)
          setModalVisit(false)
          message.success('保存成功')
          setLoading(false)
        }
      }}
      confirmLoading={loading}
      onCancel={() => {
        //清空表单2
        let initMap = new Map()
        initMap.set('firstData', [])
        initMap.set('index', 1)
        initMap.set('group', [])
        setMap(initMap)

        setType('add')
        setCurrent(0)
        setModalVisit(false)
      }}
      keyboard={false}
    >
      <Steps current={current} onChange={current => setCurrent(current)}>
        <Steps.Step title="基本信息"/>
        <Steps.Step title="配置表单"/>
        <Steps.Step title="设计流程"/>
      </Steps>
      <div style={{ marginTop: 20, display: current === 0 ? 'block' : 'none' }}><Form1/></div>
      <div style={{ marginTop: 20, display: current === 1 ? 'block' : 'none' }}><Form2/></div>
      <div style={{ marginTop: 20, display: current === 2 ? 'block' : 'none' }}>
        <Form3
          get={(func) => {
            getForm3DataFunction = func
          }}
        />
      </div>
    </Modal>
  </div>
}

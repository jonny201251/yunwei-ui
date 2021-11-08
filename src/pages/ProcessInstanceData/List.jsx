import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import { ajax, listFormatBefore, processInstanceDataPath, session } from '../../utils'
import { QueryCondition, Space } from '../../components'
import { onClickForComplete, onClickForModify } from './onClick'
import { message } from 'antd';

//流程实例
export default () => {
  const [list, setList] = useState()

  const onClickForDelete = async (record) => {
    const data = await ajax.post(processInstanceDataPath.delete, record)
    if (data) {
      list.refresh()
      message.success('删除成功')
    }
  }

  const buttonRender = (record) => {
    let arr = []
    const buttonArr = session.getItem('dataListButtonMap')[processInstanceDataPath.flag]
    if (buttonArr) {
      buttonArr.forEach(item => {
        if (record.processStatus === '完成') {
          if (item.permissionType === 'preview') {
            arr.push(<a onClick={() => onClickForComplete(record)}>查看</a>)
          } else if (item.permissionType === 'delete') {
            arr.push(<a onClick={() => onClickForDelete(record)}>删除</a>)
          }
        } else {
          if (item.permissionType === 'preview') {
            arr.push(<a onClick={() => onClickForComplete(record)}>查看</a>)
          } else if (item.permissionType === 'edit') {
            arr.push(<a onClick={() => onClickForModify(record, list)}>修改</a>)
          } else if (item.permissionType === 'delete') {
            arr.push(<a onClick={() => onClickForDelete(record)}>删除</a>)
          }
        }
      })
    }
    return arr
  }

  const renderOperation = (text, record, idx) => {
    return <Space>{buttonRender(record)}</Space>
    /*    if (record.processStatus === '完成') {
          return <Space>
            <a onClick={() => onClickForComplete(record)}>查看</a>
            <a onClick={() => onClickForDelete(record)}>删除</a>
          </Space>
        } else {
          return <Space>
            <a onClick={() => onClickForComplete(record)}>查看</a>
            <a onClick={() => onClickForModify(record, list)}>修改</a>
            <a onClick={() => onClickForDelete(record)}>删除</a>
          </Space>
        }*/
  }

  return <List url={processInstanceDataPath.list}
               onMount={list => list && setList(list)} formatBefore={listFormatBefore}>
    <QueryCondition path={processInstanceDataPath} list={list}/>
    <Table>
      <Table.Column title="流程名称" dataIndex="processName"/>
      <Table.Column title="提交人" dataIndex="displayName"/>
      <Table.Column title="提交部门" dataIndex="deptName"/>
      <Table.Column title="流程状态" dataIndex="processStatus"/>
      <Table.Column title="当前步骤" dataIndex="displayCurrentStep"/>
      <Table.Column title="提交时间" dataIndex="startDatetime"/>
      <Table.Column title="完成时间" dataIndex="endDatetime"/>
      <Table.Column title="操作" render={renderOperation}/>
    </Table>
    <Pagination showTotal={total => `共${total}条`}/>
  </List>
}

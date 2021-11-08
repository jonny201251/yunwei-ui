import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import { listFormatBefore, processInstanceDataPath } from '../../utils'
import { Space } from '../../components';
import { onClickForComplete } from './onClick';

//历史工单
export default (props) => {
  const [list, setList] = useState()

  const renderOperation = (text, record, idx) => {
    return <Space>
      <a onClick={() => onClickForComplete(record)}>{record.processName}</a>
    </Space>
  }

  return <List url={processInstanceDataPath.historyList + '?asId=' + props.record['asDeviceCommon.id']}
               onMount={list => list && setList(list)} formatBefore={listFormatBefore}>
    <Table>
      <Table.Column title="流程名称" dataIndex="processName" render={renderOperation}/>
      <Table.Column title="提交人" dataIndex="displayName"/>
      <Table.Column title="提交部门" dataIndex="deptName"/>
      <Table.Column title="流程状态" dataIndex="processStatus"/>
      <Table.Column title="创建时间" dataIndex="startDatetime"/>
      <Table.Column title="完成时间" dataIndex="endDatetime"/>
    </Table>
    <Pagination showTotal={total => `共${total}条`}/>
  </List>
}

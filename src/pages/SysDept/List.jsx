import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import { dataListButtonRender, listFormatBefore, sysDeptPath } from '../../utils'
import { OperateButton, QueryCondition, Space } from '../../components'

export default () => {
  const [list, setList] = useState()

  const renderOperation = (text, record, idx) => {
    return <Space>
      {dataListButtonRender(sysDeptPath, list, record)}
    </Space>
  }

  return <List url={sysDeptPath.list} onMount={list => setList(list)} formatBefore={listFormatBefore}>
    <QueryCondition path={sysDeptPath} list={list}/>
    <OperateButton path={sysDeptPath} list={list}/>
    <Table>
      <Table.Column title="部门名称" dataIndex="name"/>
      <Table.Column title="操作" render={renderOperation}/>
    </Table>
    <Pagination showTotal={total => `共${total}条`}/>
  </List>
}

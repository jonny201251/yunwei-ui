import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import { asDeviceCommonPath, listFormatBefore } from '../../utils'
import { OperateButton, QueryCondition } from '../../components'

export default () => {
  const [list, setList] = useState()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  return <List url={asDeviceCommonPath.list} onMount={list => setList(list)} formatBefore={listFormatBefore}>
    <QueryCondition path={asDeviceCommonPath} list={list}/>
    <OperateButton path={asDeviceCommonPath} list={list}
                   selectedRowKeys={selectedRowKeys} setSelectedRowKeys={setSelectedRowKeys}
                   width={1000} footerAlign='right'/>
    <Table rowKey='id'
           rowSelection={{
             selectedRowKeys,
             onChange: (selectedRowKeys, selectedRows) => setSelectedRowKeys(selectedRowKeys)
           }}
    >
      <Table.Column title="资产编号" dataIndex="no"/>
      <Table.Column title="资产名称" dataIndex="name"/>
    </Table>
    <Pagination showTotal={total => `共${total}条`}/>
  </List>
}

import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import { listFormatBefore, sysUserPath } from '../../utils'
import { OperateButton, QueryCondition } from '../../components'
import { useModel } from 'umi'


export default () => {
  const [list, setList] = useState()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const { map } = useModel('useProcessDefinition')

  return <List url={sysUserPath.list} onMount={list => setList(list)} formatBefore={listFormatBefore}>
    <QueryCondition path={sysUserPath} list={list}/>
    <OperateButton path={sysUserPath} list={list} width={600}
                   selectedRowKeys={selectedRowKeys} setSelectedRowKeys={setSelectedRowKeys}/>
    <Table rowKey='id'
           rowSelection={{
             selectedRowKeys,
             onChange: (selectedRowKeys, selectedRows) => setSelectedRowKeys(selectedRowKeys)
           }}
    >
      <Table.Column title="登录账号" dataIndex="loginName"/>
      <Table.Column title="用户姓名" dataIndex="displayName"/>
    </Table>
    <Pagination showTotal={total => `共${total}条`}/>
  </List>
}

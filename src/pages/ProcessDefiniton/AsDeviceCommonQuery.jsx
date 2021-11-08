import Form, { FormCore, FormItem } from 'noform'
import { AutoComplete, Input } from 'nowrapper/lib/antd'
import { Button, Col, Row } from 'antd'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd';
import { ajax, asDeviceCommonPath, listFormatBefore, width } from '../../utils'
import React, { useEffect, useState } from 'react';
import { Space } from '../../components'

const core = new FormCore()

//查询表单方式二：利用noform
export default () => {
  const [list, setList] = useState()
  const [selectedRowKey, setSelectedRowKey] = useState()

  const onClick = (type) => {
    setSelectedRowKey(null)
    if (type === 'query') {
      let params = {}
      let values = core.getValues()
      Object.keys(values).forEach(key => {
        if (values[key]) {
          params[key] = values[key]
        }
      })
      list.setParams(params)
      list.refresh()
    } else {
      core.reset()
      list.setParams({})
      list.refresh()
    }
  }

  const [noOption, setNoOption] = useState()
  const [noOptionTmp, setNoOptionTmp] = useState()
  useEffect(async () => {
    const data = await ajax.get(asDeviceCommonPath.getAsDeviceCommonNoVL)
    if (data) {
      setNoOption(data)
      setNoOptionTmp(data)
    }
  }, [])

  return <Form core={core}>
    <FormItem name="asDeviceCommonId" value={selectedRowKey} style={{ display: 'none' }}><Input/></FormItem>
    <Row gutter={[8, 16]} style={{ marginBottom: 10 }}>
      <Col span={8}>
        <FormItem
          label="资产编号" name="no"
          onChange={(value) => {
            if (value) {
              let tmp = []
              noOption.forEach(item => {
                if (item.label.indexOf(value) >= 0) {
                  tmp.push(item)
                }
              })
              setNoOptionTmp(tmp)
            } else {
              setNoOptionTmp([])
            }
          }}
        >
          <AutoComplete style={{ width: width }} options={noOptionTmp}/>
        </FormItem>
      </Col>
      <Col span={8}>
        <FormItem label="资产名称" name="name"><Input style={{ width: width }}/></FormItem>
      </Col>
      <Col span={8}>
        <Space>
          <Button icon='search' type='primary' onClick={() => onClick('query')}>查询</Button>
          <Button icon='reload' onClick={() => onClick('reload')}>重置</Button>
        </Space>
      </Col>
    </Row>
    <List url={asDeviceCommonPath.list} onMount={list => setList(list)} formatBefore={listFormatBefore}>
      <Table rowKey='id'
             rowSelection={{
               type: 'radio',
               selectedRowKeys: [selectedRowKey],
               onChange: (selectedRowKeys, selectedRows) => setSelectedRowKey(selectedRowKeys[0])
             }}
             onRow={record => {
               return {
                 onClick: () => setSelectedRowKey(record.id)
               }
             }}
      >
        <Table.Column title="资产编号" dataIndex="no"/>
        <Table.Column title="资产名称" dataIndex="name"/>
      </Table>
      <Pagination showTotal={total => `共${total}条`}/>
    </List>
  </Form>
}

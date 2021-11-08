import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem } from 'noform'
import { Card, Col, Row, Tabs } from 'antd'
import { ajax, asDeviceCommonPath } from '../../utils'
import { DatePicker, Input, InputNumber, Radio, TreeSelect } from 'nowrapper/lib/antd'
import locale from 'antd/lib/date-picker/locale/zh_CN'
import ProcessInstanceChangeList from '../ProcessInstanceChange/List'
import ProcessInstanceHistoryList from '../ProcessInstanceData/HistoryList'
import ProcessInstanceCurrentList from '../ProcessInstanceData/CurrentList'

const { TabPane } = Tabs
const width = 250, span = 12

export default (props) => {
  const { type, record } = props

  const [core] = useState(new FormCore())
  const [typeId, setTypeId] = useState()

  const [treeData, setTreeData] = useState()
  useEffect(async () => {
    const data = await ajax.get(asDeviceCommonPath.getAsTypeTree)
    if(data){
      setTreeData(data)
    }

    if (type === 'add') {
      core.reset()
      core.setValues({ 'asDeviceCommon.shared': '是' })
    } else {
      core.setValues(record)
      const data = await ajax.get(asDeviceCommonPath.getAsType, { typeId: record['asDeviceCommon.typeId'] })
      if (data) {
        setTypeId(data.id)
      }
    }
  }, [props])

  const showAsDeviceCommonForm = () => {
    return <>
      <Row gutter={[8, 16]}>
        <FormItem name="asDeviceCommon.id" style={{ display: 'none' }}><Input style={{ width: width }}/></FormItem>
        <Col span={span}>
          <FormItem label="资产类别" name="asDeviceCommon.typeId" required
                    validateConfig={{ type: 'number', required: true, message: '资产类别不能为空' }}>
            <TreeSelect
              style={{ width: width }}
              treeData={treeData}
              treeDefaultExpandAll
              onSelect={async (value, node) => {
                const data = await ajax.get(asDeviceCommonPath.getAsType, { typeId: value })
                if (data) {
                  setTypeId(data.id)
                  core.setValue('asDeviceCommon.typeId', value)
                }
              }}
            />
          </FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.no' label='资产编号' required
                    validateConfig={{ type: 'string', required: true, message: '资产编号不能为空' }}>
            <Input style={{ width: width }}/></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.name' label='资产名称'><Input style={{ width: width }}/></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.baomiNo' label='保密编号'><Input style={{ width: width }}/></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.fundSrc' label='资金来源'><Input style={{ width: width }}/></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.netType' label='联网类别'><Input style={{ width: width }}/></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.portNo' label='信息点号'><Input style={{ width: width }}/></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.hostName' label='主机名称'><Input style={{ width: width }}/></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.location' label='所在位置'><Input style={{ width: width }}/></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.shared' label='是否合用'>
            <Radio.Group
              options={[
                { label: '是', value: '是' },
                { label: '否', value: '否' }]}/>
          </FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.nameShared' label='合用人'><Input style={{ width: width }}/></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.state' label='状态'><Input style={{ width: width }}/></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.usagee' label='用途'><Input style={{ width: width }}/></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.administrator' label='管理员'><Input style={{ width: width }}/></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.adminTel' label='管理员电话'><Input style={{ width: width }}/></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.userName' label='使用人'><Input style={{ width: width }}/></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.userDept' label='使用部门'><Input style={{ width: width }}/></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.userMiji' label='使用人密级'><Input style={{ width: width }}/></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.userTel' label='使用人电话'><Input style={{ width: width }}/></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.manufacturer' label='设备厂商'><Input style={{ width: width }}/></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.model' label='设备型号'><Input style={{ width: width }}/></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.sn' label='设备序列号'><Input style={{ width: width }}/></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <div style={{ display: 'none' }}><FormItem name='asDeviceCommon.madeDate'><Input/></FormItem></div>
          <FormItem name='asDeviceCommon.madeDateTmp' label='生产日期' width={width}
                    onChange={date => {
                      if (date) {
                        core.setValue('asDeviceCommon.madeDate', date.format('YYYY-MM-DD'))
                      } else {
                        core.setValue('asDeviceCommon.madeDate', '')
                      }
                    }}>
            <DatePicker locale={locale} format="YYYY-MM-DD" style={{ width: width }}/>
          </FormItem>
        </Col>
        <Col span={span}>
          <div style={{ display: 'none' }}><FormItem name='asDeviceCommon.buyDate'><Input/></FormItem></div>
          <FormItem name='asDeviceCommon.buyDateTmp' label='购买日期' width={width}
                    onChange={date => {
                      if (date) {
                        core.setValue('asDeviceCommon.buyDate', date.format('YYYY-MM-DD'))
                      } else {
                        core.setValue('asDeviceCommon.buyDate', '')
                      }
                    }}>
            <DatePicker locale={locale} format="YYYY-MM-DD" style={{ width: width }}/>
          </FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <div style={{ display: 'none' }}><FormItem name='asDeviceCommon.useDate'><Input/></FormItem></div>
          <FormItem name='asDeviceCommon.useDateTmp' label='启用日期' width={width}
                    onChange={date => {
                      if (date) {
                        core.setValue('asDeviceCommon.useDate', date.format('YYYY-MM-DD'))
                      } else {
                        core.setValue('asDeviceCommon.useDate', '')
                      }
                    }}>
            <DatePicker locale={locale} format="YYYY-MM-DD" style={{ width: width }}/>
          </FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.price' label='价格'><InputNumber style={{ width: width }}/></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <div style={{ display: 'none' }}><FormItem name='asDeviceCommon.discardDate'><Input/></FormItem></div>
          <FormItem name='asDeviceCommon.discardDateTmp' label='报废日期' width={width}
                    onChange={date => {
                      if (date) {
                        core.setValue('asDeviceCommon.discardDate', date.format('YYYY-MM-DD'))
                      } else {
                        core.setValue('asDeviceCommon.discardDate', '')
                      }
                    }}>
            <DatePicker locale={locale} format="YYYY-MM-DD" style={{ width: width }}/>
          </FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.ip' label='IP地址'><Input style={{ width: width }}/></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.mac' label='MAC地址'><Input style={{ width: width }}/></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.miji' label='涉密级别'><Input style={{ width: width }}/></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.remark' label='备注'><Input style={{ width: width }}/></FormItem>
        </Col>
      </Row>
    </>
  }

  const showSpecialForm = () => {
    if (typeId) {
      if (typeId === 4) {
        //计算机
        return <>
          <Card size='small' title='计算机专用' bordered={false}>
            <Row gutter={[8, 16]}>
              <FormItem name="asComputerSpecial.id" style={{ display: 'none' }}><Input
                style={{ width: width }}/></FormItem>
              <Col span={span}>
                <FormItem name='asComputerSpecial.netInterface' label='网络接口'><Input
                  style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.ram' label='物理内存(MB)'><InputNumber
                  style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.cdrom' label='光驱'><Input style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.videoCard' label='显卡'><Input style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.macBackup' label='备用网卡MAC'><Input
                  style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.soundCard' label='声卡'><Input style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <div style={{ display: 'none' }}><FormItem name='asComputerSpecial.osDate'><Input/></FormItem></div>
                <FormItem name='asComputerSpecial.osDateTmp' label='操作系统安装时间' width={width}
                          onChange={date => {
                            if (date) {
                              core.setValue('asComputerSpecial.osDate', date.format('YYYY-MM-DD'))
                            } else {
                              core.setValue('asComputerSpecial.osDate', '')
                            }
                          }}>
                  <DatePicker locale={locale} format="YYYY-MM-DD" style={{ width: width }}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.osType' label='操作系统'><Input style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.cpuTotal' label='CPU个数'><InputNumber
                  style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskTotal' label='硬盘个数'><InputNumber
                  style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskSize' label='硬盘总容量'><InputNumber
                  style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskMode1' label='硬盘型号1'><Input style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskMode2' label='硬盘型号2'><Input style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskMode3' label='硬盘型号3'><Input style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskMode4' label='硬盘型号4'><Input style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskSn1' label='硬盘序列号1'><Input style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskSn2' label='硬盘序列号2'><Input style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskSn3' label='硬盘序列号3'><Input style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskSn4' label='硬盘序列号4'><Input style={{ width: width }}/></FormItem>
              </Col>
            </Row>
          </Card>
          <Card size='small' title='计算机权限' bordered={false}>
            <Row gutter={[8, 16]}>
              <FormItem name="asComputerGranted.id" style={{ display: 'none' }}><Input
                style={{ width: width }}/></FormItem>
              <Col span={span}>
                <FormItem name='asComputerGranted.usb' label='USB接口' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.serial' label='串口' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.parallel' label='并口' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.hongwai' label='红外' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.bluetooth' label='蓝牙' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.screenShot' label='拷屏' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.dev1394' label='1394' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.connection' label='设备接入' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.ipBind' label='IP绑定' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.vm' label='虚拟机' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.docShare' label='文件共享' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.pcmcia' label='PCMCIA' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.devImage' label='图形设备' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.devJuanying' label='卷影设备' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.portShemi' label='多功能导入装置涉密口' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.portCommon' label='多功能导入装置通用口' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]}/>
                </FormItem>
              </Col>
            </Row>
          </Card>
        </>
      } else if (typeId === 5) {
        //网络设备
        return <>
          <Card size='small' title='网络设备' bordered={false}>
            <FormItem name="asNetworkDeviceSpecial.id" style={{ display: 'none' }}><Input
              style={{ width: width }}/></FormItem>
            <Row gutter={[8, 16]}>
              <Col span={span}>
                <FormItem name='asNetworkDeviceSpecial.rom' label='内存ROM(MB)'><Input
                  style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asNetworkDeviceSpecial.flash' label='内存FLASH(MB)'><Input
                  style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asNetworkDeviceSpecial.portTotal' label='端口总数'><Input
                  style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asNetworkDeviceSpecial.ios' label='IOS版本'><Input style={{ width: width }}/></FormItem>
              </Col>
            </Row>
          </Card>
        </>
      } else if (typeId === 6) {
        //外设
        return <>
          <Card size='small' title='外设' bordered={false}>
            <FormItem name="asSecurityProductsSpecial.id" style={{ display: 'none' }}><Input
              style={{ width: width }}/></FormItem>
            <Row gutter={[8, 16]}>
              <Col span={span}>
                <FormItem name='asSecurityProductsSpecial.certificateName' label='检测证书名称'><Input
                  style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asSecurityProductsSpecial.certificateSn' label='检测证书编号'><Input
                  style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <div style={{ display: 'none' }}>
                  <FormItem name='asSecurityProductsSpecial.certificateDatetime'><Input/></FormItem>
                </div>
                <FormItem name='asSecurityProductsSpecial.certificateDatetimeTmp' label='证书有效期' width={width}
                          onChange={date => {
                            if (date) {
                              core.setValue('asSecurityProductsSpecial.certificateDatetime', date.format('YYYY-MM-DD'))
                            } else {
                              core.setValue('asSecurityProductsSpecial.certificateDatetime', '')
                            }
                          }}>
                  <DatePicker locale={locale} format="YYYY-MM-DD HH:mm:ss" style={{ width: width }}/>
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asSecurityProductsSpecial.strategy' label='策略'><Input
                  style={{ width: width }}/></FormItem>
              </Col>
            </Row>
          </Card>
        </>
      } else if (typeId === 7) {
        //安全防护产品
        return <>
          <Card size='small' title='安全防护产品' bordered={false}>
            <FormItem name="asComputerSpecial.id" style={{ display: 'none' }}><Input
              style={{ width: width }}/></FormItem>
            <Row gutter={[8, 16]}>
              <Col span={span}>
                <FormItem name='asIoSpecial.accessHostNo' label='接入主机资产号'><Input style={{ width: width }}/></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asIoSpecial.accessPort' label='接入主机端口'><Input style={{ width: width }}/></FormItem>
              </Col>
            </Row>
          </Card>
        </>
      }
    }
  }

  const showTabPane = () => {
    let arr = []
    if (type !== 'add') {
      arr.push(
        <TabPane tab="当前工单" key="3">
          <ProcessInstanceCurrentList record={record}/>
        </TabPane>
      )
      arr.push(
        <TabPane tab="历史工单" key="4">
          <ProcessInstanceHistoryList record={record}/>
        </TabPane>
      )
      arr.push(
        <TabPane tab="属性变更记录" key="5">
          <ProcessInstanceChangeList record={record}/>
        </TabPane>
      )
    }
    return arr
  }

  return <Form core={core} layout={{ label: 8, control: 16 }}>
    <FormItem name='formItemNameFlag' style={{ display: 'none' }} value='formItemNameFlag'><Input/></FormItem>
    <Tabs animated={false}>
      <TabPane tab="基本属性" key="1">
        {showAsDeviceCommonForm()}
      </TabPane>
      <TabPane tab="专有属性" key="2">
        {showSpecialForm()}
      </TabPane>
      {showTabPane()}
    </Tabs>
  </Form>
}

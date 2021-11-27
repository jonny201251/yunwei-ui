import { useState } from 'react'
import { Button } from 'antd'

export default (props) => {
  const { onClick, param } = props

  const [loading, setLoading] = useState(false)

  return <Button
    {...props}
    loading={loading}
    onClick={() => {
      setLoading(true)
      try {
        onClick(param).then(() => setLoading(false))
      } catch (e) {
        console.log(e);
        setLoading(false)
      }
    }}>{props.children}</Button>
}

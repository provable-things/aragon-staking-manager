import React, { Fragment, useState } from 'react'
import { Box, Button, Field, GU, Tabs, textStyle } from '@aragon/ui'
import { useAragonApi } from '@aragon/api-react'

const Wrapper = (_props) => {
  const { amount, selected, onChangeAmount, onChangeSelected, onClick } = _props

  return (
    <Fragment>
      <Field label="Enter the amount here:">
        <input
          type="number"
          value={amount}
          onChange={(e) => onChangeAmount(e.target.value)}
        />
      </Field>
      <Button onClick={() => onClick()}>ciaoi</Button>
    </Fragment>
  )
}

export default Wrapper

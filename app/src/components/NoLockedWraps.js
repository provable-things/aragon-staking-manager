import React from 'react'
import {
  Box,
  GU,
  textStyle,
} from '@aragon/ui'
const NoLockedWraps = _props => {

  return (
    <Box
      css={`
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        height: ${50 * GU}px;
        ${textStyle('title3')};
      `}
    >
      no data
    </Box>
  )
}
export default NoLockedWraps
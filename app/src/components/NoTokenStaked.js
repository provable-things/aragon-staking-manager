import React from 'react'
import { Box, Button, EmptyStateCard, GU, textStyle } from '@aragon/ui'
import PropTypes from 'prop-types'

const NoTokenStaked = (_props) => {
  const { onOpenSidebar } = _props

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
      <EmptyStateCard
        text="There are no staked tokens."
        action={<Button onClick={onOpenSidebar}>Start</Button>}
      />
    </Box>
  )
}

NoTokenStaked.propTypes = {
  onOpenSidebar: PropTypes.func,
}

export default NoTokenStaked

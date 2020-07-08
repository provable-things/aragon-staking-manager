import React from 'react'
import {
  Box,
  Button,
  GU,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  Text,
  IconUnlock,
  Tag,
  textStyle,
} from '@aragon/ui'
import { correctFormat, parseSeconds } from '../utils/format'
import PropTypes from 'prop-types'

const LockedWraps = (_props) => {
  const { depositToken, lockedWraps, lockTime, onUnwrap } = _props

  const now = new Date().getTime() / 1000

  return lockedWraps && lockedWraps.length > 0 ? (
    <Table
      header={
        <TableRow>
          <TableHeader title="Locked Wraps" />
        </TableRow>
      }
    >
      {lockedWraps.map(({ amount, lockDate }, _index) => {
        return (
          <TableRow key={_index}>
            <TableCell>
              <Text>
                {`${correctFormat(amount, depositToken.decimals, '/')} ${
                  depositToken.symbol
                }`}
              </Text>
            </TableCell>
            <TableCell>
              {lockDate + lockTime < now ? (
                <Tag mode="new">Unlocked</Tag>
              ) : (
                <Text
                  css={`
                    font-weight: bold;
                  `}
                >
                  {parseSeconds(lockDate + lockTime - now)}
                </Text>
              )}
            </TableCell>
            <TableCell>
              {lockDate + lockTime < now ? (
                <Button
                  onClick={() =>
                    onUnwrap(correctFormat(amount, depositToken.decimals, '*'))
                  }
                >
                  <IconUnlock />
                </Button>
              ) : (
                <Tag mode="identifier">Locked</Tag>
              )}
            </TableCell>
          </TableRow>
        )
      })}
    </Table>
  ) : (
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

LockedWraps.propTypes = {
  depositToken: PropTypes.object,
  lockedWraps: PropTypes.array,
  lockTime: PropTypes.number,
  onUnwrap: PropTypes.func,
}

export default LockedWraps

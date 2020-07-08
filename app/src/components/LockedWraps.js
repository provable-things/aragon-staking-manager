import React from 'react'
import { Box, Table, TableHeader, TableRow, TableCell, Text } from '@aragon/ui'
import { correctFormat, parseSeconds } from '../utils/format'
import PropTypes from 'prop-types'

const LockedWraps = (_props) => {
  const {
    depositToken,
    depositTokenBalance,
    miniMeToken,
    miniMeTokenBalance,
    lockedWraps,
  } = _props

  const now = new Date().getTime() / 1000

  return (
    <Table
      header={
        <TableRow>
          <TableHeader title="Locked Wraps" />
        </TableRow>
      }
    >
      {lockedWraps.map(({ amount, unlockableTime }) => {
        return (
          <TableRow>
            <TableCell>
              <Text>
                {`${correctFormat(amount, depositToken.decimals, '/')} ${
                  depositToken.symbol
                }`}
              </Text>
            </TableCell>
            <TableCell>
              {unlockableTime < now ? (
                <Text>Unlockable</Text>
              ) : (
                <Text
                  css={`
                    font-weight: bold;
                  `}
                >
                  {parseSeconds(unlockableTime - now)}
                </Text>
              )}
            </TableCell>
          </TableRow>
        )
      })}
    </Table>
  )
}

LockedWraps.propTypes = {
  depositToken: PropTypes.object,
  depositTokenBalance: PropTypes.number,
  miniMeToken: PropTypes.object,
  miniMeTokenBalance: PropTypes.number,
  lockedWraps: PropTypes.array,
}

export default LockedWraps

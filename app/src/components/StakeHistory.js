import React from 'react'
import {
  Button,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  Text,
  IconUnlock,
  Tag,
} from '@aragon/ui'
import { parseSeconds } from '../utils/time-utils'
import PropTypes from 'prop-types'
import NoTokenStaked from './NoTokenStaked'
import { strip, offChainFormat } from '../utils/amount-utils'

const StakeHistory = (_props) => {
  const {
    depositToken,
    stakedLocks,
    onUnwrap,
    onOpenSidebar,
    miniMeToken,
  } = _props

  const now = new Date().getTime() / 1000

  return stakedLocks && stakedLocks.length > 0 ? (
    <Table
      header={
        <TableRow>
          <TableHeader
            title={`UNDERLAYING ASSETS FOR YOUR ${miniMeToken.symbol}`}
          />
        </TableRow>
      }
    >
      {stakedLocks.map(({ amount, lockDate, lockTime }, _index) => {
        return (
          <TableRow key={_index}>
            <TableCell>
              <Text>{`${strip(offChainFormat(amount, depositToken.decimals))} ${
                depositToken.symbol
              }`}</Text>
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
                    onUnwrap({
                      action: 'Unstake',
                      amount: offChainFormat(amount, depositToken.decimals),
                    })
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
    <NoTokenStaked onOpenSidebar={onOpenSidebar} />
  )
}

StakeHistory.propTypes = {
  depositToken: PropTypes.object,
  miniMeToken: PropTypes.object,
  stakedLocks: PropTypes.array,
  onUnwrap: PropTypes.func,
}

export default StakeHistory

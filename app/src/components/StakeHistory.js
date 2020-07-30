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
import { strip } from '../utils/amount-utils'
import { useAppState } from '@aragon/api-react'

const StakeHistory = (_props) => {
  const { onUnwrap, onOpenSidebar } = _props

  const { depositToken, stakedLocks, miniMeToken } = useAppState()

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
      {stakedLocks.map(({ amount, lockDate, duration }, _index) => {
        return (
          <TableRow key={_index}>
            <TableCell>
              <Text>{`${strip(amount.toString())} ${
                depositToken.symbol
              }`}</Text>
            </TableCell>
            <TableCell>
              {lockDate + duration < now ? (
                <Tag mode="new">Unlocked</Tag>
              ) : (
                <Tag mode="identifier">Locked</Tag>
              )}
            </TableCell>
            <TableCell>
              {lockDate + duration < now ? (
                <Button
                  onClick={() =>
                    onUnwrap({
                      action: 'Unstake',
                      amount,
                    })
                  }
                >
                  <IconUnlock />
                </Button>
              ) : (
                <Text
                  css={`
                    font-weight: bold;
                  `}
                >
                  {parseSeconds(lockDate + duration - now)}
                </Text>
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

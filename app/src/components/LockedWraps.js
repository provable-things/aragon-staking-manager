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
import { correctFormat, strip } from '../utils/number-utils'
import { parseSeconds } from '../utils/time-utils'
import PropTypes from 'prop-types'
import NoLockedWraps from './NoLockedWraps'

const LockedWraps = (_props) => {
  const { depositToken, stakedLocks, onUnwrap, onOpenSidebar } = _props

  const now = new Date().getTime() / 1000

  return stakedLocks && stakedLocks.length > 0 ? (
    <Table
      header={
        <TableRow>
          <TableHeader title="Locked Wraps" />
        </TableRow>
      }
    >
      {stakedLocks.map(({ amount, lockDate, lockTime }, _index) => {
        return (
          <TableRow key={_index}>
            <TableCell>
              <Text>
                {`${strip(correctFormat(amount, depositToken.decimals, '/'))} ${
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
                    onUnwrap({
                      action: 'Unstake',
                      amount: correctFormat(amount, depositToken.decimals, '/'),
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
    <NoLockedWraps onOpenSidebar={onOpenSidebar} />
  )
}

LockedWraps.propTypes = {
  depositToken: PropTypes.object,
  stakedLocks: PropTypes.array,
  onUnwrap: PropTypes.func,
}

export default LockedWraps

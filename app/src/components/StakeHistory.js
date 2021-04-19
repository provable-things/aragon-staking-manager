import React from 'react'
import { Button, Table, TableHeader, TableRow, TableCell, Text, IconUnlock, Tag } from '@aragon/ui'
import PropTypes from 'prop-types'
import NoTokenStaked from './NoTokenStaked'
import { useStakeHistory } from '../hooks/stake-history'
import { useAppState } from '@aragon/api-react'

const StakeHistory = (_props) => {
  const { onUnwrap, onExtendTimelock, onOpenSidebar } = _props
  const { miniMeToken } = useAppState()
  const { stakedLocks } = useStakeHistory()

  return stakedLocks && stakedLocks.length > 0 ? (
    <Table
      header={
        <TableRow>
          <TableHeader title={`UNDERLAYING ASSETS FOR YOUR ${miniMeToken.symbol}`} />
        </TableRow>
      }
    >
      {stakedLocks.map(({ amount, remainderSeconds, isUnlocked, textedAmount, index }, _index) => {
        return (
          <TableRow key={_index}>
            <TableCell>
              <Text>{textedAmount}</Text>
            </TableCell>
            <TableCell>{isUnlocked ? <Tag mode="new">Unlocked</Tag> : <Tag mode="identifier">Locked</Tag>}</TableCell>
            <TableCell>
              <Button
                label="Extend timelock"
                onClick={() =>
                  onExtendTimelock({
                    action: 'Extend Timelock',
                    amount,
                    index,
                  })
                }
              />
            </TableCell>
            <TableCell>
              {isUnlocked ? (
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
                  {remainderSeconds}
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
  onExtendTimelock: PropTypes.func,
  onOpenSidebar: PropTypes.func,
  onUnwrap: PropTypes.func,
}

export default StakeHistory

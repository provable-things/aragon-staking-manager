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
import { correctFormat, parseSeconds } from '../utils/format'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const LockedWraps = (_props) => {
  const { depositToken, lockedWraps, onUnwrap } = _props

  const now = new Date().getTime() / 1000

  return (
    <Table
      header={
        <TableRow>
          <TableHeader title="Locked Wraps" />
        </TableRow>
      }
    >
      {lockedWraps ? lockedWraps.map(({ amount, unlockableTime }, _index) => {
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
              {unlockableTime < now ? (
                <Tag mode="new">Unlockable</Tag>
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
            <TableCell>
              {unlockableTime < now ? (
                <Button
                  onClick={() =>
                    onUnwrap(correctFormat(amount, depositToken.decimals, '/'))
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
      }) : null}
    </Table>
  )
}

LockedWraps.propTypes = {
  depositToken: PropTypes.object,
  lockedWraps: PropTypes.array,
  onUnwrap: PropTypes.func,
}

export default LockedWraps

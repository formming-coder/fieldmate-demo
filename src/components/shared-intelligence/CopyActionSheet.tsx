import React, { memo } from 'react'

type CopyActionSheetProps = {
  open: boolean
  onClose: () => void
  onAction: (action: string) => void
}

const actions = ['Copy Telephone', 'Copy Price', 'Copy Address', 'Copy Coordinates', 'Copy OCR', 'Copy All']

function CopyActionSheet({ open, onClose, onAction }: CopyActionSheetProps) {
  if (!open) return null

  return (
    <div className="spi-copy-sheet-backdrop" onClick={onClose}>
      <div className="spi-copy-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="spi-copy-sheet-title">Copy Information</div>
        {actions.map((action) => (
          <button type="button" key={action} onClick={() => onAction(action)}>{action}</button>
        ))}
      </div>
    </div>
  )
}

export default memo(CopyActionSheet)

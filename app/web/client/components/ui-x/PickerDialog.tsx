import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type PickerOption = { value: string; label: string }

export function PickerDialog({
  open,
  title,
  description,
  placeholder,
  options,
  confirmLabel,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  placeholder: string
  options: PickerOption[]
  confirmLabel: string
  onOpenChange: (open: boolean) => void
  onConfirm: (value: string) => Promise<void>
}) {
  const [picked, setPicked] = useState('')
  const [saving, setSaving] = useState(false)

  if (!open) return null

  async function confirm() {
    setSaving(true)
    try {
      await onConfirm(picked)
      onOpenChange(false)
      setPicked('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Select value={picked} onValueChange={setPicked}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => void confirm()} disabled={!picked || saving}>
          {confirmLabel}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Customer {
  _id: string
  name: string
  address: string
  mobile: string
}

interface AddCustomerDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (customer: Omit<Customer, "_id"> & { _id?: string }) => void
  customer?: Customer | null
}

export function AddCustomerDialog({ isOpen, onClose, onSubmit, customer }: AddCustomerDialogProps) {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [mobile, setMobile] = useState("")

  useEffect(() => {
    if (customer) {
      setName(customer.name)
      setAddress(customer.address)
      setMobile(customer.mobile)
    } else {
      setName("")
      setAddress("")
      setMobile("")
    }
  }, [customer])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...customer,
      name,
      address,
      mobile,
    })
    setName("")
    setAddress("")
    setMobile("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mobile" className="text-right">
                Mobile
              </Label>
              <Input
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{customer ? "Update" : "Add"} Customer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

export interface NewCustomer extends Omit<Customer, 'id'> {}
export interface UpdateCustomer extends Partial<Customer> {}
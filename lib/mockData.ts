// Shared mock data store for development
export let customers: any[] = [
  {
    id: "customer_1",
    name: "John Doe",
    contact: "9876543210",
    fee: 1000,
    joinDate: "2024-01-15",
    regNo: 1,
    payments: { "2024-01": true, "2024-02": false }
  },
  {
    id: "customer_2", 
    name: "Jane Smith",
    contact: "9876543211",
    fee: 1200,
    joinDate: "2024-02-01",
    regNo: 2,
    payments: { "2024-02": true, "2024-03": true }
  }
];

export let nextRegNo = 3;

export function addCustomer(customer: any) {
  const newCustomer = {
    ...customer,
    id: `customer_${Date.now()}`,
    regNo: nextRegNo++
  };
  customers.push(newCustomer);
  return newCustomer;
}

export function getCustomers(search?: string) {
  if (!search) return customers;
  const lowerSearch = search.toLowerCase();
  return customers.filter(
    (c) => c.name.toLowerCase().includes(lowerSearch) || String(c.regNo) === lowerSearch
  );
}

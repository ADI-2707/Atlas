export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'leave' | 'terminated';
  joinDate: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  amount: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  status: 'pending' | 'processed' | 'paid';
}

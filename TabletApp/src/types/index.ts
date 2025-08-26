export interface Customer {
  id?: number;
  CustomerID?: number;
  Name?: string;
  Phone?: string;
  Age?: number;
  name: string;
  phoneNumber: string;
  rrn: string;
  currentStep: string;
  employeeId?: number;
}

export interface ProductForm {
  id: number;
  productName: string;
  formName: string;
  formType: string;
  interestRate: number;
  formFields: FormField[];
  pdfUrl: string;
}

export interface FormField {
  id: number;
  fieldName: string;
  fieldType: string;
  required: boolean;
  options: string[];
  value?: string;
}

export interface WebSocketMessage {
  type: string;
  customerId?: number;
  employeeId?: number;
  data?: any;
  userType?: string;
  userId?: string;
  employeeName?: string;
  customerData?: Customer;
  productData?: any;
  field?: any;
}

export interface SignatureData {
  signature: string;
  customerId: number;
  formId: number;
}

export interface CustomerProduct {
  product_name: string;
  product_type: string;
  interest_rate: number;
  balance: number;
  monthly_payment: number;
}

export interface ProductSummary {
  totalAssets: number;
  totalDebts: number;
  netAssets: number;
}

export interface ProductDetail {
  product_name: string;
  productType?: string;
  product_type?: string;
  productFeatures?: string;
  product_features?: string;
  targetCustomers?: string;
  target_customers?: string;
  depositAmount?: string;
  deposit_amount?: string;
  depositPeriod?: string;
  deposit_period?: string;
  interestRate?: string;
  interest_rate?: string;
  preferentialRate?: string;
  preferential_rate?: string;
  taxBenefits?: string;
  tax_benefits?: string;
}

export interface FormData {
  form?: any;
  pdfUrl?: string;
  type?: string;
}

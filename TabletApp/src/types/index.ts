export interface Customer {
  id?: number;
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
}

export interface WebSocketMessage {
  type: string;
  customerId?: number;
  employeeId?: number;
  data?: any;
}

export interface SignatureData {
  signature: string;
  customerId: number;
  formId: number;
}

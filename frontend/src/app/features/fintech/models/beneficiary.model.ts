export interface Beneficiary {
  id: number;
  ownerId: number;
  name: string;
  iban?: string;
  accountNumber?: string;
  bankName?: string;
  bankCode?: string;
  currency: string;
  active: boolean;
  createdAt: string;
}

export interface CreateBeneficiaryRequest {
  name: string;
  iban?: string;
  accountNumber?: string;
  bankName?: string;
  bankCode?: string;
  currency?: string;
}

export interface UpdateBeneficiaryRequest {
  name?: string;
  iban?: string;
  accountNumber?: string;
  bankName?: string;
  currency?: string;
  active?: boolean;
}
